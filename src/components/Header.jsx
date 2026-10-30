import { useEffect, useState } from 'react'

const PAGES = [
  { id: 'explore', label: 'Explore', tagline: 'League tables, clubs and squads, this season and past ones.' },
  { id: 'schedule', label: 'Schedule', tagline: 'Results, live scores and fixtures by day.' },
  { id: 'builder', label: 'Team Builder', tagline: 'Build your squad, pick a formation, set the lineup.' },
]

function Header({ squadSize, page, onPageChange }) {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme ?? 'light')
  const isDark = theme === 'dark'

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // Ignore — the theme just will not be remembered next visit.
    }
  }, [theme])

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__crest" aria-hidden="true">⚽</span>
        <div>
          <h1>Let's Play Soccer</h1>
          <p>{PAGES.find((entry) => entry.id === page).tagline}</p>
        </div>
      </div>
      <nav className="app-nav" aria-label="Main">
        <ul className="app-nav__list">
          {PAGES.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                className="app-nav__link"
                aria-current={entry.id === page ? 'page' : undefined}
                onClick={() => onPageChange(entry.id)}
              >
                {entry.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="app-header__actions">
        <button
          type="button"
          className="theme-toggle"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
          <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
        </button>
        <div className="app-header__count">
          <span className="app-header__count-value">{squadSize}</span>
          <span className="app-header__count-label">Players</span>
        </div>
      </div>
    </header>
  )
}

export default Header
