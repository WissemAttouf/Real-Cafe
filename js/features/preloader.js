/* ------------------------------------------------------------
   PRELOADER - tasse qui se remplit
   Désactivé temporairement (bug sur mobile)
   ------------------------------------------------------------ */
export function init(){
  const preloader = document.getElementById('preloader');
  if (preloader) preloader.remove();
  document.body.classList.remove('preloading');
}