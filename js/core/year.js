/* ------------------------------------------------------------
   YEAR — année dans le footer
   ------------------------------------------------------------ */
export function init(){
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}