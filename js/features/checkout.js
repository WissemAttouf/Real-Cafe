/* ------------------------------------------------------------
   CHECKOUT - finalisation de commande
   ------------------------------------------------------------ */
import * as cart from './cart.js';

const SHIPPING_PRICES = {
  retrait: 0,
  tunis: 7,
  tunisie: 12
};

function escapeHtml(str){
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatPrice(price){
  return Number(price).toFixed(2).replace('.', ',') + ' DT';
}

export function init(){
  const itemsEl = document.getElementById('checkoutItems');
  const submitBtn = document.getElementById('checkoutSubmit');
  if (!itemsEl || !submitBtn) return;

  let currentDelivery = 'retrait';
  let currentPayment = 'livraison';

  // ----- Rendu du récapitulatif -----
  function renderSummary(){
    const items = cart.getItems();

    if (!items.length){
      itemsEl.innerHTML = `
        <div class="cart-empty">
          <p>Votre panier est vide.</p>
          <a href="/boutique.html">Voir les cafés</a>
        </div>
      `;
      document.getElementById('checkoutSubtotal').textContent = formatPrice(0);
      document.getElementById('checkoutShipping').textContent = '—';
      document.getElementById('checkoutTotal').textContent = formatPrice(0);
      submitBtn.disabled = true;
      return;
    }

    submitBtn.disabled = false;

    itemsEl.innerHTML = items.map(item => `
      <div class="checkout-item">
        <div class="checkout-item-image">
          ${item.image_url ? '<img src="' + escapeHtml(item.image_url) + '" alt="">' : ''}
        </div>
        <div class="checkout-item-info">
          <span class="checkout-item-name">${escapeHtml(item.name)}</span>
          <span class="checkout-item-meta">${escapeHtml(item.weight)} · ${escapeHtml(item.grind)} × ${item.quantity}</span>
        </div>
        <span class="checkout-item-price">${formatPrice(item.unitPrice * item.quantity)}</span>
      </div>
    `).join('');

    const st = cart.subtotal();
    const shipping = SHIPPING_PRICES[currentDelivery] || 0;
    const total = st + shipping;

    document.getElementById('checkoutSubtotal').textContent = formatPrice(st);
    document.getElementById('checkoutShipping').textContent = shipping === 0 ? 'Gratuit' : formatPrice(shipping);
    document.getElementById('checkoutTotal').textContent = formatPrice(total);
  }

  // ----- Choix livraison -----
  document.querySelectorAll('input[name="delivery"]').forEach(radio => {
    radio.addEventListener('change', () => {
      currentDelivery = radio.value;
      const addressWrap = document.getElementById('addressWrap');
      if (currentDelivery === 'retrait'){
        addressWrap.hidden = true;
      } else {
        addressWrap.hidden = false;
      }
      renderSummary();
    });
  });

  // ----- Choix paiement -----
  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', () => {
      currentPayment = radio.value;
    });
  });

  // ----- Erreurs -----
  function setError(field, msg){
    const el = document.querySelector('[data-err="' + field + '"]');
    if (el) el.textContent = msg || '';
  }

  function clearErrors(){
    ['name','phone','email','address'].forEach(f => setError(f, ''));
  }

  // ----- Soumission -----
  submitBtn.addEventListener('click', async () => {
    clearErrors();

    const name = document.getElementById('co-name').value.trim();
    const phone = document.getElementById('co-phone').value.trim();
    const email = document.getElementById('co-email').value.trim();
    const address = document.getElementById('co-address').value.trim();
    const notes = document.getElementById('co-notes').value.trim();

    let valid = true;

    if (!name){ setError('name', 'Merci d\'indiquer votre nom.'); valid = false; }
    if (!phone || phone.replace(/\D/g,'').length < 8){
      setError('phone', 'Numéro de téléphone invalide.'); valid = false;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      setError('email', 'Email invalide.'); valid = false;
    }
    if (currentDelivery !== 'retrait' && !address){
      setError('address', 'Adresse de livraison requise.'); valid = false;
    }

    if (!valid) {
      const firstError = document.querySelector('.err:not(:empty)');
      if (firstError) firstError.scrollIntoView({behavior:'smooth', block:'center'});
      return;
    }

    const items = cart.getItems();
    if (!items.length){
      alert('Votre panier est vide.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { name, phone, email },
          delivery: {
            method: currentDelivery,
            address: currentDelivery === 'retrait' ? null : address
          },
          payment: currentPayment,
          notes: notes,
          items: items.map(i => ({
            productId: i.productId,
            weight: i.weight,
            grind: i.grind,
            quantity: i.quantity
          }))
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok){
        alert(data.error || 'Erreur lors de l\'envoi.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirmer la commande';
        return;
      }

      // Vide le panier
      cart.clear();

      // Affiche la confirmation
      document.getElementById('confirmName').textContent = name;
      document.getElementById('confirmPhone').textContent = phone;
      document.getElementById('confirmNumber').textContent = data.orderNumber || data.id;

      document.querySelector('.checkout-section').hidden = true;
      document.querySelector('.checkout-hero').hidden = true;
      document.getElementById('checkoutConfirm').hidden = false;

      window.scrollTo({top: 0, behavior: 'smooth'});
    } catch (err){
      console.error('[checkout] Erreur:', err);
      alert('Erreur réseau. Merci de réessayer.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirmer la commande';
    }
  });

  // Rendu initial
  renderSummary();
}