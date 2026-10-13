/* ------------------------------------------------------------
   THEME — palette jour / nuit selon l'heure locale
   ------------------------------------------------------------ */
export function init(){
  function getTheme(){
    const h = new Date().getHours();
    if (h >= 6 && h < 11) return 'morning';
    if (h >= 11 && h < 18) return 'day';
    if (h >= 18 && h < 22) return 'evening';
    return 'night';
  }

  function apply(){
    const theme = getTheme();
    // Le thème "day" est la palette par défaut — pas besoin d'attribut
    if (theme === 'day'){
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.dataset.theme = theme;
    }
  }

  apply();

  // Rafraîchit toutes les 30 minutes (l'utilisateur peut rester longtemps)
  setInterval(apply, 30 * 60 * 1000);

  // Rafraîchit si l'utilisateur revient sur l'onglet après un moment
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) apply();
  });
}