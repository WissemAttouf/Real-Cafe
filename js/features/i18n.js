/* ------------------------------------------------------------
   I18N — bascule FR / AR
   ------------------------------------------------------------ */
import { loadArabicFont } from '../utils/load-arabic-font.js';
const STORAGE_KEY = 'gac_lang';
const SUPPORTED = ['fr', 'ar'];
const RTL_LANGS = ['ar'];

const translations = {};
let currentLang = 'fr';

async function loadLocale(lang){
  if (translations[lang]) return translations[lang];
  try {
    const res = await fetch('/locales/' + lang + '.json', {cache:'no-cache'});
    if (!res.ok) throw new Error('HTTP ' + res.status);
    translations[lang] = await res.json();
    return translations[lang];
  } catch (e){
    console.warn('[i18n] Impossible de charger', lang, e);
    return null;
  }
}

function get(obj, path){
  return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
}

async function applyLang(lang){
  if (SUPPORTED.indexOf(lang) === -1) lang = 'fr';

  // Charge la police arabe seulement si on passe en AR
  if (lang === 'ar'){
    await loadArabicFont();
  }

  const dict = await loadLocale(lang);
  if (!dict) return;

  currentLang = lang;

  document.documentElement.lang = lang;
  document.documentElement.dir = RTL_LANGS.indexOf(lang) !== -1 ? 'rtl' : 'ltr';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = get(dict, key);
    if (typeof val === 'string') el.textContent = val;
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    const val = get(dict, key);
    if (typeof val === 'string') el.innerHTML = val;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = get(dict, key);
    if (typeof val === 'string') el.setAttribute('placeholder', val);
  });

  const btn = document.getElementById('langToggle');
  if (btn){
    const currentEl = btn.querySelector('.lang-current');
    const otherEl = btn.querySelector('.lang-other');
    if (currentEl) currentEl.textContent = lang === 'fr' ? 'FR' : 'ع';
    if (otherEl) otherEl.textContent = lang === 'fr' ? 'ع' : 'FR';
  }

  window.__i18nDict = window.__i18nDict || {};
  window.__i18nDict[lang] = dict;

  if (typeof window.__refreshStatus === 'function') {
    window.__refreshStatus();
  }

  try { localStorage.setItem(STORAGE_KEY, lang); } catch(e){}
}

export function init(){
  const stored = (() => { try { return localStorage.getItem(STORAGE_KEY); } catch(e){ return null; } })();
  const browserLang = (navigator.language || 'fr').slice(0, 2);
  const initial = SUPPORTED.indexOf(stored) !== -1 ? stored
                : SUPPORTED.indexOf(browserLang) !== -1 ? browserLang
                : 'fr';

  applyLang(initial);

  const btn = document.getElementById('langToggle');
  if (btn){
    btn.addEventListener('click', () => {
      const next = currentLang === 'fr' ? 'ar' : 'fr';
      applyLang(next);
    });
  }
}