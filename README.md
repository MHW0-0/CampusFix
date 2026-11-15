# CampusFix

CampusFix is a CS388T Scrum course project: a university maintenance request web application completed across **Sprint 1 and Sprint 2**. Students and staff can report campus maintenance issues, track requests, and view status updates. The maintenance team can update request statuses, and administration can monitor reported issues.

## Technologies
HTML, CSS, JavaScript, Node.js 22.13+, Express 4, and SQLite (built-in Node.js `node:sqlite`).

## Sprint 1 — Core maintenance requests (US1–US9)
- Submit a maintenance issue with a category, location, and description.
- Track a request using its request number and view its details and current status.
- View incoming requests and their locations in the Maintenance Team page.
- Update a request's status to **Pending**, **In Progress**, or **Resolved**.

## Sprint 2 — Request history and administration (US10–US15)
- **My Requests:** View request numbers saved in the current browser, along with the associated requests and statuses.
- **Request details:** Open a saved request to see its information.
- **Status history and updates:** Record status changes in SQLite, view the history with timestamps, and show an in-browser notice when a saved request's status changes.
- **Administration overview:** View all maintenance requests and counts by status.
- **Status filtering:** Filter administration results by **Pending**, **In Progress**, or **Resolved**, including a resolved-only view.

## Project structure
- `public/` — HTML, CSS, and browser JavaScript for the pages
- `server.js` — Express application and API endpoints
- `db.js` — SQLite database, request validation, and status history
- `tests/` — automated database behavior tests
- `data/` — locally generated SQLite database (ignored by Git)

## Run locally (Windows)
1. Install Node.js **22.13 or newer** from https://nodejs.org/.
2. Clone or download the repository's **main** branch, then open the folder in VS Code.
3. Open a terminal in the project folder.
4. Run `npm install`.
5. Run `npm start`.
6. Visit **http://localhost:3000**.
7. Submit a maintenance request, then use **Track Request**, **My Requests**, **Maintenance Team**, and **Administration** to explore the workflows.
8. Optionally run `npm test` to run the automated database tests.

The SQLite database is created automatically in `data/`. No separate database installation is required. Stop the server with **Ctrl+C**.

## Important notes
- This is a **local university prototype**, not a production-ready public service.
- There are **no login accounts or role-based access controls**. Anyone with access to the local app can open the maintenance and administration views; someone who knows a valid request number can view that request.
- **My Requests** uses browser local storage to remember request numbers. It is not linked to a university email or account and is specific to the browser.
- Status update notices appear **inside the web app**; there are no email, SMS, or push notifications.
- The application shows a resolved request's current status but does not provide a separate resolution-date field.
- Do not commit the generated `data/` directory or credentials.
