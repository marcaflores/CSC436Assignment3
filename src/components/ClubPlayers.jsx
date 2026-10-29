import { useMemo, useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import {
  apiUrl,
  DEFAULT_RATING,
  fetchAllPages,
  fetchApiFootball,
  SEASON,
  SEASON_LABEL,
  toRatingsById,
  toSquadPlayer,
} from '../api/apiFootball'
import { POSITIONS } from '../data/formations'
import { FetchError, LoadingRows } from './FetchStatus'
import PlayerAvatar from './PlayerAvatar'

// Lowercase and strip accents so "martinez" finds "Martínez".
function normalize(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function clampRating(value) {
  const number = Math.round(Number(value))
  return Number.isNaN(number) ? DEFAULT_RATING : Math.min(99, Math.max(40, number))
}

function ClubPlayers({ club, simulateError, squad, onAddPlayer }) {
  const [search, setSearch] = useState('')
  const [positionFilter, setPositionFilter] = useState('ALL')
  // OVRs typed in for players with no rating, keyed by player id.
  const [customRatings, setCustomRatings] = useState({})

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

  function handleAdd(player) {
    const rating = player.rating ?? clampRating(customRatings[player.id] ?? DEFAULT_RATING)
    onAddPlayer({ ...player, rating })
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
        {visiblePlayers.map((player) => {
          const alreadyAdded = squad.some((squadPlayer) => squadPlayer.id === player.id)
          const isUnrated = player.rating === null

          return (
            <li key={player.id} className="scout-card">
              <PlayerAvatar player={player} />
              <div className="scout-card__info">
                <p className="scout-card__name">{player.name}</p>
                <p className="player-card__rating">
                  <span className={`position-badge position-badge--${player.position}`}>
                    {player.position}
                  </span>{' '}
                  {isUnrated ? 'No rating' : `OVR ${player.rating}`}
                </p>
              </div>
              {isUnrated && !alreadyAdded && (
                <input
                  type="number"
                  className="scout-card__rating-input"
                  min={40}
                  max={99}
                  value={customRatings[player.id] ?? DEFAULT_RATING}
                  onChange={(event) =>
                    setCustomRatings((prev) => ({ ...prev, [player.id]: event.target.value }))
                  }
                  aria-label={`Starting OVR for ${player.name}`}
                />
              )}
              <button
                type="button"
                className="btn btn--outline"
                disabled={alreadyAdded}
                aria-label={alreadyAdded ? `${player.name} added` : `Add ${player.name}`}
                onClick={() => handleAdd(player)}
              >
                {alreadyAdded ? 'Added' : 'Add'}
              </button>
            </li>
          )
        })}
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
          {unratedCount} {unratedCount === 1 ? 'player has' : 'players have'} no {SEASON_LABEL}{' '}
          rating for {club.name}, so you set their starting OVR.
        </p>
      )}
    </div>
  )
}

export default ClubPlayers
