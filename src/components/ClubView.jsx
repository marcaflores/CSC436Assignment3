import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import {
  ageFrom,
  fetchFootballData,
  footballDataUrl,
  groupSquad,
  seasonLabel,
} from '../api/footballData'
import { normalize } from '../utils/normalize'
import { FetchError, LoadingRows } from './FetchStatus'
import MatchList from './MatchList'

const RECENT_COUNT = 5
const UPCOMING_COUNT = 3

function ordinal(number) {
  const suffixes = { one: 'st', two: 'nd', few: 'rd', other: 'th' }
  return `${number}${suffixes[new Intl.PluralRules('en', { type: 'ordinal' }).select(number)]}`
}

// One club: its place in the table (already loaded, so free), its games in every competition
// this season, and its current squad. Two requests.
function ClubView({ club, simulateError, headingRef }) {
  const [search, setSearch] = useState('')
  const { standing, season } = club

  const teamUrl = footballDataUrl(`/teams/${club.id}`, {}, { broken: simulateError })
  const matchesUrl = footballDataUrl(
    `/teams/${club.id}/matches`,
    { season: season.startDate.slice(0, 4) },
    { broken: simulateError },
  )
  const team = useFetch(teamUrl, fetchFootballData)
  const matches = useFetch(matchesUrl, fetchFootballData)

  function renderInfo() {
    if (team.loading) return <LoadingRows label="Loading club info…" rows={2} />
    if (team.error) return null // The squad panel below shows the error and the retry.

    const facts = [
      ['Coach', team.data.coach?.name],
      ['Stadium', team.data.venue],
      ['Founded', team.data.founded],
      ['Colours', team.data.clubColors],
    ].filter(([, value]) => value)

    return (
      <dl className="club-facts">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    )
  }

  function renderMatches() {
    if (matches.loading) return <LoadingRows label="Loading games…" rows={4} />
    if (matches.error) {
      return <FetchError title="Couldn't load games" error={matches.error} onRetry={matches.retry} />
    }

    const played = matches.data.matches.filter((match) => match.status === 'FINISHED')
    const upcoming = matches.data.matches.filter((match) =>
      ['SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED'].includes(match.status),
    )

    return (
      <>
        <h4 className="explore-panel__subtitle">Recent results</h4>
        {played.length === 0 ? (
          <p className="empty-state">No games played yet.</p>
        ) : (
          <MatchList matches={played.slice(-RECENT_COUNT).reverse()} showCompetition />
        )}
        <h4 className="explore-panel__subtitle">Next up</h4>
        {upcoming.length === 0 ? (
          <p className="empty-state">No games scheduled.</p>
        ) : (
          <MatchList matches={upcoming.slice(0, UPCOMING_COUNT)} showCompetition />
        )}
      </>
    )
  }

  function renderSquad() {
    if (team.loading) return <LoadingRows label="Loading squad…" rows={8} />
    if (team.error) {
      return <FetchError title="Couldn't load the club" error={team.error} onRetry={team.retry} />
    }

    const squad = team.data.squad ?? []
    if (squad.length === 0) return <p className="empty-state">No squad listed for {club.name}.</p>

    // Filters the squad already loaded, so typing never sends a request.
    const query = normalize(search.trim())
    const groups = groupSquad(squad.filter((player) => normalize(player.name).includes(query)))

    return (
      <>
        <input
          type="search"
          className="filter-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search squad"
          aria-label={`Search ${club.shortName ?? club.name} players`}
        />
        {groups.length === 0 ? (
          <p className="empty-state">No players match your search.</p>
        ) : (
          <div className="club-squad">
            {groups.map((group) => (
              <div key={group.code} className="explore-panel">
                <h3 className="explore-panel__title">
                  {group.title} <span className="explore-panel__count">{group.players.length}</span>
                </h3>
                <ul className="club-squad__list">
                  {group.players.map((player) => {
                    const age = ageFrom(player.dateOfBirth)
                    return (
                      <li key={player.id} className="club-squad__row">
                        <p className="club-squad__name">{player.name}</p>
                        <p className="club-squad__meta">
                          {[player.position, age && `${age} yrs`, player.nationality]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </>
    )
  }

  const name = club.shortName ?? club.name

  return (
    <section className="explore-view" aria-labelledby="explore-heading">
      <div className="explore-view__intro explore-view__intro--club">
        <img className="explore-view__logo" src={club.crest} alt="" />
        <div>
          <h2 id="explore-heading" className="explore-view__title" ref={headingRef} tabIndex={-1}>
            {name}
          </h2>
          <p className="explore-view__subtitle">
            {ordinal(standing.position)} in {seasonLabel(season)} · {standing.points} pts ·{' '}
            {standing.won}W {standing.draw}D {standing.lost}L
          </p>
        </div>
      </div>

      {renderInfo()}

      <div className="club-view">
        <div className="explore-panel">
          <h3 className="explore-panel__title">Games</h3>
          {renderMatches()}
        </div>
        <div className="club-view__squad">
          <h3 className="explore-view__section-title">Squad</h3>
          {renderSquad()}
          <p className="scout-note">
            To add {name} players to your squad, scout them in the Team Builder, which has their
            photos and ratings.
          </p>
        </div>
      </div>
    </section>
  )
}

export default ClubView
