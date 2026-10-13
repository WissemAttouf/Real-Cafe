/* ------------------------------------------------------------
   CUSTOM CURSOR — curseur contextuel
   ------------------------------------------------------------ */
export function init(){
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return;

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.className = 'cursor-label';
  cursor.appendChild(label);
  document.body.appendChild(cursor);
  document.body.classList.add('has-custom-cursor');

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

  let x = 0, y = 0, raf = null, active = null;

  function move(){
    cursor.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
    raf = null;
  }

  window.addEventListener('mousemove', (e) => {
    x = e.clientX; y = e.clientY;
    cursor.classList.add('show');
    if (!raf) raf = requestAnimationFrame(move);
  }, { passive: true });

  document.addEventListener('mouseleave', () => cursor.classList.remove('show'));

  document.addEventListener('mouseover', (e) => {
    const t = matchTarget(e.target);
    if (t === active) return;
    active = t;
    if (t){
      cursor.classList.add('is-cta');
      label.textContent = t.label;
      cursor.classList.toggle('is-label', Boolean(t.label));
    } else {
      cursor.classList.remove('is-cta', 'is-label');
      label.textContent = '';
    }
  }, { passive: true });
}