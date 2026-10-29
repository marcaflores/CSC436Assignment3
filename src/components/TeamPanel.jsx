import FormationPicker from './FormationPicker'
import Pitch from './Pitch'
import TeamSummary from './TeamSummary'

function TeamPanel({
  teamId,
  team,
  squad,
  otherTeamAssignments,
  opponent,
  matchResult,
  onFormationChange,
  onAssign,
  onSimulate,
}) {
  return (
    <div className="team-panel">
      <h3 className="team-panel__title">{team.label}</h3>

      <FormationPicker
        formationKey={team.formationKey}
        onChange={(nextFormationKey) => onFormationChange(teamId, nextFormationKey)}
      />

      <Pitch
        formationKey={team.formationKey}
        squad={squad}
        assignments={team.assignments}
        otherTeamAssignments={otherTeamAssignments}
        onAssign={(slotId, playerId) => onAssign(teamId, slotId, playerId)}
      />

      <TeamSummary
        squad={squad}
        formationKey={team.formationKey}
        assignments={team.assignments}
        teamLabel={team.label}
        opponent={opponent}
        matchResult={matchResult}
        onSimulate={onSimulate}
      />
    </div>
  )
}

export default TeamPanel
