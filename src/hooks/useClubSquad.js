import { useMemo } from 'react'
import { useFetch } from './useFetch'
import {
  apiUrl,
  fetchAllPages,
  fetchApiFootball,
  SEASON,
  toRatingsById,
  toSquadPlayers,
} from '../api/apiFootball'

// A club's current squad with OVRs, shared by the Explore club page and the builder's scout panel.
// Both use the same two urls, so a club opened in one is already cached for the other.
export function useClubSquad(club, simulateError) {
  // Two requests: who is in the squad now, and how they did last season.
  const squadUrl = apiUrl('/players/squads', { team: club.id }, { broken: simulateError })
  const statsUrl = apiUrl('/players', { team: club.id, season: SEASON }, { broken: simulateError })
  const squadRequest = useFetch(squadUrl, fetchApiFootball)
  const statsRequest = useFetch(statsUrl, fetchAllPages)

  const squadData = squadRequest.data
  const statsData = statsRequest.data

  const result = useMemo(() => {
    if (!squadData || !statsData) return { players: [], details: new Map() }

    const squadPlayers = squadData.response[0]?.players ?? []
    const players = toSquadPlayers(squadPlayers, club, toRatingsById(statsData.response))

    // Extra info for Explore that the builder doesn't need, by the same id the players use.
    const statsById = new Map(statsData.response.map((entry) => [entry.player.id, entry]))
    const details = new Map(
      squadPlayers.map((player) => [
        `api-${player.id}`,
        { number: player.number, age: player.age, stats: statsById.get(player.id) ?? null },
      ]),
    )

    return { players, details }
  }, [squadData, statsData, club])

  function retry() {
    // Only the request that failed refetches; the other comes straight from the cache.
    squadRequest.retry()
    statsRequest.retry()
  }

  return {
    ...result,
    loading: squadRequest.loading || statsRequest.loading,
    error: squadRequest.error || statsRequest.error,
    retry,
  }
}
