/* ============================================================
   Emails — Resend
   ============================================================ */
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM || 'onboarding@resend.dev';
const TO_CAFE = process.env.RESEND_TO;

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

/* ============================================================
   EMAILS — Boutique
   ============================================================ */

function formatOrderItems(items){
  return items.map(i => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #E1D2A9;">${escape(i.product_name)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #E1D2A9;color:#8B8168;">${escape(i.weight)} · ${escape(i.grind)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #E1D2A9;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #E1D2A9;text-align:right;font-weight:600;">${Number(i.line_total).toFixed(2).replace('.', ',')} DT</td>
    </tr>
  `).join('');
}

function deliveryLabel(method){
  if (method === 'retrait') return 'Retrait au café';
  if (method === 'tunis') return 'Livraison Grand Tunis';
  if (method === 'tunisie') return 'Livraison toute la Tunisie';
  return method;
}

function paymentLabel(method){
  if (method === 'livraison') return 'Paiement à la livraison';
  if (method === 'virement') return 'Virement bancaire';
  if (method === 'flouci') return 'Flouci';
  return method;
}

export async function sendOrderConfirmationToClient(order, items){
  const subject = `Votre commande Real Cafe — ${order.orderNumber}`;

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#F6EEDD;color:#17130F;">
      <h1 style="font-family:Georgia,serif;font-size:24px;margin:0 0 8px;color:#17130F;">Real Cafe</h1>
      <p style="color:#8B8168;margin:0 0 24px;font-size:14px;">Commande ${escape(order.orderNumber)}</p>

      <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Bonjour ${escape(order.customer_name)},</p>

      <p style="font-size:16px;line-height:1.6;margin:0 0 24px;">
        Nous avons bien reçu votre commande. Voici le récapitulatif :
      </p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 0;border-bottom:2px solid #17130F;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Produit</th>
            <th style="text-align:left;padding:8px 0;border-bottom:2px solid #17130F;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Format</th>
            <th style="text-align:center;padding:8px 0;border-bottom:2px solid #17130F;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Qté</th>
            <th style="text-align:right;padding:8px 0;border-bottom:2px solid #17130F;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${formatOrderItems(items)}
        </tbody>
      </table>

      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
        <tr>
          <td style="padding:6px 0;color:#8B8168;">Sous-total</td>
          <td style="padding:6px 0;text-align:right;">${Number(order.subtotal).toFixed(2).replace('.', ',')} DT</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#8B8168;">Livraison (${escape(deliveryLabel(order.delivery_method))})</td>
          <td style="padding:6px 0;text-align:right;">${order.shipping > 0 ? Number(order.shipping).toFixed(2).replace('.', ',') + ' DT' : 'Gratuit'}</td>
        </tr>
        <tr>
          <td style="padding:12px 0 6px;border-top:2px solid #17130F;font-weight:600;font-size:16px;">Total</td>
          <td style="padding:12px 0 6px;border-top:2px solid #17130F;text-align:right;font-weight:700;font-size:18px;">${Number(order.total).toFixed(2).replace('.', ',')} DT</td>
        </tr>
      </table>

      <div style="background:#ECE0C2;padding:16px;border-radius:3px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-weight:600;font-size:14px;">${escape(paymentLabel(order.payment_method))}</p>
        ${order.payment_method === 'virement' ? `
          <p style="margin:0;font-size:13px;line-height:1.6;">
            Nos coordonnées bancaires :<br>
            <strong>Titulaire :</strong> Real Cafe<br>
            <strong>Banque :</strong> À préciser<br>
            <strong>RIB :</strong> À préciser<br>
            Nous vous enverrons ces informations par SMS sous peu.
          </p>
        ` : ''}
        ${order.payment_method === 'livraison' ? `
          <p style="margin:0;font-size:13px;line-height:1.6;">
            Vous paierez en espèces au moment de la ${order.delivery_method === 'retrait' ? 'récupération au café' : 'livraison'}.
          </p>
        ` : ''}
      </div>

      <p style="font-size:14px;line-height:1.6;margin:0 0 24px;">
        <strong>Livraison :</strong> ${escape(deliveryLabel(order.delivery_method))}<br>
        ${order.delivery_address ? '<strong>Adresse :</strong> ' + escape(order.delivery_address) : '12 Rue de la Casbah, Tunis 1006'}
      </p>

      <p style="font-size:14px;line-height:1.6;margin:0 0 24px;">
        Nous vous appellerons au <strong>${escape(order.customer_phone)}</strong> pour confirmer.
      </p>

      <hr style="border:none;border-top:1px solid #E1D2A9;margin:32px 0;">

      <p style="font-size:12px;color:#8B8168;margin:0;line-height:1.6;">
        Real Cafe · 12 Rue de la Casbah, Tunis 1006<br>
        +216 71 234 567 · Grain torréfié sur place, 3×/semaine
      </p>
    </div>
  `;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: FROM,
    to: order.customer_email || TO_CAFE,
    subject,
    html
  });

  if (error) throw new Error('Resend client order: ' + error.message);
}

