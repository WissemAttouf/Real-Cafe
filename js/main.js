/* ============================================================
   Real Cafe — Point d'entrée
   ============================================================ */
import * as preloader      from './features/preloader.js';
import * as sentry         from './core/sentry.js';
import * as theme          from './features/theme.js';
import * as year           from './core/year.js';
import * as header         from './core/header.js';
import * as mobileMenu     from './core/mobile-menu.js';
import * as status         from './core/status.js';
import * as i18n           from './features/i18n.js';
import * as splitText      from './utils/split-text.js';
import * as scrollReveal   from './features/scroll-reveal.js';
import * as parallax       from './features/parallax.js';
import * as scrolly        from './features/scrolly.js';
import * as menuPanel      from './features/menu-panel.js';
import * as roast          from './features/roast.js';
import * as menu           from './features/menu.js';
import * as reservation    from './features/reservation.js';
import * as magnetic       from './features/magnetic.js';
import * as floatReserve   from './features/float-reserve.js';
import * as customCursor   from './features/custom-cursor.js';
import * as heroGrains     from './features/hero-grains.js';
import * as scrollProgress from './features/scroll-progress.js';
import * as stats          from './features/stats.js';
import * as confetti       from './features/confetti.js';
import * as video          from './features/video.js';

/* ------------------------------------------------------------
   LAZY INIT — charge un module quand une section approche
   ------------------------------------------------------------ */
function lazyInit(selector, importFn){
  const el = document.querySelector(selector);
  if (!el) return;

  if (!('IntersectionObserver' in window)){
    importFn().then(m => m.init && m.init());
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        importFn()
          .then(m => m.init && m.init())
          .catch(err => console.warn('[lazy] Erreur de chargement pour ' + selector, err));
        io.disconnect();
      }
    });
  }, {rootMargin: '200px 0px'});
  io.observe(el);
}

/* ------------------------------------------------------------
   INIT — ordre important
   ------------------------------------------------------------ */

// 0. Preloader en premier
preloader.init();

// 1. Sentry — pour capturer les erreurs des autres modules
sentry.init();

// 2. Core
theme.init();
year.init();
header.init();
mobileMenu.init();
status.init();

// 3. i18n avant tout pour __i18nDict
i18n.init();

// 4. Animations d'entrée
splitText.init();
scrollReveal.init();
parallax.init();
scrolly.init();

// 5. Données asynchrones (fire-and-forget)
roast.init();
menu.init();

// 6. Interactions
reservation.init();
menuPanel.init();
confetti.init();
video.init();

// 7. Lazy-load
lazyInit('#carnets', () => import('./features/carnets.js'));
lazyInit('#brew',    () => import('./features/brew-guide.js'));

// 8. Effets visuels
magnetic.init();
floatReserve.init();
customCursor.init();
heroGrains.init();
scrollProgress.init();
stats.init();

// 9. Zellige réactif au scroll
const zelligeObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => e.target.classList.toggle('in-view', e.isIntersecting));
}, {threshold: 0.1});
document.querySelectorAll('.zellige-sep').forEach(el => zelligeObserver.observe(el));

/* ------------------------------------------------------------
   SERVICE WORKER — DÉSACTIVÉ (bug cache mobile)
   ------------------------------------------------------------ */
const DISABLE_SW = true;

if (!DISABLE_SW && 'serviceWorker' in navigator && location.protocol !== 'file:'){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[PWA] Service Worker enregistré', reg.scope))
      .catch(err => console.warn('[PWA] Échec de l\'enregistrement', err));
  });
}