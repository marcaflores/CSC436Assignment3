import PlayerAvatar from './PlayerAvatar'

function PlayerCard({ player, onRemove }) {
  return (
    <li className="player-card">
      <PlayerAvatar player={player} />
      <span className={`position-badge position-badge--${player.position}`}>
        {player.position}
      </span>
      <div className="player-card__info">
        <p className="player-card__name">{player.name}</p>
        <p className="player-card__rating">
          OVR {player.rating}
          {player.club && ` · ${player.club}`}
        </p>
      </div>
      <button
        type="button"
        className="icon-button"
        aria-label={`Remove ${player.name}`}
        onClick={() => onRemove(player.id)}
      >
        ✕
      </button>
    </li>
  )
}

export default PlayerCard
