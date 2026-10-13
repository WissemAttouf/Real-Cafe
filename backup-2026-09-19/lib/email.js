/* ============================================================
   Emails — Resend
   ============================================================ */
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM || 'onboarding@resend.dev';
const TO_CAFE = process.env.RESEND_TO || 'wattouf35@gmail.com';

function formatDateFR(dateStr){
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

export async function sendConfirmationToClient(reservation){
  const dateFR = formatDateFR(reservation.date);
  const subject = `Votre réservation chez Grain & Cendre — ${dateFR} à ${reservation.time}`;

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#17130F;background:#F6EEDD;">
      <h1 style="font-family:Georgia,serif;font-size:24px;margin:0 0 16px;color:#17130F;">Grain &amp; Cendre</h1>
      <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Bonjour ${escape(reservation.name)},</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 24px;">
        Nous avons bien noté votre réservation pour
        <strong>${reservation.guests} personne${reservation.guests > 1 ? 's' : ''}</strong>
        le <strong>${dateFR}</strong> à <strong>${reservation.time}</strong>.
      </p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 24px;">
        Nous vous rappelons au ${escape(reservation.phone)} dans les plus brefs délais pour confirmer.
      </p>
      <hr style="border:none;border-top:1px solid rgba(23,19,15,0.15);margin:32px 0;">
      <p style="font-size:13px;line-height:1.6;color:#8B8168;margin:0;">
        12 Rue de la Casbah, Tunis 1006 · +216 71 234 567<br>
        Ouvert du lundi au jeudi 07h–21h, vendredi–samedi 07h–22h30, dimanche 08h–20h.
      </p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: FROM,
    to: TO_CAFE,
    subject,
    html
  });

  if (error) throw new Error(`Resend client: ${error.message}`);
}

export async function sendNotificationToCafe(reservation){
  const dateFR = formatDateFR(reservation.date);
  const subject = `Nouvelle réservation — ${dateFR} ${reservation.time} (${reservation.guests}p)`;

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#F6EEDD;color:#17130F;">
      <h2 style="font-family:Georgia,serif;font-size:20px;margin:0 0 16px;">Nouvelle réservation</h2>
      <table style="width:100%;border-collapse:collapse;font-size:15px;">
        <tr><td style="padding:8px 0;color:#8B8168;">Nom</td><td style="padding:8px 0;font-weight:600;">${escape(reservation.name)}</td></tr>
        <tr><td style="padding:8px 0;color:#8B8168;">Téléphone</td><td style="padding:8px 0;font-weight:600;">${escape(reservation.phone)}</td></tr>
        <tr><td style="padding:8px 0;color:#8B8168;">Date</td><td style="padding:8px 0;font-weight:600;">${dateFR}</td></tr>
        <tr><td style="padding:8px 0;color:#8B8168;">Heure</td><td style="padding:8px 0;font-weight:600;">${reservation.time}</td></tr>
        <tr><td style="padding:8px 0;color:#8B8168;">Personnes</td><td style="padding:8px 0;font-weight:600;">${reservation.guests}</td></tr>
        ${reservation.message ? `<tr><td style="padding:8px 0;color:#8B8168;vertical-align:top;">Message</td><td style="padding:8px 0;">${escape(reservation.message)}</td></tr>` : ''}
        <tr><td style="padding:8px 0;color:#8B8168;">Reçue le</td><td style="padding:8px 0;">${new Date().toLocaleString('fr-FR')}</td></tr>
      </table>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: FROM,
    to: TO_CAFE,
    subject,
    html
  });

  if (error) throw new Error(`Resend cafe: ${error.message}`);
}

function escape(str){
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}