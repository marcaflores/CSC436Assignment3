// Everything that knows about API-Football lives here: URLs, auth, caching and response shapes.
// Docs: https://www.api-football.com/documentation-v3
const BASE_URL = import.meta.env.VITE_API_FOOTBALL_URL ?? 'https://v3.football.api-sports.io'
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY

// The .invalid domain can never resolve, so requests fail like a dropped network and cost no quota.
const BROKEN_BASE_URL = 'https://v3.football.api-sports.invalid'

// Latest season the free plan can read.
export const SEASON = 2024

export const LEAGUES = [
  { id: 39, name: 'Premier League' },
  { id: 140, name: 'La Liga' },
  { id: 135, name: 'Serie A' },
  { id: 78, name: 'Bundesliga' },
  { id: 61, name: 'Ligue 1' },
]

export function apiUrl(path, params, { broken = false } = {}) {
  const query = new URLSearchParams(params).toString()
  return `${broken ? BROKEN_BASE_URL : BASE_URL}${path}?${query}`
}

// The free plan allows 100 requests a day, so successful responses are cached in the browser.
const CACHE_PREFIX = 'api-football:'
const CACHE_TTL_MS = 12 * 60 * 60 * 1000

function readCache(url) {
  try {
    const entry = JSON.parse(localStorage.getItem(CACHE_PREFIX + url))
    if (entry && Date.now() - entry.savedAt < CACHE_TTL_MS) return entry.data
  } catch {
    // Missing, corrupt or blocked storage — just fetch again.
  }
  return null
}

function writeCache(url, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + url, JSON.stringify({ savedAt: Date.now(), data }))
  } catch {
    // Storage full or blocked — the app still works, it just refetches next time.
  }
}

// Fetcher for useFetch: resolves with the parsed body or rejects with a human-readable Error.
export async function fetchApiFootball(url, signal) {
  const cached = readCache(url)
  if (cached) return cached

  let response
  try {
    response = await fetch(url, { headers: { 'x-apisports-key': API_KEY }, signal })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error(
      navigator.onLine
        ? "Couldn't reach API-Football. The service may be down or the request was blocked."
        : 'You appear to be offline. Check your internet connection.',
    )
  }

  if (!response.ok) {
    throw new Error(`API-Football responded with an error (HTTP ${response.status}).`)
  }

  const body = await response.json()

  // API-Football reports problems like a bad key or a used-up daily quota with HTTP 200 and an
  // `errors` field that is either an array or an object of messages.
  const messages = Object.values(body.errors ?? {})
  if (messages.length > 0) {
    throw new Error(`API-Football: ${messages.join(' ')}`)
  }

  writeCache(url, body)
  return body
}

const POSITION_CODES = {
  Goalkeeper: 'GK',
  Defender: 'DEF',
  Midfielder: 'MID',
  Attacker: 'FWD',
}

// Match ratings run roughly 6.0–8.0; stretch them onto the 40–99 OVR scale the squad uses.
function toOverall(matchRating) {
  return Math.min(99, Math.max(40, Math.round(Number(matchRating) * 10 + 10)))
}

// Turns one /players result into a squad player, or null if they never got a rating this season.
export function toSquadPlayer({ player, statistics }) {
  const rated = statistics.filter((stat) => stat.games.rating)
  if (rated.length === 0) return null

  // A player can have stats in several competitions; use the one they played the most minutes in.
  const main = rated.reduce((best, stat) =>
    (stat.games.minutes ?? 0) > (best.games.minutes ?? 0) ? stat : best,
  )
  const position = POSITION_CODES[main.games.position]
  if (!position) return null

  return {
    id: `api-${player.id}`,
    name: player.name,
    position,
    rating: toOverall(main.games.rating),
    photo: player.photo,
    club: main.team.name,
  }
}
