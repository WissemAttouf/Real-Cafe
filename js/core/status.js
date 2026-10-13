/* ------------------------------------------------------------
   STATUS — ouvert / fermé selon l'heure locale
   ------------------------------------------------------------ */
export function init(){
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  if (!dot || !text) return;

  function t(key){
    const lang = document.documentElement.lang || 'fr';
    const dict = window.__i18nDict && window.__i18nDict[lang];
    if (!dict) return null;
    return key.split('.').reduce((o, k) => (o ? o[k] : undefined), dict);
  }

  function update(){
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours() + now.getMinutes()/60;
    let openH = 7, closeH = 21;
    if (day === 5 || day === 6) closeH = 22.5;
    if (day === 0) { openH = 8; closeH = 20; }
    const isOpen = hour >= openH && hour < closeH;
    dot.classList.toggle('closed', !isOpen);

    const openLabel = t('hero.status_open') || 'Ouvert maintenant';
    const closedLabel = t('hero.status_closed') || 'Fermé';

    if (isOpen){
      text.textContent = openLabel;
    } else {
      const openHLabel = String(Math.floor(openH)).padStart(2,'0');
      text.textContent = hour < openH
        ? 'Ouvre à ' + openHLabel + 'h00'
        : closedLabel;
    }
  }

  update();
  window.__refreshStatus = update;
}