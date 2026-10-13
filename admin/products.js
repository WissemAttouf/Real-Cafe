/* ============================================================
   ADMIN PRODUITS
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
  const addBtn = document.getElementById('addBtn');
  const listEl = document.getElementById('productsList');

  const modal = document.getElementById('modal');
  const backdrop = document.getElementById('modalBackdrop');
  const modalClose = document.getElementById('modalClose');
  const modalCancel = document.getElementById('modalCancel');
  const modalTitle = document.getElementById('modalTitle');
  const form = document.getElementById('productForm');

  let password = '';
  try { password = sessionStorage.getItem(STORAGE_KEY) || ''; } catch(e){}
  let products = [];

  // ------- API -------
  async function api(path, opts = {}){
    const res = await fetch('/api/admin/products' + path, {
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

  // ------- Rendu -------
  function esc(str){
    return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function fmtPrice(n){
    return Number(n).toFixed(2).replace('.', ',') + ' DT';
  }

  function render(){
    if (!products.length){
      listEl.innerHTML = '<p style="color:var(--muted); text-align:center; padding:3rem;">Aucun produit.</p>';
      return;
    }

    listEl.innerHTML = products.map(p => `
      <div class="admin-product" data-id="${esc(p.id)}">
        <div class="admin-product-image">
          ${p.image_url ? `<img src="${esc(p.image_url)}" alt="">` : ''}
        </div>
        <div class="admin-product-info">
          <h3>
            ${esc(p.name)}
            <span class="admin-badge ${p.active ? 'active' : 'inactive'}">${p.active ? 'Actif' : 'Inactif'}</span>
            ${p.featured ? '<span class="admin-badge active">Coup de cœur</span>' : ''}
          </h3>
          <div class="admin-product-meta">${esc(p.origin || '—')} · ${esc(p.roast_level || '—')} · Stock ${p.stock}</div>
          <div class="admin-product-price">250g : ${fmtPrice(p.price_250g)}${p.price_500g ? ' · 500g : ' + fmtPrice(p.price_500g) : ''}${p.price_1kg ? ' · 1kg : ' + fmtPrice(p.price_1kg) : ''}</div>
        </div>
        <div class="admin-product-actions">
          <button class="admin-btn secondary edit-btn" data-id="${esc(p.id)}">Modifier</button>
          <button class="admin-btn danger del-btn" data-id="${esc(p.id)}">Supprimer</button>
        </div>
      </div>
    `).join('');

    listEl.querySelectorAll('.edit-btn').forEach(b => b.addEventListener('click', () => openModal(b.dataset.id)));
    listEl.querySelectorAll('.del-btn').forEach(b => b.addEventListener('click', () => deleteProduct(b.dataset.id)));
  }

  // ------- Charge -------
  async function load(){
    try {
      const data = await api('');
      products = data.products || [];
      render();
    } catch (err){
      console.error(err);
      listEl.innerHTML = '<p style="color:#D98A6B;">Erreur de chargement.</p>';
    }
  }

  // ------- Modale -------
  function openModal(id){
    form.reset();
    document.getElementById('p-id').value = '';

    if (id){
      const p = products.find(x => x.id === id);
      if (!p) return;
      modalTitle.textContent = 'Modifier : ' + p.name;
      document.getElementById('p-id').value = p.id;
      document.getElementById('p-slug').value = p.slug || '';
      document.getElementById('p-name').value = p.name || '';
      document.getElementById('p-origin').value = p.origin || '';
      document.getElementById('p-description').value = p.description || '';
      document.getElementById('p-roast').value = p.roast_level || '';
      document.getElementById('p-image').value = p.image_url || '';
      document.getElementById('p-notes').value = (p.notes || []).join(', ');
      document.getElementById('p-price250').value = p.price_250g || '';
      document.getElementById('p-price500').value = p.price_500g || '';
      document.getElementById('p-price1kg').value = p.price_1kg || '';
      document.getElementById('p-stock').value = p.stock || 0;
      document.getElementById('p-active').checked = p.active !== false;
      document.getElementById('p-featured').checked = p.featured === true;
    } else {
      modalTitle.textContent = 'Nouveau produit';
      document.getElementById('p-active').checked = true;
      document.getElementById('p-stock').value = 0;
    }

    modal.classList.add('open');
    backdrop.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => document.getElementById('p-slug').focus(), 100);
  }

  function closeModal(){
    modal.classList.remove('open');
    backdrop.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  // ------- Submit -------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('p-id').value;

    const payload = {
      slug: document.getElementById('p-slug').value,
      name: document.getElementById('p-name').value,
      origin: document.getElementById('p-origin').value,
      description: document.getElementById('p-description').value,
      roast_level: document.getElementById('p-roast').value || null,
      image_url: document.getElementById('p-image').value,
      notes: document.getElementById('p-notes').value.split(',').map(s => s.trim()).filter(Boolean),
      price_250g: Number(document.getElementById('p-price250').value),
      price_500g: document.getElementById('p-price500').value ? Number(document.getElementById('p-price500').value) : null,
      price_1kg: document.getElementById('p-price1kg').value ? Number(document.getElementById('p-price1kg').value) : null,
      stock: Number(document.getElementById('p-stock').value) || 0,
      active: document.getElementById('p-active').checked,
      featured: document.getElementById('p-featured').checked
    };

    const btn = document.getElementById('modalSave');
    const orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Enregistrement…';

    try {
      if (id){
        await api('?id=' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await api('', { method: 'POST', body: JSON.stringify(payload) });
      }
      closeModal();
      await load();
    } catch (err){
      alert(err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = orig;
    }
  });

  async function deleteProduct(id){
    const p = products.find(x => x.id === id);
    if (!p) return;
    if (!confirm('Supprimer « ' + p.name + ' » ? Cette action est irréversible.')) return;

    try {
      await api('?id=' + encodeURIComponent(id), { method: 'DELETE' });
      await load();
    } catch (err){
      alert(err.message);
    }
  }

  // ------- Login -------
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
  addBtn.addEventListener('click', () => openModal(null));
  modalClose.addEventListener('click', closeModal);
  modalCancel.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  if (password){
    loginScreen.style.display = 'none';
    adminScreen.style.display = 'block';
    load();
  }
})();