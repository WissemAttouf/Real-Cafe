/* ------------------------------------------------------------
   CONFETTI — explosion de points ambrés (canvas)
   Déclenché manuellement après un événement réussi.
   ------------------------------------------------------------ */
let canvas = null;
let ctx = null;
let particles = [];
let raf = null;
let reduce = false;

function ensureCanvas(){
  if (canvas) return;

  canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9997;';
  document.body.appendChild(canvas);

  ctx = canvas.getContext('2d');
  resize();

  window.addEventListener('resize', resize);
}

function resize(){
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function makeParticle(x, y){
  const angle = Math.random() * Math.PI * 2;
  const speed = 4 + Math.random() * 8;
  return {
    x: x,
    y: y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 4,  // léger biais vers le haut
    size: 3 + Math.random() * 5,
    rotation: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.3,
    life: 1,
    decay: 0.012 + Math.random() * 0.01,
    color: Math.random() < 0.7 ? '#E4BC72' : '#CE9C49'
  };
}

function loop(){
  if (!ctx || !canvas) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    // Physique
    p.vy += 0.35;              // gravité
    p.vx *= 0.99;              // friction
    p.vy *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.vr;
    p.life -= p.decay;

    if (p.life > 0){
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }
  });

  // Filtre les particules mortes
  particles = particles.filter(p => p.life > 0);

  if (particles.length > 0){
    raf = requestAnimationFrame(loop);
  } else {
    raf = null;
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

export function burst(x, y, count){
  reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  ensureCanvas();

  const n = count || 80;

  for (let i = 0; i < n; i++){
    particles.push(makeParticle(x, y));
  }

  if (!raf){
    raf = requestAnimationFrame(loop);
  }
}

export function init(){
  // Rien à initialiser — tout est paresseux (lazy)
  // On garde cette fonction pour cohérence avec les autres modules
}