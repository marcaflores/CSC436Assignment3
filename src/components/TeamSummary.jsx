import { getLineupStats } from '../utils/teamStats'

function getOutcome(result) {
  if (result.goalsFor > result.goalsAgainst) return { label: 'Won', tone: 'ready' }
  if (result.goalsFor < result.goalsAgainst) return { label: 'Lost', tone: 'warning' }
  return { label: 'Drew', tone: 'idle' }
}

function TeamSummary({ squad, formationKey, assignments, teamLabel, opponent, matchResult, onSimulate }) {
  const stats = getLineupStats(squad, formationKey, assignments)
  const { filledSlots, totalSlots, isComplete } = stats
  const averageRating = Math.round(stats.averageRating)
  const outcome = matchResult ? getOutcome(matchResult) : null

  return (
    <div className="team-summary">
      <div className="team-summary__stat">
        <span className="team-summary__value">{filledSlots}/{totalSlots}</span>
        <span className="team-summary__label">Lineup filled</span>
      </div>
      <div className="team-summary__stat">
        <span className="team-summary__value">{averageRating || '—'}</span>
        <span className="team-summary__label">Avg. rating</span>
      </div>
      <div className="team-summary__stat">
        <span className="team-summary__value">{squad.length}</span>
        <span className="team-summary__label">Squad size</span>
      </div>

      {outcome && (
        <p className={`team-summary__badge team-summary__badge--${outcome.tone} team-summary__result`} aria-live="polite">
          <span>{outcome.label}</span>
          <span className="team-summary__score">
            {teamLabel} {matchResult.goalsFor} – {matchResult.goalsAgainst} {opponent.label}
          </span>
        </p>
      )}

      {squad.length === 0 ? (
        <p className="team-summary__badge team-summary__badge--idle">Build your squad to get started</p>
      ) : !isComplete ? (
        <p className="team-summary__badge team-summary__badge--warning">
          {totalSlots - filledSlots} slot{totalSlots - filledSlots === 1 ? '' : 's'} still need a player
        </p>
      ) : (
        <>
          <button
            type="button"
            className="btn btn--primary team-summary__kickoff"
            disabled={!opponent.isComplete}
            onClick={onSimulate}
          >
            {matchResult ? 'Play again' : `Kick off vs ${opponent.label}`}
          </button>
          {!opponent.isComplete && (
            <p className="team-summary__hint">Lineup ready ✓ — finish {opponent.label}&apos;s lineup to play.</p>
          )}
        </>
      )}
    </div>
  )
}

export default TeamSummary
