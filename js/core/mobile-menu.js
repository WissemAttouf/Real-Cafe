/* ------------------------------------------------------------
   MOBILE MENU — ouverture / fermeture
   ------------------------------------------------------------ */
export function init(){
  const burger = document.getElementById('burgerBtn');
  const panel = document.getElementById('mobilePanel');
  if (!burger || !panel) return;

  burger.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });

  panel.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      panel.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}