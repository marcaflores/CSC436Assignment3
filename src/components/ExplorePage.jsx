import { useEffect, useRef } from 'react'
import { LEAGUES } from '../api/apiFootball'
import ErrorToggle from './ErrorToggle'
import LeagueView from './LeagueView'
import ClubView from './ClubView'
import PlayerView from './PlayerView'

// League → club → player. Where the user is lives in App (`explore`), so it survives a trip to
// the builder and back. Each step only fetches when it's opened.
function ExplorePage({
  explore,
  onNavigate,
  squad,
  onAddPlayer,
  simulateError,
  onSimulateErrorChange,
}) {
  const { leagueId, club, player } = explore
  const league = LEAGUES.find((entry) => entry.id === leagueId)

  // After the user moves to another view, focus its heading so keyboard and screen reader users
  // land on the new content instead of on a button that just disappeared.
  const headingRef = useRef(null)
  const focusPending = useRef(false)

  useEffect(() => {
    if (!focusPending.current) return
    focusPending.current = false
    headingRef.current?.focus()
  }, [explore])

  function navigate(next) {
    focusPending.current = true
    onNavigate(next)
  }

  const openLeague = (id) => navigate({ leagueId: id, club: null, player: null })
  const openClub = (nextClub) => navigate({ leagueId, club: nextClub, player: null })
  const openPlayer = (nextPlayer) => navigate({ leagueId, club, player: nextPlayer })

  function renderView() {
    if (club && player) {
      return (
        <PlayerView
          key={player.id}
          club={club}
          player={player}
          simulateError={simulateError}
          squad={squad}
          onAddPlayer={onAddPlayer}
          headingRef={headingRef}
        />
      )
    }
    if (club) {
      return (
        <ClubView
          key={club.id}
          club={club}
          simulateError={simulateError}
          squad={squad}
          onAddPlayer={onAddPlayer}
          onOpenPlayer={openPlayer}
          headingRef={headingRef}
        />
      )
    }
    return (
      <LeagueView
        key={leagueId}
        league={league}
        simulateError={simulateError}
        onOpenClub={openClub}
        headingRef={headingRef}
      />
    )
  }

  return (
    <main className="explore">
      <ul className="league-tabs" aria-label="Leagues">
        {LEAGUES.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              className="league-tabs__button"
              aria-pressed={entry.id === leagueId}
              onClick={() => openLeague(entry.id)}
            >
              {entry.name}
            </button>
          </li>
        ))}
      </ul>

      {club && (
        <nav aria-label="Breadcrumb">
          <ol className="breadcrumbs">
            <li>
              <button type="button" className="breadcrumbs__link" onClick={() => openLeague(leagueId)}>
                {league.name}
              </button>
            </li>
            <li>
              {player ? (
                <button type="button" className="breadcrumbs__link" onClick={() => openClub(club)}>
                  {club.name}
                </button>
              ) : (
                <span aria-current="page">{club.name}</span>
              )}
            </li>
            {player && (
              <li>
                <span aria-current="page">{player.name}</span>
              </li>
            )}
          </ol>
        </nav>
      )}

      {renderView()}

      <div className="explore__footer">
        <ErrorToggle checked={simulateError} onChange={onSimulateErrorChange} />
      </div>
    </main>
  )
}

export default ExplorePage
