/* ============================================================
   GRAIN & CENDRE — Back-office
   ============================================================ */
(function(){
  'use strict';

  const STORAGE_KEY = 'gac_admin_pwd';

  const loginScreen = document.getElementById('loginScreen');
  const adminScreen = document.getElementById('adminScreen');
  const pwd = document.getElementById('pwd');
  const loginBtn = document.getElementById('loginBtn');
  const loginErr = document.getElementById('loginErr');
  const logoutBtn = document.getElementById('logoutBtn');
  const tbody = document.getElementById('tbody');
  const count = document.getElementById('count');
  const fFrom = document.getElementById('fFrom');
  const fTo = document.getElementById('fTo');
  const fStatus = document.getElementById('fStatus');
  const refreshBtn = document.getElementById('refreshBtn');

  let password = '';
  try { password = sessionStorage.getItem(STORAGE_KEY) || ''; } catch(e){}

  // ----------------------------------------------------------
  // FETCH
  // ----------------------------------------------------------
  async function fetchReservations(){
    const params = new URLSearchParams();
    if (fFrom.value) params.set('from', fFrom.value);
    if (fTo.value) params.set('to', fTo.value);
    if (fStatus.value) params.set('status', fStatus.value);

    const res = await fetch('/api/admin/reservations?' + params.toString(), {
      headers: { 'Authorization': 'Bearer ' + password }
    });

    if (res.status === 401){
      logout();
      return;
    }
    if (!res.ok){
      tbody.innerHTML = '<tr><td colspan="7" class="empty">Erreur de chargement.</td></tr>';
      return;
    }
    const data = await res.json();
    render(data.reservations || []);
  }

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------
  function render(rows){
    if (!rows.length){
      tbody.innerHTML = '<tr><td colspan="7" class="empty">Aucune réservation.</td></tr>';
      count.textContent = '0 réservation';
      return;
    }
    count.textContent = rows.length + ' réservation' + (rows.length > 1 ? 's' : '');
    tbody.innerHTML = rows.map(r => `
      <tr data-id="${esc(r.id)}">
        <td><strong>${fmtDate(r.date)}</strong></td>
        <td>${esc(r.time)}</td>
        <td>${esc(r.name)}</td>
        <td>${esc(r.phone)}</td>
        <td>${r.guests}</td>
        <td>${r.message ? esc(r.message) : '<span style="color:#8B8168;">—</span>'}</td>
        <td class="actions-cell">
          <span class="status ${esc(r.status)}">${labelStatus(r.status)}</span>
          <div class="actions">
            ${r.status === 'pending' ? `
              <button class="action confirm" data-action="confirmed" data-id="${esc(r.id)}">Confirmer</button>
              <button class="action cancel" data-action="cancelled" data-id="${esc(r.id)}">Annuler</button>
            ` : ''}
            ${r.status === 'confirmed' ? `
              <button class="action cancel" data-action="cancelled" data-id="${esc(r.id)}">Annuler</button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  }

  function fmtDate(str){
    const d = new Date(str + 'T12:00:00');
    return d.toLocaleDateString('fr-FR', { weekday:'short', day:'numeric', month:'short' });
  }

  function labelStatus(s){
    return { pending:'En attente', confirmed:'Confirmée', cancelled:'Annulée' }[s] || s;
  }

  function esc(str){
    return String(str ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ----------------------------------------------------------
  // ACTIONS (délégation)
  // ----------------------------------------------------------
  async function updateStatus(id, status){
    const res = await fetch('/api/admin/reservations/' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + password,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    if (!res.ok){
      alert('Erreur lors de la mise à jour.');
      return;
    }
    fetchReservations();
  }

  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('button.action');
    if (!btn) return;
    e.preventDefault();
    const id = btn.dataset.id;
    const status = btn.dataset.action;
    if (!id || !status) return;

    if (!confirm(`Changer le statut en « ${labelStatus(status)} » ?`)) return;
    updateStatus(id, status);
  });

  // ----------------------------------------------------------
  // LOGIN / LOGOUT
  // ----------------------------------------------------------
  function login(){
    password = pwd.value;
    try { sessionStorage.setItem(STORAGE_KEY, password); } catch(e){}
    loginScreen.style.display = 'none';
    adminScreen.style.display = 'block';
    fetchReservations();
  }

  function logout(){
    password = '';
    try { sessionStorage.removeItem(STORAGE_KEY); } catch(e){}
    loginScreen.style.display = 'block';
    adminScreen.style.display = 'none';
    pwd.value = '';
  }

  loginBtn.addEventListener('click', login);
  pwd.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
  logoutBtn.addEventListener('click', logout);
  refreshBtn.addEventListener('click', fetchReservations);
  [fFrom, fTo, fStatus].forEach(el => el.addEventListener('change', fetchReservations));

  // Auto-login si mot de passe en session
  if (password){
    loginScreen.style.display = 'none';
    adminScreen.style.display = 'block';
    fetchReservations();
  }
})();