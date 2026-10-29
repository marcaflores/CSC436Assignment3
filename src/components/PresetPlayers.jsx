import { useState } from 'react'
import { PRESET_PLAYERS } from '../data/presetPlayers'
import { POSITIONS } from '../data/formations'

function PresetPlayers({ squad, onAddPlayer }) {
  const [positionFilter, setPositionFilter] = useState('ALL')

  const visiblePresets =
    positionFilter === 'ALL'
      ? PRESET_PLAYERS
      : PRESET_PLAYERS.filter((player) => player.position === positionFilter)

  return (
    <div className="preset-players">
      <div className="player-list__header">
        <h2 className="panel-title">Quick Add</h2>
        <select
          className="filter-select"
          value={positionFilter}
          onChange={(event) => setPositionFilter(event.target.value)}
          aria-label="Filter quick-add players by position"
        >
          <option value="ALL">All positions</option>
          {POSITIONS.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </div>

      <ul className="preset-players__items">
        {visiblePresets.map((player) => {
          const alreadyAdded = squad.some((squadPlayer) => squadPlayer.id === player.id)

          return (
            <li key={player.id} className="preset-card">
              <span className={`position-badge position-badge--${player.position}`}>
                {player.position}
              </span>
              <div className="preset-card__info">
                <p className="preset-card__name">{player.name}</p>
                <p className="player-card__rating">OVR {player.rating}</p>
              </div>
              <button
                type="button"
                className="btn btn--outline"
                disabled={alreadyAdded}
                onClick={() => onAddPlayer(player)}
              >
                {alreadyAdded ? 'Added' : 'Add'}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default PresetPlayers
