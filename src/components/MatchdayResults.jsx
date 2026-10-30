import { useFetch } from '../hooks/useFetch'
import { fetchFootballData, footballDataUrl } from '../api/footballData'
import { FetchError, LoadingRows } from './FetchStatus'
import MatchList from './MatchList'

// The games beside a league table, picked by LeagueView's `query` ({ params, title }). The
// query usually depends on the table's response for the matchday number, so it's null (and
// nothing is fetched) until that arrives.
function MatchdayResults({ competition, query, simulateError }) {
  const url = query
    ? footballDataUrl(`/competitions/${competition.code}/matches`, query.params, {
        broken: simulateError,
      })
    : null
  const { data, error, retry } = useFetch(url, fetchFootballData)

  function renderMatches() {
    if (error) return <FetchError title="Couldn't load the matches" error={error} onRetry={retry} />
    // Covers both waiting for the query and waiting for the matches themselves.
    if (!data) return <LoadingRows label="Loading matches…" rows={5} />
    if (data.matches.length === 0) return <p className="empty-state">No games listed.</p>
    return <MatchList matches={data.matches} />
  }

  return (
    <div className="explore-panel">
      <h3 className="explore-panel__title">{query?.title ?? 'Matchday'}</h3>
      {renderMatches()}
    </div>
  )
}

export default MatchdayResults
