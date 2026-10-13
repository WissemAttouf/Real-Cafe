/* ------------------------------------------------------------
   SCROLL REVEAL — apparition au scroll
   ------------------------------------------------------------ */
export function init(){
  const els = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)){
    els.forEach(el => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, {threshold: 0.15});

  els.forEach(el => io.observe(el));
  // ----------------------------------------------------------
  // GALERIE — chargement des images avec fallback dégradé
  // ----------------------------------------------------------
  document.querySelectorAll('.g-tile .g-img').forEach(img => {
    const markLoaded = () => img.classList.add('loaded');
    const markFailed = () => {
      img.remove();
    };

    if (img.complete){
      if (img.naturalWidth > 0) markLoaded();
      else markFailed();
    } else {
      img.addEventListener('load', markLoaded);
      img.addEventListener('error', markFailed);
    }
  });
}