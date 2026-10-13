/* ------------------------------------------------------------
   PRODUCT MODAL - fiche produit
   ------------------------------------------------------------ */
let currentProduct = null;
let selectedWeight = '250g';
let selectedGrind = 'Grain';
let quantity = 1;
let lastFocused = null;

function escapeHtml(str){
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatPrice(price){
  return Number(price).toFixed(2).replace('.', ',') + ' DT';
}

function getWeightPrice(product, weight){
  if (weight === '250g') return Number(product.price_250g) || 0;
  if (weight === '500g') return Number(product.price_500g) || 0;
  if (weight === '1kg') return Number(product.price_1kg) || 0;
  return 0;
}

function updatePrice(){
  if (!currentProduct) return;
  const priceEl = document.getElementById('productPrice');
  const unitPrice = getWeightPrice(currentProduct, selectedWeight);
  const total = unitPrice * quantity;
  if (priceEl) priceEl.textContent = formatPrice(total);
}

function updateOptionsStates(){
  document.querySelectorAll('#productWeights .product-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.weight === selectedWeight);
    const price = getWeightPrice(currentProduct, btn.dataset.weight);
    if (!price){
      btn.disabled = true;
      btn.style.opacity = '0.3';
      btn.style.cursor = 'not-allowed';
    } else {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    }
  });

  document.querySelectorAll('#productGrinds .product-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.grind === selectedGrind);
  });

  const qtyInput = document.getElementById('productQty');
  if (qtyInput) qtyInput.value = quantity;
}

export function open(product){
  if (!product) return;

  currentProduct = product;
  selectedWeight = '250g';
  selectedGrind = 'Grain';
  quantity = 1;

  // Remplit les champs
  document.getElementById('productOrigin').textContent = product.origin || '';
  document.getElementById('productModalName').textContent = product.name || '';
  document.getElementById('productDesc').textContent = product.description || '';

  // Notes
  const notesEl = document.getElementById('productNotes');
  notesEl.innerHTML = (product.notes || []).map(n => '<span>' + escapeHtml(n) + '</span>').join('');

  // Image
  const imageEl = document.getElementById('productImage');
  if (product.image_url){
    imageEl.innerHTML = '<img src="' + escapeHtml(product.image_url) + '" alt="">';
  } else {
    imageEl.innerHTML = '';
  }

  // Stock
  const stockEl = document.getElementById('productStock');
  if (stockEl){
    if (product.stock <= 0){
      stockEl.textContent = 'Épuisé — réapprovisionnement en cours';
      document.getElementById('productAdd').disabled = true;
    } else if (product.stock <= 5){
      stockEl.textContent = 'Plus que ' + product.stock + ' en stock';
      document.getElementById('productAdd').disabled = false;
    } else {
      stockEl.textContent = 'En stock';
      document.getElementById('productAdd').disabled = false;
    }
  }

  updateOptionsStates();
  updatePrice();

  // Ouvre la modale
  lastFocused = document.activeElement;
  const modal = document.getElementById('productModal');
  const backdrop = document.getElementById('productBackdrop');
  modal.classList.add('open');
  backdrop.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    const closeBtn = document.getElementById('productClose');
    if (closeBtn) closeBtn.focus();
  }, 100);
}

export function close(){
  const modal = document.getElementById('productModal');
  const backdrop = document.getElementById('productBackdrop');
  if (!modal) return;

  // Retire le focus AVANT de mettre aria-hidden
  if (document.activeElement && modal.contains(document.activeElement)){
    document.activeElement.blur();
  }

  modal.classList.remove('open');
  backdrop.classList.remove('open');
  document.body.style.overflow = '';

  // Le aria-hidden après un petit délai pour que le focus soit bien retiré
  setTimeout(() => {
    modal.setAttribute('aria-hidden', 'true');
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }, 100);
}

export function init(){
  const modal = document.getElementById('productModal');
  const backdrop = document.getElementById('productBackdrop');
  const closeBtn = document.getElementById('productClose');
  const addBtn = document.getElementById('productAdd');
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');

  if (!modal) return;

  // Ferme
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (backdrop) backdrop.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape'){
      e.preventDefault();
      close();
    }
  });

  // Choix poids
  document.querySelectorAll('#productWeights .product-option').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      selectedWeight = btn.dataset.weight;
      updateOptionsStates();
      updatePrice();
    });
  });

  // Choix mouture
  document.querySelectorAll('#productGrinds .product-option').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedGrind = btn.dataset.grind;
      updateOptionsStates();
    });
  });

  // Quantite
  if (qtyMinus) qtyMinus.addEventListener('click', () => {
    if (quantity > 1){ quantity--; updateOptionsStates(); updatePrice(); }
  });
  if (qtyPlus) qtyPlus.addEventListener('click', () => {
    if (quantity < 20){ quantity++; updateOptionsStates(); updatePrice(); }
  });

  // Ajouter au panier (prep 5.4)
  if (addBtn) addBtn.addEventListener('click', () => {
    if (!currentProduct) return;

    const item = {
      productId: currentProduct.id,
      slug: currentProduct.slug,
      name: currentProduct.name,
      weight: selectedWeight,
      grind: selectedGrind,
      quantity: quantity,
      unitPrice: getWeightPrice(currentProduct, selectedWeight)
    };

    console.log('[shop] Ajout au panier :', item);

    // TODO 5.4 : ajouter au panier localStorage
    // Pour l'instant, on ferme juste
    close();
  });
}