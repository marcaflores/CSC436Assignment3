import { SEASON_LABEL } from '../api/apiFootball'
import { POSITIONS } from '../data/formations'
import { useClubSquad } from '../hooks/useClubSquad'
import { FetchError, LoadingRows } from './FetchStatus'
import PlayerAvatar from './PlayerAvatar'

const GROUP_TITLES = { GK: 'Goalkeepers', DEF: 'Defenders', MID: 'Midfielders', FWD: 'Forwards' }

function ordinal(number) {
  const suffixes = { one: 'st', two: 'nd', few: 'rd', other: 'th' }
  return `${number}${suffixes[new Intl.PluralRules('en', { type: 'ordinal' }).select(number)]}`
}

// One club: last season's finish (already in the table, so free) and its current squad.
function ClubView({ club, simulateError, squad, onAddPlayer, onOpenPlayer, headingRef }) {
  const { players, details, loading, error, retry } = useClubSquad(club, simulateError)
  const { standing } = club

  function renderSquad() {
    if (loading) return <LoadingRows label="Loading squad…" rows={8} />
    if (error) return <FetchError title="Couldn't load the squad" error={error} onRetry={retry} />
    if (players.length === 0) return <p className="empty-state">No squad listed for {club.name}.</p>

    return (
      <div className="club-squad">
        {POSITIONS.map((position) => {
          // Best first, like the position picker in the builder.
          const group = players
            .filter((player) => player.position === position)
            .sort((a, b) => b.rating - a.rating)
          if (group.length === 0) return null

          return (
            <div key={position} className="explore-panel">
              <h3 className="explore-panel__title">
                {GROUP_TITLES[position]} <span className="explore-panel__count">{group.length}</span>
              </h3>
              <ul className="club-squad__list">
                {group.map((player) => {
                  const { number, age } = details.get(player.id) ?? {}
                  const added = squad.some((squadPlayer) => squadPlayer.id === player.id)

                  return (
                    <li key={player.id} className="club-squad__row">
                      <PlayerAvatar player={player} />
                      <div className="club-squad__info">
                        <button
                          type="button"
                          className="club-squad__name"
                          onClick={() => onOpenPlayer({ id: player.id, name: player.name })}
                        >
                          {player.name}
                        </button>
                        <p className="club-squad__meta">
                          {number ? `#${number} · ` : ''}
                          {age ? `${age} yrs · ` : ''}
                          OVR {player.rating}
                          {player.ratingEstimated && ' est.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn--outline"
                        disabled={added}
                        aria-label={added ? `${player.name} added` : `Add ${player.name} to your squad`}
                        onClick={() => onAddPlayer(player)}
                      >
                        {added ? 'Added' : 'Add'}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <section className="explore-view" aria-labelledby="explore-heading">
      <div className="explore-view__intro explore-view__intro--club">
        <img className="explore-view__logo" src={club.logo} alt="" />
        <div>
          <h2 id="explore-heading" className="explore-view__title" ref={headingRef} tabIndex={-1}>
            {club.name}
          </h2>
          {standing && (
            <p className="explore-view__subtitle">
              Finished {ordinal(standing.rank)} in {SEASON_LABEL} · {standing.points} pts ·{' '}
              {standing.all.win}W {standing.all.draw}D {standing.all.lose}L
            </p>
          )}
        </div>
      </div>

      {renderSquad()}

      {!loading && !error && players.some((player) => player.ratingEstimated) && (
        <p className="scout-note">
          est. means the player has no {SEASON_LABEL} rating for {club.name}, usually a new signing,
          so their OVR is the club's average for their position (a little lower for players under 21).
        </p>
      )}
    </section>
  )
}

export default ClubView
