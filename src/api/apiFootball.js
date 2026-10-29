// Everything that knows about API-Football lives here: URLs, auth, caching and response shapes.
// Docs: https://www.api-football.com/documentation-v3
const BASE_URL = import.meta.env.VITE_API_FOOTBALL_URL ?? 'https://v3.football.api-sports.io'
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY

// The .invalid domain can never resolve, so requests fail like a dropped network and cost no quota.
const BROKEN_BASE_URL = 'https://v3.football.api-sports.invalid'

// Squads are current, but the free plan only has stats up to the 2024 season (2024–25),
// so that's where ratings come from.
export const SEASON = 2024
export const SEASON_LABEL = '2024–25'

// Starting OVR for players with no rating from SEASON, e.g. new signings. Matches PlayerForm.
export const DEFAULT_RATING = 70

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

// Fetcher for paginated endpoints: loads every page and merges them into one `response` list.
export async function fetchAllPages(url, signal) {
  const first = await fetchApiFootball(`${url}&page=1`, signal)
  const rest = await Promise.all(
    Array.from({ length: first.paging.total - 1 }, (_, index) =>
      fetchApiFootball(`${url}&page=${index + 2}`, signal),
    ),
  )
  return { ...first, response: [first, ...rest].flatMap((page) => page.response) }
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

// Maps player id → OVR from a club's /players stats. Players who never got a match rating are left out.
export function toRatingsById(statsResponse) {
  const ratings = new Map()

  for (const { player, statistics } of statsResponse) {
    const rated = statistics.filter((stat) => stat.games.rating)
    if (rated.length === 0) continue

    // A player can have stats in several competitions; use the one they played the most minutes in.
    const main = rated.reduce((best, stat) =>
      (stat.games.minutes ?? 0) > (best.games.minutes ?? 0) ? stat : best,
    )
    ratings.set(player.id, toOverall(main.games.rating))
  }

  return ratings
}

// Turns one player from /players/squads into a squad player, or null if their position is unknown.
// `rating` is null when they have no SEASON rating for this club.
export function toSquadPlayer(player, club, ratingsById) {
  const position = POSITION_CODES[player.position]
  if (!position) return null

  return {
    id: `api-${player.id}`,
    name: player.name,
    position,
    rating: ratingsById.get(player.id) ?? null,
    photo: player.photo,
    club: club.name,
  }
}
