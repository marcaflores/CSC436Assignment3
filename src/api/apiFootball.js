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

// Fallback OVR when a club has no rated players to estimate from. Matches PlayerForm.
const DEFAULT_RATING = 70

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

// The free plan also allows only 10 requests a minute. Going over returns a 429 without CORS
// headers, which the browser hides as a network error, so requests are paced to stay under it.
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60 * 1000
const sentAt = []

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForRateLimit() {
  for (;;) {
    const now = Date.now()
    while (sentAt.length > 0 && now - sentAt[0] >= RATE_WINDOW_MS) sentAt.shift()
    if (sentAt.length < RATE_LIMIT) {
      sentAt.push(now)
      return
    }
    await sleep(sentAt[0] + RATE_WINDOW_MS - now)
  }
}

async function request(url) {
  // The broken URL never reaches the server, so it doesn't need a rate-limit slot.
  if (!url.startsWith(BROKEN_BASE_URL)) await waitForRateLimit()

  let response
  try {
    response = await fetch(url, { headers: { 'x-apisports-key': API_KEY } })
  } catch {
    throw new Error(
      navigator.onLine
        ? "Couldn't reach API-Football. If you opened several clubs quickly, the free plan's limit of 10 requests a minute may have been hit, so wait a moment and try again."
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

// Requests already on their way, by url. A second caller for the same url (like React running
// an effect twice in development) shares the first request instead of spending another one.
const inFlight = new Map()

// Rejects as soon as `signal` aborts, without cancelling the shared request underneath.
function abortable(promise, signal) {
  return new Promise((resolve, reject) => {
    const abort = () => reject(new DOMException('Request aborted', 'AbortError'))
    if (signal?.aborted) return abort()
    signal?.addEventListener('abort', abort, { once: true })
    promise.then(resolve, reject)
  })
}

// Fetcher for useFetch: resolves with the parsed body or rejects with a human-readable Error.
export function fetchApiFootball(url, signal) {
  const cached = readCache(url)
  if (cached) return Promise.resolve(cached)

  if (!inFlight.has(url)) {
    inFlight.set(url, request(url).finally(() => inFlight.delete(url)))
  }
  return abortable(inFlight.get(url), signal)
}

// The free plan rejects any page past 3, so stats beyond that are skipped.
const MAX_PAGE = 3

// Fetcher for paginated endpoints: loads every page and merges them into one `response` list.
export async function fetchAllPages(url, signal) {
  const first = await fetchApiFootball(`${url}&page=1`, signal)
  const lastPage = Math.min(first.paging.total, MAX_PAGE)
  const rest = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, index) =>
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

function average(numbers) {
  return numbers.reduce((sum, number) => sum + number, 0) / numbers.length
}

// Players under this age lose a little from their estimate, so youth players rank below starters.
const YOUTH_AGE = 21
const YOUTH_PENALTY_PER_YEAR = 3

// Builds the squad list from /players/squads plus the club's SEASON ratings. Players with no
// rating (mostly new signings) get an estimate instead of costing another request: the club's
// average for their position, a little lower for young players. Estimates are flagged.
export function toSquadPlayers(squadPlayers, club, ratingsById) {
  const players = squadPlayers
    .filter((player) => POSITION_CODES[player.position])
    .map((player) => ({
      id: `api-${player.id}`,
      name: player.name,
      position: POSITION_CODES[player.position],
      rating: ratingsById.get(player.id) ?? null,
      age: player.age,
      photo: player.photo,
      club: club.name,
    }))

  const rated = players.filter((player) => player.rating !== null)
  const clubAverage = rated.length ? average(rated.map((player) => player.rating)) : DEFAULT_RATING

  return players.map(({ age, ...player }) => {
    if (player.rating !== null) return player

    const samePosition = rated.filter((other) => other.position === player.position)
    const base = samePosition.length ? average(samePosition.map((other) => other.rating)) : clubAverage
    const youthPenalty = Math.max(0, YOUTH_AGE - (age ?? YOUTH_AGE)) * YOUTH_PENALTY_PER_YEAR
    const rating = Math.min(99, Math.max(40, Math.round(base - youthPenalty)))

    return { ...player, rating, ratingEstimated: true }
  })
}
