function PitchSlot({ slot, assignedPlayer, isActive, onSelect }) {
  const chipClass = assignedPlayer
    ? `pitch-slot__chip position-badge--${assignedPlayer.position}`
    : 'pitch-slot__chip pitch-slot__chip--empty'

  return (
    <div className="pitch-slot" style={{ left: `${slot.x}%`, top: `${slot.y}%` }}>
      <button
        type="button"
        className={`${chipClass}${isActive ? ' pitch-slot__chip--active' : ''}`}
        aria-label={
          assignedPlayer
            ? `${slot.title}: ${assignedPlayer.name}. Change player`
            : `${slot.title}: empty. Pick a player`
        }
        onClick={() => onSelect(slot.id)}
      >
        {assignedPlayer ? (
          <>
            <span className="pitch-slot__name">{assignedPlayer.name}</span>
            <span className="pitch-slot__rating">
              {slot.title} · {assignedPlayer.rating}
            </span>
          </>
        ) : (
          <>
            <span className="pitch-slot__plus" aria-hidden="true">+</span>
            <span className="pitch-slot__role">{slot.title}</span>
          </>
        )}
      </button>
    </div>
  )
}

export default PitchSlot
