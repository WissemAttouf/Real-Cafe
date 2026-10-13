/* ============================================================
   /api/admin/orders
   GET   → liste les commandes (avec filtres)
   PATCH → change le statut d'une commande (?id=xxx)
   ============================================================ */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];

function checkAuth(req){
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return token && process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD;
}

export default async function handler(req, res){
  if (!checkAuth(req)){
    return res.status(401).json({ error: 'Non autorisé.' });
  }

  try {
    // GET — liste
    if (req.method === 'GET'){
      const { status, from, to, limit } = req.query;

      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) query = query.eq('status', status);
      if (from) query = query.gte('created_at', from);
      if (to) query = query.lte('created_at', to);
      if (limit) query = query.limit(Number(limit));

      const { data, error } = await query;
      if (error) throw error;

      // Charge les items pour chaque commande
      const orders = data || [];
      if (orders.length){
        const ids = orders.map(o => o.id);
        const { data: items, error: itemsErr } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', ids);

        if (itemsErr) throw itemsErr;

        const itemsByOrder = {};
        (items || []).forEach(item => {
          if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
          itemsByOrder[item.order_id].push(item);
        });

        orders.forEach(o => { o.items = itemsByOrder[o.id] || []; });
      }

      return res.status(200).json({ orders });
    }

    // PATCH — change le statut
    if (req.method === 'PATCH'){
      const { id } = req.query;
      const { status } = req.body || {};

      if (!id) return res.status(400).json({ error: 'ID manquant.' });
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Statut invalide.' });
      }

      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ ok: true, order: data });
    }

    return res.status(405).json({ error: 'Méthode non autorisée.' });
  } catch (err){
    console.error('[admin/orders] Erreur:', err);
    return res.status(500).json({ error: err.message || 'Erreur serveur.' });
  }
}