import { useFetch } from '../hooks/useFetch'
import { COMPETITIONS, fetchFootballData, footballDataUrl } from '../api/footballData'
import { addDays, formatLongDate, todayKey, toDateKey } from '../utils/dates'
import { FetchError, LoadingRows } from './FetchStatus'
import ErrorToggle from './ErrorToggle'
import Icon from './Icon'
import PageHero from './PageHero'
import MatchList from './MatchList'

const COMPETITION_CODES = COMPETITIONS.map((competition) => competition.code).join(',')

// Every game in the six competitions on one day, in the user's local time.
// `schedule.date` is null for today; the filter only narrows games already loaded.
function SchedulePage({ schedule, onScheduleChange, simulateError, onSimulateErrorChange }) {
  const today = todayKey()
  const date = schedule.date ?? today
  const { competition } = schedule

  // The API filters by UTC date, and its dateTo is exclusive. A local day can start or end on a
  // neighbouring UTC date, so this asks for the day either side and keeps only local matches below.
  const url = footballDataUrl(
    '/matches',
    { dateFrom: addDays(date, -1), dateTo: addDays(date, 2), competitions: COMPETITION_CODES },
    { broken: simulateError },
  )
  const { data, loading, error, retry } = useFetch(url, fetchFootballData)

  const dayMatches = (data?.matches ?? []).filter(
    (match) => toDateKey(new Date(match.utcDate)) === date,
  )
  const groups = COMPETITIONS.map((entry) => ({
    ...entry,
    matches: dayMatches.filter((match) => match.competition.code === entry.code),
  })).filter((group) => group.matches.length > 0)
  const visibleGroups = groups.filter((group) => competition === 'ALL' || group.code === competition)

  function goTo(nextDate) {
    onScheduleChange({ ...schedule, date: nextDate === today ? null : nextDate })
  }

  const quickDays = [
    { label: 'Yesterday', date: addDays(today, -1) },
    { label: 'Today', date: today },
    { label: 'Tomorrow', date: addDays(today, 1) },
  ]

  function renderGames() {
    if (loading) return <LoadingRows label="Loading games…" rows={6} />
    if (error) return <FetchError title="Couldn't load games" error={error} onRetry={retry} />
    if (dayMatches.length === 0) return <p className="empty-state">No games on this day.</p>
    if (visibleGroups.length === 0) {
      return <p className="empty-state">No games in this competition on this day.</p>
    }

    return visibleGroups.map((group) => (
      <section key={group.code} className="explore-panel" aria-labelledby={`schedule-${group.code}`}>
        <h3 id={`schedule-${group.code}`} className="explore-panel__title schedule__competition">
          <img className="schedule__emblem" src={group.emblem} alt="" />
          {group.name}
          <span className="explore-panel__count">{group.matches.length}</span>
        </h3>
        <MatchList matches={group.matches} showDate={false} />
      </section>
    ))
  }

  return (
    <main className="page schedule">
      <PageHero pageId="schedule">
        <div className="schedule__days">
          <ul className="league-tabs" aria-label="Quick days">
            {quickDays.map((day) => (
              <li key={day.label}>
                <button
                  type="button"
                  className="league-tabs__button"
                  aria-pressed={day.date === date}
                  onClick={() => goTo(day.date)}
                >
                  {day.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="schedule__picker">
            <button
              type="button"
              className="icon-button schedule__step"
              aria-label="Previous day"
              onClick={() => goTo(addDays(date, -1))}
            >
              <Icon name="chevronLeft" />
            </button>
            <input
              type="date"
              className="filter-input"
              value={date}
              onChange={(event) => event.target.value && goTo(event.target.value)}
              aria-label="Pick a date"
            />
            <button
              type="button"
              className="icon-button schedule__step"
              aria-label="Next day"
              onClick={() => goTo(addDays(date, 1))}
            >
              <Icon name="chevronRight" />
            </button>
          </div>
        </div>
      </PageHero>

      <div className="page__body">
        <div className="explore-view__intro schedule__intro">
          <div>
            <h2 className="explore-view__title">{formatLongDate(date)}</h2>
            <p className="explore-view__subtitle">
              {loading || error
                ? 'Games in the top five leagues and the Champions League'
                : `${dayMatches.length} ${dayMatches.length === 1 ? 'game' : 'games'} · times in your time zone`}
            </p>
          </div>
          <select
            className="filter-select"
            value={competition}
            onChange={(event) => onScheduleChange({ ...schedule, competition: event.target.value })}
            aria-label="Competition"
          >
            <option value="ALL">All competitions</option>
            {COMPETITIONS.map((entry) => (
              <option key={entry.code} value={entry.code}>
                {entry.name}
                {data ? ` (${groups.find((group) => group.code === entry.code)?.matches.length ?? 0})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="schedule__groups">{renderGames()}</div>

        <div className="page__footer">
          <ErrorToggle checked={simulateError} onChange={onSimulateErrorChange} />
        </div>
      </div>
    </main>
  )
}

export default SchedulePage
