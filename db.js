const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');
const allowedStatuses = ['Pending', 'In Progress', 'Resolved'];
const categories = ['Air Conditioning', 'Electrical', 'Plumbing', 'Furniture', 'Other'];
function openDatabase(filename = path.join(__dirname, 'data', 'campusfix.db')) {
  if (filename !== ':memory:') fs.mkdirSync(path.dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(`CREATE TABLE IF NOT EXISTS maintenance_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending','In Progress','Resolved')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
  return db;
}
function validateRequest(body) {
  if (!body || typeof body !== 'object') return 'Invalid request data.';
  if (typeof body.category !== 'string' || !categories.includes(body.category)) return 'Choose a valid category.';
  if (typeof body.location !== 'string' || body.location.trim().length < 3 || body.location.length > 120) return 'Location must be 3–120 characters.';
  if (typeof body.description !== 'string' || body.description.trim().length < 10 || body.description.length > 1000) return 'Description must be 10–1000 characters.';
  return null;
}
function createRequest(db, body) {
  const error = validateRequest(body);
  if (error) throw new Error(error);
  const result = db.prepare('INSERT INTO maintenance_requests (category,description,location) VALUES (?,?,?)')
    .run(body.category, body.description.trim(), body.location.trim());
  return getRequest(db, Number(result.lastInsertRowid));
}
function getRequest(db, id) {
  return db.prepare('SELECT * FROM maintenance_requests WHERE id = ?').get(id) || null;
}
function listRequests(db) {
  return db.prepare('SELECT * FROM maintenance_requests ORDER BY id DESC').all();
}
function updateStatus(db, id, status) {
  if (!allowedStatuses.includes(status)) throw new Error('Choose a valid status.');
  const request = getRequest(db, id);
  if (!request) return null;
  db.prepare("UPDATE maintenance_requests SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
  return getRequest(db, id);
}
module.exports = { openDatabase, categories, allowedStatuses, validateRequest, createRequest, getRequest, listRequests, updateStatus };
