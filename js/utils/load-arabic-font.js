/* ------------------------------------------------------------
   LOAD ARABIC FONT — charge Amiri à la demande
   ------------------------------------------------------------ */
const FONT_ID = 'amiri-font';
const FONT_HREF = '/assets/fonts/amiri.css';

export function loadArabicFont(){
  // Déjà chargée ?
  if (document.getElementById(FONT_ID)){
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.id = FONT_ID;
    link.rel = 'stylesheet';
    link.href = FONT_HREF;
    link.onload = () => {
      // Attend que la police soit vraiment parsée
      if (document.fonts && document.fonts.load){
        document.fonts.load('1rem Amiri').then(resolve).catch(resolve);
      } else {
        resolve();
      }
    };
    link.onerror = () => resolve(); // silencieux, on ne bloque pas
    document.head.appendChild(link);
  });
}

export function isArabicFontLoaded(){
  return Boolean(document.getElementById(FONT_ID));
}