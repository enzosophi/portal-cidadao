/* Tela de acessibilidade: liga os controles às preferências (js/prefs.js) */
(function () {
  'use strict';
  var P = window.PCPrefs;
  if (!P) return;
  var inputs = document.querySelectorAll('[data-pref]');

  function sync() {
    inputs.forEach(function (i) {
      var v = P.get(i.getAttribute('data-pref'));
      i.checked = i.type === 'radio' ? v === i.value : v === '1';
    });
  }

  inputs.forEach(function (i) {
    i.addEventListener('change', function () {
      var pref = i.getAttribute('data-pref');
      if (pref === 'reader') return; // tratado por js/leitor.js (ele mesmo avisa em voz alta)
      if (pref === 'lang') {
        if (window.PC.setLang) window.PC.setLang(i.value);
      } else {
        P.set(pref, i.type === 'radio' ? i.value : (i.checked ? '1' : '0'));
      }
      window.PC.toast('Preferência salva.');
    });
  });

  document.getElementById('a11y-reset').addEventListener('click', function () {
    P.reset();
    if (window.PC.reader) window.PC.reader.setOn(false, true);
    if (window.PC.setLang) window.PC.setLang('pt');
    sync();
    window.PC.toast('Tudo voltou ao padrão.');
  });

  var demo = document.querySelector('[data-soon-btn]');
  if (demo) demo.addEventListener('click', function () { window.PC.toast('Este botão é só uma prévia.'); });

  document.addEventListener('pc:hc', sync);
  document.addEventListener('pc:lang', sync);
  sync();
})();
