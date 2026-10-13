/* ============================================================
   GET /api/availability?date=YYYY-MM-DD
   Retourne les créneaux disponibles pour une date donnée.
   ============================================================ */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function handler(req, res){
  if (req.method !== 'GET'){
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const { date } = req.query;

  if (!date || !DATE_RE.test(date)){
    return res.status(400).json({ error: 'Date invalide.' });
  }

  try {
    const { data, error } = await supabase
      .from('time_slots')
      .select('time, capacity, reserved')
      .eq('date', date)
      .order('time', { ascending: true });

    if (error) throw error;

    const slots = (data || []).map(s => ({
      time: s.time,
      capacity: s.capacity,
      reserved: s.reserved,
      remaining: Math.max(0, s.capacity - s.reserved),
      available: s.reserved < s.capacity
    }));

    return res.status(200).json({ date, slots });
  } catch (err){
    console.error('[availability] Erreur:', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
}