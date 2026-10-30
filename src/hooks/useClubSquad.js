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

// A club's current squad with OVRs, from two API-Football requests combined into one
// { players, loading, error, retry } result.
export function useClubSquad(club, simulateError) {
  // Who is in the squad now, and how they rated last season.
  const squadUrl = apiUrl('/players/squads', { team: club.id }, { broken: simulateError })
  const statsUrl = apiUrl('/players', { team: club.id, season: SEASON }, { broken: simulateError })
  const squadRequest = useFetch(squadUrl, fetchApiFootball)
  const statsRequest = useFetch(statsUrl, fetchAllPages)

  const squadData = squadRequest.data
  const statsData = statsRequest.data

  const players = useMemo(() => {
    if (!squadData || !statsData) return []
    const squadPlayers = squadData.response[0]?.players ?? []
    return toSquadPlayers(squadPlayers, club, toRatingsById(statsData.response))
  }, [squadData, statsData, club])

  function retry() {
    // Only the request that failed refetches; the other comes straight from the cache.
    squadRequest.retry()
    statsRequest.retry()
  }

  return {
    players,
    loading: squadRequest.loading || statsRequest.loading,
    error: squadRequest.error || statsRequest.error,
    retry,
  }
}
