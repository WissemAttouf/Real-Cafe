/* ------------------------------------------------------------
   FLOAT RESERVE — pastille flottante
   ------------------------------------------------------------ */
export function init(){
  const el = document.getElementById('floatReserve');
  const hero = document.getElementById('home');
  const resa = document.getElementById('reservation');
  if (!el || !hero) return;

  const update = () => {
    const heroRect = hero.getBoundingClientRect();
    const pastHero = heroRect.bottom < 100;
    let atResa = false;
    if (resa){
      const r = resa.getBoundingClientRect();
      atResa = r.top < window.innerHeight * 0.6 && r.bottom > 0;
    }
    el.classList.toggle('show', pastHero && !atResa);
  };

  update();
  window.addEventListener('scroll', update, {passive:true});
  window.addEventListener('resize', update);
}