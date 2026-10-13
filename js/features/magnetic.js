/* ------------------------------------------------------------
   MAGNETIC — boutons magnétiques
   ------------------------------------------------------------ */
export function init(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const targets = document.querySelectorAll('.btn-primary, .nav-cta, .btn-outline');
  if (!targets.length) return;

  const STRENGTH = 0.3;
  const RADIUS = 90;

  targets.forEach(btn => {
    btn.classList.add('magnetic');

    const onMove = (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < RADIUS){
        const falloff = 1 - dist / RADIUS;
        btn.style.transform = 'translate3d(' + (dx * STRENGTH * falloff) + 'px, ' + (dy * STRENGTH * falloff) + 'px, 0)';
      } else {
        btn.style.transform = '';
      }
    };

    const onLeave = () => { btn.style.transform = ''; };

    document.addEventListener('mousemove', onMove, {passive:true});
    btn.addEventListener('mouseleave', onLeave);
  });
  // ----------------------------------------------------------
  // ANIMATION VERSEMENT — sur le CTA principal
  // ----------------------------------------------------------
  document.querySelectorAll('a.btn-primary[href^="#"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (btn.classList.contains('pouring')) return;
      const href = btn.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      btn.classList.add('pouring');

      setTimeout(() => {
        target.scrollIntoView({ behavior:'smooth', block:'start' });
        setTimeout(() => btn.classList.remove('pouring'), 600);
      }, 350);
    });
  });
}