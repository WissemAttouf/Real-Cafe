/* ------------------------------------------------------------
   CART - panier localStorage
   ------------------------------------------------------------ */
const STORAGE_KEY = 'rc_cart';

function escapeHtml(str){
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatPrice(price){
  return Number(price).toFixed(2).replace('.', ',') + ' DT';
}

function read(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch(e){
    return [];
  }
}

function write(items){
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch(e){}
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items } }));
}

export function getItems(){ return read(); }
export function count(){ return read().reduce((sum, item) => sum + item.quantity, 0); }
export function subtotal(){ return read().reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0); }

export function add(item){
  const items = read();
  const existing = items.find(i =>
    i.productId === item.productId &&
    i.weight === item.weight &&
    i.grind === item.grind
  );
  if (existing){
    existing.quantity += item.quantity;
    if (existing.quantity > 20) existing.quantity = 20;
  } else {
    items.push({ ...item });
  }
  write(items);
}

export function updateQuantity(index, quantity){
  const items = read();
  if (!items[index]) return;
  if (quantity < 1) quantity = 1;
  if (quantity > 20) quantity = 20;
  items[index].quantity = quantity;
  write(items);
}

export function remove(index){
  const items = read();
  items.splice(index, 1);
  write(items);
}

export function clear(){ write([]); }

// ------------------------------------------------------------
// FORCE les styles du drawer (contourne tout conflit CSS)
// ------------------------------------------------------------
function hideDrawer(drawer, backdrop){
  if (!drawer) return;
  drawer.style.position = 'fixed';
  drawer.style.top = '0';
  drawer.style.right = '0';
  drawer.style.bottom = '0';
  drawer.style.left = 'auto';
  drawer.style.width = 'min(400px, 90vw)';
  drawer.style.background = '#221B14';
  drawer.style.borderLeft = '1px solid rgba(246,238,221,0.28)';
  drawer.style.zIndex = '400';
  drawer.style.display = 'flex';
  drawer.style.flexDirection = 'column';
  drawer.style.visibility = 'hidden';
  drawer.style.opacity = '0';
  drawer.style.pointerEvents = 'none';
  drawer.style.transform = 'translateX(100%)';
  drawer.style.transition = 'transform .4s cubic-bezier(0.22, 1, 0.36, 1), visibility 0s .4s';
  drawer.style.overflowY = 'auto';

  if (backdrop){
    backdrop.style.position = 'fixed';
    backdrop.style.inset = '0';
    backdrop.style.background = 'rgba(10,8,6,0.7)';
    backdrop.style.zIndex = '399';
    backdrop.style.visibility = 'hidden';
    backdrop.style.opacity = '0';
    backdrop.style.pointerEvents = 'none';
    backdrop.style.transition = 'opacity .3s ease, visibility 0s .3s';
  }
}

function showDrawer(drawer, backdrop){
  if (!drawer) return;
  drawer.style.visibility = 'visible';
  drawer.style.opacity = '1';
  drawer.style.pointerEvents = 'auto';
  drawer.style.transform = 'translateX(0)';
  drawer.style.transition = 'transform .4s cubic-bezier(0.22, 1, 0.36, 1), visibility 0s 0s';

  if (backdrop){
    backdrop.style.visibility = 'visible';
    backdrop.style.opacity = '1';
    backdrop.style.pointerEvents = 'auto';
    backdrop.style.transition = 'opacity .3s ease, visibility 0s 0s';
  }
}

// ------------------------------------------------------------
// UI — Drawer, badge, rendu
// ------------------------------------------------------------
function render(){
  const body = document.getElementById('cartBody');
  const footer = document.getElementById('cartFooter');
  const countEl = document.getElementById('cartCount');
  if (!body) return;

  const items = read();
  const total = count();

  if (countEl){
    if (total > 0){
      countEl.textContent = total;
      countEl.hidden = false;
    } else {
      countEl.hidden = true;
    }
  }

  if (!items.length){
    body.innerHTML = `
      <div class="cart-empty">
        <p>Votre panier est vide.</p>
        <a href="/boutique.html">Voir les cafés</a>
      </div>
    `;
    if (footer) footer.hidden = true;
    return;
  }

  body.innerHTML = items.map((item, i) => `
    <div class="cart-item" data-index="${i}">
      <div class="cart-item-image">
        ${item.image_url ? '<img src="' + escapeHtml(item.image_url) + '" alt="">' : ''}
      </div>
      <div class="cart-item-info">
        <h3 class="cart-item-name">${escapeHtml(item.name)}</h3>
        <span class="cart-item-meta">${escapeHtml(item.weight)} · ${escapeHtml(item.grind)}</span>
        <span class="cart-item-price">${formatPrice(item.unitPrice * item.quantity)}</span>
      </div>
      <div class="cart-item-actions">
        <div class="cart-item-qty">
          <button type="button" data-action="minus" data-index="${i}" aria-label="Moins">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-action="plus" data-index="${i}" aria-label="Plus">+</button>
        </div>
        <button type="button" class="cart-item-remove" data-action="remove" data-index="${i}">Retirer</button>
      </div>
    </div>
  `).join('');

  if (footer){
    footer.hidden = false;
    const st = subtotal();
    document.getElementById('cartSubtotal').textContent = formatPrice(st);
  }
}

export function open(){
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartBackdrop');
  if (!drawer) return;

  render();
  drawer.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
  showDrawer(drawer, backdrop);
  drawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    const closeBtn = document.getElementById('cartClose');
    if (closeBtn) closeBtn.focus();
  }, 100);
}

export function close(){
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartBackdrop');
  if (!drawer) return;

  if (document.activeElement && drawer.contains(document.activeElement)){
    document.activeElement.blur();
  }

  drawer.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  hideDrawer(drawer, backdrop);
  document.body.style.overflow = '';

  setTimeout(() => {
    drawer.setAttribute('aria-hidden', 'true');
  }, 100);
}

export function init(){
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartBackdrop');
  const toggleBtn = document.getElementById('cartToggle');
  const closeBtn = document.getElementById('cartClose');
  const body = document.getElementById('cartBody');

  if (!drawer) return;

  // FIX : force le drawer caché dès l'init (contourne tout CSS)
  hideDrawer(drawer, backdrop);

  // Force caché à chaque rechargement (au cas où)
  window.addEventListener('pageshow', () => {
    if (!drawer.classList.contains('open')){
      hideDrawer(drawer, backdrop);
    }
  });

  if (toggleBtn) toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    open();
  });

  if (closeBtn) closeBtn.addEventListener('click', close);
  if (backdrop) backdrop.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (!drawer.classList.contains('open')) return;
    if (e.key === 'Escape'){
      e.preventDefault();
      close();
    }
  });

  if (body) body.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    e.preventDefault();

    const action = btn.dataset.action;
    const index = Number(btn.dataset.index);

    if (action === 'plus'){
      const items = read();
      if (items[index]) updateQuantity(index, items[index].quantity + 1);
    } else if (action === 'minus'){
      const items = read();
      if (items[index]) updateQuantity(index, items[index].quantity - 1);
    } else if (action === 'remove'){
      remove(index);
    }
  });

  window.addEventListener('cart:updated', render);
  render();
}