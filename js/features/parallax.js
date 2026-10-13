/* ------------------------------------------------------------
   PARALLAX — moucharabieh derrière le hero
   ------------------------------------------------------------ */
export function init(){
  const el = document.getElementById('moucharabieh');
  if (!el) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const amplitude = parseFloat(el.dataset.parallax || '15');
  let ticking = false;

  const update = () => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -rect.top / (rect.height || 1)));
    const offset = (progress - 0.5) * 2 * amplitude;
    el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    ticking = false;
  };

  const requestTick = () => {
    if (!ticking){ ticking = true; requestAnimationFrame(update); }
  };

  update();
  window.addEventListener('scroll', requestTick, {passive:true});
  window.addEventListener('resize', requestTick);
}