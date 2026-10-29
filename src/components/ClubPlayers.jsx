import { useMemo, useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import {
  apiUrl,
  fetchAllPages,
  fetchApiFootball,
  SEASON,
  SEASON_LABEL,
  toRatingsById,
  toSquadPlayer,
} from '../api/apiFootball'
import { POSITIONS } from '../data/formations'
import { FetchError, LoadingRows } from './FetchStatus'
import ScoutCard from './ScoutCard'

// Letters that aren't a base letter plus an accent, so NFD can't simplify them.
const SPECIAL_LETTERS = { ø: 'o', æ: 'ae', œ: 'oe', ß: 'ss', ł: 'l', đ: 'd', ı: 'i' }

// Lowercase and strip accents so "martinez" finds "Martínez" and "odegaard" finds "Ødegaard".
function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[øæœßłđı]/g, (letter) => SPECIAL_LETTERS[letter])
}

function ClubPlayers({ club, simulateError, squad, onAddPlayer }) {
  const [search, setSearch] = useState('')
  const [positionFilter, setPositionFilter] = useState('ALL')
  // Players whose rating lookup was asked for. Kept here so a row hidden by the search and shown
  // again keeps its looked-up rating (it comes back from the cache instead of costing a request).
  const [lookupIds, setLookupIds] = useState(() => new Set())

  // Two requests: who is in the squad now, and how they rated last season.
  const squadUrl = apiUrl('/players/squads', { team: club.id }, { broken: simulateError })
  const statsUrl = apiUrl('/players', { team: club.id, season: SEASON }, { broken: simulateError })
  const squadRequest = useFetch(squadUrl, fetchApiFootball)
  const statsRequest = useFetch(statsUrl, fetchAllPages)

  const loading = squadRequest.loading || statsRequest.loading
  const error = squadRequest.error || statsRequest.error

  function retry() {
    // Only the request that failed refetches; the other comes straight from the cache.
    squadRequest.retry()
    statsRequest.retry()
  }

  const players = useMemo(() => {
    if (!squadRequest.data || !statsRequest.data) return []
    const ratingsById = toRatingsById(statsRequest.data.response)
    const squadPlayers = squadRequest.data.response[0]?.players ?? []
    return squadPlayers.map((player) => toSquadPlayer(player, club, ratingsById)).filter(Boolean)
  }, [squadRequest.data, statsRequest.data, club])

  // Searching and filtering only narrow the squad already fetched, so typing never sends a request.
  const query = normalize(search.trim())
  const visiblePlayers = players.filter(
    (player) =>
      (positionFilter === 'ALL' || player.position === positionFilter) &&
      normalize(player.name).includes(query),
  )
  const unratedCount = players.filter((player) => player.rating === null).length

  function handleLookup(playerId) {
    setLookupIds((prev) => new Set(prev).add(playerId))
  }

  function renderPlayers() {
    if (loading) return <LoadingRows label="Loading squad…" />
    if (error) return <FetchError title="Couldn't load the squad" error={error} onRetry={retry} />
    if (players.length === 0) return <p className="empty-state">No squad listed for {club.name}.</p>
    if (visiblePlayers.length === 0) {
      return <p className="empty-state">No {club.name} players match your search.</p>
    }

    return (
      <ul className="scout-list">
        {visiblePlayers.map((player) => (
          <ScoutCard
            key={player.id}
            player={player}
            alreadyAdded={squad.some((squadPlayer) => squadPlayer.id === player.id)}
            lookupRequested={lookupIds.has(player.id)}
            simulateError={simulateError}
            onLookup={handleLookup}
            onAdd={onAddPlayer}
          />
        ))}
      </ul>
    )
  }

  return (
    <div className="club-players">
      <div className="scout-filters">
        <input
          type="search"
          className="filter-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search squad"
          aria-label={`Search ${club.name} players`}
        />
        <select
          className="filter-select"
          value={positionFilter}
          onChange={(event) => setPositionFilter(event.target.value)}
          aria-label="Filter players by position"
        >
          <option value="ALL">All</option>
          {POSITIONS.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </div>

      {renderPlayers()}

      {!loading && !error && unratedCount > 0 && (
        <p className="scout-note">
          {unratedCount} {unratedCount === 1 ? 'player has' : 'players have'} no {SEASON_LABEL} rating
          for {club.name}, usually new signings. Get rating looks up their {SEASON_LABEL} rating from any
          club, one request each.
        </p>
      )}
    </div>
  )
}

export default ClubPlayers
