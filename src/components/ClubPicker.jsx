import { useFetch } from '../hooks/useFetch'
import { apiUrl, fetchApiFootball, SEASON } from '../api/apiFootball'
import { FetchError, LoadingGrid } from './FetchStatus'

function ClubPicker({ leagueId, simulateError, onSelect }) {
  const url = apiUrl('/teams', { league: leagueId, season: SEASON }, { broken: simulateError })
  const { data, loading, error, retry } = useFetch(url, fetchApiFootball)

  if (loading) return <LoadingGrid label="Loading clubs…" />
  if (error) return <FetchError title="Couldn't load clubs" error={error} onRetry={retry} />

  const clubs = data.response
    .map((entry) => entry.team)
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <ul className="club-grid">
      {clubs.map((club) => (
        <li key={club.id}>
          <button type="button" className="club-tile" onClick={() => onSelect(club)}>
            <img className="club-tile__logo" src={club.logo} alt="" loading="lazy" />
            <span className="club-tile__name">{club.name}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default ClubPicker
