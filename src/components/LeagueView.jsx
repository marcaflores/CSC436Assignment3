import { useFetch } from '../hooks/useFetch'
import {
  fetchFootballData,
  footballDataUrl,
  PAST_SEASONS,
  seasonLabel,
  yearLabel,
} from '../api/footballData'
import StandingsTable from './StandingsTable'
import TopScorers from './TopScorers'
import MatchdayResults from './MatchdayResults'

// One league in one season: table, top scorers and a matchday's games.
// seasonYear is null for the current season, or the start year of a past one.
function LeagueView({ competition, seasonYear, onSeasonChange, simulateError, onOpenClub, headingRef }) {
  // Leaving `season` off asks for the current season, whatever year that is.
  const seasonParams = seasonYear ? { season: seasonYear } : {}

  // The table is fetched here because the matchday panel needs its matchday number.
  const standingsUrl = footballDataUrl(
    `/competitions/${competition.code}/standings`,
    seasonParams,
    { broken: simulateError },
  )
  const standings = useFetch(standingsUrl, fetchFootballData)
  const season = standings.data?.season

  // Which games to show beside the table: a past Champions League season's final, a past
  // league's last matchday, or this season's current matchday. Null until the table says which.
  function gamesQuery() {
    if (seasonYear && competition.code === 'CL') {
      return { params: { ...seasonParams, stage: 'FINAL' }, title: 'Final' }
    }
    if (!season) return null
    const params = { ...seasonParams, matchday: season.currentMatchday }
    const title = `${seasonYear ? 'Final matchday' : 'Matchday'} ${season.currentMatchday}`
    return { params, title }
  }

  function describeSeason() {
    if (!season) return seasonYear ? `${yearLabel(seasonYear)} season` : 'This season'
    if (seasonYear) {
      const winner = season.winner ? ` · won by ${season.winner.shortName ?? season.winner.name}` : ''
      return `${seasonLabel(season)} season · final standings${winner}`
    }
    return `${seasonLabel(season)} season · matchday ${season.currentMatchday}`
  }

  return (
    <section className="explore-view" aria-labelledby="explore-heading">
      <div className="explore-view__intro explore-view__intro--league">
        <div>
          <h2 id="explore-heading" className="explore-view__title" ref={headingRef} tabIndex={-1}>
            {competition.name}
          </h2>
          <p className="explore-view__subtitle">{describeSeason()} · pick a club to see more</p>
        </div>
        <select
          className="filter-select"
          value={seasonYear ?? ''}
          onChange={(event) => onSeasonChange(event.target.value ? Number(event.target.value) : null)}
          aria-label="Season"
        >
          <option value="">This season</option>
          {PAST_SEASONS.map((year) => (
            <option key={year} value={year}>
              {yearLabel(year)}
            </option>
          ))}
        </select>
      </div>

      <div className="league-view">
        <StandingsTable
          competition={competition}
          standings={standings}
          onOpenClub={(club) => onOpenClub({ ...club, season, isPastSeason: Boolean(seasonYear) })}
        />
        <div className="league-view__side">
          {/* No point waiting on a matchday number from a table that failed to load. */}
          {!standings.error && (
            <MatchdayResults
              competition={competition}
              query={gamesQuery()}
              simulateError={simulateError}
            />
          )}
          <TopScorers competition={competition} seasonParams={seasonParams} simulateError={simulateError} />
        </div>
      </div>
    </section>
  )
}

export default LeagueView
