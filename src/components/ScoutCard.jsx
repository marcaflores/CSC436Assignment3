import PlayerAvatar from './PlayerAvatar'

// One scouted player with an Add button. Estimated ratings are marked "est.".
function ScoutCard({ player, alreadyAdded, onAdd }) {
  return (
    <li className="scout-card">
      <PlayerAvatar player={player} />
      <div className="scout-card__info">
        <p className="scout-card__name">{player.name}</p>
        <p className="player-card__rating">
          <span className={`position-badge position-badge--${player.position}`}>{player.position}</span>{' '}
          OVR {player.rating}
          {player.ratingEstimated && ' · est.'}
        </p>
      </div>
      <button
        type="button"
        className="btn btn--outline"
        disabled={alreadyAdded}
        aria-label={alreadyAdded ? `${player.name} added` : `Add ${player.name}`}
        onClick={() => onAdd(player)}
      >
        {alreadyAdded ? 'Added' : 'Add'}
      </button>
    </li>
  )
}

export default ScoutCard
