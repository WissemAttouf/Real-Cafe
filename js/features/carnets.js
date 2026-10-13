/* ------------------------------------------------------------
   CARNETS — journal éditorial
   ------------------------------------------------------------ */
import { loadJSON } from '../utils/load-json.js';

const THEME_CLASSES = {
  warm: 'carnet-thumb-warm',
  cool: 'carnet-thumb-cool',
  green: 'carnet-thumb-green'
};

function formatDate(iso){
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function escapeHtml(str){
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export async function init(){
  const grid = document.getElementById('carnetsGrid');
  if (!grid) return;

  const data = await loadJSON('/data/carnets.json');
  if (!data || !data.carnets) return;

  grid.innerHTML = '';

  data.carnets.forEach(c => {
    const themeClass = THEME_CLASSES[c.theme] || 'carnet-thumb-cool';
    const a = document.createElement('a');
    a.className = 'carnet-card';
    a.href = '/carnets/' + encodeURIComponent(c.slug) + '.html';
    a.innerHTML = `
      <div class="carnet-thumb ${themeClass}" aria-hidden="true"></div>
      <div class="carnet-body">
        <div class="carnet-meta">
          <span>${escapeHtml(c.category)}</span>
          <span class="dot"></span>
          <span>${formatDate(c.date)}</span>
        </div>
        <h3 class="carnet-title">${escapeHtml(c.title)}</h3>
        <p class="carnet-excerpt">${escapeHtml(c.excerpt)}</p>
        <span class="carnet-cta">Lire la suite →</span>
      </div>
    `;
    grid.appendChild(a);
  });
}