import { FORMATIONS } from '../data/formations'

function FormationPicker({ formationKey, onChange }) {
  return (
    <div className="formation-picker">
      <span className="field__label">Formation</span>
      <div className="formation-picker__options" role="radiogroup" aria-label="Formation">
        {Object.keys(FORMATIONS).map((key) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={formationKey === key}
            className={`chip ${formationKey === key ? 'chip--active' : ''}`}
            onClick={() => onChange(key)}
          >
            {FORMATIONS[key].label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default FormationPicker
