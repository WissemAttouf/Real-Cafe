/* ------------------------------------------------------------
   SCROLL PROGRESS — barre de progression en haut
   ------------------------------------------------------------ */
export function init(){
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  let ticking = false, idleTimer = null;

  function update(){
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    bar.style.width = (progress * 100).toFixed(2) + '%';
    bar.classList.add('active');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => bar.classList.remove('active'), 600);
    ticking = false;
  }

  function requestTick(){
    if (!ticking){ ticking = true; requestAnimationFrame(update); }
  }

  update();
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);
}