import { useEffect, useRef } from 'react'
import { COMPETITIONS, yearLabel } from '../api/footballData'
import ErrorToggle from './ErrorToggle'
import Icon from './Icon'
import PageHero from './PageHero'
import LeagueView from './LeagueView'
import ClubView from './ClubView'

// League → club, with football-data.org data for this season or a past one. Where the user is
// lives in App (`explore`), so it survives a trip to another page and back. Each view only
// fetches when it's opened.
function ExplorePage({ explore, onNavigate, simulateError, onSimulateErrorChange }) {
  const { code, season, club } = explore
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

  // The season stays picked when switching leagues, so you can compare the same year across them.
  const openLeague = (nextCode) => navigate({ code: nextCode, season, club: null })
  const changeSeason = (nextSeason) => navigate({ code, season: nextSeason, club: null })
  const openClub = (nextClub) => navigate({ code, season, club: nextClub })

  return (
    <main className="page">
      <PageHero pageId="explore">
        <ul className="league-tabs" aria-label="Competitions">
          {COMPETITIONS.map((entry) => (
            <li key={entry.code}>
              <button
                type="button"
                className="league-tabs__button"
                aria-pressed={entry.code === code}
                onClick={() => openLeague(entry.code)}
              >
                <span className="league-tabs__emblem">
                  <img src={entry.emblem} alt="" />
                </span>
                {entry.name}
              </button>
            </li>
          ))}
        </ul>
      </PageHero>

      <div className="page__body">
        {club && (
          <nav aria-label="Breadcrumb">
            <ol className="breadcrumbs">
              <li>
                <button type="button" className="breadcrumbs__link" onClick={() => openLeague(code)}>
                  <Icon name="chevronLeft" size={16} />
                  {competition.name}
                  {season ? ` ${yearLabel(season)}` : ''}
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
            key={`${code}-${season}`}
            competition={competition}
            seasonYear={season}
            onSeasonChange={changeSeason}
            simulateError={simulateError}
            onOpenClub={openClub}
            headingRef={headingRef}
          />
        )}

        <div className="page__footer">
          <ErrorToggle checked={simulateError} onChange={onSimulateErrorChange} />
        </div>
      </div>
    </main>
  )
}

export default ExplorePage
