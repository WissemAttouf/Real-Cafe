/* ------------------------------------------------------------
   RESERVATION - formulaire avec creneaux dynamiques
   ------------------------------------------------------------ */
export function init(){
  const form = document.getElementById('resaForm');
  const confirmBox = document.getElementById('confirmBox');
  const confirmText = document.getElementById('confirmText');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalLabel = submitBtn ? submitBtn.textContent : '';
  const dateInput = form.querySelector('#f-date');
  const timeInput = form.querySelector('#f-time');
  const timeWrap = timeInput ? timeInput.parentElement : null;

  // Remplace l'input time par un select de creneaux
  let timeSelect = null;
  if (timeWrap && timeInput){
    timeSelect = document.createElement('select');
    timeSelect.id = 'f-time';
    timeSelect.name = 'time';
    timeSelect.disabled = true;
    timeSelect.innerHTML = '<option value="">Choisissez d\'abord une date</option>';
    timeInput.replaceWith(timeSelect);
  }

  // ----------------------------------------------------------
  // Chargement des creneaux
  // ----------------------------------------------------------
  async function loadSlots(dateStr){
    if (!dateStr){
      timeSelect.disabled = true;
      timeSelect.innerHTML = '<option value="">Choisissez d\'abord une date</option>';
      return;
    }

    timeSelect.disabled = true;
    timeSelect.innerHTML = '<option value="">Chargement...</option>';

    try {
      const res = await fetch('/api/availability?date=' + encodeURIComponent(dateStr));
      const data = await res.json();

      if (!res.ok || !data.slots){
        timeSelect.innerHTML = '<option value="">Erreur de chargement</option>';
        return;
      }

      if (!data.slots.length){
        timeSelect.innerHTML = '<option value="">Aucun creneau disponible</option>';
        return;
      }

      timeSelect.innerHTML = '<option value="">Choisissez une heure</option>';
      data.slots.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.time;
        opt.textContent = s.available
          ? s.time + ' - ' + s.remaining + ' place' + (s.remaining > 1 ? 's' : '')
          : s.time + ' - complet';
        if (!s.available) opt.disabled = true;
        timeSelect.appendChild(opt);
      });
      timeSelect.disabled = false;
    } catch (err){
      console.error(err);
      timeSelect.innerHTML = '<option value="">Erreur reseau</option>';
    }
  }

  if (dateInput){
    const today = new Date().toISOString().slice(0, 10);
    dateInput.min = today;

    dateInput.addEventListener('change', () => loadSlots(dateInput.value));
  }

  // ----------------------------------------------------------
  // Soumission
  // ----------------------------------------------------------
  function setError(field, msg){
    const el = form.querySelector('[data-err="' + field + '"]');
    if (el) el.textContent = msg || '';
  }

  function clearErrors(){
    ['name','phone','date','time'].forEach(f => setError(f, ''));
  }

  function setLoading(loading){
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? 'Envoi en cours...' : originalLabel;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const payload = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      date: form.date.value,
      time: form.time.value,
      guests: Number(form.guests.value),
      message: form.message.value.trim(),
      website: form.website ? form.website.value : ''
    };

    let valid = true;
    if (!payload.name){ setError('name', 'Merci d\'indiquer votre nom.'); valid = false; }
    if (!payload.phone || payload.phone.replace(/\D/g,'').length < 8){
      setError('phone', 'Numero de telephone invalide.'); valid = false;
    }
    if (!payload.date){ setError('date', 'Choisissez une date.'); valid = false; }
    if (!payload.time){ setError('time', 'Choisissez un creneau.'); valid = false; }
    if (!valid) return;

    setLoading(true);

    try {
      const res = await fetch('/api/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok){
        if (data.fields){
          Object.entries(data.fields).forEach(([field, msg]) => setError(field, msg));
        }
        if (res.status === 429){
          setError('phone', data.error || 'Trop de demandes. Merci de reessayer plus tard.');
        }
        if (res.status === 409){
          loadSlots(payload.date);
        }
        setLoading(false);
        return;
      }

      // Confettis depuis le bouton
      try {
        const confetti = await import('./confetti.js');
        const btnRect = submitBtn.getBoundingClientRect();
        confetti.burst(
          btnRect.left + btnRect.width / 2,
          btnRect.top + btnRect.height / 2,
          90
        );
      } catch(e){
        console.warn('[confetti] Erreur:', e);
      }

      const dateObj = new Date(payload.date + 'T' + payload.time);
      const dateStr = dateObj.toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long'
      });

      confirmText.textContent =
        payload.name + ', votre table pour ' + payload.guests + ' personne' + (payload.guests > 1 ? 's' : '') +
        ' est notee pour le ' + dateStr + ' a ' + payload.time + '. ' +
        'Nous vous appellerons au ' + payload.phone + ' pour confirmer.';

      form.style.display = 'none';
      confirmBox.classList.add('show');
    } catch (err){
      console.error(err);
      setError('phone', 'Erreur reseau. Merci de nous appeler directement.');
    } finally {
      setLoading(false);
    }
  });

  const resetBtn = document.getElementById('resetForm');
  if (resetBtn) resetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    form.reset();
    form.style.display = 'grid';
    confirmBox.classList.remove('show');
    clearErrors();
    if (timeSelect){
      timeSelect.disabled = true;
      timeSelect.innerHTML = '<option value="">Choisissez d\'abord une date</option>';
    }
  });
}