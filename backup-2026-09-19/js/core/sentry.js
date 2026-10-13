/* ------------------------------------------------------------
   SENTRY — monitoring d'erreurs en production
   Plan gratuit : 5000 erreurs/mois, pas de PAYG, arrêt auto.
   Chargé depuis le CDN officiel (pas de bundler).
   ------------------------------------------------------------ */
const SENTRY_DSN = 'https://942f54da2ce3e801614882911f0b3ddd@o4512113863360512.ingest.de.sentry.io/4512113870635088';
const SENTRY_CDN = 'https://browser.sentry-cdn.com/9.6.1/bundle.min.js';

export function init(){
  const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

  if (isLocal){
    console.log('[Sentry] Désactivé en local');
    return;
  }

  // Charge le SDK Sentry depuis le CDN puis initialise
  const script = document.createElement('script');
  script.src = SENTRY_CDN;
  script.async = true;

  script.onload = () => {
    if (!window.Sentry){
      console.warn('[Sentry] SDK chargé mais window.Sentry absent');
      return;
    }

    window.Sentry.init({
      dsn: SENTRY_DSN,
      environment: 'production',

      // Pas de tracing, pas de replays → on garde le quota pour les erreurs
      tracesSampleRate: 0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,

      // Filtre anti-extensions navigateur
      denyUrls: [
        /extensions\//i,
        /^chrome:\/\//i,
        /^chrome-extension:\/\//i,
        /^moz-extension:\/\//i,
        /^safari-extension:\/\//i,
        /^safari-web-extension:\/\//i
      ],

      // Filtre les erreurs bruyantes courantes
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        'Non-Error promise rejection captured',
        'AbortError: The user aborted a request',
        'NetworkError when attempting to fetch resource',
        'Load failed',
        'Script error.',
        'CORS error'
      ]
    });

    console.log('[Sentry] Activé en production');
  };

  script.onerror = () => {
    console.warn('[Sentry] Impossible de charger le SDK depuis le CDN');
  };

  document.head.appendChild(script);
}