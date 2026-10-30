// Builds a fetcher for useFetch with the protections both APIs need: a localStorage cache,
// pacing under a per-minute rate limit, and sharing of identical requests already in flight.

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Rejects as soon as `signal` aborts, without cancelling the shared request underneath.
function abortable(promise, signal) {
  return new Promise((resolve, reject) => {
    const abort = () => reject(new DOMException('Request aborted', 'AbortError'))
    if (signal?.aborted) return abort()
    signal?.addEventListener('abort', abort, { once: true })
    promise.then(resolve, reject)
  })
}

// Requests to a .invalid host can never resolve, so they fail like a dropped network.
// They're how "Simulate API failure" works, and they never need a rate-limit slot or the cache.
function isBroken(url) {
  return new URL(url, window.location.href).hostname.endsWith('.invalid')
}

/**
 * @param {object} options
 * @param {string} options.cachePrefix      localStorage key prefix
 * @param {number} options.cacheTtlMs       how long a successful response is reused
 * @param {number} options.rateLimit        requests allowed per minute
 * @param {object} [options.headers]        sent with every request
 * @param {string} options.networkError     message when the request can't be sent at all
 * @param {(response: Response, body: any) => string | null} options.getError
 *        returns a human-readable message when the response is an error, or null when it's fine
 */
export function createFetcher({ cachePrefix, cacheTtlMs, rateLimit, headers, networkError, getError }) {
  function readCache(url) {
    try {
      const entry = JSON.parse(localStorage.getItem(cachePrefix + url))
      if (entry && Date.now() - entry.savedAt < cacheTtlMs) return entry.data
    } catch {
      // Missing, corrupt or blocked storage — just fetch again.
    }
    return null
  }

  function writeCache(url, data) {
    try {
      localStorage.setItem(cachePrefix + url, JSON.stringify({ savedAt: Date.now(), data }))
    } catch {
      // Storage full or blocked — the app still works, it just refetches next time.
    }
  }

  // Sliding window of send times from the last minute.
  const sentAt = []

  async function waitForRateLimit() {
    for (;;) {
      const now = Date.now()
      while (sentAt.length > 0 && now - sentAt[0] >= 60_000) sentAt.shift()
      if (sentAt.length < rateLimit) {
        sentAt.push(now)
        return
      }
      await sleep(sentAt[0] + 60_000 - now)
    }
  }

  async function request(url) {
    if (!isBroken(url)) await waitForRateLimit()

    let response
    try {
      response = await fetch(url, { headers })
    } catch {
      throw new Error(
        navigator.onLine ? networkError : 'You appear to be offline. Check your internet connection.',
      )
    }

    let body = null
    try {
      body = await response.json()
    } catch {
      // Not JSON; getError still gets the status code to work with.
    }

    const message = getError(response, body)
    if (message) throw new Error(message)

    writeCache(url, body)
    return body
  }

  // Requests already on their way, by url. A second caller for the same url (like React running
  // an effect twice in development) shares the first request instead of spending another one.
  const inFlight = new Map()

  // Resolves with the parsed body or rejects with a human-readable Error.
  return function fetcher(url, signal) {
    const cached = readCache(url)
    if (cached) return Promise.resolve(cached)

    if (!inFlight.has(url)) {
      inFlight.set(url, request(url).finally(() => inFlight.delete(url)))
    }
    return abortable(inFlight.get(url), signal)
  }
}
