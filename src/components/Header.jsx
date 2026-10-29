import { useEffect, useState } from 'react'

function Header({ squadSize }) {
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
          <h1>Matchday Builder</h1>
          <p>Build your squad, pick a formation, set the lineup.</p>
        </div>
      </div>
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
