# Let's Play Soccer

Async React project (Project 3) for CSC 436. Built with [Vite](https://vite.dev) + React, using data from [API-Football](https://www.api-football.com/).

**Live site:** [letsplaysoccer.netlify.app](https://letsplaysoccer.netlify.app/)

Let's Play Soccer has two pages. **Explore** lets you browse the top five European leagues: each league's 2024–25 table and top scorers, each club's current squad, and each player's 2024–25 stats. **Team Builder** is a soccer team builder that uses those real players: add players to your own squad, pick a formation for each of two teams, then click a position on the field to choose from the players who can play it. Once both lineups are full, kick off a simulated match. The team with the higher average rating wins.

## Features

- **Explore leagues, clubs and players:** pick a league for its 2024–25 final table and top 10 scorers, a club in the table for its current squad grouped by position, then a player for their age, nationality, height, weight and 2024–25 stats by competition. Add any player to your squad from the club or player page
- **Real squads in the builder:** browse the clubs in the Premier League, La Liga, Serie A, Bundesliga and Ligue 1, and see each club's current squad with player photos and club crests
- **Real ratings:** each player's OVR comes from their average match rating in 2024–25. Players who weren't at the club that season, usually new signings, get an estimate marked **est.**: the club's average for their position, a little lower for players under 21. Estimates cost no extra requests
- **Search and filter:** search a squad by name (accents optional, so "odegaard" finds "Ødegaard") and filter by position. Both work on the squad already loaded, so typing never sends a request
- **Loading, error and data states:** every request shows a loading skeleton, then either the data or an error message with a **Try again** button
- **Custom players:** create your own players with a name, position and rating
- **Two teams:** view Team 1, Team 2 or both side by side. A player can only be in one lineup at a time
- **Formations:** 4-3-3, 4-4-2 and 3-5-2, each laid out on the field
- **Position picker:** clicking a slot lists only the available players for that position, best rating first
- **Match simulator:** the higher average rating wins, and a bigger rating gap means a bigger winning margin
- **Light and dark mode:** follows your system setting, and the toggle in the header remembers your choice
- **Responsive layout:** stacked on phones, two columns on tablets, and three columns on desktop

## Triggering the error state

Check **Simulate API failure** at the bottom of the Explore page, or at the bottom of the Scout Players panel in the Team Builder (it's one setting, shared by both). Requests then go to a URL that can't resolve, and every panel that loads data shows its error message with a **Try again** button. Uncheck it to load the data again. Going offline and opening a club you haven't opened yet shows the same error with an offline message. Clubs you've already opened load from the cache.

## The API

[API-Football](https://www.api-football.com/documentation-v3) (v3), free plan, authenticated with an API key in the `x-apisports-key` header.

| Endpoint | Used for |
|---|---|
| `/teams?league=…&season=2024` | the clubs in a league |
| `/players/squads?team=…` | a club's current squad, with photos |
| `/players?team=…&season=2024` | the club's 2024–25 stats: match ratings (which become OVR) and the player page's stats |
| `/standings?league=…&season=2024` | a league's 2024–25 final table |
| `/players/topscorers?league=…&season=2024` | a league's 2024–25 top scorers |

The free plan sets the limits the app works around:

- **Seasons 2022 to 2024 only.** Squads are current, but ratings, stats, tables, top scorers and the league club lists are from 2024–25.
- **100 requests a day.** Successful responses are cached in the browser for 12 hours, so a club you have opened before costs nothing.
- **What a visit costs.** A league page is 2 requests (table and top scorers). A club is up to 4 (its squad, plus 1 to 3 pages of stats), and it's the same 4 whether you open it in Explore or the builder, so it's only paid once. A player page is free, because its stats are already in the club's response.
- **10 requests a minute.** The app spaces out its own requests to stay under this. Opening several new clubs quickly makes the next one wait.
- **Stats pages 1 to 3 only.** Players listed after page 3 of a club's stats get an estimated rating.

One data quirk: the API sometimes merges a player's season with games for a later club (it lists Matheus Cunha with 30 goals in 66 Premier League appearances for Manchester United). Top scorers with more appearances than the league has rounds are left out.

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
  App.jsx               shared state: page, explore position, squad, teams, match result
  api/apiFootball.js    API-Football URLs, caching, rate limiting, response shapes
  hooks/useFetch.js     custom hook: data, loading, error and retry for one url
  hooks/useClubSquad.js custom hook: a club's squad with OVRs, shared by Explore and the builder
  components/
    Header.jsx          title, Explore / Team Builder nav, squad count, light/dark toggle
    ExplorePage.jsx     league tabs, breadcrumbs, and which view to show
    LeagueView.jsx      a league's table and top scorers
    StandingsTable.jsx  2024–25 final table; each club opens its page
    TopScorers.jsx      2024–25 top 10 scorers
    ClubView.jsx        a club's current squad grouped by position
    PlayerView.jsx      one player's profile and 2024–25 stats
    ErrorToggle.jsx     the Simulate API failure checkbox
    ScoutPlayers.jsx    league picker, club or squad view, simulate-failure toggle
    ClubPicker.jsx      grid of clubs in the chosen league
    ClubPlayers.jsx     a club's squad with search and position filter
    ScoutCard.jsx       one scouted player with an Add button
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
