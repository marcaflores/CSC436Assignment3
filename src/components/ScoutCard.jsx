import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import {
  apiUrl,
  DEFAULT_RATING,
  fetchApiFootball,
  SEASON,
  SEASON_LABEL,
  toSeasonRating,
} from '../api/apiFootball'
import PlayerAvatar from './PlayerAvatar'

function clampRating(value) {
  const number = Math.round(Number(value))
  return Number.isNaN(number) ? DEFAULT_RATING : Math.min(99, Math.max(40, number))
}

// One scouted player. Players with no rating for this club (new signings) can look up their
// SEASON rating from wherever they played. It costs one request, so it waits for a click.
function ScoutCard({ player, alreadyAdded, lookupRequested, simulateError, onLookup, onAdd }) {
  const [customRating, setCustomRating] = useState(String(DEFAULT_RATING))

  const needsLookup = player.rating === null
  const lookupUrl =
    needsLookup && lookupRequested
      ? apiUrl('/players', { id: player.apiId, season: SEASON }, { broken: simulateError })
      : null
  const { data, loading, error, retry } = useFetch(lookupUrl, fetchApiFootball)

  // undefined: not looked up yet · null: looked up, no rating anywhere · object: found one
  const lookedUp = data ? toSeasonRating(data.response[0]?.statistics ?? []) : undefined
  const rating = player.rating ?? lookedUp?.rating ?? null
  const needsCustomRating = needsLookup && lookedUp === null

  function handleAdd() {
    onAdd({ ...player, rating: rating ?? clampRating(customRating) })
  }

  function renderStatus() {
    if (!needsLookup) return `OVR ${player.rating}`
    if (loading) return 'Checking rating…'
    if (error) return <span role="alert" title={error.message}>Couldn't get rating</span>
    if (lookedUp) return `OVR ${lookedUp.rating} · ${lookedUp.club}`
    if (lookedUp === null) return `No ${SEASON_LABEL} rating`
    return 'Unrated'
  }

  function renderAction() {
    if (alreadyAdded) {
      return (
        <button type="button" className="btn btn--outline" disabled aria-label={`${player.name} added`}>
          Added
        </button>
      )
    }
    if (needsLookup && !lookupRequested) {
      return (
        <button
          type="button"
          className="btn btn--outline"
          aria-label={`Get ${SEASON_LABEL} rating for ${player.name}`}
          onClick={() => onLookup(player.id)}
        >
          Get rating
        </button>
      )
    }
    if (loading) {
      return (
        <button type="button" className="btn btn--outline" disabled>
          …
        </button>
      )
    }
    if (error) {
      return (
        <button
          type="button"
          className="btn btn--outline"
          aria-label={`Try getting ${player.name}'s rating again`}
          onClick={retry}
        >
          Retry
        </button>
      )
    }

    return (
      <>
        {needsCustomRating && (
          <input
            type="number"
            className="scout-card__rating-input"
            min={40}
            max={99}
            value={customRating}
            onChange={(event) => setCustomRating(event.target.value)}
            aria-label={`Starting OVR for ${player.name}`}
          />
        )}
        <button type="button" className="btn btn--outline" aria-label={`Add ${player.name}`} onClick={handleAdd}>
          Add
        </button>
      </>
    )
  }

  return (
    <li className="scout-card">
      <PlayerAvatar player={player} />
      <div className="scout-card__info">
        <p className="scout-card__name">{player.name}</p>
        <p className="player-card__rating">
          <span className={`position-badge position-badge--${player.position}`}>{player.position}</span>{' '}
          {renderStatus()}
        </p>
      </div>
      {renderAction()}
    </li>
  )
}

export default ScoutCard
