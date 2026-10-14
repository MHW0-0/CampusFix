const $ = (id) => document.getElementById(id);
const views = ['report', 'track', 'maintenance'];
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
}
document.querySelectorAll('.nav').forEach((button) => button.addEventListener('click', () => show(button.dataset.view)));
$('reportForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  message('reportMessage', 'Submitting…');
  try {
    const item = await api('/api/requests', { method: 'POST', body: JSON.stringify({ category: $('category').value, location: $('location').value, description: $('description').value }) });
    message('reportMessage', `Request #${item.id} submitted successfully. Save this number to track your request.`);
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
  try { const item = await api(`/api/requests/${encodeURIComponent($('requestId').value)}`); message('trackMessage', 'Request found.'); $('trackResult').append(requestCard(item)); }
  catch (err) { message('trackMessage', err.message, true); }
});
async function loadRequests() {
  message('maintenanceMessage', 'Loading requests…');
  $('requestList').replaceChildren();
  try { const items = await api('/api/requests'); message('maintenanceMessage', `${items.length} request(s) found.`); if (!items.length) $('requestList').append(element('p', 'No requests have been submitted yet.')); items.forEach((item) => $('requestList').append(requestCard(item, true))); }
  catch (err) { message('maintenanceMessage', err.message, true); }
}
$('refresh').addEventListener('click', loadRequests);
