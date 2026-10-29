// Each formation lists pitch slots top-to-bottom (attack -> defense -> keeper).
// x/y are percentages so the pitch scales at any screen size.
export const FORMATIONS = {
  '4-3-3': {
    label: '4-3-3',
    slots: [
      { id: '433-st1', role: 'FWD', title: 'LW', x: 18, y: 16 },
      { id: '433-st2', role: 'FWD', title: 'ST', x: 50, y: 10 },
      { id: '433-st3', role: 'FWD', title: 'RW', x: 82, y: 16 },
      { id: '433-mid1', role: 'MID', title: 'CM', x: 25, y: 42 },
      { id: '433-mid2', role: 'MID', title: 'CM', x: 50, y: 36 },
      { id: '433-mid3', role: 'MID', title: 'CM', x: 75, y: 42 },
      { id: '433-def1', role: 'DEF', title: 'LB', x: 15, y: 68 },
      { id: '433-def2', role: 'DEF', title: 'CB', x: 38, y: 72 },
      { id: '433-def3', role: 'DEF', title: 'CB', x: 62, y: 72 },
      { id: '433-def4', role: 'DEF', title: 'RB', x: 85, y: 68 },
      { id: '433-gk', role: 'GK', title: 'GK', x: 50, y: 92 },
    ],
  },
  '4-4-2': {
    label: '4-4-2',
    slots: [
      { id: '442-st1', role: 'FWD', title: 'ST', x: 35, y: 12 },
      { id: '442-st2', role: 'FWD', title: 'ST', x: 65, y: 12 },
      { id: '442-mid1', role: 'MID', title: 'LM', x: 12, y: 40 },
      { id: '442-mid2', role: 'MID', title: 'CM', x: 38, y: 44 },
      { id: '442-mid3', role: 'MID', title: 'CM', x: 62, y: 44 },
      { id: '442-mid4', role: 'MID', title: 'RM', x: 88, y: 40 },
      { id: '442-def1', role: 'DEF', title: 'LB', x: 15, y: 70 },
      { id: '442-def2', role: 'DEF', title: 'CB', x: 38, y: 74 },
      { id: '442-def3', role: 'DEF', title: 'CB', x: 62, y: 74 },
      { id: '442-def4', role: 'DEF', title: 'RB', x: 85, y: 70 },
      { id: '442-gk', role: 'GK', title: 'GK', x: 50, y: 92 },
    ],
  },
  '3-5-2': {
    label: '3-5-2',
    slots: [
      { id: '352-st1', role: 'FWD', title: 'ST', x: 35, y: 12 },
      { id: '352-st2', role: 'FWD', title: 'ST', x: 65, y: 12 },
      { id: '352-mid1', role: 'MID', title: 'LM', x: 8, y: 42 },
      { id: '352-mid2', role: 'MID', title: 'CM', x: 29, y: 46 },
      { id: '352-mid3', role: 'MID', title: 'CM', x: 50, y: 38 },
      { id: '352-mid4', role: 'MID', title: 'CM', x: 71, y: 46 },
      { id: '352-mid5', role: 'MID', title: 'RM', x: 92, y: 42 },
      { id: '352-def1', role: 'DEF', title: 'CB', x: 25, y: 72 },
      { id: '352-def2', role: 'DEF', title: 'CB', x: 50, y: 76 },
      { id: '352-def3', role: 'DEF', title: 'CB', x: 75, y: 72 },
      { id: '352-gk', role: 'GK', title: 'GK', x: 50, y: 92 },
    ],
  },
}

export const POSITIONS = ['GK', 'DEF', 'MID', 'FWD']
