/* ============================================================
   GET /api/admin/orders-export
   Export CSV des commandes
   ============================================================ */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

function checkAuth(req){
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return token && process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD;
}

function escapeCSV(value){
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')){
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function labelStatus(s){
  return {
    pending: 'En attente',
    confirmed: 'Confirmée',
    preparing: 'En préparation',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  }[s] || s;
}

function labelDelivery(m){
  return {
    retrait: 'Retrait café',
    tunis: 'Livraison Tunis',
    tunisie: 'Livraison Tunisie'
  }[m] || m;
}

function labelPayment(p){
  return {
    livraison: 'À la livraison',
    virement: 'Virement',
    flouci: 'Flouci'
  }[p] || p;
}

export default async function handler(req, res){
  if (!checkAuth(req)){
    return res.status(401).json({ error: 'Non autorisé.' });
  }

  const { status, from, to } = req.query;

  try {
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data, error } = await query;
    if (error) throw error;

    const orders = data || [];

    // Charge les items
    if (orders.length){
      const ids = orders.map(o => o.id);
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', ids);

      const itemsByOrder = {};
      (items || []).forEach(item => {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
        itemsByOrder[item.order_id].push(item);
      });

      orders.forEach(o => { o.items = itemsByOrder[o.id] || []; });
    }

    const headers = [
      'Numéro', 'Date', 'Statut', 'Nom', 'Téléphone', 'Email',
      'Livraison', 'Adresse', 'Paiement', 'Sous-total', 'Livraison (frais)', 'Total',
      'Articles', 'Notes'
    ];

    const lines = [headers.join(',')];

    orders.forEach(o => {
      const num = 'RC-' + o.id.slice(0, 8).toUpperCase();
      const articles = (o.items || []).map(i =>
        `${i.product_name} ${i.weight} ${i.grind} ×${i.quantity}`
      ).join(' | ');

      const row = [
        escapeCSV(num),
        escapeCSV(new Date(o.created_at).toLocaleString('fr-FR')),
        escapeCSV(labelStatus(o.status)),
        escapeCSV(o.customer_name),
        escapeCSV(o.customer_phone),
        escapeCSV(o.customer_email || ''),
        escapeCSV(labelDelivery(o.delivery_method)),
        escapeCSV(o.delivery_address || ''),
        escapeCSV(labelPayment(o.payment_method)),
        escapeCSV(Number(o.subtotal).toFixed(2)),
        escapeCSV(Number(o.shipping).toFixed(2)),
        escapeCSV(Number(o.total).toFixed(2)),
        escapeCSV(articles),
        escapeCSV(o.notes || '')
      ];
      lines.push(row.join(','));
    });

    const csv = lines.join('\n');
    const BOM = '\uFEFF';
    const filename = 'commandes-' + new Date().toISOString().slice(0, 10) + '.csv';

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    return res.status(200).send(BOM + csv);
  } catch (err){
    console.error('[admin/orders-export] Erreur:', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
}