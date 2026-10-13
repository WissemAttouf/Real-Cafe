/* ============================================================
   Validation serveur — ne jamais faire confiance au client
   ============================================================ */

const PHONE_RE = /^[+]?[\d\s().-]{8,20}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export function validateReservation(body){
  const errors = {};

  const name = String(body?.name ?? '').trim();
  if (name.length < 2 || name.length > 80){
    errors.name = 'Nom invalide (2 à 80 caractères).';
  }

  const phone = String(body?.phone ?? '').trim();
  const digits = phone.replace(/\D/g, '');
  if (!PHONE_RE.test(phone) || digits.length < 8 || digits.length > 15){
    errors.phone = 'Numéro de téléphone invalide.';
  }

  const date = String(body?.date ?? '').trim();
  if (!DATE_RE.test(date)){
    errors.date = 'Date invalide.';
  } else {
    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(date + 'T00:00:00');
    if (isNaN(target.getTime())){
      errors.date = 'Date invalide.';
    } else if (target < today){
      errors.date = 'La date est déjà passée.';
    } else if (target > new Date(today.getTime() + 90 * 86400000)){
      errors.date = 'Réservation limitée à 90 jours.';
    }
  }

  const time = String(body?.time ?? '').trim();
  if (!TIME_RE.test(time)){
    errors.time = 'Heure invalide.';
  } else {
    const [h, m] = time.split(':').map(Number);
    if (h < 7 || h > 23 || (h === 23 && m > 0)){
      errors.time = 'Hors horaires d\u2019ouverture (07h–23h).';
    }
  }

  const guests = Number(body?.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > 6){
    errors.guests = 'Nombre de personnes invalide (1 à 6).';
  }

  const message = String(body?.message ?? '').trim().slice(0, 500);

  const website = String(body?.website ?? '').trim();
  if (website !== ''){
    errors._honeypot = 'Rejeté.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: { name, phone, date, time, guests, message }
  };
}