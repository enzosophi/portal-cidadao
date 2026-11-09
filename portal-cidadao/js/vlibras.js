/* Integra o widget oficial de tradução para Libras do Governo Federal. */
(function () {
  'use strict';

  var widget = document.createElement('div');
  widget.setAttribute('vw', '');
  widget.className = 'enabled';
  widget.innerHTML = '<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
  document.body.appendChild(widget);

  var script = document.createElement('script');
  script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
  script.onload = function () {
    if (window.VLibras && window.VLibras.Widget) {
      new window.VLibras.Widget('https://vlibras.gov.br/app');
    }
  };
  document.body.appendChild(script);
})();
