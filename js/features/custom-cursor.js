/* ------------------------------------------------------------
   CUSTOM CURSOR — curseur contextuel + halo ambré
   ------------------------------------------------------------ */
export function init(){
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return;

  // ----- Curseur point (existant) -----
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.className = 'cursor-label';
  cursor.appendChild(label);
  document.body.appendChild(cursor);
  document.body.classList.add('has-custom-cursor');

  // ----- Halo ambré (nouveau) -----
  const halo = document.createElement('div');
  halo.className = 'cursor-halo';
  halo.setAttribute('aria-hidden', 'true');
  document.body.appendChild(halo);

  // Cibles contextuelles (label + intensification)
  const TARGETS = [
    { selector: '.btn-primary, .btn-outline, .nav-cta, #floatReserve', label: '' },
    { selector: 'button.menu-item, .menu-item[data-desc]', label: 'Goûter' },
    { selector: '.g-tile', label: 'Voir' }
  ];

  function matchTarget(el){
    for (const t of TARGETS){
      if (el.closest && el.closest(t.selector)) return t;
    }
    return null;
  }

  let x = 0, y = 0;           // position cible (souris)
  let haloX = 0, haloY = 0;   // position du halo (avec traîne)
  let raf = null;
  let active = null;
  let hasMoved = false;

  function move(){
    // Le curseur suit la souris directement
    cursor.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';

    // Le halo suit avec un effet de traîne (lerp)
    haloX += (x - haloX) * 0.18;
    haloY += (y - haloY) * 0.18;
    halo.style.transform = 'translate3d(' + haloX + 'px, ' + haloY + 'px, 0)';

    // Continue à animer tant que le halo n'est pas revenu
    if (Math.abs(x - haloX) > 0.5 || Math.abs(y - haloY) > 0.5 || hasMoved){
      raf = requestAnimationFrame(move);
    } else {
      raf = null;
    }
  }

  window.addEventListener('mousemove', (e) => {
    x = e.clientX; y = e.clientY;
    hasMoved = true;

    cursor.classList.add('show');
    halo.classList.add('show');

    if (!raf) raf = requestAnimationFrame(move);
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    cursor.classList.remove('show');
    halo.classList.remove('show');
  });

  document.addEventListener('mouseover', (e) => {
    const t = matchTarget(e.target);
    if (t === active) return;
    active = t;
    if (t){
      cursor.classList.add('is-cta');
      halo.classList.add('is-cta');
      label.textContent = t.label;
      cursor.classList.toggle('is-label', Boolean(t.label));
    } else {
      cursor.classList.remove('is-cta', 'is-label');
      halo.classList.remove('is-cta');
      label.textContent = '';
    }
  }, { passive: true });
}