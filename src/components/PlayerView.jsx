import { SEASON_LABEL } from '../api/apiFootball'
import { useClubSquad } from '../hooks/useClubSquad'
import { FetchError, LoadingRows } from './FetchStatus'
import PlayerAvatar from './PlayerAvatar'

// The API sometimes sends "176" and sometimes "176 cm", so add the unit only when it's missing.
function withUnit(value, unit) {
  if (!value) return null
  return /^\d+$/.test(value) ? `${value} ${unit}` : value
}

function total(statistics, pick) {
  return statistics.reduce((sum, stat) => sum + (pick(stat) ?? 0), 0)
}

// One player. Everything here is in the club's squad and stats responses, which the club page
// already loaded, so this view costs no requests.
function PlayerView({ club, player: { id, name }, simulateError, squad, onAddPlayer, headingRef }) {
  const { players, details, loading, error, retry } = useClubSquad(club, simulateError)
  const player = players.find((entry) => entry.id === id)
  const { number, age, stats } = details.get(id) ?? {}
  const added = squad.some((squadPlayer) => squadPlayer.id === id)

  // Only competitions they actually played in.
  const competitions = stats?.statistics.filter((stat) => stat.games.appearences > 0) ?? []

  function renderBody() {
    if (loading) return <LoadingRows label="Loading player…" rows={4} />
    if (error) return <FetchError title="Couldn't load the player" error={error} onRetry={retry} />
    if (!player) return <p className="empty-state">{name} is no longer in the {club.name} squad.</p>

    const facts = [
      ['Club', club.name],
      ['Shirt', number ? `#${number}` : null],
      ['Age', age],
      ['Nationality', stats?.player.nationality],
      ['Height', withUnit(stats?.player.height, 'cm')],
      ['Weight', withUnit(stats?.player.weight, 'kg')],
    ].filter(([, value]) => value)

    return (
      <>
        <div className="explore-panel player-profile">
          <PlayerAvatar player={player} size="lg" />
          <div className="player-profile__body">
            <p className="player-profile__rating">
              <span className={`position-badge position-badge--${player.position}`}>{player.position}</span>
              OVR {player.rating}
              {player.ratingEstimated && <span className="player-profile__est"> est.</span>}
            </p>
            <dl className="player-profile__facts">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              className="btn btn--primary"
              disabled={added}
              onClick={() => onAddPlayer(player)}
            >
              {added ? 'In your squad' : 'Add to your squad'}
            </button>
          </div>
        </div>

        <div className="explore-panel">
          <h3 className="explore-panel__title">
            {SEASON_LABEL} at {club.name}
          </h3>
          {competitions.length === 0 ? (
            <p className="empty-state">
              No {SEASON_LABEL} appearances for {club.name}, usually because they joined after that
              season.
            </p>
          ) : (
            <>
              <dl className="stat-tiles">
                <div>
                  <dt>Apps</dt>
                  <dd>{total(competitions, (stat) => stat.games.appearences)}</dd>
                </div>
                <div>
                  <dt>Goals</dt>
                  <dd>{total(competitions, (stat) => stat.goals.total)}</dd>
                </div>
                <div>
                  <dt>Assists</dt>
                  <dd>{total(competitions, (stat) => stat.goals.assists)}</dd>
                </div>
                <div>
                  <dt>Minutes</dt>
                  <dd>{total(competitions, (stat) => stat.games.minutes)}</dd>
                </div>
              </dl>

              <div className="table-scroll">
                <table className="player-stats">
                  <caption className="visually-hidden">
                    {name}'s {SEASON_LABEL} stats by competition
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Competition</th>
                      <th scope="col">Apps</th>
                      <th scope="col">Goals</th>
                      <th scope="col">Assists</th>
                      <th scope="col">Rating</th>
                      <th scope="col">
                        <abbr title="Yellow cards">YC</abbr>
                      </th>
                      <th scope="col">
                        <abbr title="Red cards">RC</abbr>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitions.map((stat) => (
                      <tr key={stat.league.id}>
                        <th scope="row">{stat.league.name}</th>
                        <td>{stat.games.appearences}</td>
                        <td>{stat.goals.total ?? 0}</td>
                        <td>{stat.goals.assists ?? 0}</td>
                        <td>{stat.games.rating ? Number(stat.games.rating).toFixed(2) : '–'}</td>
                        <td>{stat.cards.yellow ?? 0}</td>
                        <td>{stat.cards.red ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </>
    )
  }

  return (
    <section className="explore-view" aria-labelledby="explore-heading">
      <div className="explore-view__intro">
        <h2 id="explore-heading" className="explore-view__title" ref={headingRef} tabIndex={-1}>
          {name}
        </h2>
        <p className="explore-view__subtitle">{club.name} · current squad</p>
      </div>

      {renderBody()}
    </section>
  )
}

export default PlayerView
