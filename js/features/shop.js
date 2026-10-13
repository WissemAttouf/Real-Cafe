/* ------------------------------------------------------------
   SHOP - affichage public des produits
   ------------------------------------------------------------ */
import * as productModal from './product-modal.js';

export function init(){
  const grid = document.getElementById('shopGrid');
  if (!grid) return;

  productModal.init();

  const filters = document.querySelectorAll('.shop-filter');
  let allProducts = [];
  let currentFilter = 'all';

  function escapeHtml(str){
    return String(str ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function formatPrice(price){
    return Number(price).toFixed(2).replace('.', ',') + ' DT';
  }

  function renderProducts(){
    const list = currentFilter === 'all'
      ? allProducts
      : allProducts.filter(p => p.roast_level === currentFilter);

    if (!list.length){
      grid.innerHTML = '<p class="shop-loading">Aucun café dans cette catégorie.</p>';
      return;
    }

    grid.innerHTML = list.map(p => {
      const isOut = p.stock <= 0;
      const notesHtml = (p.notes || []).map(n => '<span>' + escapeHtml(n) + '</span>').join('');
      const imageHtml = p.image_url
        ? '<img src="' + escapeHtml(p.image_url) + '" alt="" loading="lazy">'
        : '';

      return `
        <article class="shop-card">
          <div class="shop-card-image">
            ${imageHtml}
            ${p.featured ? '<span class="shop-card-badge">Coup de coeur</span>' : ''}
            ${isOut ? '<span class="shop-card-badge out">Épuisé</span>' : ''}
          </div>
          <div class="shop-card-body">
            <span class="shop-card-origin">${escapeHtml(p.origin || '')}</span>
            <h3 class="shop-card-title">${escapeHtml(p.name)}</h3>
            <p class="shop-card-desc">${escapeHtml(p.description || '')}</p>
            ${notesHtml ? '<div class="shop-card-notes">' + notesHtml + '</div>' : ''}
            <div class="shop-card-footer">
              <div class="shop-card-price">
                ${formatPrice(p.price_250g)}
                <small>250g</small>
              </div>
              <button type="button" class="shop-card-cta" data-slug="${escapeHtml(p.slug)}" ${isOut ? 'disabled' : ''}>
                ${isOut ? 'Épuisé' : 'Voir le café'}
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Clic sur un produit → ouvrir la modale
    grid.querySelectorAll('.shop-card-cta:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        const slug = btn.dataset.slug;
        const product = allProducts.find(p => p.slug === slug);
        if (!product) return;
        productModal.open(product);
      });
    });
  }

  // Charge les produits
  fetch('/api/products')
    .then(r => r.json())
    .then(data => {
      allProducts = data.products || [];
      renderProducts();
    })
    .catch(err => {
      console.error('[shop] Erreur:', err);
      grid.innerHTML = '<p class="shop-loading">Impossible de charger les cafés.</p>';
    });

  // Filtres
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderProducts();
    });
  });
}