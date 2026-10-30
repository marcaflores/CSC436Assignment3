import { useFetch } from '../hooks/useFetch'
import { apiUrl, fetchApiFootball, SEASON } from '../api/apiFootball'
import { FetchError, LoadingRows } from './FetchStatus'
import PlayerAvatar from './PlayerAvatar'

const SHOWN = 10

function TopScorers({ league, simulateError }) {
  const url = apiUrl('/players/topscorers', { league: league.id, season: SEASON }, { broken: simulateError })
  const { data, loading, error, retry } = useFetch(url, fetchApiFootball)

  function renderList() {
    if (loading) return <LoadingRows label="Loading top scorers…" />
    if (error) return <FetchError title="Couldn't load top scorers" error={error} onRetry={retry} />
    // The API sometimes merges a player's season with games for a later club (Matheus Cunha shows
    // 30 goals in 66 Premier League apps under Man United). More apps than the league has rounds
    // can't be right, so those entries are left out.
    const scorers = data.response.filter(
      ({ statistics }) => statistics[0].games.appearences <= league.rounds,
    )
    if (scorers.length === 0) return <p className="empty-state">No scorers listed yet.</p>

    return (
      <ol className="scorers">
        {scorers.slice(0, SHOWN).map(({ player, statistics }) => {
          // The first entry is this league; a player who moved mid-season may have more.
          const stats = statistics[0]
          return (
            <li key={player.id} className="scorers__row">
              <PlayerAvatar player={player} />
              <div className="scorers__info">
                <p className="scorers__name">{player.name}</p>
                <p className="scorers__club">
                  {stats.team.name} · {stats.goals.assists ?? 0} assists
                </p>
              </div>
              <p className="scorers__goals">
                {stats.goals.total}
                <span className="scorers__goals-label">goals</span>
              </p>
            </li>
          )
        })}
      </ol>
    )
  }

  return (
    <div className="explore-panel">
      <h3 className="explore-panel__title">Top scorers</h3>
      {renderList()}
    </div>
  )
}

export default TopScorers
