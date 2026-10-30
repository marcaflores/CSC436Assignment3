// Lets the grader trigger the error state. Shared by both pages, so it's on or off everywhere.
function ErrorToggle({ checked, onChange }) {
  return (
    <label className="error-toggle">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>
        Simulate API failure
        <span className="error-toggle__hint">Sends requests to a broken URL to show the error state.</span>
      </span>
    </label>
  )
}

export default ErrorToggle
