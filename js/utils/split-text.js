/* ------------------------------------------------------------
   SPLIT TEXT — animation mot par mot au scroll
   ------------------------------------------------------------ */
export function init(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  document.querySelectorAll('[data-split]').forEach(el => {
    const text = el.textContent.trim();
    const words = text.split(/\s+/);

    el.innerHTML = '';
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      span.style.transitionDelay = (i * 0.15) + 's';
      el.appendChild(span);
    });

    if ('IntersectionObserver' in window){
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting){
            el.classList.add('in');
            io.unobserve(el);
          }
        });
      }, {threshold: 0.35});
      io.observe(el);
    } else {
      el.classList.add('in');
    }
  });
}