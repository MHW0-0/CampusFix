# CampusFix

CampusFix is a CS388T Sprint 1 university maintenance request web application. Students and staff can submit maintenance reports and track their status. Maintenance team members can review reports and update progress.

## Technologies
HTML, CSS, JavaScript, Node.js 22.13+, Express 4, SQLite (built-in Node.js `node:sqlite`).

## Sprint 1 scope (US1–US9)
Submit an issue with a category, description and location; look up request status by number; view maintenance requests, details and locations; change status to **Pending**, **In Progress** or **Resolved**. No authentication is included: **local demonstration only, not for public deployment**.

## Structure
- `public/` — web pages, styles and browser JavaScript
- `server.js` — Express API
- `db.js` — SQLite database and validation
- `tests/` — database behavior tests
- `data/` — locally generated SQLite database (ignored by Git)

## Run on Windows
1. Install Node.js **22.13 or newer** from https://nodejs.org/ and Visual Studio Code.
2. Download or clone the `sprint-1-implementation` branch, then open its folder in VS Code.
3. In VS Code select Terminal > New Terminal.
4. Run `npm install` (requires internet once).
5. Run `npm start`.
6. Open http://localhost:3000 in your browser.
7. Report an issue, save the request number, track it, then open Maintenance Team to update the status. Refresh the tracking view to confirm it changed.
8. Optional: run `npm test` to execute the database tests.

The SQLite file is created automatically under `data/`. No database installation or password is needed. Stop the server with Ctrl+C. Never commit the `data/` directory or credentials.

## Notes
Only Sprint 1 is implemented. User-specific request history, notifications and administration reporting are reserved for Sprint 2. Team meeting records and individual contribution logs must reflect real activities.
