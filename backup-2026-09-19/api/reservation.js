/* ============================================================
   POST /api/reservation
   Reçoit une réservation, la valide, la stocke, envoie les emails.
   ============================================================ */
import { validateReservation } from '../lib/validate.js';
import { saveReservation } from '../lib/store.js';
import { sendConfirmationToClient, sendNotificationToCafe } from '../lib/email.js';
import { checkRateLimit, getClientIp } from '../lib/rate-limit.js';
import { supabase } from '../lib/store.js';

export default async function handler(req, res){
  // CORS : seulement notre domaine
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || 'https://grainetcendre.tn');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS'){
    return res.status(204).end();
  }

  if (req.method !== 'POST'){
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  // Rate-limit par IP
  const ip = getClientIp(req);
  const rate = checkRateLimit(ip);
  if (!rate.allowed){
    return res.status(429).json({
      error: 'Trop de demandes. Merci de réessayer dans une heure ou de nous appeler.'
    });
  }

  // Validation
  const result = validateReservation(req.body);
  if (!result.valid){
    // Honeypot : on renvoie un succès factice pour ne pas informer le bot
    if (result.errors._honeypot){
      return res.status(200).json({ ok: true });
    }
    return res.status(400).json({ error: 'Données invalides.', fields: result.errors });
  }

    try {
    // Vérifie la capacité du créneau AVANT insertion
    const { data: slot, error: slotErr } = await supabase
      .from('time_slots')
      .select('capacity, reserved')
      .eq('date', result.data.date)
      .eq('time', result.data.time)
      .single();

    if (slotErr || !slot){
      return res.status(400).json({
        error: 'Ce créneau n\u2019existe pas.',
        fields: { time: 'Choisissez un autre créneau.' }
      });
    }

    if (slot.reserved >= slot.capacity){
      return res.status(409).json({
        error: 'Ce créneau est complet.',
        fields: { time: 'Ce créneau est complet. Choisissez-en un autre.' }
      });
    }

    const row = await saveReservation(result.data);

    await Promise.allSettled([
      sendNotificationToCafe(row),
      sendConfirmationToClient(row)
    ]);

    return res.status(200).json({
      ok: true,
      id: row.id,
      message: 'Réservation enregistrée.'
    });
  } catch (err){
    console.error('[reservation] Erreur:', err);
    return res.status(500).json({
      error: 'Erreur serveur. Merci de nous appeler directement.'
    });
  }
}