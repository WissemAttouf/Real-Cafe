/* ------------------------------------------------------------
   HERO GRAINS — canvas particules dans le hero
   ------------------------------------------------------------ */
export function init(){
  const hero = document.querySelector('.hero');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!hero || reduce || !('IntersectionObserver' in window)) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero-grains';
  canvas.setAttribute('aria-hidden', 'true');
  hero.insertBefore(canvas, hero.firstChild);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const COUNT = 46;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0, height = 0, particles = [], running = false, rafId = null;

  function makeParticle(){
    return {
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.00012,
      vy: -0.00006 - Math.random() * 0.00014,
      o: 0.12 + Math.random() * 0.22
    };
  }

  function resize(){
    const rect = hero.getBoundingClientRect();
    width = rect.width; height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(){
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -0.02){ p.y = 1.02; p.x = Math.random(); }
      if (p.x < -0.02 || p.x > 1.02) p.x = (p.x + 1) % 1;
      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(228,188,114,' + p.o + ')';
      ctx.fill();
    });
    if (running) rafId = requestAnimationFrame(draw);
  }

  function start(){ if (!running){ running = true; rafId = requestAnimationFrame(draw); } }
  function stop(){ running = false; if (rafId) cancelAnimationFrame(rafId); }

  resize();
  particles = Array.from({ length: COUNT }, makeParticle);

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => (e.isIntersecting ? start() : stop()));
  }, { threshold: 0 });
  io.observe(hero);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (hero.getBoundingClientRect().top < window.innerHeight) start();
  });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
}