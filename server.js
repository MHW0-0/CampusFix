const express = require('express');
const path = require('node:path');
const { openDatabase, createRequest, getRequest, listRequests, updateStatus } = require('./db');
const app = express();
const db = openDatabase();
app.disable('x-powered-by');
app.use(express.json({ limit: '12kb' }));
app.use(express.static(path.join(__dirname, 'public')));
function validId(value) { return /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value)); }
app.post('/api/requests', (req, res) => {
  try { res.status(201).json(createRequest(db, req.body)); }
  catch (err) { res.status(400).json({ error: err.message }); }
});
app.get('/api/requests', (_req, res) => res.json(listRequests(db)));
app.get('/api/requests/:id', (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid request number.' });
  const item = getRequest(db, Number(req.params.id));
  return item ? res.json(item) : res.status(404).json({ error: 'Request not found.' });
});
app.patch('/api/requests/:id/status', (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid request number.' });
  try {
    const item = updateStatus(db, Number(req.params.id), req.body?.status);
    return item ? res.json(item) : res.status(404).json({ error: 'Request not found.' });
  } catch (err) { return res.status(400).json({ error: err.message }); }
});
app.use('/api', (_req, res) => res.status(404).json({ error: 'API endpoint not found.' }));
app.use((err, _req, res, _next) => res.status(err.status || 400).json({ error: 'Invalid request.' }));
const port = Number(process.env.PORT) || 3000;
if (require.main === module) app.listen(port, '127.0.0.1', () => console.log(`CampusFix running at http://localhost:${port}`));
module.exports = app;
