import { useFetch } from '../hooks/useFetch'
import { fetchFootballData, footballDataUrl } from '../api/footballData'
import { FetchError, LoadingRows } from './FetchStatus'

function TopScorers({ competition, simulateError }) {
  const url = footballDataUrl(
    `/competitions/${competition.code}/scorers`,
    { limit: 10 },
    { broken: simulateError },
  )
  const { data, loading, error, retry } = useFetch(url, fetchFootballData)

  function renderList() {
    if (loading) return <LoadingRows label="Loading top scorers…" />
    if (error) return <FetchError title="Couldn't load top scorers" error={error} onRetry={retry} />
    if (data.scorers.length === 0) return <p className="empty-state">No goals scored yet.</p>

    return (
      <ol className="scorers">
        {data.scorers.map(({ player, team, goals, assists, playedMatches }) => (
          <li key={player.id} className="scorers__row">
            <img className="scorers__crest" src={team.crest} alt="" loading="lazy" />
            <div className="scorers__info">
              <p className="scorers__name">{player.name}</p>
              <p className="scorers__club">
                {/* The free plan leaves assists out (null), so only show them when they're there. */}
                {[team.shortName ?? team.name, assists != null && `${assists} assists`, `${playedMatches} games`]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <p className="scorers__goals">
              {goals}
              <span className="scorers__goals-label">goals</span>
            </p>
          </li>
        ))}
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
