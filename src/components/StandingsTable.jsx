import { FetchError, LoadingRows } from './FetchStatus'

function formatGoalDiff(goalDifference) {
  return goalDifference > 0 ? `+${goalDifference}` : String(goalDifference)
}

// The league table. The request lives in LeagueView, which passes its { data, loading, error, retry }.
function StandingsTable({ competition, standings, onOpenClub }) {
  const { data, loading, error, retry } = standings

  function renderTable() {
    if (loading) return <LoadingRows label="Loading table…" rows={10} />
    if (error) return <FetchError title="Couldn't load the table" error={error} onRetry={retry} />

    // TOTAL is the full table; HOME and AWAY are only home or away games.
    const total = data.standings.find((standing) => standing.type === 'TOTAL')
    const rows = total?.table ?? []
    if (rows.length === 0) return <p className="empty-state">No table yet for {competition.name}.</p>

    return (
      <>
        {/* Older Champions League seasons had groups, but the free plan returns them as one table. */}
        {total.stage === 'GROUP_STAGE' && (
          <p className="scout-note">
            Group stage: the free plan combines all the groups into one table, ranked by points.
          </p>
        )}
        <table className="standings">
          <caption className="visually-hidden">{competition.name} table</caption>
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
                <td>
                  <span className="standings__rank">{row.position}</span>
                </td>
                <th scope="row" className="standings__club-col">
                  <button
                    type="button"
                    className="standings__club"
                    onClick={() => onOpenClub({ ...row.team, standing: row })}
                  >
                    <img className="standings__logo" src={row.team.crest} alt="" loading="lazy" />
                    <span className="standings__name">{row.team.shortName ?? row.team.name}</span>
                  </button>
                </th>
                <td>{row.playedGames}</td>
                <td className="standings__wdl">{row.won}</td>
                <td className="standings__wdl">{row.draw}</td>
                <td className="standings__wdl">{row.lost}</td>
                <td>{formatGoalDiff(row.goalDifference)}</td>
                <td className="standings__points">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
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
