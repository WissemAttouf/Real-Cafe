/* ============================================================
   PATCH /api/admin/reservations/[id]
   Change le statut d'une réservation : pending → confirmed | cancelled
   ============================================================ */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const ALLOWED_STATUSES = ['pending', 'confirmed', 'cancelled'];

export default async function handler(req, res){
  if (req.method !== 'PATCH'){
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  // Auth : même mécanisme que GET /api/admin/reservations
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!process.env.ADMIN_PASSWORD || token !== process.env.ADMIN_PASSWORD){
    return res.status(401).json({ error: 'Non autorisé.' });
  }

  const { id } = req.query;
  const { status } = req.body || {};

  if (!id){
    return res.status(400).json({ error: 'ID manquant.' });
  }
  if (!ALLOWED_STATUSES.includes(status)){
    return res.status(400).json({ error: 'Statut invalide.' });
  }

  try {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ ok: true, reservation: data });
  } catch (err){
    console.error('[admin/reservations/[id]] Erreur:', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
}