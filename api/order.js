/* ============================================================
   POST /api/order
   Crée une commande (orders + order_items)
   ============================================================ */
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmationToClient, sendOrderNotificationToCafe } from '../lib/email.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const SHIPPING_PRICES = {
  retrait: 0,
  tunis: 7,
  tunisie: 12
};

const VALID_WEIGHTS = ['250g', '500g', '1kg'];
const VALID_GRINDS = ['Grain', 'Moulu V60', 'Moulu espresso', 'Moulu turc'];
const VALID_DELIVERIES = ['retrait', 'tunis', 'tunisie'];
const VALID_PAYMENTS = ['livraison', 'virement', 'flouci'];

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST'){
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const body = req.body || {};
  const { customer, delivery, payment, notes, items } = body;

  // ----- Validation -----
  if (!customer || !customer.name || !customer.phone){
    return res.status(400).json({ error: 'Coordonnées client manquantes.' });
  }

  if (!delivery || !VALID_DELIVERIES.includes(delivery.method)){
    return res.status(400).json({ error: 'Mode de livraison invalide.' });
  }

  if (delivery.method !== 'retrait' && (!delivery.address || delivery.address.length < 5)){
    return res.status(400).json({ error: 'Adresse de livraison requise.' });
  }

  if (!VALID_PAYMENTS.includes(payment)){
    return res.status(400).json({ error: 'Mode de paiement invalide.' });
  }

  if (!Array.isArray(items) || !items.length){
    return res.status(400).json({ error: 'Panier vide.' });
  }

  try {
    // ----- Recharge les prix depuis la base (sécurité) -----
    const productIds = items.map(i => i.productId).filter(Boolean);
    const { data: products, error: productsErr } = await supabase
      .from('products')
      .select('id, name, price_250g, price_500g, price_1kg, image_url')
      .in('id', productIds);

    if (productsErr) throw productsErr;

    const productsMap = new Map((products || []).map(p => [p.id, p]));

    // ----- Construit les items avec prix vérifiés -----
    let subtotal = 0;
    const orderItems = [];

    for (const item of items){
      const product = productsMap.get(item.productId);
      if (!product){
        return res.status(400).json({ error: 'Produit introuvable : ' + item.productId });
      }
      if (!VALID_WEIGHTS.includes(item.weight)){
        return res.status(400).json({ error: 'Poids invalide.' });
      }
      if (!VALID_GRINDS.includes(item.grind)){
        return res.status(400).json({ error: 'Mouture invalide.' });
      }
      const qty = Math.max(1, Math.min(20, Number(item.quantity) || 1));

      // Prix selon le poids
      let unitPrice = 0;
      if (item.weight === '250g') unitPrice = Number(product.price_250g) || 0;
      else if (item.weight === '500g') unitPrice = Number(product.price_500g) || 0;
      else if (item.weight === '1kg') unitPrice = Number(product.price_1kg) || 0;

      if (unitPrice <= 0){
        return res.status(400).json({ error: 'Poids non disponible pour ' + product.name });
      }

      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        weight: item.weight,
        grind: item.grind,
        quantity: qty,
        unit_price: unitPrice,
        line_total: lineTotal
      });
    }

    const shipping = SHIPPING_PRICES[delivery.method] || 0;
    const total = subtotal + shipping;

    // ----- Insère la commande -----
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        customer_name: customer.name.trim(),
        customer_phone: customer.phone.trim(),
        customer_email: customer.email ? customer.email.trim() : null,
        delivery_method: delivery.method,
        delivery_address: delivery.method === 'retrait' ? null : delivery.address.trim(),
        payment_method: payment,
        subtotal: subtotal,
        shipping: shipping,
        total: total,
        status: 'pending',
        notes: notes ? notes.trim() : null
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // ----- Insère les items -----
    const itemsToInsert = orderItems.map(i => ({
      ...i,
      order_id: order.id
    }));

    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsErr) throw itemsErr;

    // ----- Réponse -----
        const orderNumber = 'RC-' + order.id.slice(0, 8).toUpperCase();

    // Ajoute le numéro à l'objet order pour les emails
    const orderForEmail = { ...order, orderNumber };

    // Envoie les emails (non bloquant)
    await Promise.allSettled([
      sendOrderConfirmationToClient(orderForEmail, itemsToInsert),
      sendOrderNotificationToCafe(orderForEmail, itemsToInsert)
    ]);

    return res.status(200).json({
      ok: true,
      id: order.id,
      orderNumber: orderNumber,
      total: total
    });
  } catch (err){
    console.error('[order] Erreur:', err);
    return res.status(500).json({ error: 'Erreur serveur. Merci de réessayer.' });
  }
}