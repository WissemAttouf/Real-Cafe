/* ------------------------------------------------------------
   BREW GUIDE — calculateur de dosage
   ------------------------------------------------------------ */
const METHODS = {
  v60:   { ratio: 16, ratioLabel: '1:16', time: '2 min 30', grind: 'Moyenne',
           note: 'Versez en spirale, en trois temps. Laissez s\u2019égoutter complètement avant de servir.' },
  press: { ratio: 12, ratioLabel: '1:12', time: '4 min',    grind: 'Grossière',
           note: 'Cassez la croûte en surface après 4 minutes, puis laissez reposer 30 secondes avant de presser.' },
  cold:  { ratio: 8,  ratioLabel: '1:8',  time: '16 h',     grind: 'Très grossière',
           note: 'Au réfrigérateur, couvert. Filtrez deux fois avant de servir. Se garde 5 jours.' }
};

export function init(){
  const section = document.getElementById('brew');
  if (!section) return;

  let currentMethod = 'v60';

  const buttons = section.querySelectorAll('.brew-method');
  const doseInput = section.querySelector('#brewDose');
  const doseOutput = section.querySelector('#brewDoseValue');
  const waterOut = section.querySelector('#brewWater');
  const ratioOut = section.querySelector('#brewRatio');
  const timeOut = section.querySelector('#brewTime');
  const grindOut = section.querySelector('#brewGrind');
  const noteOut = section.querySelector('#brewNote');

  function update(){
    const dose = Number(doseInput.value);
    const method = METHODS[currentMethod];
    const water = Math.round(dose * method.ratio);

    doseOutput.textContent = dose + ' g';
    waterOut.textContent = water + ' mL';
    ratioOut.textContent = method.ratioLabel;
    timeOut.textContent = method.time;
    grindOut.textContent = method.grind;
    noteOut.textContent = method.note;
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      currentMethod = btn.dataset.method;
      update();
    });
  });

  doseInput.addEventListener('input', update);
  update();
}