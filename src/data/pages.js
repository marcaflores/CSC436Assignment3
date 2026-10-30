// The three pages. Each one has its own #hash, so links can be shared and the browser's back
// button moves between pages.
export const PAGES = [
  {
    id: 'explore',
    label: 'Explore',
    icon: 'compass',
    lead: "Tables, results and squads from Europe's top five leagues and the Champions League.",
  },
  {
    id: 'schedule',
    label: 'Schedule',
    icon: 'calendar',
    lead: 'Every game by day, with live scores and kick-off times in your time zone.',
  },
  {
    id: 'builder',
    label: 'Team Builder',
    icon: 'shirt',
    lead: 'Scout real players, set two lineups and kick off a simulated match.',
  },
]

export function pageFromHash() {
  const id = window.location.hash.slice(1)
  return PAGES.some((page) => page.id === id) ? id : PAGES[0].id
}
