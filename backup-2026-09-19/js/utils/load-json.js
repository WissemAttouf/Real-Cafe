/* ------------------------------------------------------------
   LOAD JSON — helper fetch
   ------------------------------------------------------------ */
export async function loadJSON(path){
  try {
    const res = await fetch(path, {cache:'no-cache'});
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (err){
    console.warn('[Grain & Cendre] Impossible de charger ' + path + ' :', err);
    return null;
  }
}