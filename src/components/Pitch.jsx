import { useState } from 'react'
import PitchSlot from './PitchSlot'
import SlotPicker from './SlotPicker'
import { FORMATIONS } from '../data/formations'

function Pitch({ formationKey, squad, assignments, otherTeamAssignments, onAssign }) {
  const [activeSlotId, setActiveSlotId] = useState(null)

  const formation = FORMATIONS[formationKey]
  const assignedIds = new Set(Object.values(assignments))
  const otherTeamIds = new Set(Object.values(otherTeamAssignments ?? {}))
  const playersById = new Map(squad.map((player) => [player.id, player]))

  const activeSlot = formation.slots.find((slot) => slot.id === activeSlotId)
  const activePlayerId = activeSlot ? assignments[activeSlot.id] : null
  const candidates = activeSlot
    ? squad
        .filter(
          (player) =>
            player.position === activeSlot.role &&
            !assignedIds.has(player.id) &&
            !otherTeamIds.has(player.id),
        )
        .sort((a, b) => b.rating - a.rating)
    : []

  function assignAndClose(playerId) {
    onAssign(activeSlot.id, playerId)
    setActiveSlotId(null)
  }

  return (
    <div className="pitch">
      <div className="pitch__stripes" aria-hidden="true" />
      {formation.slots.map((slot) => {
        const assignedPlayerId = assignments[slot.id]
        const assignedPlayer = assignedPlayerId ? playersById.get(assignedPlayerId) : null

        return (
          <PitchSlot
            key={slot.id}
            slot={slot}
            assignedPlayer={assignedPlayer}
            isActive={slot.id === activeSlotId}
            onSelect={setActiveSlotId}
          />
        )
      })}

      {activeSlot && (
        <SlotPicker
          slot={activeSlot}
          assignedPlayer={activePlayerId ? playersById.get(activePlayerId) : null}
          candidates={candidates}
          onPick={assignAndClose}
          onClear={() => assignAndClose('')}
          onClose={() => setActiveSlotId(null)}
        />
      )}
    </div>
  )
}

export default Pitch
