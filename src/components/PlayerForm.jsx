import { useState } from 'react'
import { POSITIONS } from '../data/formations'

function PlayerForm({ onAddPlayer }) {
  const [name, setName] = useState('')
  const [position, setPosition] = useState('MID')
  const [rating, setRating] = useState(70)

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    onAddPlayer({
      id: crypto.randomUUID(),
      name: trimmedName,
      position,
      rating,
    })

    setName('')
    setPosition('MID')
    setRating(70)
  }

  return (
    <form className="player-form" onSubmit={handleSubmit}>
      <h2 className="panel-title">Add Player</h2>

      <label className="field">
        <span className="field__label">Name</span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Alex Rivera"
          maxLength={24}
        />
      </label>

      <label className="field">
        <span className="field__label">Position</span>
        <select value={position} onChange={(event) => setPosition(event.target.value)}>
          {POSITIONS.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field__label">
          Rating <strong>{rating}</strong>
        </span>
        <input
          type="range"
          min={40}
          max={99}
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
        />
      </label>

      <button type="submit" className="btn btn--primary" disabled={!name.trim()}>
        Add to Squad
      </button>
    </form>
  )
}

export default PlayerForm
