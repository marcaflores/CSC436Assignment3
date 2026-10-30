import { useFetch } from '../hooks/useFetch'
import { fetchFootballData, footballDataUrl } from '../api/footballData'
import { FetchError, LoadingRows } from './FetchStatus'
import MatchList from './MatchList'

// The current matchday's results and fixtures. It depends on the table's response for the
// matchday number, so the url stays null (and nothing is fetched) until that arrives.
function MatchdayResults({ competition, matchday, simulateError }) {
  const url = matchday
    ? footballDataUrl(
        `/competitions/${competition.code}/matches`,
        { matchday },
        { broken: simulateError },
      )
    : null
  const { data, error, retry } = useFetch(url, fetchFootballData)

  function renderMatches() {
    if (error) return <FetchError title="Couldn't load the matches" error={error} onRetry={retry} />
    // Covers both waiting for the matchday number and waiting for the matches themselves.
    if (!data) return <LoadingRows label="Loading matches…" rows={5} />
    if (data.matches.length === 0) return <p className="empty-state">No games this matchday.</p>
    return <MatchList matches={data.matches} />
  }

  return (
    <div className="explore-panel">
      <h3 className="explore-panel__title">Matchday {matchday ?? ''}</h3>
      {renderMatches()}
    </div>
  )
}

export default MatchdayResults
