# Modernisation Plan

Goal: bring Realms of War up to date, make it run end to end, and deploy it so it can serve as a working full-stack portfolio piece.

The code was last touched in 2021 and targets Node 10, Mongoose 5 and Babel 6. The plan is ordered so every phase leaves the app in a working state and can ship as its own pull request. Sizes are rough: **S** is an evening, **M** is a weekend, **L** is a few sessions.

## Phase 1: Make it run (S)

Fix the things that stop the app working today.

- Mount `fireBaseRoute` in `index.js`. The client requests `/firebase` for its config, but the route is never registered.
- Fix `getUsersDetails` so it returns every player, not just `user[0]`, and handle the empty-collection case.
- Fix the event controllers: the handlers are declared `(res, req)` instead of `(req, res)`. Either implement them or remove the stub routes until they're needed.
- Stop logging the full MongoDB connection string at start-up.
- Fix client typos that break rendering (`</table` is missing a `>`, and the `onclick='#(...)'` placeholders on the View and Attack buttons).
- Update `repository`, `bugs` and `homepage` in `package.json`, which still point at the old `jesyikaturner` account.

**Done when:** `npm run dev` starts, you can sign up, log in, see the quest list and see the player list.

## Phase 2: Dependency and toolchain upgrade (M)

- Move to the current Node LTS and set `engines` to match.
- Drop Babel and `esm`. Use native ES modules (`"type": "module"`, explicit `.js` extensions in imports). Replace `nodemon` and `babel-node` with `node --watch`.
- Upgrade Express to 5 and remove `body-parser` (`express.json()` and `express.urlencoded()` are built in).
- Upgrade Mongoose to the current major. Callback APIs were removed in later versions, so controllers need to move to `async/await`. `User.remove` becomes `deleteOne`, and `useNewUrlParser` and `useUnifiedTopology` are no longer needed.
- Triage the Dependabot security alerts on the repo as part of this phase.
- Clean up the client dependencies in `client/index.html` and `client/scripts/`:
  - `moment-with-locales.js` isn't loaded by any page, and the Luxon calls in `scripts/index.js` are commented out. jQuery is loaded but not used by the app scripts. Delete what's unused, along with the duplicate unminified and minified Materialize files.
  - The Firebase SDK is loaded from a CDN at version 7.2.0. Move to the current modular Firebase SDK.
  - Axios is loaded from unpkg with no version pinned. Pin it, or install it from npm.

**Done when:** `npm audit` is clean or each remaining finding is explained, and the app behaves as it did after Phase 1.

## Phase 3: Auth and API hardening (M)

The API currently trusts the Firebase UID in the URL, and `PUT /user/:token` writes the request body straight into the document.

- Add middleware using the Firebase Admin SDK to verify the ID token from an `Authorization: Bearer` header, and derive the player's UID from the verified token instead of the URL.
- Whitelist updatable fields on user updates, so clients can't set their own `gold`, `level` or `experience`.
- Restrict quest create, update and delete to an admin role.
- Add `helmet`, request body size limits and basic rate limiting.
- Replace the `Accept`-header check on `/user` with real authorisation. It is not a security control.
- Return proper status codes (404 for a missing player, 400 for validation errors) and stop sending raw Mongoose errors to clients.

**Done when:** a request without a valid token can't read or change another player's data, and tests prove it.

## Phase 4: Tests and CI (M)

- Replace the two smoke tests with API tests against an in-memory MongoDB (`mongodb-memory-server`) or a throwaway test database. Cover quests, player creation and retrieval, field whitelisting and auth failures.
- Make `index.js` export the app without calling `listen()` so tests don't bind a port, and move `listen()` into a separate `server.js`.
- Add a GitHub Actions workflow that runs `npm ci` and `npm test` on pull requests.
- Add a CI status badge to the README.

**Done when:** pull requests run the tests automatically and fail on regressions.

## Phase 5: Finish one vertical slice (L)

A working "start a quest" loop is more convincing than many half-built features.

- Implement `performQuest`: check the player meets the requirements (level, action points, units), deduct action points, apply gold and experience rewards, and handle level-ups.
- Return the updated player and show the result in the client.
- Add the quest's cost, reward and failure cases to the tests.
- Optionally seed default units and items (`defaultUnits.json` and `defaultItems.json` already exist) so quests have something to check against.

**Done when:** a new player can sign up, take a quest and see their gold, experience and action points change.

## Phase 6: Deploy (S to M)

- Host the API and static client on a free or low-cost platform (Render, Fly.io and Railway are all options) with MongoDB Atlas.
- Keep all secrets in the host's environment settings. Rotate any credentials that were ever committed or logged.
- Add the live link and a screenshot to the README.

**Done when:** the README links to a working demo.

## Suggested order and pull requests

1. Phase 1 as a single small PR.
2. Phase 2, ideally split in two: toolchain and Mongoose, then client dependencies.
3. Phases 3 and 4 can be done together, since the auth tests are the most valuable tests.
4. Phase 5, then Phase 6.

## Out of scope for now

Guilds, leaderboards, profile messages, unit art and combat between players stay on [`todoList.md`](todoList.md) until the vertical slice is working.
