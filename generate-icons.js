/* ============================================================
   GÉNÉRATION D'ICÔNES — Grain & Cendre
   Convertit un SVG en PNG aux tailles requises pour la PWA.
   Usage : node generate-icons.js
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const SRC = 'assets/icons/favicon.svg';
const OUT_DIR = 'assets/icons';

const TARGETS = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png',         size: 192 },
  { name: 'icon-512.png',         size: 512 }
];

// Icône maskable : même SVG mais avec safe-zone (jasmin réduit à 70%)
// On enveloppe dans un SVG plus grand
const MASKABLE_SIZE = 512;
const MASKABLE_SAFE = 0.7; // 70% de la taille = safe-zone Android

async function main(){
  if (!fs.existsSync(SRC)){
    console.error('❌ ' + SRC + ' introuvable');
    process.exit(1);
  }

  const svgContent = fs.readFileSync(SRC, 'utf8');

  // Icônes standard
  for (const t of TARGETS){
    const resvg = new Resvg(svgContent, { fitTo: { mode: 'width', value: t.size } });
    const png = resvg.render().asPng();
    fs.writeFileSync(path.join(OUT_DIR, t.name), png);
    console.log('✅ ' + t.name + ' (' + t.size + '×' + t.size + ')');
  }

  // Icône maskable : on re-encode le SVG dans un conteneur plus grand
  const inner = svgContent.replace(/<svg[^>]*>/, '').replace('</svg>', '');
  const viewBoxSize = 512;
  const scaledInner = 512 * MASKABLE_SAFE; // 358.4
  const offset = (viewBoxSize - scaledInner) / 2; // 76.8

  const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${viewBoxSize}" height="${viewBoxSize}">
    <rect width="${viewBoxSize}" height="${viewBoxSize}" fill="#17130F"/>
    <g transform="translate(${offset} ${offset}) scale(${MASKABLE_SAFE})">
      ${inner}
    </g>
  </svg>`;

  const resvgM = new Resvg(maskableSvg, { fitTo: { mode: 'width', value: MASKABLE_SIZE } });
  const pngM = resvgM.render().asPng();
  fs.writeFileSync(path.join(OUT_DIR, 'icon-maskable-512.png'), pngM);
  console.log('✅ icon-maskable-512.png (' + MASKABLE_SIZE + '×' + MASKABLE_SIZE + ', safe-zone ' + (MASKABLE_SAFE * 100) + '%)');
}

main().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});