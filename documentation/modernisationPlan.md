# Modernisation Plan

Goal: bring Realms of War up to date, make it run end to end, and deploy it so it can serve as a working full-stack portfolio piece.

The plan is ordered so every phase leaves the app in a working state and can ship as its own pull request. Sizes are rough: **S** is an evening, **M** is a weekend, **L** is a few sessions.

## Where things stand (November 2026)

**Done**

- **Phase 1: Make it run** (#20, #21). The Firebase route is mounted, `getUsersDetails` returns every player, the event handler arguments are fixed, the connection string is no longer logged, and the `package.json` links point at `jessicaleaturner`.
- **Phase 2: Dependency and toolchain upgrade** (#22 to #25). The app runs on Node 26 with native ES modules and `node --watch`, Express 5, Mongoose 9 with `async/await`, and the modular Firebase SDK. Axios comes from npm, and unused client libraries have been removed. `npm audit` reports 0 vulnerabilities.
- `index.js` exports the app and only calls `listen()` when run directly, so tests can import it.

**Decisions since the original plan**

- **Firebase is used for sign-in only.** Firebase Authentication handles usernames, emails and passwords. The original design added Firestore as a layer between the Firebase account and the player data in MongoDB. That layer is gone: the Firebase user ID now links the account directly to the player document in MongoDB, which holds all game data such as inventory, units and gold.
- **Players are identified by a `uuid` field, not `firebase_token`.** The old name was misleading, because it held the Firebase user ID, not a token. `uuid` holds the Firebase Auth user ID (`user.uid`), so a signed-in user maps directly to their player document. `src/data/mockUsers.json` already uses this shape.
- **The server moves to TypeScript.** Express works well with TypeScript, and Node 26 can run `.ts` files directly, so the server needs no build step.
- **Tests sit next to the code they test** (`eventController.ts` and `eventController.test.ts` in the same folder). Every module gets tests.

**Still outstanding from Phases 1 and 2** (folded into the phases below)

- The players table is still closed with `</table` (missing `>`), and the View and Attack buttons still use `onclick='#(...)'` placeholders.
- The event handlers other than `deleteEvent` are still stubs that only `console.log`.

## Phase 3: Switch players to `uuid` (S)

Sign-up is currently half broken. After Firebase creates the account, `auth.js` calls `newUserData.slice()`, but `newUserData` is defined in `profile.js` and never exported. It's also an object, so it has no `slice()`. The error is swallowed by an empty `catch`, so the player document is never created in MongoDB. Fix this while renaming the field.

- In `userModel.js`, rename `firebase_token` to `uuid`, keep it `required` and make it `unique` with an index.
- Rename the routes from `/user/:token` to `/user/:uuid`, and `getUserByToken` to `getUserByUuid`. Update every `{ firebase_token: ... }` query.
- On the client:
  - Export the new-player defaults from one place, set `uuid: auth.currentUser.uid` on sign-up, and post them to `/user`.
  - Rename `sendDataByToken` to something accurate, such as `postData`.
  - Compare players with `user.uuid !== currentUser.uid` in `fillUsers`. At the moment it compares `firebase_token` against a Firebase user object, which never matches.
- Include `uuid` in the `/userDetails` response, because the View and Attack buttons need it to identify a player. Replace the `onclick='#(...)'` placeholders with real handlers, and fix the `</table` typo.
- Fix the signed-out branch in `auth.js`, which calls `fillUsers(response.data)` with the arguments in the wrong order.
- Remove `FIREBASE_DATABASE_URL` and `FIREBASE_STORAGE_BUCKET` from `fireBaseRoute.js` and `projectSetup.md`, because Realtime Database and Storage aren't used.
- Add an optional `npm run database -- --mock-users` flag to `defaultDatabaseSetup.js` that seeds `mockUsers.json` for local development. Decide whether `mockUsers.json` is committed. It's currently untracked, and an earlier commit (`ae05dbc`) removed mock user data.
- Existing documents created with `firebase_token` can be migrated with a one-off `updateMany` using `$rename`, or deleted if they're only test data.

**Done when:** signing up creates a player document keyed by `uuid`, the players list hides the signed-in player, and nothing in the code refers to `firebase_token`.

## Phase 4: Show errors to the player (S)

Firebase rejects bad sign-ups and logins (for example, a password under 6 characters), but `auth.js` has no `catch` on `createUserWithEmailAndPassword` or `signInWithEmailAndPassword`. The error only reaches the browser console, and the modal just sits there.

- Add an error area to the sign-up and login modals, and keep the modal open when something fails.
- Map Firebase error codes to plain messages in a small, testable function such as `client/scripts/authErrors.js`:

  | Code | Message |
  | --- | --- |
  | `auth/weak-password` | Password must be at least 6 characters. |
  | `auth/email-already-in-use` | An account with that email already exists. |
  | `auth/invalid-email` | That email address isn't valid. |
  | `auth/invalid-credential` | Email or password is incorrect. |
  | `auth/too-many-requests` | Too many attempts. Try again in a few minutes. |
  | `auth/network-request-failed` | Couldn't reach the server. Check your connection. |
  | anything else | Something went wrong. Please try again. |

- Add `minlength="6"` to the sign-up password field so the browser catches the most common case before the request is sent.
- Disable the submit button while a request is in flight, so double clicks don't create two requests.
- If Firebase creates the account but saving the player to MongoDB fails, tell the player rather than leaving them signed in with no player data.
- On the server, return real status codes and a consistent `{ error: "message" }` body instead of `res.send(err)` with a 200. Express 5 passes rejected `async` handlers to error middleware, so most `try/catch` blocks can be replaced by one error handler in `index.js`. Use 404 for a missing player or quest, 400 for validation errors, and 500 for anything else, and never send raw Mongoose errors to the client.
- Show API errors (such as a failed quest) in the client in the same way.

**Done when:** each error in the table shows a readable message in the modal, and no API route returns an error with a 200 status.

## Phase 5: Migrate the server to TypeScript (M)

TypeScript works well with Express. Node 26 strips types natively, so `node --watch index.ts` runs TypeScript directly, with no Babel, `ts-node` or build step. Type stripping doesn't check types, so `tsc` runs separately as a check.

- Add `typescript`, `@types/node`, `@types/express` and `@types/supertest` as dev dependencies. Mongoose ships its own types.
- Add a `tsconfig.json` set up for running files directly with Node:
  - `"noEmit": true`, `"strict": true`, `"module": "nodenext"`, `"target": "esnext"`
  - `"allowImportingTsExtensions": true`, so imports keep their `.ts` extension
  - `"erasableSyntaxOnly": true` and `"verbatimModuleSyntax": true`, so the code only uses syntax that Node can strip (no `enum` or `namespace`, and type-only imports use `import type`)
  - `"resolveJsonModule": true`, for the default data JSON files
- Rename the server files from `.js` to `.ts` one folder at a time: models, then controllers, then routes, then `index.ts` and `defaultDatabaseSetup.ts`. Commit after each folder.
- Export each compiled model from its model file (`export const User = model("User", UserSchema)`) instead of calling `mongoose.model()` in every controller, and type it with an interface or `InferSchemaType`.
- Type the request params and bodies on the handlers, for example `Request<{ uuid: string }>`.
- Update the scripts: `"start": "node index.ts"`, `"dev": "node --watch index.ts"`, and add `"typecheck": "tsc"`.
- **Client:** browsers can't run TypeScript, so the client needs a build step to use it. For now, keep the client in JavaScript and add `// @ts-check` to each file. Editors and `tsc` (with `checkJs` in a separate `client/tsconfig.json`) then catch type errors without changing how the files are served. Converting the client fully means adding a bundler such as Vite and installing Firebase from npm. That's worth doing later if the client grows, but it isn't needed now.

**Done when:** there are no `.js` files left in `src/`, `npm run typecheck` passes with `strict` on, and the app behaves as it did before.

## Phase 6: Tests and CI (M)

Every module gets a test file in the same folder, named after the file it tests:

```
index.ts
index.test.ts
src/
  controllers/
    eventController.ts
    eventController.test.ts
    questController.ts
    questController.test.ts
    setupController.ts
    setupController.test.ts
    userController.ts
    userController.test.ts
  models/
    userModel.ts
    userModel.test.ts
    ...
  routes/
    userRoutes.ts
    userRoutes.test.ts
    ...
client/scripts/
  authErrors.js
  authErrors.test.js
  ...
```

- Keep Node's built-in test runner (`node:test`) and `supertest`, which are already set up. Set the test script to an explicit glob so it only picks up colocated tests: `"test": "node --test \"**/*.test.ts\" \"client/**/*.test.js\""`.
- Move `test/index.test.js` to `index.test.ts` and delete the `test/` folder.
- Use `mongodb-memory-server` so tests run against a real but throwaway MongoDB without touching the dev database. A shared helper (for example, `src/testUtils/db.ts`) starts it, clears collections between tests and stops it at the end. `.npmrc` has `ignore-scripts=true`, so the MongoDB binary downloads on the first test run rather than at install.
- What to cover:
  - **Models:** required fields, the unique `uuid` index and defaults.
  - **Controllers:** each handler's success path, missing-record path (404) and validation path (400). `mockUsers.json` and `defaultQuests.json` work as fixtures.
  - **Routes:** each route is wired to the right handler and method, through `supertest`.
  - **Setup:** `setupDatabase` seeds quests once and doesn't duplicate them on a second run.
  - **Client:** pure logic such as `authErrors.js` is tested directly. For the DOM rendering in `profile.js` and `questlog.js`, move the HTML-building code into functions that return strings and test those. Use `happy-dom` only if a test really needs a DOM.
- Turn on Node's built-in coverage reporting so gaps are visible.
- Add a GitHub Actions workflow that runs `npm ci`, `npm run typecheck` and `npm test` on every pull request. Cache the `mongodb-memory-server` binary between runs.
- Add a CI status badge to the README.

**Done when:** every source file has a matching test file, and pull requests run type checks and tests automatically and fail on regressions.

## Phase 7: Auth and API hardening (M)

The API currently trusts whatever `uuid` is in the URL, and `PUT /user/:uuid` writes the request body straight into the document.

- Add middleware that uses the Firebase Admin SDK to verify the ID token from an `Authorization: Bearer` header, and set `req.user.uuid` from the verified token's `uid`.
- Replace `/user/:uuid` for the player's own data with `/me` routes that use `req.user.uuid`, so a player can only change their own record. Viewing another player stays a read-only route that returns public fields only.
- Whitelist updatable fields on user updates, so clients can't set their own `gold`, `level` or `experience`.
- Restrict quest create, update and delete to an admin role (the `type` field on the user).
- Replace the `Accept`-header checks on `/user` and `/firebase` with real authorisation. They aren't a security control.
- Add `helmet`, a request body size limit and basic rate limiting.
- Add tests for each of these alongside the code: missing token, invalid token, another player's `uuid`, a non-admin creating a quest, and a client trying to set `gold`.

**Done when:** a request without a valid token can't read private data or change any player, and tests prove it.

## Phase 8: Finish one vertical slice (L)

A working "start a quest" loop is more convincing than many half-built features.

The quest rules already exist in the original client-only prototype: `doQuest`, `determineWinner` and `handleLevelUp`, commented out in `client/scripts/index.js`. This phase ports them to the server and refactors them, rather than designing the rules from scratch.

**Move the rules to the server.** The prototype worked out the result in the browser and then sent the new gold and experience with `axios.put('/user/...')`, so any player could give themselves gold. The client should only say which quest it wants to attempt. The server loads the player and quest, decides the outcome, saves it and returns the result.

- Write the quest logic as a pure function with no Express or Mongoose code, for example `src/game/resolveQuest.ts`:

  ```ts
  resolveQuest(player: Player, quest: Quest, roll: () => number): QuestResult
  ```

  `roll` is passed in (`Math.random` in production), so tests can force a win or a loss. `QuestResult` says whether the quest succeeded and why, plus the changes to apply (gold, experience, action points, units lost, new level).
- `performQuest` becomes a thin controller for the signed-in player. It loads the player and quest, calls `resolveQuest`, saves the changes and returns the updated player with the result. A request should name a quest, not send stats. Consider renaming the route to `POST /quests/:id/attempt`.
- Port the prototype's rules into `resolveQuest`:
  - **Hard requirements:** the quest fails without a roll if the player's level or action points are too low.
  - **Odds:** when the player is short of the required units, each missing unit lowers the success chance by 10%. Meeting every requirement always succeeds. In the prototype, the ranged roll overwrote the melee result, so a melee shortfall could be ignored. Combine the shortfalls into one success chance, or roll once for each and require both to pass.
  - **Cost of failure:** the prototype planned to "randomly kill some units" on a failed quest. Decide the rule (for example, lose one unit for each missing unit, chosen with `roll`) and implement it.
  - **Rewards:** on success, deduct action points and add gold and experience.
  - **Level-ups:** the prototype levelled up when experience passed `level * 100`, then reset experience to 0, which lost any extra experience. Carry the remainder over, and handle gaining more than one level at once.
- Map the prototype's melee and ranged units onto the current schema (`totalUnits`, `totalAttack` and the unit model), or bring back separate unit types if quests need them.
- Show the result in the client, including failures ("not enough action points", "the bandits drove you back and you lost 2 units"). Then delete the commented-out prototype code from `client/scripts/index.js`.
- Delete the event model, controller and routes. They weren't part of the original submission and have no clear purpose. Move `performQuest` into `questController` first. Timed features don't need a collection or background jobs:
  - **Action point regeneration:** store `actionPointsUpdatedAt` on the player and work out the current value whenever the player is read: `min(max, stored + floor((now - updatedAt) / regenInterval))`.
  - **Cooldowns:** store an `availableAt` time and compare it with the current time.
- Save quest results with one atomic conditional update, such as `findOneAndUpdate({ uuid, actionPoints: { $gte: cost } }, { $inc: ... })`, so two requests at the same time (a double click) can't both spend the same action points. If the update returns `null`, the player couldn't afford the quest.
- Seed default units and items (`defaultUnits.json` and `defaultItems.json` already exist) so quests have something to check against.
- Unit-test `resolveQuest` directly with a fixed `roll`: hard requirement failures, guaranteed success, success and failure at each shortfall, units lost on failure, rewards, and single and multiple level-ups. Add one integration test for the route.

**Done when:** a new player can sign up, attempt a quest and see their gold, experience, action points and units change, and the client can't change any of these values directly.

**Next, once the slice works:** extend `resolveQuest` so that quests can need specific unit types (tags such as *flying* or *siege*) and items as well as totals, can reward items, and can unlock later quests. This is what turns single quests into a story. Add a test that walks the quest graph and checks that every quest can be reached.

## Phase 9: Deploy (S to M)

- Host the API and static client on a free or low-cost platform (Render, Fly.io and Railway are all options) with MongoDB Atlas.
- Keep all secrets in the host's environment settings, including the Firebase Admin service account. Rotate any credentials that were ever committed or logged.
- Add the live link and a screenshot to the README.

**Done when:** the README links to a working demo.

## Suggested order and pull requests

1. Phase 3 as one PR. It fixes sign-up, so do it first.
2. Phase 4 as one PR, or two if you want to split the client messages from the server status codes.
3. Phase 5 as one PR per folder, or one PR with a commit per folder.
4. Phase 6. The test setup and CI can go in first, followed by tests folder by folder.
5. Phase 7, then Phase 8, then Phase 9.

TypeScript comes before tests so tests are only written once, in TypeScript. The server is small enough that the risk of migrating without tests is low, and `tsc` catches most mistakes a rename would introduce.

## Out of scope for now

Guilds, leaderboards, profile messages, unit art and combat between players stay on [`todoList.md`](todoList.md) until the vertical slice is working.
