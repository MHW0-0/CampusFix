const $ = (id) => document.getElementById(id);
const views = ['report', 'track', 'mine', 'maintenance', 'admin'];
function message(id, text, error = false) { const el = $(id); el.textContent = text; el.classList.toggle('error', error); }
async function api(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  let data;
  try { data = await response.json(); } catch { throw new Error('The server returned an unexpected response.'); }
  if (!response.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}
function show(view) {
  views.forEach((name) => $(name).classList.toggle('hidden', name !== view));
  document.querySelectorAll('.nav').forEach((button) => button.classList.toggle('active', button.dataset.view === view));
  if (view === 'maintenance') loadRequests();
  if (view === 'mine') loadMine();
  if (view === 'admin') loadAdmin();
}
document.querySelectorAll('.nav').forEach((button) => button.addEventListener('click', () => show(button.dataset.view)));
$('reportForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  message('reportMessage', 'Submitting…');
  try {
    const item = await api('/api/requests', { method: 'POST', body: JSON.stringify({ category: $('category').value, location: $('location').value, description: $('description').value }) });
    message('reportMessage', `Request #${item.id} submitted successfully. Save this number to track your request.`);
    rememberRequest(item.id);
    $('reportForm').reset();
  } catch (err) { message('reportMessage', err.message, true); }
});
function element(tag, text, className) { const el = document.createElement(tag); if (text !== undefined) el.textContent = String(text); if (className) el.className = className; return el; }
function requestCard(item, editable = false) {
  const card = element('article', undefined, 'request-card');
  card.append(element('h3', `Request #${item.id} · ${item.category}`));
  card.append(element('p', `Status: ${item.status}`, 'status'));
  card.append(element('p', `Location: ${item.location}`));
  card.append(element('p', `Description: ${item.description}`));
  card.append(element('p', `Submitted: ${item.created_at}`, 'muted'));
  if (editable) {
    const label = element('label', 'Update status');
    const select = element('select');
    ['Pending', 'In Progress', 'Resolved'].forEach((status) => { const option = element('option', status); option.value = status; select.append(option); });
    select.value = item.status;
    const save = element('button', 'Save status', 'secondary');
    const feedback = element('p', '', 'message');
    save.addEventListener('click', async () => {
      save.disabled = true;
      try { const updated = await api(`/api/requests/${item.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: select.value }) }); feedback.textContent = `Status saved: ${updated.status}`; feedback.classList.remove('error'); card.querySelector('.status').textContent = `Status: ${updated.status}`; }
      catch (err) { feedback.textContent = err.message; feedback.classList.add('error'); }
      finally { save.disabled = false; }
    });
    card.append(label, select, save, feedback);
  }
  return card;
}
$('trackForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  $('trackResult').replaceChildren();
  message('trackMessage', 'Looking up request…');
  try {
    const item = await api(`/api/requests/${encodeURIComponent($('requestId').value)}`);
    rememberRequest(item.id);
    message('trackMessage', 'Request found.');
    $('trackResult').append(detailedCard(item));
  }
  catch (err) { message('trackMessage', err.message, true); }
});
async function loadRequests() {
  message('maintenanceMessage', 'Loading requests…');
  $('requestList').replaceChildren();
  try { const items = await api('/api/requests'); message('maintenanceMessage', `${items.length} request(s) found.`); if (!items.length) $('requestList').append(element('p', 'No requests have been submitted yet.')); items.forEach((item) => $('requestList').append(requestCard(item, true))); }
  catch (err) { message('maintenanceMessage', err.message, true); }
}
$('refresh').addEventListener('click', loadRequests);


// Sprint 2: remember request numbers only on this browser (no user accounts).
const savedKey = 'campusfix-my-requests';
function myIds() {
  try {
    const ids = JSON.parse(localStorage.getItem(savedKey) || '[]');
    return Array.isArray(ids) ? ids.filter(id => Number.isSafeInteger(id) && id > 0) : [];
  } catch { return []; }
}
function rememberRequest(id) {
  const ids = myIds();
  if (!ids.includes(id)) localStorage.setItem(savedKey, JSON.stringify([id, ...ids]));
}
async function showUpdates(card, id) {
  const old = card.querySelector('.updates');
  if (old) { old.remove(); return; }
  const area = element('div', undefined, 'updates');
  area.append(element('p', 'Loading status updates…'));
  card.append(area);
  try {
    const updates = await api(`/api/requests/${id}/updates`);
    area.replaceChildren(element('h4', 'Status updates'));
    updates.forEach(update => area.append(element('p', `${update.changed_at}: ${update.status}`)));
  } catch (err) { area.replaceChildren(element('p', err.message, 'error')); }
}
function detailedCard(item) {
  const card = requestCard(item);
  const button = element('button', 'View status updates', 'secondary');
  button.addEventListener('click', () => showUpdates(card, item.id));
  card.append(button);
  return card;
}
async function loadMine() {
  const ids = myIds();
  $('mineList').replaceChildren();
  if (!ids.length) {
    message('mineMessage', 'No requests saved on this browser yet. Submit an issue first.');
    return;
  }
  message('mineMessage', 'Loading your requests…');
  const results = await Promise.allSettled(ids.map(id => api(`/api/requests/${id}`)));
  const items = results.filter(result => result.status === 'fulfilled').map(result => result.value);
  message('mineMessage', `${items.length} saved request(s) found.`);
  items.forEach(item => $('mineList').append(detailedCard(item)));
}
$('refreshMine').addEventListener('click', loadMine);

// Sprint 2: simple administration monitoring (read-only).
let adminRequests = [];
function drawAdmin() {
  const counts = ['Pending', 'In Progress', 'Resolved'];
  $('adminSummary').replaceChildren();
  [['All', adminRequests.length], ...counts.map(status => [status, adminRequests.filter(item => item.status === status).length])]
    .forEach(([status, count]) => {
      const tile = element('div', undefined, 'summary-tile');
      tile.append(element('strong', count), element('span', status));
      $('adminSummary').append(tile);
    });
  const filter = $('adminFilter').value;
  const visible = filter === 'All' ? adminRequests : adminRequests.filter(item => item.status === filter);
  $('adminList').replaceChildren();
  if (!visible.length) $('adminList').append(element('p', 'No requests found for this status.'));
  visible.forEach(item => $('adminList').append(detailedCard(item)));
}
async function loadAdmin() {
  message('adminMessage', 'Loading overview…');
  try {
    adminRequests = await api('/api/requests');
    message('adminMessage', `${adminRequests.length} total maintenance request(s).`);
    drawAdmin();
  } catch (err) { message('adminMessage', err.message, true); }
}
$('adminFilter').addEventListener('change', drawAdmin);
$('refreshAdmin').addEventListener('click', loadAdmin);

