# Let's Play Soccer

Async React project (Project 3) for CSC 436. Built with [Vite](https://vite.dev) + React, using data from two APIs: [football-data.org](https://www.football-data.org/) and [API-Football](https://www.api-football.com/).

**Live site:** [letsplaysoccer.netlify.app](https://letsplaysoccer.netlify.app/)

Let's Play Soccer has two pages. **Explore** follows the top five European leagues this season: each league's table, this matchday's results and fixtures, and top scorers, then each club's recent results, next games and current squad. **Team Builder** is a soccer team builder that uses real players: scout a club's squad with photos and ratings, add players to your own squad, pick a formation for each of two teams, then click a position on the field to choose from the players who can play it. Once both lineups are full, kick off a simulated match. The team with the higher average rating wins.

## Features

- **League pages (Explore):** the Premier League, La Liga, Serie A, Bundesliga and Ligue 1, each with the current table, the current matchday's games (scores for finished and live games, kick-off times in your time zone for the rest) and the top 10 scorers
- **Club pages (Explore):** click a club in the table for its coach, stadium, founding year and colours, its place in the table, its last 5 results and next 3 games in every competition, and its current squad grouped by position with age and nationality
- **Real squads in the builder:** browse the same five leagues and see each club's current squad with player photos and club crests
- **Real ratings:** each player's OVR comes from their average match rating in 2024–25. Players who weren't at the club that season, usually new signings, get an estimate marked **est.**: the club's average for their position, a little lower for players under 21. Estimates cost no extra requests
- **Search and filter:** search a club's squad by name on both pages (accents optional, so "odegaard" finds "Ødegaard"), and filter by position in the builder. Both work on the squad already loaded, so typing never sends a request
- **Loading, error and data states:** every request shows a loading skeleton, then either the data or an error message with a **Try again** button
- **Custom players:** create your own players with a name, position and rating
- **Two teams:** view Team 1, Team 2 or both side by side. A player can only be in one lineup at a time
- **Formations:** 4-3-3, 4-4-2 and 3-5-2, each laid out on the field
- **Position picker:** clicking a slot lists only the available players for that position, best rating first
- **Match simulator:** the higher average rating wins, and a bigger rating gap means a bigger winning margin
- **Light and dark mode:** follows your system setting, and the toggle in the header remembers your choice
- **Responsive layout:** stacked on phones, with more columns on tablets and desktops

## Triggering the error state

Check **Simulate API failure** at the bottom of the Explore page, or at the bottom of the Scout Players panel in the Team Builder (it's one setting, shared by both). Requests then go to a URL that can't resolve, and every panel that loads data shows its error message with a **Try again** button. Uncheck it to load the data again. Going offline and opening something you haven't opened yet shows the same error with an offline message.

## The APIs

Each API does what the other can't on its free plan. football-data.org has the current season but no player photos or ratings. API-Football has photos and ratings but only seasons up to 2024–25.

### football-data.org (Explore)

[football-data.org](https://docs.football-data.org/) v4, free plan, authenticated with an API key in the `X-Auth-Token` header.

| Endpoint | Used for |
|---|---|
| `/competitions/{code}/standings` | a league's current table, and which matchday it's on |
| `/competitions/{code}/matches?matchday=…` | that matchday's games. Waits for the table, which says which matchday it is |
| `/competitions/{code}/scorers?limit=10` | a league's top scorers |
| `/teams/{id}` | a club's info and current squad |
| `/teams/{id}/matches?season=…` | a club's games this season, in every competition |

- **No browser requests.** football-data.org doesn't send CORS headers, so the app calls it through a proxy at `/api/football-data/*`, which adds the key. On Netlify that's [`netlify/functions/football-data.mjs`](netlify/functions/football-data.mjs). Locally, it's the dev server proxy in [`vite.config.js`](vite.config.js). Either way, this key never reaches the browser.
- **10 requests a minute, no daily cap.** Responses are cached in the browser for 10 minutes, so scores stay fresh. A league page is 3 requests, and a club page is 2.
- **Free plan gaps.** Assists aren't included, so top scorers show goals and games only.

### API-Football (Team Builder)

[API-Football](https://www.api-football.com/documentation-v3) v3, free plan, authenticated with an API key in the `x-apisports-key` header.

| Endpoint | Used for |
|---|---|
| `/teams?league=…&season=2024` | the clubs in a league |
| `/players/squads?team=…` | a club's current squad, with photos |
| `/players?team=…&season=2024` | the club's 2024–25 match ratings, which become OVR |

- **Seasons 2022 to 2024 only.** Squads are current, but ratings and the league club lists are from 2024–25.
- **100 requests a day.** Successful responses are cached in the browser for 12 hours, so a club you've opened before costs nothing. A club costs up to 4 requests: its squad, plus 1 to 3 pages of stats.
- **10 requests a minute.** The app spaces out its own requests to stay under this. Opening several new clubs quickly makes the next one wait.
- **Stats pages 1 to 3 only.** Players listed after page 3 of a club's stats get an estimated rating.
- **The key is public.** API-Football allows browser requests, so this key ships in the frontend bundle and anyone can see it. That's acceptable for a free-tier key on a class project.

Both APIs share one fetch helper ([`src/api/createFetcher.js`](src/api/createFetcher.js)): a localStorage cache, pacing under the per-minute limit, and sharing of identical requests already in flight. That last part stops React's development double-render from spending two requests.

## Run it locally

Requires [Node.js](https://nodejs.org) 20.19 or newer and two free API keys: one from [football-data.org](https://www.football-data.org/client/register) and one from the [API-Football dashboard](https://dashboard.api-football.com/).

Create a `.env` file in the project root (it's listed in `.gitignore`, so it's never committed):

```bash
VITE_API_FOOTBALL_KEY=your-api-football-key
VITE_API_FOOTBALL_URL=https://v3.football.api-sports.io
FOOTBALL_DATA_KEY=your-football-data-key
```

`FOOTBALL_DATA_KEY` has no `VITE_` prefix on purpose: only the dev server and the Netlify Function read it, so it stays out of the browser bundle.

Then:

```bash
npm install
npm run dev       # start the dev server at http://localhost:5173
npm run build     # production build into dist/
npm run preview   # serve the production build locally (Explore needs the dev server or Netlify)
npm run lint      # run oxlint
```

## Deployment

Deployed on Netlify. The build settings are in [`netlify.toml`](netlify.toml): build command `npm run build`, publish directory `dist`. Netlify picks up the function in `netlify/functions/` on its own. The three variables from `.env` are set under Netlify's environment variables, because `.env` isn't in the repo.

## Project structure

```
netlify/functions/
  football-data.mjs     proxy that adds the football-data.org key on the server
src/
  App.jsx               shared state: page, explore position, squad, teams, match result
  api/createFetcher.js  shared fetch helper: cache, rate limiting, in-flight request sharing
  api/footballData.js   football-data.org URLs, errors, squad grouping
  api/apiFootball.js    API-Football URLs, errors, ratings and squad shapes
  hooks/useFetch.js     custom hook: data, loading, error and retry for one url
  hooks/useClubSquad.js custom hook: a club's squad with OVRs (two requests combined)
  components/
    Header.jsx          title, Explore / Team Builder nav, squad count, light/dark toggle
    ExplorePage.jsx     league tabs, breadcrumbs, and which view to show
    LeagueView.jsx      a league's table, matchday and top scorers
    StandingsTable.jsx  the current table; each club opens its page
    MatchdayResults.jsx the current matchday's games
    TopScorers.jsx      top 10 scorers
    ClubView.jsx        a club's info, games and squad with search
    MatchList.jsx       games as home · score or kick-off · away
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
  utils/normalize.js    accent-insensitive text for search
  utils/teamStats.js    lineup averages and match scoring
```
