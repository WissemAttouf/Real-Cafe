/* ------------------------------------------------------------
   SCROLLYTELLING — frames + dots
   ------------------------------------------------------------ */
export function init(){
  const stops = document.querySelectorAll('.scrolly-stop');
  const frames = document.querySelectorAll('.frame-illustration');
  const dots = document.querySelectorAll('.s-dot');
  if (!stops.length || !frames.length) return;

  const activate = (frameId) => {
    frames.forEach(f => f.classList.toggle('active', f.classList.contains(frameId)));
    dots.forEach(d => {
      const target = document.getElementById(d.dataset.target);
      if (target) d.classList.toggle('active', target.dataset.frame === frameId);
    });
  };

  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      let best = null;
      entries.forEach(e => {
        if (e.isIntersecting){
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
      });
      if (best){
        const frameId = best.target.dataset.frame;
        if (frameId) activate(frameId);
      }
    }, {
      rootMargin: '-35% 0px -35% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1]
    });
    stops.forEach(s => io.observe(s));
  }

  dots.forEach(d => {
    d.addEventListener('click', () => {
      const target = document.getElementById(d.dataset.target);
      if (target) target.scrollIntoView({behavior:'smooth', block:'center'});
    });
  });
}