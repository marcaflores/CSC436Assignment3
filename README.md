# Matchday Builder

React Fundamentals project for CSC 436. Built with [Vite](https://vite.dev) + React.

**Live site:** [marcsmatchday.netlify.app](https://marcsmatchday.netlify.app/)

Matchday Builder is a soccer team builder. Add players to your squad from a quick-add list or create your own, pick a formation for each of two teams, then click a position on the field to choose from the players who can play it. Once both lineups are full, kick off a simulated match. The team with the higher average rating wins.

## Features

- **Squad building:** quick-add 30 preset players or create custom ones with a name, position and rating
- **Two teams:** view Team 1, Team 2 or both side by side. A player can only be in one lineup at a time
- **Formations:** 4-3-3, 4-4-2 and 3-5-2, each laid out on the field
- **Position picker:** clicking a slot lists only the available players for that position, best rating first
- **Match simulator:** the higher average rating wins, and a bigger rating gap means a bigger winning margin
- **Light and dark mode:** follows your system setting, and the toggle in the header remembers your choice
- **Responsive layout:** stacked on phones, two columns on tablets, and three columns on desktop

## Run it locally

Requires [Node.js](https://nodejs.org) 20.19 or newer.

```bash
npm install
npm run dev       # start the dev server at http://localhost:5173
npm run build     # production build into dist/
npm run preview   # serve the production build locally
npm run lint      # run oxlint
```

## Deployment

Deployed on Netlify. The build settings are in [`netlify.toml`](netlify.toml): build command `npm run build`, publish directory `dist`.

## Project structure

```
src/
  App.jsx               shared state: squad, teams, view mode, match result
  components/
    Header.jsx          title, squad count, light/dark toggle
    PresetPlayers.jsx   quick-add list with position filter
    PlayerForm.jsx      controlled form for custom players
    PlayerList.jsx      current squad with position filter
    PlayerCard.jsx      one squad row
    TeamSelector.jsx    Team 1 / Team 2 / Both switch
    TeamPanel.jsx       one team's formation, field and summary
    FormationPicker.jsx formation buttons
    Pitch.jsx           the field and the open position picker
    PitchSlot.jsx       one position on the field
    SlotPicker.jsx      list of players for a clicked position
    TeamSummary.jsx     lineup stats, kick off button, match result
  data/                 formations and preset players
  utils/teamStats.js    lineup averages and match scoring
```
