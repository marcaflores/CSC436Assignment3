import { FORMATIONS } from '../data/formations'

// Lineup stats for one team: how many slots are filled and the exact average rating.
export function getLineupStats(squad, formationKey, assignments) {
  const totalSlots = FORMATIONS[formationKey].slots.length
  const filledIds = Object.values(assignments).filter(Boolean)
  const players = squad.filter((player) => filledIds.includes(player.id))
  const averageRating = players.length
    ? players.reduce((sum, player) => sum + player.rating, 0) / players.length
    : 0

  return {
    filledSlots: filledIds.length,
    totalSlots,
    averageRating,
    isComplete: filledIds.length === totalSlots,
  }
}

function randomInt(max) {
  return Math.floor(Math.random() * (max + 1))
}

// The higher average rating always wins; a bigger gap means a bigger margin.
export function simulateMatch(averageA, averageB) {
  const gap = Math.abs(averageA - averageB)
  const loserGoals = randomInt(2)

  if (gap === 0) return { goalsA: loserGoals, goalsB: loserGoals }

  const winnerGoals = loserGoals + Math.min(1 + Math.floor(gap / 4), 4)
  return averageA > averageB
    ? { goalsA: winnerGoals, goalsB: loserGoals }
    : { goalsA: loserGoals, goalsB: winnerGoals }
}
