import { useCallback, useEffect, useState } from 'react'

const EMPTY = { url: null, data: null, error: null }

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`Request failed (HTTP ${response.status}).`)
  return response.json()
}

// Fetches `url` and reports it as exactly one of three states: loading, error or data.
// Pass a null url to skip fetching. `fetcher(url, signal)` must be defined outside any
// component: a new function every render would be a new dependency and refetch forever.
export function useFetch(url, fetcher = fetchJson) {
  // Results are tagged with the url they belong to, so a new url reads as loading right away
  // instead of briefly showing the previous url's data.
  const [result, setResult] = useState(EMPTY)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!url) return

    // Aborting on cleanup cancels the request when the url changes or the component unmounts,
    // so a slow old response can never overwrite a newer one.
    const controller = new AbortController()

    fetcher(url, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ url, data, error: null })
      },
      (error) => {
        if (!controller.signal.aborted) setResult({ url, data: null, error })
      },
    )

    return () => controller.abort()
  }, [url, fetcher, attempt])

  const retry = useCallback(() => {
    setResult(EMPTY)
    setAttempt((count) => count + 1)
  }, [])

  const isCurrent = result.url === url
  return {
    data: isCurrent ? result.data : null,
    error: isCurrent ? result.error : null,
    loading: Boolean(url) && !isCurrent,
    retry,
  }
}
