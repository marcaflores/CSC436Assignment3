// Overlay listing the players who can fill the selected pitch slot.
function SlotPicker({ slot, assignedPlayer, candidates, onPick, onClear, onClose }) {
  function handleKeyDown(event) {
    if (event.key === 'Escape') onClose()
  }

  return (
    <div className="slot-picker" onClick={onClose} onKeyDown={handleKeyDown}>
      <div
        className="slot-picker__panel"
        role="dialog"
        aria-label={`Pick a player for ${slot.title}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="slot-picker__header">
          <h4>
            {slot.title} <span className={`position-badge position-badge--${slot.role}`}>{slot.role}</span>
          </h4>
          {/* autoFocus moves keyboard focus into the picker so Escape and Tab work right away */}
          <button type="button" className="slot-picker__close" aria-label="Close" onClick={onClose} autoFocus>
            ×
          </button>
        </div>

        {assignedPlayer && (
          <div className="slot-picker__current">
            <span>
              Current: <strong>{assignedPlayer.name}</strong> ({assignedPlayer.rating})
            </span>
            <button type="button" className="slot-picker__remove" onClick={onClear}>
              Remove
            </button>
          </div>
        )}

        {candidates.length === 0 ? (
          <p className="slot-picker__empty">No available {slot.role} players.</p>
        ) : (
          <ul className="slot-picker__list">
            {candidates.map((player) => (
              <li key={player.id}>
                <button type="button" className="slot-picker__option" onClick={() => onPick(player.id)}>
                  <span className="slot-picker__option-name">{player.name}</span>
                  <span className="slot-picker__option-rating">{player.rating}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default SlotPicker
