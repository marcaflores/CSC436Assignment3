import { useState } from 'react'
import { LEAGUES, SEASON } from '../api/apiFootball'
import ClubPicker from './ClubPicker'
import ClubPlayers from './ClubPlayers'

// Browse real clubs and players from API-Football and add them to the squad.
function ScoutPlayers({ squad, onAddPlayer }) {
  const [leagueId, setLeagueId] = useState(LEAGUES[0].id)
  const [club, setClub] = useState(null)
  const [simulateError, setSimulateError] = useState(false)

  function handleLeagueChange(event) {
    setLeagueId(Number(event.target.value))
    setClub(null)
  }

  return (
    <div className="scout-players">
      <div className="player-list__header">
        <div>
          <h2 className="panel-title">Scout Players</h2>
          <p className="scout-players__subtitle">Real players from the {SEASON} season</p>
        </div>
        <select
          className="filter-select"
          value={leagueId}
          onChange={handleLeagueChange}
          aria-label="League"
        >
          {LEAGUES.map((league) => (
            <option key={league.id} value={league.id}>
              {league.name}
            </option>
          ))}
        </select>
      </div>

      {club ? (
        <>
          <div className="scout-players__club">
            <button type="button" className="btn btn--outline" onClick={() => setClub(null)}>
              ‹ All clubs
            </button>
            <img className="scout-players__club-logo" src={club.logo} alt="" />
            <h3 className="scout-players__club-name">{club.name}</h3>
          </div>
          {/* key resets the page, search and filter when a different club is picked */}
          <ClubPlayers
            key={club.id}
            club={club}
            simulateError={simulateError}
            squad={squad}
            onAddPlayer={onAddPlayer}
          />
        </>
      ) : (
        <ClubPicker leagueId={leagueId} simulateError={simulateError} onSelect={setClub} />
      )}

      <label className="error-toggle">
        <input
          type="checkbox"
          checked={simulateError}
          onChange={(event) => setSimulateError(event.target.checked)}
        />
        <span>
          Simulate API failure
          <span className="error-toggle__hint">Sends requests to a broken URL to show the error state.</span>
        </span>
      </label>
    </div>
  )
}

export default ScoutPlayers
