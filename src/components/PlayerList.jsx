import { useState } from 'react'
import PlayerCard from './PlayerCard'
import { POSITIONS } from '../data/formations'

function PlayerList({ players, onRemovePlayer }) {
  const [positionFilter, setPositionFilter] = useState('ALL')

  const visiblePlayers =
    positionFilter === 'ALL'
      ? players
      : players.filter((player) => player.position === positionFilter)

  return (
    <div className="player-list">
      <div className="player-list__header">
        <h2 className="panel-title">Squad ({players.length})</h2>
        <select
          className="filter-select"
          value={positionFilter}
          onChange={(event) => setPositionFilter(event.target.value)}
          aria-label="Filter squad by position"
        >
          <option value="ALL">All positions</option>
          {POSITIONS.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </div>

      {players.length === 0 ? (
        <p className="empty-state">No players yet — add your first player to start building the squad.</p>
      ) : visiblePlayers.length === 0 ? (
        <p className="empty-state">No {positionFilter} players in the squad yet.</p>
      ) : (
        <ul className="player-list__items">
          {visiblePlayers.map((player) => (
            <PlayerCard key={player.id} player={player} onRemove={onRemovePlayer} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default PlayerList
