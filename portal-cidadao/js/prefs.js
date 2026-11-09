/* Preferências de acessibilidade (tamanho do texto, cores, leitura, movimento e idioma).
   Carregado no <head> de todas as páginas para aplicar as escolhas antes de a tela aparecer.
   Tudo fica guardado só neste navegador (localStorage). */
(function () {
  'use strict';

  var KEYS = { font: 'pc-font', cb: 'pc-cb', links: 'pc-links', spacing: 'pc-spacing', motion: 'pc-motion', lang: 'pc-lang', hc: 'pc-hc' };
  var DEF = { font: '100', cb: 'none', links: '0', spacing: '0', motion: '0', lang: 'pt', hc: '0' };
  var FONTS = ['100', '115', '130', '150'];
  var CB = ['none', 'protan', 'deutan', 'tritan', 'mono'];
  var LANGS = { pt: 'pt-BR', en: 'en', es: 'es' };

  function get(k) {
    var v = null;
    try { v = localStorage.getItem(KEYS[k]); } catch (e) {}
    if (v === null) return DEF[k];
    if (k === 'font' && FONTS.indexOf(v) < 0) return DEF.font;
    if (k === 'cb' && CB.indexOf(v) < 0) return DEF.cb;
    if (k === 'lang' && !LANGS[v]) return DEF.lang;
    return v;
  }

  function apply() {
    var h = document.documentElement;
    var font = get('font');
    h.style.fontSize = font === '100' ? '' : font + '%';
    CB.forEach(function (c) { if (c !== 'none') h.classList.toggle('cb-' + c, get('cb') === c); });
    h.classList.toggle('links-underline', get('links') === '1');
    h.classList.toggle('text-spacing', get('spacing') === '1');
    h.classList.toggle('reduce-motion', get('motion') === '1');
    h.setAttribute('lang', LANGS[get('lang')]);
    if (document.body) document.body.classList.toggle('hc', get('hc') === '1');
  }

  function set(k, v) {
    try { localStorage.setItem(KEYS[k], v); } catch (e) {}
    apply();
    if (k === 'hc') document.dispatchEvent(new CustomEvent('pc:hc', { detail: v === '1' }));
  }

  function reset() {
    Object.keys(KEYS).forEach(function (k) {
      try { localStorage.removeItem(KEYS[k]); } catch (e) {}
    });
    apply();
    document.dispatchEvent(new CustomEvent('pc:hc', { detail: false }));
  }

  // ---------- Responsividade que acompanha o tamanho do texto ----------
  // Os pontos de quebra do CSS estão em px. Com o texto em 150%, tudo fica 50% maior, então
  // cada "max-width: 1024px" passa a valer como "max-width: 1536px" (igual ao zoom do navegador).
  var original = new WeakMap();   // regra @media -> texto original da condição
  var navForced = false;          // true quando o menu não cabe e precisa virar ☰
  function factor() { return parseFloat(get('font')) / 100 || 1; }

  function mediaRules(cb) {
    for (var i = 0; i < document.styleSheets.length; i++) {
      var rules;
      try { rules = document.styleSheets[i].cssRules; } catch (e) { continue; }
      if (!rules) continue;
      for (var j = 0; j < rules.length; j++) if (rules[j].media && rules[j].cssRules) cb(rules[j]);
    }
  }
  function isNavRule(rule) {
    for (var k = 0; k < rule.cssRules.length; k++) {
      if (/\.menu-toggle/.test(rule.cssRules[k].selectorText || '')) return true;
    }
    return false;
  }
  function rescaleMedia() {
    var f = factor();
    mediaRules(function (rule) {
      var o = original.get(rule);
      if (o === undefined) { o = rule.media.mediaText; original.set(rule, o); }
      if (!/width/.test(o)) return;
      var txt = o.replace(/((?:min|max)-width:\s*)(\d+(?:\.\d+)?)px/g, function (_, p, n) {
        return p + Math.round(n * f) + 'px';
      });
      if (navForced && isNavRule(rule)) txt = 'all';
      if (rule.media.mediaText !== txt) rule.media.mediaText = txt;
    });
  }

  // O menu cabe na linha? Se não couber (texto grande, outro idioma, mais espaçamento), vira ☰.
  function checkNav() {
    var nav = document.querySelector('.site-header .nav');
    var toggle = document.getElementById('menu-toggle');
    navForced = false;
    rescaleMedia();
    if (nav && toggle && getComputedStyle(toggle).display === 'none' && nav.scrollWidth > nav.clientWidth + 2) {
      navForced = true;
      rescaleMedia();
    }
    document.documentElement.classList.toggle('nav-compact', !!(toggle && getComputedStyle(toggle).display !== 'none'));
    document.dispatchEvent(new CustomEvent('pc:layout'));
  }

  // Largura "efetiva" da tela, já descontando o aumento do texto (para o JS usar como o CSS)
  function narrowerThan(px) { return window.innerWidth <= px * factor(); }

  var raf = 0;
  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; checkNav(); });
  }

  apply();
  // outro idioma: esconde a página até a tradução chegar (sem "piscar" em português);
  // se algo falhar, mostra mesmo assim depois de 2,5 s
  if (get('lang') !== 'pt') {
    document.documentElement.classList.add('i18n-pending');
    setTimeout(function () { document.documentElement.classList.remove('i18n-pending'); }, 2500);
  }
  // as folhas de estilo vêm depois deste script: reescala cada uma assim que carregar
  new MutationObserver(function (list) {
    list.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.tagName === 'LINK' && n.rel === 'stylesheet') n.addEventListener('load', rescaleMedia);
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', checkNav);
  window.addEventListener('load', checkNav);
  window.addEventListener('resize', schedule);
  document.addEventListener('pc:lang', schedule);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);

  var applyOnly = apply;
  apply = function () { applyOnly(); if (document.body) checkNav(); };

  window.PCPrefs = { get: get, set: set, reset: reset, apply: apply, narrowerThan: narrowerThan, FONTS: FONTS, CB: CB, LANGS: LANGS };
})();
