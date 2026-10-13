/* ------------------------------------------------------------
   HEADER — état scrollé
   ------------------------------------------------------------ */
export function init(){
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});
}