# Matchday Builder

Async React project (Project 3) for CSC 436. Built with [Vite](https://vite.dev) + React, using data from [API-Football](https://www.api-football.com/).

**Live site:** [letsplaysoccer.netlify.app](https://letsplaysoccer.netlify.app/)

Matchday Builder is a soccer team builder that uses real players. Pick a league and a club to scout its current squad, add players to your own squad, pick a formation for each of two teams, then click a position on the field to choose from the players who can play it. Once both lineups are full, kick off a simulated match. The team with the higher average rating wins.

## Features

- **Real squads:** browse the clubs in the Premier League, La Liga, Serie A, Bundesliga and Ligue 1, and see each club's current squad with player photos and club crests
- **Real ratings:** each player's OVR comes from their average match rating in 2024–25. Players who weren't at the club that season, usually new signings, have a **Get rating** button that looks up their 2024–25 rating from their old club
- **Search and filter:** search a squad by name (accents optional, so "odegaard" finds "Ødegaard") and filter by position. Both work on the squad already loaded, so typing never sends a request
- **Loading, error and data states:** every request shows that it's loading (a skeleton, or "Checking rating…" for Get rating), then either the data or an error message with a retry button
- **Custom players:** create your own players with a name, position and rating
- **Two teams:** view Team 1, Team 2 or both side by side. A player can only be in one lineup at a time
- **Formations:** 4-3-3, 4-4-2 and 3-5-2, each laid out on the field
- **Position picker:** clicking a slot lists only the available players for that position, best rating first
- **Match simulator:** the higher average rating wins, and a bigger rating gap means a bigger winning margin
- **Light and dark mode:** follows your system setting, and the toggle in the header remembers your choice
- **Responsive layout:** stacked on phones, two columns on tablets, and three columns on desktop

## Triggering the error state

Check **Simulate API failure** at the bottom of the Scout Players panel. Requests then go to a URL that can't resolve, and the panel shows its error message with a **Try again** button. Uncheck it to load the data again. Going offline and opening a club you haven't opened yet shows the same error with an offline message. Clubs you've already opened load from the cache.

## The API

[API-Football](https://www.api-football.com/documentation-v3) (v3), free plan, authenticated with an API key in the `x-apisports-key` header.

| Endpoint | Used for |
|---|---|
| `/teams?league=…&season=2024` | the clubs in a league |
| `/players/squads?team=…` | a club's current squad, with photos |
| `/players?team=…&season=2024` | the club's 2024–25 match ratings, which become OVR |
| `/players?id=…&season=2024` | one player's 2024–25 rating from any club (Get rating) |

The free plan sets the limits the app works around:

- **Seasons 2022 to 2024 only.** Squads are current, but ratings and the league club lists are from 2024–25.
- **100 requests a day.** Successful responses are cached in the browser for 12 hours, and Get rating only runs when clicked.
- **10 requests a minute.** The app spaces out its own requests to stay under this. Opening several new clubs quickly makes the next one wait.
- **Stats pages 1 to 3 only.** Players listed after page 3 of a club's stats show as unrated and can use Get rating.

The key ships in the frontend bundle, so anyone can see it in the browser. That's acceptable for a free-tier key on a class project.

## Run it locally

Requires [Node.js](https://nodejs.org) 20.19 or newer and a free API-Football key from the [dashboard](https://dashboard.api-football.com/).

Create a `.env` file in the project root (it's listed in `.gitignore`, so it's never committed):

```bash
VITE_API_FOOTBALL_KEY=your-key-here
VITE_API_FOOTBALL_URL=https://v3.football.api-sports.io
```

Then:

```bash
npm install
npm run dev       # start the dev server at http://localhost:5173
npm run build     # production build into dist/
npm run preview   # serve the production build locally
npm run lint      # run oxlint
```

## Deployment

Deployed on Netlify. The build settings are in [`netlify.toml`](netlify.toml): build command `npm run build`, publish directory `dist`. The two variables from `.env` are set under Netlify's environment variables, because `.env` isn't in the repo.

## Project structure

```
src/
  App.jsx               shared state: squad, teams, view mode, match result
  api/apiFootball.js    API-Football URLs, caching, rate limiting, response shapes
  hooks/useFetch.js     custom hook: data, loading, error and retry for one url
  components/
    Header.jsx          title, squad count, light/dark toggle
    ScoutPlayers.jsx    league picker, club or squad view, simulate-failure toggle
    ClubPicker.jsx      grid of clubs in the chosen league
    ClubPlayers.jsx     a club's squad with search and position filter
    ScoutCard.jsx       one scouted player, with Get rating for new signings
    FetchStatus.jsx     shared loading skeletons and error message
    PlayerAvatar.jsx    player photo, or initials when there isn't one
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
  data/formations.js    formation layouts
  utils/teamStats.js    lineup averages and match scoring
```
