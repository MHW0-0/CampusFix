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
