import { useEffect, useRef } from 'react'
import { COMPETITIONS } from '../api/footballData'
import ErrorToggle from './ErrorToggle'
import LeagueView from './LeagueView'
import ClubView from './ClubView'

// League → club, with this season's data from football-data.org. Where the user is lives in App
// (`explore`), so it survives a trip to the builder and back. Each view only fetches when opened.
function ExplorePage({ explore, onNavigate, simulateError, onSimulateErrorChange }) {
  const { code, club } = explore
  const competition = COMPETITIONS.find((entry) => entry.code === code)

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

  const openLeague = (nextCode) => navigate({ code: nextCode, club: null })
  const openClub = (nextClub) => navigate({ code, club: nextClub })

  return (
    <main className="explore">
      <ul className="league-tabs" aria-label="Leagues">
        {COMPETITIONS.map((entry) => (
          <li key={entry.code}>
            <button
              type="button"
              className="league-tabs__button"
              aria-pressed={entry.code === code}
              onClick={() => openLeague(entry.code)}
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
              <button type="button" className="breadcrumbs__link" onClick={() => openLeague(code)}>
                {competition.name}
              </button>
            </li>
            <li>
              <span aria-current="page">{club.shortName ?? club.name}</span>
            </li>
          </ol>
        </nav>
      )}

      {/* key gives each league and club a fresh view, so a club's search box starts empty */}
      {club ? (
        <ClubView
          key={club.id}
          club={club}
          simulateError={simulateError}
          headingRef={headingRef}
        />
      ) : (
        <LeagueView
          key={code}
          competition={competition}
          simulateError={simulateError}
          onOpenClub={openClub}
          headingRef={headingRef}
        />
      )}

      <div className="explore__footer">
        <ErrorToggle checked={simulateError} onChange={onSimulateErrorChange} />
      </div>
    </main>
  )
}

export default ExplorePage
