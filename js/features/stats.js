/* ------------------------------------------------------------
   STATS — compteurs animés au scroll
   ------------------------------------------------------------ */
export function init(){
  const stats = document.getElementById('stats');
  if (!stats) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const numbers = stats.querySelectorAll('.stat-number');

  // Fonction qui anime un compteur de 0 à target
  function animate(el, target){
    const duration = 1500;
    const start = performance.now();

    function tick(now){
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      // easeOutQuart pour un rendu fluide
      const eased = 1 - Math.pow(1 - progress, 4);
      const value = Math.round(target * eased);
      el.textContent = value;

      if (progress < 1){
        requestAnimationFrame(tick);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(tick);
  }

  // Si l'utilisateur préfère les animations réduites → valeurs finales immédiates
  if (reduce){
    numbers.forEach(el => {
      el.textContent = el.dataset.count;
    });
    return;
  }

  // IntersectionObserver pour déclencher quand la section entre
 if ('IntersectionObserver' in window){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        numbers.forEach(el => {
          const target = parseInt(el.dataset.count, 10);
          if (!isNaN(target)) animate(el, target);
        });
        io.disconnect();
      }
    });
  }, {threshold: 0.1});
  io.observe(stats);

  // Sécurité : si après 3 secondes rien ne s'est passé, on anime
  setTimeout(() => {
    const first = numbers[0];
    if (first && first.textContent === '0'){
      numbers.forEach(el => {
        const target = parseInt(el.dataset.count, 10);
        if (!isNaN(target)) animate(el, target);
      });
      io.disconnect();
    }
  }, 3000);
} else {
  numbers.forEach(el => {
    el.textContent = el.dataset.count;
  });
}