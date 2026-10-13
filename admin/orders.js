/* ============================================================
   ADMIN COMMANDES
   ============================================================ */
(function(){
  'use strict';

  const STORAGE_KEY = 'gac_admin_pwd';

  const loginScreen = document.getElementById('loginScreen');
  const adminScreen = document.getElementById('adminScreen');
  const pwd = document.getElementById('pwd');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const exportBtn = document.getElementById('exportBtn');
  const listEl = document.getElementById('ordersList');
  const fStatus = document.getElementById('f-status');
  const fFrom = document.getElementById('f-from');
  const fTo = document.getElementById('f-to');
  const countEl = document.getElementById('count');

  let password = '';
  try { password = sessionStorage.getItem(STORAGE_KEY) || ''; } catch(e){}
  let orders = [];

  const STATUS_LABELS = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    preparing: 'En préparation',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  };

  const DELIVERY_LABELS = {
    retrait: 'Retrait au café',
    tunis: 'Livraison Grand Tunis',
    tunisie: 'Livraison toute la Tunisie'
  };

  const PAYMENT_LABELS = {
    livraison: 'Paiement à la livraison',
    virement: 'Virement bancaire',
    flouci: 'Flouci'
  };

  function esc(str){
    return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function fmtPrice(n){
    return Number(n).toFixed(2).replace('.', ',') + ' DT';
  }

  function fmtDate(str){
    const d = new Date(str);
    return d.toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' }) + ' à ' + d.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
  }

  async function api(path, opts = {}){
    const res = await fetch('/api/admin/orders' + path, {
      ...opts,
      headers: {
        'Authorization': 'Bearer ' + password,
        'Content-Type': 'application/json',
        ...(opts.headers || {})
      }
    });
    if (res.status === 401){ logout(); throw new Error('Non autorisé'); }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Erreur');
    return data;
  }

  function render(){
    if (!orders.length){
      listEl.innerHTML = '<p style="color:var(--muted); text-align:center; padding:3rem;">Aucune commande.</p>';
      countEl.textContent = '0 commande';
      return;
    }

    countEl.textContent = orders.length + ' commande' + (orders.length > 1 ? 's' : '');

    listEl.innerHTML = orders.map(o => {
      const num = 'RC-' + o.id.slice(0, 8).toUpperCase();
      const itemsHtml = (o.items || []).map(i => `
        <tr>
          <td>${esc(i.product_name)}</td>
          <td style="color:var(--muted); font-size:0.82rem;">${esc(i.weight)} · ${esc(i.grind)}</td>
          <td style="text-align:center;">${i.quantity}</td>
          <td style="text-align:right;">${fmtPrice(i.line_total)}</td>
        </tr>
      `).join('');

      const statusBtns = Object.keys(STATUS_LABELS).map(s => `
        <button class="admin-status-btn ${o.status === s ? 'current' : ''}" data-status="${s}" data-id="${esc(o.id)}">
          ${STATUS_LABELS[s]}
        </button>
      `).join('');

      return `
        <div class="admin-order" data-id="${esc(o.id)}">
          <div class="admin-order-head">
            <span class="admin-order-num">${num}</span>
            <div class="admin-order-info">
              <strong>${esc(o.customer_name)}</strong>
              <span>${esc(o.customer_phone)} · ${fmtDate(o.created_at)}</span>
            </div>
            <span class="admin-order-total">${fmtPrice(o.total)}</span>
            <span class="admin-status ${esc(o.status)}">${STATUS_LABELS[o.status] || o.status}</span>
          </div>
          <div class="admin-order-body">
            <div class="admin-order-details">
              <div>
                <h4>Client</h4>
                <p><strong>${esc(o.customer_name)}</strong></p>
                <p>${esc(o.customer_phone)}</p>
                ${o.customer_email ? '<p>' + esc(o.customer_email) + '</p>' : ''}
              </div>
              <div>
                <h4>Livraison</h4>
                <p><strong>${esc(DELIVERY_LABELS[o.delivery_method] || o.delivery_method)}</strong></p>
                ${o.delivery_address ? '<p>' + esc(o.delivery_address) + '</p>' : '<p>12 Rue de la Casbah, Tunis</p>'}
                <p style="margin-top:0.5rem; color:var(--muted); font-size:0.82rem;">${esc(PAYMENT_LABELS[o.payment_method] || o.payment_method)}</p>
              </div>
            </div>

            ${o.notes ? '<p style="font-size:0.88rem; color:var(--muted); margin:0 0 1rem;"><strong style="color:var(--cream);">Notes :</strong> ' + esc(o.notes) + '</p>' : ''}

            <h4>Articles</h4>
            <table class="admin-items-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Format</th>
                  <th style="text-align:center;">Qté</th>
                  <th style="text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <p style="font-size:0.88rem; text-align:right; margin:0 0 1.2rem;">
              Sous-total : <strong>${fmtPrice(o.subtotal)}</strong> · Livraison : <strong>${o.shipping > 0 ? fmtPrice(o.shipping) : 'Gratuit'}</strong> · Total : <strong style="color:var(--amber-2); font-size:1.05rem;">${fmtPrice(o.total)}</strong>
            </p>

            <h4>Changer le statut</h4>
            <div class="admin-order-actions">${statusBtns}</div>
          </div>
        </div>
      `;
    }).join('');

    // Toggle open/close
    listEl.querySelectorAll('.admin-order-head').forEach(head => {
      head.addEventListener('click', () => {
        head.parentElement.classList.toggle('open');
      });
    });

    // Changement de statut
    listEl.querySelectorAll('.admin-status-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const status = btn.dataset.status;
        const order = orders.find(o => o.id === id);
        if (!order) return;
        if (order.status === status) return;

        if (!confirm('Changer le statut en « ' + STATUS_LABELS[status] + ' » ?')) return;

        try {
          await api('?id=' + encodeURIComponent(id), {
            method: 'PATCH',
            body: JSON.stringify({ status })
          });
          order.status = status;
          render();
        } catch (err){
          alert(err.message);
        }
      });
    });
  }

  async function load(){
    try {
      const params = new URLSearchParams();
      if (fStatus.value) params.set('status', fStatus.value);
      if (fFrom.value) params.set('from', fFrom.value);
      if (fTo.value) params.set('to', fTo.value);

      const data = await api('?' + params.toString());
      orders = data.orders || [];
      render();
    } catch (err){
      console.error(err);
      listEl.innerHTML = '<p style="color:#D98A6B; text-align:center; padding:2rem;">Erreur de chargement.</p>';
    }
  }

  // Export CSV
  exportBtn.addEventListener('click', async () => {
    const params = new URLSearchParams();
    if (fStatus.value) params.set('status', fStatus.value);
    if (fFrom.value) params.set('from', fFrom.value);
    if (fTo.value) params.set('to', fTo.value);

    const original = exportBtn.textContent;
    exportBtn.disabled = true;
    exportBtn.textContent = 'Export…';

    try {
      const res = await fetch('/api/admin/orders-export?' + params.toString(), {
        headers: { 'Authorization': 'Bearer ' + password }
      });
      if (!res.ok) throw new Error('Erreur export');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'commandes-' + new Date().toISOString().slice(0, 10) + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err){
      alert(err.message);
    } finally {
      exportBtn.disabled = false;
      exportBtn.textContent = original;
    }
  });

  // Filtres
  fStatus.addEventListener('change', load);
  fFrom.addEventListener('change', load);
  fTo.addEventListener('change', load);
  refreshBtn.addEventListener('click', load);

  // Login
  function login(){
    password = pwd.value;
    try { sessionStorage.setItem(STORAGE_KEY, password); } catch(e){}
    loginScreen.style.display = 'none';
    adminScreen.style.display = 'block';
    load();
  }

  function logout(){
    password = '';
    try { sessionStorage.removeItem(STORAGE_KEY); } catch(e){}
    loginScreen.style.display = 'block';
    adminScreen.style.display = 'none';
    pwd.value = '';
  }

  loginBtn.addEventListener('click', login);
  pwd.addEventListener('keydown', (e) => { if (e.key === 'Enter') login(); });
  logoutBtn.addEventListener('click', logout);

  if (password){
    loginScreen.style.display = 'none';
    adminScreen.style.display = 'block';
    load();
  }
})();