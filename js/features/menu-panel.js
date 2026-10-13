/* ------------------------------------------------------------
   MENU PANEL — panneau quick-view du menu
   ------------------------------------------------------------ */
let lastFocused = null;

function escapeHtml(str){
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function openPanel(btn){
  const panel = document.getElementById('menuPanel');
  const backdrop = document.getElementById('menuBackdrop');
  const closeBtn = document.getElementById('panelClose');
  const elPrice = document.getElementById('panelPrice');
  const elName = document.getElementById('panelName');
  const elMeta = document.getElementById('panelMeta');
  const elNotes = document.getElementById('panelNotes');
  const elDesc = document.getElementById('panelDesc');
  if (!panel) return;

  const d = btn.dataset;
  elPrice.textContent = d.price || '';
  elName.textContent = d.name || '';
  elNotes.innerHTML = '';
  elMeta.innerHTML = '';

  if (d.origin){
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<span>Origine</span><span>${escapeHtml(d.origin)}</span>`;
    elMeta.appendChild(row);
  }
  if (d.altitude){
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<span>Altitude</span><span>${escapeHtml(d.altitude)}</span>`;
    elMeta.appendChild(row);
  }
  if (d.notes){
    d.notes.split(',').map(s => s.trim()).filter(Boolean).forEach(n => {
      const span = document.createElement('span');
      span.textContent = n;
      elNotes.appendChild(span);
    });
  }
  elDesc.textContent = d.desc || '';

  lastFocused = btn;
  panel.classList.add('open');
  backdrop.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => closeBtn && closeBtn.focus(), 50);
}

function closePanel(){
  const panel = document.getElementById('menuPanel');
  const backdrop = document.getElementById('menuBackdrop');
  if (!panel) return;
  panel.classList.remove('open');
  backdrop.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocused) lastFocused.focus();
}

export function init(){
  const panel = document.getElementById('menuPanel');
  const backdrop = document.getElementById('menuBackdrop');
  const closeBtn = document.getElementById('panelClose');
  if (!panel) return;

  // Délégation : marche même pour les items injectés dynamiquement
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button.menu-item');
    if (btn) openPanel(btn);
  });

  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  if (backdrop) backdrop.addEventListener('click', closePanel);

  document.addEventListener('keydown', (e) => {
    if (!panel.classList.contains('open')) return;
    if (e.key === 'Escape'){ e.preventDefault(); closePanel(); return; }
    if (e.key === 'Tab'){
      const focusables = panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });
}