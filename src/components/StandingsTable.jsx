import { useFetch } from '../hooks/useFetch'
import { apiUrl, fetchApiFootball, SEASON, SEASON_LABEL } from '../api/apiFootball'
import { FetchError, LoadingRows } from './FetchStatus'

function formatGoalDiff(goalsDiff) {
  return goalsDiff > 0 ? `+${goalsDiff}` : String(goalsDiff)
}

function StandingsTable({ league, simulateError, onOpenClub }) {
  const url = apiUrl('/standings', { league: league.id, season: SEASON }, { broken: simulateError })
  const { data, loading, error, retry } = useFetch(url, fetchApiFootball)

  function renderTable() {
    if (loading) return <LoadingRows label="Loading table…" rows={10} />
    if (error) return <FetchError title="Couldn't load the table" error={error} onRetry={retry} />

    // Leagues without groups have a single table at standings[0].
    const rows = data.response[0]?.league.standings[0] ?? []
    if (rows.length === 0) return <p className="empty-state">No table listed for {league.name}.</p>

    return (
      <table className="standings">
        <caption className="visually-hidden">
          {league.name} {SEASON_LABEL} final table
        </caption>
        <thead>
          <tr>
            <th scope="col">
              <abbr title="Position">#</abbr>
            </th>
            <th scope="col" className="standings__club-col">Club</th>
            <th scope="col">
              <abbr title="Played">P</abbr>
            </th>
            <th scope="col" className="standings__wdl">
              <abbr title="Won">W</abbr>
            </th>
            <th scope="col" className="standings__wdl">
              <abbr title="Drawn">D</abbr>
            </th>
            <th scope="col" className="standings__wdl">
              <abbr title="Lost">L</abbr>
            </th>
            <th scope="col">
              <abbr title="Goal difference">GD</abbr>
            </th>
            <th scope="col">
              <abbr title="Points">Pts</abbr>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.team.id}>
              <td>{row.rank}</td>
              <th scope="row" className="standings__club-col">
                <button
                  type="button"
                  className="standings__club"
                  onClick={() => onOpenClub({ ...row.team, standing: row })}
                >
                  <img className="standings__logo" src={row.team.logo} alt="" loading="lazy" />
                  <span className="standings__name">{row.team.name}</span>
                </button>
              </th>
              <td>{row.all.played}</td>
              <td className="standings__wdl">{row.all.win}</td>
              <td className="standings__wdl">{row.all.draw}</td>
              <td className="standings__wdl">{row.all.lose}</td>
              <td>{formatGoalDiff(row.goalsDiff)}</td>
              <td className="standings__points">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <div className="explore-panel">
      <h3 className="explore-panel__title">Table</h3>
      {renderTable()}
    </div>
  )
}

export default StandingsTable