export async function sendOrderNotificationToCafe(order, items){
  const subject = `Nouvelle commande — ${order.orderNumber} (${Number(order.total).toFixed(2)} DT)`;

  const itemsRows = items.map(i => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #E1D2A9;">${escape(i.product_name)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #E1D2A9;color:#8B8168;">${escape(i.weight)} · ${escape(i.grind)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #E1D2A9;text-align:center;">${i.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #E1D2A9;text-align:right;">${Number(i.line_total).toFixed(2).replace('.', ',')} DT</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#F6EEDD;color:#17130F;">
      <h2 style="font-family:Georgia,serif;font-size:20px;margin:0 0 16px;">Nouvelle commande</h2>
      <p style="font-size:16px;margin:0 0 24px;color:#8B8168;">Commande ${escape(order.orderNumber)} — ${new Date().toLocaleString('fr-FR')}</p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
        <tr><td style="padding:6px 0;color:#8B8168;width:140px;">Nom</td><td style="padding:6px 0;font-weight:600;">${escape(order.customer_name)}</td></tr>
        <tr><td style="padding:6px 0;color:#8B8168;">Téléphone</td><td style="padding:6px 0;font-weight:600;">${escape(order.customer_phone)}</td></tr>
        ${order.customer_email ? `<tr><td style="padding:6px 0;color:#8B8168;">Email</td><td style="padding:6px 0;">${escape(order.customer_email)}</td></tr>` : ''}
        <tr><td style="padding:6px 0;color:#8B8168;">Livraison</td><td style="padding:6px 0;">${escape(deliveryLabel(order.delivery_method))}</td></tr>
        ${order.delivery_address ? `<tr><td style="padding:6px 0;color:#8B8168;vertical-align:top;">Adresse</td><td style="padding:6px 0;">${escape(order.delivery_address)}</td></tr>` : ''}
        <tr><td style="padding:6px 0;color:#8B8168;">Paiement</td><td style="padding:6px 0;">${escape(paymentLabel(order.payment_method))}</td></tr>
        ${order.notes ? `<tr><td style="padding:6px 0;color:#8B8168;vertical-align:top;">Notes</td><td style="padding:6px 0;">${escape(order.notes)}</td></tr>` : ''}
      </table>

      <h3 style="font-family:Georgia,serif;font-size:16px;margin:0 0 12px;">Articles</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 0;border-bottom:2px solid #17130F;font-size:12px;text-transform:uppercase;">Produit</th>
            <th style="text-align:left;padding:8px 0;border-bottom:2px solid #17130F;font-size:12px;text-transform:uppercase;">Format</th>
            <th style="text-align:center;padding:8px 0;border-bottom:2px solid #17130F;font-size:12px;text-transform:uppercase;">Qté</th>
            <th style="text-align:right;padding:8px 0;border-bottom:2px solid #17130F;font-size:12px;text-transform:uppercase;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>

      <p style="font-size:18px;text-align:right;margin:0 0 24px;font-weight:700;font-family:Georgia,serif;">
        Total : ${Number(order.total).toFixed(2).replace('.', ',')} DT
      </p>

      <p style="font-size:14px;margin:0;color:#8B8168;">
        Connectez-vous au back-office pour confirmer et préparer la commande.
      </p>
    </div>
  `;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: FROM,
    to: TO_CAFE,
    subject,
    html
  });

  if (error) throw new Error('Resend cafe order: ' + error.message);
}

function escape(str){
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}