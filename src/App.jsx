import { useState } from 'react'
import Header from './components/Header'
import PresetPlayers from './components/PresetPlayers'
import PlayerForm from './components/PlayerForm'
import PlayerList from './components/PlayerList'
import TeamSelector from './components/TeamSelector'
import TeamPanel from './components/TeamPanel'
import { getLineupStats, simulateMatch } from './utils/teamStats'
import './App.css'

const INITIAL_TEAMS = {
  team1: { label: 'Team 1', formationKey: '4-3-3', assignments: {} },
  team2: { label: 'Team 2', formationKey: '4-4-2', assignments: {} },
}

function App() {
  const [squad, setSquad] = useState([])
  const [teams, setTeams] = useState(INITIAL_TEAMS)
  const [viewMode, setViewMode] = useState('team1')
  const [matchResult, setMatchResult] = useState(null)

  function handleAddPlayer(player) {
    setSquad((prev) => [...prev, player])
  }

  function handleRemovePlayer(playerId) {
    setSquad((prev) => prev.filter((player) => player.id !== playerId))
    setTeams((prev) => {
      const next = {}
      for (const [teamId, team] of Object.entries(prev)) {
        const assignments = { ...team.assignments }
        for (const slotId of Object.keys(assignments)) {
          if (assignments[slotId] === playerId) delete assignments[slotId]
        }
        next[teamId] = { ...team, assignments }
      }
      return next
    })
    setMatchResult(null)
  }

  function handleFormationChange(teamId, nextFormationKey) {
    setTeams((prev) => ({
      ...prev,
      [teamId]: { ...prev[teamId], formationKey: nextFormationKey, assignments: {} },
    }))
    setMatchResult(null)
  }

  function handleAssign(teamId, slotId, playerId) {
    setTeams((prev) => {
      const assignments = { ...prev[teamId].assignments }
      if (!playerId) {
        delete assignments[slotId]
      } else {
        assignments[slotId] = playerId
      }
      return { ...prev, [teamId]: { ...prev[teamId], assignments } }
    })
    setMatchResult(null)
  }

  const otherTeamId = { team1: 'team2', team2: 'team1' }

  const stats = {
    team1: getLineupStats(squad, teams.team1.formationKey, teams.team1.assignments),
    team2: getLineupStats(squad, teams.team2.formationKey, teams.team2.assignments),
  }

  function handleSimulate() {
    const { goalsA, goalsB } = simulateMatch(stats.team1.averageRating, stats.team2.averageRating)
    setMatchResult({ team1: goalsA, team2: goalsB })
  }

  function renderTeamPanel(teamId) {
    const opponentId = otherTeamId[teamId]
    return (
      <TeamPanel
        key={teamId}
        teamId={teamId}
        team={teams[teamId]}
        squad={squad}
        otherTeamAssignments={teams[opponentId].assignments}
        opponent={{ label: teams[opponentId].label, isComplete: stats[opponentId].isComplete }}
        matchResult={
          matchResult && { goalsFor: matchResult[teamId], goalsAgainst: matchResult[opponentId] }
        }
        onFormationChange={handleFormationChange}
        onAssign={handleAssign}
        onSimulate={handleSimulate}
      />
    )
  }

  return (
    <div className="app">
      <Header squadSize={squad.length} />

      <main className="app-layout">
        <section className="app-layout__sidebar">
          <PresetPlayers squad={squad} onAddPlayer={handleAddPlayer} />
          <PlayerForm onAddPlayer={handleAddPlayer} />
        </section>

        <section className="app-layout__main">
          <TeamSelector viewMode={viewMode} onChange={setViewMode} />

          {viewMode === 'both' ? (
            <div className="teams-grid">
              {['team1', 'team2'].map(renderTeamPanel)}
            </div>
          ) : (
            renderTeamPanel(viewMode)
          )}
        </section>

        <section className="app-layout__squad">
          <PlayerList players={squad} onRemovePlayer={handleRemovePlayer} />
        </section>
      </main>
    </div>
  )
}

export default App
