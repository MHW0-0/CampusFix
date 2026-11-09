const test = require('node:test');
const assert = require('node:assert/strict');
const { openDatabase, createRequest, getRequest, listRequests, updateStatus } = require('../db');
test('submit, persist, retrieve, update and resolve a maintenance request', () => {
  const db = openDatabase(':memory:');
  try {
    const created = createRequest(db, { category: 'Electrical', location: 'Building A Room 2', description: 'The ceiling light does not work.' });
    assert.equal(created.id, 1);
    assert.equal(created.status, 'Pending');
    assert.equal(getRequest(db, 1).location, 'Building A Room 2');
    assert.equal(listRequests(db).length, 1);
    assert.equal(updateStatus(db, 1, 'In Progress').status, 'In Progress');
    assert.equal(updateStatus(db, 1, 'Resolved').status, 'Resolved');
    assert.equal(getRequest(db, 1).status, 'Resolved');
  } finally { db.close(); }
});
test('reject invalid inputs and status changes', () => {
  const db = openDatabase(':memory:');
  try {
    assert.throws(() => createRequest(db, { category: 'Wrong', location: 'A', description: 'bad' }), /category/);
    assert.throws(() => createRequest(db, { category: 'Other', location: 'Room A', description: '<script>' }), /Description/);
    assert.throws(() => updateStatus(db, 1, 'Deleted'), /valid status/);
    assert.equal(getRequest(db, 999), null);
  } finally { db.close(); }
});

test('Sprint 2 keeps a history of status updates', () => {
  const { getUpdates } = require('../db');
  const db = openDatabase(':memory:');
  try {
    const item = createRequest(db, { category: 'Plumbing', location: 'Building B', description: 'Water is leaking under the sink.' });
    assert.deepEqual(getUpdates(db, item.id).map(row => row.status), ['Pending']);
    updateStatus(db, item.id, 'In Progress');
    updateStatus(db, item.id, 'In Progress'); // saving the same status creates no new event
    updateStatus(db, item.id, 'Resolved');
    assert.deepEqual(getUpdates(db, item.id).map(row => row.status), ['Pending', 'In Progress', 'Resolved']);
    assert.equal(getUpdates(db, 999), null);
  } finally { db.close(); }
});
