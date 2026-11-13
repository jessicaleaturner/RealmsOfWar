# Realms of War

A browser-based RPG prototype where players sign up, take quests for gold and experience, and (eventually) send units out to fight each other. It's a small full-stack app: an Express and MongoDB API, Firebase email/password authentication, and a vanilla JavaScript client built with Materialize.

> **Status: prototype, paused since 2021.** The sign-up flow, quest list and player list are implemented. Combat, quest execution, units and items are not finished. See [What's built](#whats-built) for details.

## Tech stack

| Layer | Tools |
| --- | --- |
| Server | Node.js, Express 4, `body-parser` |
| Database | MongoDB via Mongoose 5 |
| Auth | Firebase Authentication (email and password), configured from the client |
| Client | Vanilla JS (ES modules), jQuery, Axios, Materialize CSS, Luxon |
| Tests | Mocha and Supertest |

## What's built

**Implemented**
- Email/password sign-up, login and logout through Firebase. Signing up also creates a matching player document in MongoDB (level 1, 20 action points, 100 gold).
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
test/                        Mocha and Supertest tests
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

You'll need Node.js (the project targets Node 24 and npm 11 or later), a MongoDB database, and a Firebase project with Email/Password sign-in enabled.

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

- The API doesn't verify Firebase ID tokens on the server. Player routes use the Firebase UID from the URL, so they aren't safe to expose publicly.
- `/userDetails` only returns the first player.
- The server logs the full MongoDB connection string at start-up.

## Licence

ISC, as declared in `package.json`.
