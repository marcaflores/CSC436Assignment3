const dateFormat = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

const LIVE = ['IN_PLAY', 'PAUSED']

// The middle of a row: the score once a game has started, otherwise the kick-off time.
function MatchScore({ match }) {
  const { home, away } = match.score.fullTime
  if (match.status === 'FINISHED' || LIVE.includes(match.status)) {
    return (
      <span className="match__score">
        {home}–{away}
        {LIVE.includes(match.status) && <span className="match__live">Live</span>}
      </span>
    )
  }
  if (match.status === 'POSTPONED') return <span className="match__time">Postponed</span>
  return <span className="match__time">{timeFormat.format(new Date(match.utcDate))}</span>
}

// Games as rows of "home · score or kick-off · away", in local time. The Schedule page turns
// the date off because every game in its list is on the same day.
function MatchList({ matches, showDate = true, showCompetition = false }) {
  return (
    <ul className="match-list">
      {matches.map((match) => (
        <li key={match.id} className="match">
          {(showDate || showCompetition) && (
            <p className="match__meta">
              {showDate && (
                <time dateTime={match.utcDate}>{dateFormat.format(new Date(match.utcDate))}</time>
              )}
              {showDate && showCompetition && ' · '}
              {showCompetition && match.competition.name}
            </p>
          )}
          <div className="match__teams">
            <span className="match__team match__team--home">
              <span className="match__name">{match.homeTeam.shortName ?? match.homeTeam.name}</span>
              <img className="match__crest" src={match.homeTeam.crest} alt="" loading="lazy" />
            </span>
            <MatchScore match={match} />
            <span className="match__team">
              <img className="match__crest" src={match.awayTeam.crest} alt="" loading="lazy" />
              <span className="match__name">{match.awayTeam.shortName ?? match.awayTeam.name}</span>
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default MatchList
