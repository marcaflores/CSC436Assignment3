import { useMemo, useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { apiUrl, fetchApiFootball, SEASON, toSquadPlayer } from '../api/apiFootball'
import { POSITIONS } from '../data/formations'
import { FetchError, LoadingRows } from './FetchStatus'
import PlayerAvatar from './PlayerAvatar'

// Lowercase and strip accents so "martinez" finds "Martínez".
function normalize(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function ClubPlayers({ club, simulateError, squad, onAddPlayer }) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [positionFilter, setPositionFilter] = useState('ALL')

  // API-Football returns 20 players per page, and each page costs one request.
  const url = apiUrl('/players', { team: club.id, season: SEASON, page }, { broken: simulateError })
  const { data, loading, error, retry } = useFetch(url, fetchApiFootball)

  const players = useMemo(
    () => (data ? data.response.map(toSquadPlayer).filter(Boolean) : []),
    [data],
  )

  // Searching and filtering only narrow the page already fetched, so typing never sends a request.
  const query = normalize(search.trim())
  const visiblePlayers = players.filter(
    (player) =>
      (positionFilter === 'ALL' || player.position === positionFilter) &&
      normalize(player.name).includes(query),
  )

  const totalPages = data?.paging.total
  const unratedCount = data ? data.response.length - players.length : 0

  function renderPlayers() {
    if (loading) return <LoadingRows label="Loading players…" />
    if (error) return <FetchError title="Couldn't load players" error={error} onRetry={retry} />
    if (players.length === 0) {
      return <p className="empty-state">No rated players on this page.</p>
    }
    if (visiblePlayers.length === 0) {
      return <p className="empty-state">No players on this page match your search.</p>
    }

    return (
      <ul className="scout-list">
        {visiblePlayers.map((player) => {
          const alreadyAdded = squad.some((squadPlayer) => squadPlayer.id === player.id)

          return (
            <li key={player.id} className="scout-card">
              <PlayerAvatar player={player} />
              <div className="scout-card__info">
                <p className="scout-card__name">{player.name}</p>
                <p className="player-card__rating">
                  <span className={`position-badge position-badge--${player.position}`}>
                    {player.position}
                  </span>{' '}
                  OVR {player.rating}
                </p>
              </div>
              <button
                type="button"
                className="btn btn--outline"
                disabled={alreadyAdded}
                aria-label={alreadyAdded ? `${player.name} added` : `Add ${player.name}`}
                onClick={() => onAddPlayer(player)}
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
          placeholder="Search this page"
          aria-label={`Search ${club.name} players on this page`}
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

      {unratedCount > 0 && (
        <p className="scout-note">
          {unratedCount} {unratedCount === 1 ? 'player has' : 'players have'} no {SEASON} rating
          and {unratedCount === 1 ? 'is' : 'are'} hidden.
        </p>
      )}

      <nav className="pager" aria-label={`${club.name} player pages`}>
        <button
          type="button"
          className="btn btn--outline"
          disabled={loading || page === 1}
          onClick={() => setPage((current) => current - 1)}
        >
          ‹ Prev
        </button>
        <span className="pager__status">
          Page {page}
          {totalPages ? ` of ${totalPages}` : ''}
        </span>
        <button
          type="button"
          className="btn btn--outline"
          disabled={loading || !totalPages || page >= totalPages}
          onClick={() => setPage((current) => current + 1)}
        >
          Next ›
        </button>
      </nav>
    </div>
  )
}

export default ClubPlayers
