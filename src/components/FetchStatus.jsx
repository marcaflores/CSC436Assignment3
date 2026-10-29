// Shared loading and error views so every fetch in the app looks and behaves the same way.

export function LoadingRows({ label, rows = 5 }) {
  return (
    <div className="loading-rows" role="status">
      <span className="visually-hidden">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="skeleton skeleton--row" aria-hidden="true">
          <span className="skeleton__circle" />
          <span className="skeleton__line" />
        </div>
      ))}
    </div>
  )
}

export function LoadingGrid({ label, tiles = 9 }) {
  return (
    <div className="club-grid" role="status">
      <span className="visually-hidden">{label}</span>
      {Array.from({ length: tiles }, (_, index) => (
        <div key={index} className="skeleton skeleton--tile" aria-hidden="true" />
      ))}
    </div>
  )
}

export function FetchError({ title, error, onRetry }) {
  return (
    <div className="fetch-error" role="alert">
      <p className="fetch-error__title">
        <span aria-hidden="true">⚠️</span> {title}
      </p>
      <p className="fetch-error__message">{error.message}</p>
      <button type="button" className="btn btn--outline" onClick={onRetry}>
        Try again
      </button>
    </div>
  )
}
