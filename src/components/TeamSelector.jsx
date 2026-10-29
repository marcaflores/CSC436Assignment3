const VIEW_OPTIONS = [
  { key: 'team1', label: 'Team 1' },
  { key: 'team2', label: 'Team 2' },
  { key: 'both', label: 'Both' },
]

function TeamSelector({ viewMode, onChange }) {
  return (
    <div className="team-selector" role="radiogroup" aria-label="Team view">
      {VIEW_OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          role="radio"
          aria-checked={viewMode === option.key}
          className={`chip ${viewMode === option.key ? 'chip--active' : ''}`}
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default TeamSelector
