// Forwards /api/football-data/* to football-data.org with the API key added here, on the server.
// football-data.org doesn't allow browser requests (no CORS headers), and this way the key is never
// in the frontend bundle. Locally, vite.config.js does the same job.
const API_BASE = 'https://api.football-data.org/v4'

export default async (request) => {
  if (request.method !== 'GET') {
    return Response.json({ message: 'Only GET requests are allowed.' }, { status: 405 })
  }

  // Without a key football-data.org answers with a vague "restricted" error, so say what's wrong.
  const key = Netlify.env.get('FOOTBALL_DATA_KEY')
  if (!key) {
    return Response.json(
      { message: 'The FOOTBALL_DATA_KEY environment variable is not set on Netlify.' },
      { status: 500 },
    )
  }

  const url = new URL(request.url)
  const path = url.pathname.replace(/^\/api\/football-data/, '')

  const response = await fetch(`${API_BASE}${path}${url.search}`, {
    headers: { 'X-Auth-Token': key },
  })

  return new Response(response.body, {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const config = { path: '/api/football-data/*' }
