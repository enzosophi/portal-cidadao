/* Tradução do site: português (original) → inglês e espanhol.
   Os textos em português continuam no HTML. Este script troca cada texto e atributo
   (placeholder, aria-label, dica) pela tradução de js/i18n-dict.js e acompanha o que
   aparece depois na tela (perfis, avisos, assistente) com um MutationObserver.
   Elementos com translate="no" ficam como estão.
   O dicionário (js/i18n-dict.js, ~54 KB) só é baixado quando o idioma não é português. */
(function () {
  'use strict';

  // carregados sob demanda: ver ensureDict()
  function DICT() { return window.PC_I18N || {}; }
  function PATTERNS() { return window.PC_I18N_PATTERNS || []; }
  var dictUrl = (document.currentScript && document.currentScript.src || 'js/i18n.js').replace(/i18n\.js(\?.*)?$/, 'i18n-dict.js');
  var dictWaiting = null;
  function ensureDict(cb) {
    if (window.PC_I18N) { cb(); return; }
    if (dictWaiting) { dictWaiting.push(cb); return; }
    dictWaiting = [cb];
    var s = document.createElement('script');
    s.src = dictUrl;
    s.onload = s.onerror = function () {
      var list = dictWaiting; dictWaiting = null;
      list.forEach(function (f) { f(); });
    };
    document.head.appendChild(s);
  }
  function reveal() { document.documentElement.classList.remove('i18n-pending'); }
  var ATTRS = ['placeholder', 'aria-label', 'data-tooltip', 'title', 'alt'];
  var NAMES = { pt: 'Português', en: 'English', es: 'Español' };
  var SKIP = 'script, style, noscript, textarea, [translate="no"], [vw]';
  var P = window.PCPrefs;
  var lang = P ? P.get('lang') : 'pt';
  var texts = new WeakMap();   // nó de texto -> { pt, out }
  var attrs = new WeakMap();   // elemento -> { atributo: { pt, out } }
  var titlePt = document.title;

  function idx() { return lang === 'en' ? 0 : 1; }
  function clean(s) { return String(s).replace(/\s+/g, ' ').trim(); }

  function lookup(key) {
    var hit = DICT()[key];
    return hit ? hit[idx()] : null;
  }

  // traduz uma frase; devolve o próprio texto se não houver tradução
  function t(pt) {
    if (lang === 'pt' || pt == null) return pt;
    var key = clean(pt);
    if (!key) return pt;
    var out = lookup(key);
    if (!out) {
      var pats = PATTERNS();
      for (var i = 0; i < pats.length; i++) {
        var m = key.match(pats[i][0]);
        if (m) {
          out = pats[i][1 + idx()].replace(/\{(\d)\}/g, function (_, n) { return lookup(m[n]) || m[n]; });
          break;
        }
      }
    }
    if (!out) return pt;
    var lead = String(pt).match(/^\s*/)[0], tail = String(pt).match(/\s*$/)[0];
    return lead + out + tail;
  }

  function skipped(el) { return !el || !!el.closest(SKIP); }

  function doText(node) {
    if (skipped(node.parentElement)) return;
    var cur = node.nodeValue, rec = texts.get(node);
    if (!rec || cur !== rec.out) { rec = { pt: cur }; texts.set(node, rec); }
    rec.out = t(rec.pt);
    if (cur !== rec.out) node.nodeValue = rec.out;
  }

  function doAttr(el, name) {
    if (!el.hasAttribute(name) || skipped(el)) return;
    var all = attrs.get(el);
    if (!all) { all = {}; attrs.set(el, all); }
    var cur = el.getAttribute(name), rec = all[name];
    if (!rec || cur !== rec.out) { rec = all[name] = { pt: cur }; }
    rec.out = t(rec.pt);
    if (cur !== rec.out) el.setAttribute(name, rec.out);
  }

  function walk(root) {
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1 || skipped(root)) return;
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (n.nodeType === 1 && n.matches(SKIP)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n = root;
    do {
      if (n.nodeType === 3) doText(n);
      else ATTRS.forEach(function (a) { doAttr(n, a); });
    } while ((n = tw.nextNode()));
  }

  function syncControls() {
    var code = document.querySelector('.tb-lang-code');
    if (code) code.textContent = lang.toUpperCase();
    var trig = document.querySelector('.tb-lang');
    if (trig) trig.setAttribute('aria-label', (lang === 'pt' ? 'Idioma' : lang === 'en' ? 'Language' : 'Idioma') + ': ' + NAMES[lang]);
    document.querySelectorAll('[data-lang]').forEach(function (a) {
      if (a.getAttribute('data-lang') === lang) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    var sel = document.getElementById('lang-select');
    if (sel) sel.value = lang;
  }

  function setLang(l, silent) {
    if (!NAMES[l]) l = 'pt';
    if (l !== 'pt' && !window.PC_I18N) { ensureDict(function () { setLang(l, silent); }); return; }
    lang = l;
    if (P) P.set('lang', l);
    walk(document.body);
    document.title = t(titlePt);
    syncControls();
    reveal();
    if (!silent) document.dispatchEvent(new CustomEvent('pc:lang', { detail: l }));
  }

  new MutationObserver(function (list) {
    if (lang === 'pt') return;
    list.forEach(function (m) {
      if (m.type === 'childList') m.addedNodes.forEach(walk);
      else if (m.type === 'characterData') doText(m.target);
      else if (m.type === 'attributes') doAttr(m.target, m.attributeName);
    });
  }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });

  var sel = document.getElementById('lang-select');
  if (sel) sel.addEventListener('change', function () { setLang(sel.value); });

  window.PC = window.PC || {};
  window.PC.t = t;
  window.PC.setLang = setLang;
  window.PC.getLang = function () { return lang; };

  if (lang !== 'pt') { var start = lang; lang = 'pt'; setLang(start, true); }
  else { syncControls(); reveal(); }
})();
