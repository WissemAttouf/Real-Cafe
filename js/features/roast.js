/* ------------------------------------------------------------
   ROAST — bandeau "En torréfaction cette semaine"
   ------------------------------------------------------------ */
import { loadJSON } from '../utils/load-json.js';

export async function init(){
  const originEl = document.getElementById('roastOrigin');
  const metaEl = document.getElementById('roastMeta');
  if (!originEl) return;

  const data = await loadJSON('/data/roast.json');
  if (!data) return;
  if (data.origin) originEl.textContent = data.origin;
  if (metaEl && data.schedule) metaEl.textContent = data.schedule;
}