// Everything that knows about football-data.org lives here: URLs, errors and response shapes.
// It powers the Explore page with current-season data. Docs: https://docs.football-data.org
import { createFetcher } from './createFetcher'

// Requests go through our own proxy (netlify/functions/football-data.mjs in production,
// vite.config.js locally), which adds the key. football-data.org doesn't allow browser requests.
const BASE_URL = '/api/football-data'
const BROKEN_BASE_URL = 'https://football-data.invalid'

const EMBLEM_URL = 'https://crests.football-data.org'

export const COMPETITIONS = [
  { code: 'PL', name: 'Premier League', emblem: `${EMBLEM_URL}/PL.png` },
  { code: 'PD', name: 'La Liga', emblem: `${EMBLEM_URL}/PD.png` },
  { code: 'SA', name: 'Serie A', emblem: `${EMBLEM_URL}/SA.png` },
  { code: 'BL1', name: 'Bundesliga', emblem: `${EMBLEM_URL}/BL1.png` },
  { code: 'FL1', name: 'Ligue 1', emblem: `${EMBLEM_URL}/FL1.png` },
  { code: 'CL', name: 'Champions League', emblem: `${EMBLEM_URL}/CL.png` },
]

export function footballDataUrl(path, params = {}, { broken = false } = {}) {
  const query = new URLSearchParams(params).toString()
  return `${broken ? BROKEN_BASE_URL : BASE_URL}${path}${query ? `?${query}` : ''}`
}

// No daily cap on the free plan, only 10 requests a minute. Scores change during the day,
// so responses are only reused for 10 minutes.
export const fetchFootballData = createFetcher({
  cachePrefix: 'football-data:',
  cacheTtlMs: 10 * 60 * 1000,
  rateLimit: 10,
  networkError: "Couldn't reach football-data.org. Check your connection and try again.",
  getError(response, body) {
    if (response.ok) return null
    if (response.status === 429) {
      return 'Too many requests: the free plan allows 10 a minute. Wait a moment and try again.'
    }
    // Errors come back as JSON with a `message`, e.g. for a missing key or a paid-only resource.
    return `football-data.org: ${body?.message ?? `error (HTTP ${response.status})`}`
  },
})

// 2025 → "2025–26"
export function yearLabel(startYear) {
  return `${startYear}–${String(startYear + 1).slice(2)}`
}

// A season from the API ("startDate": "2025-08-15") → "2025–26"
export function seasonLabel(season) {
  return yearLabel(Number(season.startDate.slice(0, 4)))
}

// Seasons start in July or later, so before July the current season began last year.
function currentStartYear() {
  const now = new Date()
  return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
}

// The free plan has the current season and the three before it; older ones come back "restricted".
export const PAST_SEASONS = [1, 2, 3].map((yearsBack) => currentStartYear() - yearsBack)

// Squad positions are either broad ("Defence") or detailed ("Centre-Back"), depending on the club.
const POSITION_GROUPS = [
  { code: 'GK', title: 'Goalkeepers', match: /goalkeeper/i },
  { code: 'DEF', title: 'Defenders', match: /defen|back/i },
  { code: 'MID', title: 'Midfielders', match: /midfield/i },
  { code: 'FWD', title: 'Forwards', match: /offence|forward|winger|striker/i },
]

export function groupSquad(squad) {
  const groups = POSITION_GROUPS.map((group) => ({ ...group, players: [] }))
  const other = { code: 'OTHER', title: 'Other', players: [] }

  for (const player of squad) {
    const group = groups.find(({ match }) => match.test(player.position ?? '')) ?? other
    group.players.push(player)
  }

  return [...groups, other].filter((group) => group.players.length > 0)
}

export function ageFrom(dateOfBirth) {
  if (!dateOfBirth) return null
  const born = new Date(dateOfBirth)
  const now = new Date()
  const hadBirthday =
    now.getMonth() > born.getMonth() ||
    (now.getMonth() === born.getMonth() && now.getDate() >= born.getDate())
  return now.getFullYear() - born.getFullYear() - (hadBirthday ? 0 : 1)
}
