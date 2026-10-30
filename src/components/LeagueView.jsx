import { SEASON_LABEL } from '../api/apiFootball'
import StandingsTable from './StandingsTable'
import TopScorers from './TopScorers'

// One league: its final table and top scorers. Two requests, each with its own three states.
function LeagueView({ league, simulateError, onOpenClub, headingRef }) {
  return (
    <section className="explore-view" aria-labelledby="explore-heading">
      <div className="explore-view__intro">
        <h2 id="explore-heading" className="explore-view__title" ref={headingRef} tabIndex={-1}>
          {league.name}
        </h2>
        <p className="explore-view__subtitle">
          {SEASON_LABEL} final table · pick a club to see its current squad
        </p>
      </div>

      <div className="league-view">
        <StandingsTable league={league} simulateError={simulateError} onOpenClub={onOpenClub} />
        <TopScorers league={league} simulateError={simulateError} />
      </div>
    </section>
  )
}

export default LeagueView
