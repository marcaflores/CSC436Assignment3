import { useEffect, useState } from 'react'
import { PAGES } from '../data/pages'
import Icon from './Icon'

// Sticky top bar: brand, page links and the squad/theme controls. On phones the page links
// move to a tab bar fixed to the bottom of the screen, where thumbs can reach them.
function Header({ squadSize, page }) {
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
      <div className="app-header__inner">
        <a className="app-header__brand" href="#explore">
          <span className="app-header__logo">
            <Icon name="ball" size={22} />
          </span>
          <h1 className="app-header__title">Let's Play Soccer</h1>
        </a>

        {/* Real links to #hashes: the back button and shared links both work. */}
        <nav className="app-nav" aria-label="Main">
          <ul className="app-nav__list">
            {PAGES.map((entry) => (
              <li key={entry.id}>
                <a
                  className="app-nav__link"
                  href={`#${entry.id}`}
                  aria-current={entry.id === page ? 'page' : undefined}
                >
                  <Icon name={entry.icon} />
                  <span>{entry.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="app-header__actions">
          <a
            className="squad-chip"
            href="#builder"
            aria-label={`Your squad: ${squadSize} ${squadSize === 1 ? 'player' : 'players'}`}
          >
            <Icon name="users" size={18} />
            <span className="squad-chip__count">{squadSize}</span>
          </a>
          <button
            type="button"
            className="theme-toggle"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
          >
            <Icon name={isDark ? 'sun' : 'moon'} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
