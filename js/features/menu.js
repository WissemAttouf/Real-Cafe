/* ------------------------------------------------------------
   MENU — charge menu.json et construit la grille
   ------------------------------------------------------------ */
import { loadJSON } from '../utils/load-json.js';

function buildMenuItem(item, isButton){
  if (isButton){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'menu-item';
    btn.dataset.name = item.name;
    btn.dataset.price = item.price;
    btn.dataset.origin = item.origin || '';
    btn.dataset.altitude = item.altitude || '';
    btn.dataset.notes = (item.notes || []).join(',');
    btn.dataset.desc = item.desc || '';
    btn.innerHTML = `
      <span class="name">${item.name}${item.sub ? ` <span class="desc">${item.sub}</span>` : ''}</span>
      <span class="fill"></span>
      <span class="price">${item.priceDisplay || item.price}</span>
      <span class="hint">Voir l'origine →</span>
    `;
    return btn;
  } else {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `
      <span class="name">${item.name}${item.sub ? ` <span class="desc">${item.sub}</span>` : ''}</span>
      <span class="fill"></span>
      <span class="price">${item.priceDisplay || item.price}</span>
    `;
    return div;
  }
}

export async function init(){
  const grid = document.getElementById('menuGrid');
  if (!grid) return;

  const data = await loadJSON('/data/menu.json');
  if (!data || !data.categories) return;

  grid.innerHTML = '';
  data.categories.forEach(cat => {
    const col = document.createElement('div');
    col.className = 'menu-col';
    const h3 = document.createElement('h3');
    h3.textContent = cat.title;
    col.appendChild(h3);
    cat.items.forEach(item => {
      col.appendChild(buildMenuItem(item, !!cat.interactive));
    });
    grid.appendChild(col);
  });
}