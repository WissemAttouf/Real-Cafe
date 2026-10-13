/* ============================================================
   GET /api/admin/reservations
   Back-office : liste les réservations. Protégé par mot de passe.
   ============================================================ */
import { listReservations } from '../../lib/store.js';

export default async function handler(req, res){
  if (req.method !== 'GET'){
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!process.env.ADMIN_PASSWORD || token !== process.env.ADMIN_PASSWORD){
    return res.status(401).json({ error: 'Non autorisé.' });
  }

  const { from, to, status } = req.query;

  try {
    const rows = await listReservations({ from, to, status });
    return res.status(200).json({ ok: true, reservations: rows });
  } catch (err){
    console.error('[admin/reservations] Erreur:', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
}