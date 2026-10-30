import { useState } from 'react'
import { useClubSquad } from '../hooks/useClubSquad'
import { SEASON_LABEL } from '../api/apiFootball'
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

  const { players, loading, error, retry } = useClubSquad(club, simulateError)

  // Searching and filtering only narrow the squad already fetched, so typing never sends a request.
  const query = normalize(search.trim())
  const visiblePlayers = players.filter(
    (player) =>
      (positionFilter === 'ALL' || player.position === positionFilter) &&
      normalize(player.name).includes(query),
  )
  const estimatedCount = players.filter((player) => player.ratingEstimated).length

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

      {!loading && !error && estimatedCount > 0 && (
        <p className="scout-note">
          est. means the player has no {SEASON_LABEL} rating for {club.name}, usually a new signing,
          so their OVR is the club's average for their position (a little lower for players under 21).
        </p>
      )}
    </div>
  )
}

export default ClubPlayers
