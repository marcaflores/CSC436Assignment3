import { useFetch } from '../hooks/useFetch'
import { fetchFootballData, footballDataUrl, seasonLabel } from '../api/footballData'
import StandingsTable from './StandingsTable'
import TopScorers from './TopScorers'
import MatchdayResults from './MatchdayResults'

// One league this season: table, top scorers and the current matchday's games.
function LeagueView({ competition, simulateError, onOpenClub, headingRef }) {
  // The table is fetched here because the matchday panel needs its current matchday number.
  const standingsUrl = footballDataUrl(
    `/competitions/${competition.code}/standings`,
    {},
    { broken: simulateError },
  )
  const standings = useFetch(standingsUrl, fetchFootballData)
  const season = standings.data?.season

  return (
    <section className="explore-view" aria-labelledby="explore-heading">
      <div className="explore-view__intro">
        <h2 id="explore-heading" className="explore-view__title" ref={headingRef} tabIndex={-1}>
          {competition.name}
        </h2>
        <p className="explore-view__subtitle">
          {season
            ? `${seasonLabel(season)} season · matchday ${season.currentMatchday} · pick a club to see its squad`
            : 'This season · pick a club to see its squad'}
        </p>
      </div>

      <div className="league-view">
        <StandingsTable
          competition={competition}
          standings={standings}
          onOpenClub={(club) => onOpenClub({ ...club, season })}
        />
        <div className="league-view__side">
          {/* No point waiting on a matchday number from a table that failed to load. */}
          {!standings.error && (
            <MatchdayResults
              competition={competition}
              matchday={season?.currentMatchday}
              simulateError={simulateError}
            />
          )}
          <TopScorers competition={competition} simulateError={simulateError} />
        </div>
      </div>
    </section>
  )
}

export default LeagueView
