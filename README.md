# Realms of War

A browser-based RPG prototype where players sign up, take quests for gold and experience, and (eventually) send units out to fight each other. It's a small full-stack app: an Express and MongoDB API, Firebase email/password authentication, and a vanilla JavaScript client built with Materialize.

> **Status: being modernised.** Dependencies and tooling are up to date and the app runs. Sign-up still needs fixing, and combat, quest execution, units and items aren't finished yet. See [What's built](#whats-built) for details and [`documentation/modernisationPlan.md`](documentation/modernisationPlan.md) for the roadmap.

## Origins

Realms of War started in 2019 as a university cloud computing assignment. It was pitched as a mobile-friendly idle game with social features, inspired by browser games like Reign of Blood and Cookie Clicker. Players buy troops, take quests to level up, and attack other players to climb a leaderboard. The brief was to combine cloud services, so the original ran on Google App Engine with Firebase Authentication, MongoDB Atlas, and a Google Cloud Storage bucket for profile pictures.

All of the game logic in that first version ran in the browser. To take a quest, attack a player or buy a unit, the client fetched the player, changed their gold, experience or units, and sent the whole record back with a `PUT`. That was enough for a working demo, but the server trusted whatever it was sent, so any player could give themselves gold.

The current work rebuilds the project rather than replacing it. Dependencies are up to date, and game rules move to the server. Quest outcomes come from a tested, pure function, and the client can only ask to attempt a quest. The original rules are being ported, not thrown away: the client-side `doQuest` and `determineWinner` code is still in [`client/scripts/index.js`](client/scripts/index.js), commented out. The plan is in [`documentation/modernisationPlan.md`](documentation/modernisationPlan.md).

## Tech stack

| Layer | Tools |
| --- | --- |
| Server | Node.js 26, Express 5 |
| Database | MongoDB via Mongoose 9 |
| Auth | Firebase Authentication (email and password) with the modular Firebase JS SDK, configured from the client |
| Client | Vanilla JS (ES modules), Axios, Materialize CSS |
| Tests | Node's built-in test runner and Supertest |

## What's built

**Implemented**
- Email/password sign-up, login and logout through Firebase.
- Quest list served from `/quest`, seeded from `src/data/defaultQuests.json`. Each quest has requirements (player level, action points, total attack, total units) and rewards (gold, unit experience).
- Player list served from `/userDetails`, shown in the client for logged-in and logged-out visitors.
- A server time endpoint, `/serverTime`, formatted with Luxon.
- Mongoose models for users (units, inventory, profile messages), quests, units, items and events.
- Two smoke tests (home page and `/serverTime`).

**Stubbed or unfinished**
- Starting a quest. The button renders, but `performQuest` and the event controllers are placeholders.
- Attacking other players, guilds, leaderboards and profile pages.
- Seeding default units and items. `npm run database` only seeds quests so far.

The roadmap is in [`documentation/todoList.md`](documentation/todoList.md).

## Project structure

```
index.js                     Express app, Mongoose connection, route registration
defaultDatabaseSetup.js      Seeds the default quests
client/                      Static front end (index.html, scripts/, css/, img/)
src/
  controllers/               Request handlers (users, quests, events, setup)
  models/                    Mongoose schemas (user, quest, unit, item, event)
  routes/                    Express routes
  data/                      Default quests, items and units (JSON)
test/                        node:test and Supertest tests
documentation/               Setup notes and the to-do list
```

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/quest` | List quests |
| GET, PUT, DELETE | `/quest/:id` | Get, update or delete a quest |
| POST | `/quest` | Create a quest |
| GET | `/user`, `/userDetails` | List players (full or public details) |
| POST | `/user` | Create a player |
| GET, PUT, DELETE | `/user/:token` | Get, update or delete a player by Firebase UID |
| GET | `/serverTime` | Current server time |
| POST | `/performQuest` | Not implemented yet |
| GET, POST, DELETE | `/event`, `/event/:id` | Not implemented yet |

## Running it locally

You'll need Node.js (the project targets Node 26 LTS and npm 11 or later; with nvm, run `nvm use`), a MongoDB database, and a Firebase project with Email/Password sign-in enabled.

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a `.env` file in the project root:

   ```
   MONGO='mongodb connection string'
   FIREBASE_API_KEY='firebase apiKey'
   FIREBASE_AUTH_DOMAIN='firebase authDomain'
   FIREBASE_DATABASE_URL='firebase databaseURL'
   FIREBASE_PROJECT_ID='firebase projectId'
   FIREBASE_STORAGE_BUCKET='firebase storageBucket'
   FIREBASE_MESSAGING_SENDER_ID='firebase messagingSenderId'
   FIREBASE_APP_ID='firebase appId'
   FIREBASE_MEASUREMENT_ID='firebase measurementId'
   ```

3. Seed the default quests:

   ```sh
   npm run database
   ```

4. Start the dev server (it listens on port 8080 unless `PORT` is set):

   ```sh
   npm run dev
   ```

5. Run the tests:

   ```sh
   npm test
   ```

More detail is in [`documentation/projectSetup.md`](documentation/projectSetup.md).

## Known issues

These are documented so they're easy to find, not because they're fixed:

- Sign-up creates the Firebase account but not the player document in MongoDB. The error is swallowed by an empty `catch`, so it fails silently.
- Sign-up and login errors from Firebase (such as a password under 6 characters) only appear in the browser console.
- The API doesn't verify Firebase ID tokens on the server. Player routes use the Firebase UID from the URL, so they aren't safe to expose publicly.
- The players list doesn't hide the signed-in player, and its View and Attack buttons are placeholders.

## Licence

ISC, as declared in `package.json`.
