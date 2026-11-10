/* Leitor de voz do site: lê em voz alta usando a voz do próprio navegador (Web Speech API).
   - "Ler a página": lê títulos e textos do conteúdo principal, um bloco por vez, destacando o trecho.
   - Ao andar com Tab (ou tocar num texto), lê o item em foco.
   - Lê sozinho os popups de correção e os avisos que aparecem.
   Liga/desliga no botão de alto-falante do topo ou na tela de Acessibilidade.
   Não substitui leitores de tela como NVDA, VoiceOver ou TalkBack: é um apoio para quem não tem um. */
(function () {
  'use strict';
  var P = window.PCPrefs;
  var synth = window.speechSynthesis;
  var supported = !!(synth && window.SpeechSynthesisUtterance);
  var t = function (s) { return (window.PC && window.PC.t) ? window.PC.t(s) : s; };

  var on = false, queue = [], current = null, paused = false, bar = null;

  // ---------- fala ----------
  function langCode() { return document.documentElement.getAttribute('lang') || 'pt-BR'; }
  function pickVoice(lang) {
    var vs = synth.getVoices(), base = lang.slice(0, 2).toLowerCase();
    return vs.filter(function (v) { return v.lang && v.lang.toLowerCase() === lang.toLowerCase(); })[0] ||
           vs.filter(function (v) { return v.lang && v.lang.slice(0, 2).toLowerCase() === base; })[0] || null;
  }
  function rate() { return parseFloat(P ? P.get('rate') : '1') || 1; }

  function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }

  function mark(el) {
    document.querySelectorAll('.pc-reading').forEach(function (x) { x.classList.remove('pc-reading'); });
    if (el && el.classList) el.classList.add('pc-reading');
  }

  function speakNext() {
    if (!queue.length) { current = null; mark(null); updateBar(); return; }
    var item = queue.shift();
    var u = new SpeechSynthesisUtterance(item.text);
    u.lang = langCode();
    var v = pickVoice(u.lang);
    if (v) u.voice = v;
    u.rate = rate();
    u.onstart = function () { mark(item.el); if (item.el && item.scroll) item.el.scrollIntoView({ block: 'center', behavior: 'smooth' }); };
    u.onend = u.onerror = function () { if (current === u) speakNext(); };
    current = u;
    synth.speak(u);
    updateBar();
  }

  // fala uma lista de { text, el }; "interrupt" para o que estava sendo dito
  function say(items, interrupt) {
    if (!supported) return;
    if (interrupt !== false) stop(true);
    items.forEach(function (i) { if (clean(i.text)) queue.push({ text: clean(i.text), el: i.el, scroll: i.scroll }); });
    paused = false;
    if (!current) speakNext();
  }
  function stop(silent) {
    queue = [];
    current = null;
    paused = false;
    if (supported) synth.cancel();
    mark(null);
    if (!silent) updateBar();
  }
  function togglePause() {
    if (!current) return;
    if (paused) { synth.resume(); paused = false; } else { synth.pause(); paused = true; }
    updateBar();
  }

  // ---------- o que ler ----------
  var BLOCKS = 'h1, h2, h3, h4, p, li, dt, dd, label, .svc-title, .svc-desc, .app-name, .app-desc, .perfil-name, .perfil-tagline, .pd-name, .pd-text, .step-title, .opt-name';
  function visible(el) {
    if (el.closest('[aria-hidden="true"], [hidden], .sr-only, .pc-reader-bar, [vw], .assist')) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
  }
  function pageItems() {
    var root = document.querySelector('main') || document.body;
    var list = [];
    root.querySelectorAll(BLOCKS).forEach(function (el) {
      if (!visible(el)) return;
      // evita repetir: se um "pai" já entrou na lista, o filho não entra
      if (list.some(function (x) { return x.el.contains(el); })) return;
      // textContent: lê o texto como foi escrito (não em MAIÚSCULAS do estilo visual)
      var txt = clean(el.textContent);
      if (txt.length < 2) return;
      if (/^H[1-4]$/.test(el.tagName)) txt = t('Título') + ': ' + txt;
      list.push({ text: txt, el: el, scroll: true });
    });
    var h1 = document.querySelector('h1');
    if (h1 && h1.classList.contains('sr-only')) list.unshift({ text: clean(h1.textContent), el: null });
    return list;
  }

  // nome do item em foco, como um leitor de tela diria
  function describe(el) {
    var role = '', name = '';
    var lab = el.getAttribute('aria-label');
    var by = el.getAttribute('aria-labelledby');
    if (lab) name = lab;
    else if (by) name = by.split(/\s+/).map(function (id) { var x = document.getElementById(id); return x ? x.textContent : ''; }).join(' ');
    else if (el.labels && el.labels.length) name = el.labels[0].textContent;
    else name = el.textContent || el.value || el.getAttribute('placeholder') || el.getAttribute('title') || '';
    var tag = el.tagName, type = (el.getAttribute('type') || '').toLowerCase(), r = el.getAttribute('role');
    if (tag === 'A') role = t('link');
    else if (r === 'switch') role = t('interruptor') + ', ' + (el.checked ? t('ligado') : t('desligado'));
    else if (type === 'checkbox' || r === 'checkbox') role = t('caixa de seleção') + ', ' + ((el.checked || el.getAttribute('aria-checked') === 'true') ? t('marcada') : t('não marcada'));
    else if (type === 'radio') role = t('opção') + (el.checked ? ', ' + t('selecionada') : '');
    else if (tag === 'BUTTON' || r === 'button' || r === 'tab') role = t('botão');
    else if (tag === 'INPUT' || tag === 'TEXTAREA') role = t('campo de texto') + (el.value && type !== 'password' ? ', ' + el.value : '');
    else if (tag === 'SELECT') role = t('lista de opções') + ', ' + (el.options[el.selectedIndex] || {}).text;
    var extra = el.getAttribute('aria-expanded') === 'true' ? ', ' + t('aberto') : '';
    var hint = el.getAttribute('aria-describedby');
    var desc = hint ? clean(hint.split(/\s+/).map(function (id) { var x = document.getElementById(id); return x ? x.textContent : ''; }).join(' ')) : '';
    return clean(clean(name).slice(0, 220) + (role ? ', ' + role : '') + extra + (desc ? '. ' + desc : ''));
  }

  // ---------- barra de controle ----------
  function buildBar() {
    bar = document.createElement('div');
    bar.className = 'pc-reader-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Leitor de voz');
    bar.innerHTML =
      '<span class="prb-title"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.4 18.4a9 9 0 0 0 0-12.8"/></svg><span>Leitor de voz</span></span>' +
      '<button type="button" class="prb-btn prb-read">Ler a página</button>' +
      '<button type="button" class="prb-btn prb-pause" aria-label="Pausar leitura">⏸</button>' +
      '<button type="button" class="prb-btn prb-stop" aria-label="Parar leitura">■</button>' +
      '<label class="prb-rate"><span class="sr-only">Velocidade da voz</span><select>' +
      '<option value="0.8">Lenta</option><option value="1">Normal</option><option value="1.25">Rápida</option></select></label>' +
      '<button type="button" class="prb-btn prb-close" aria-label="Desligar leitor de voz">×</button>';
    document.body.appendChild(bar);
    bar.querySelector('.prb-read').addEventListener('click', function () { say(pageItems()); });
    bar.querySelector('.prb-pause').addEventListener('click', togglePause);
    bar.querySelector('.prb-stop').addEventListener('click', function () { stop(); });
    bar.querySelector('.prb-close').addEventListener('click', function () { setOn(false); });
    var sel = bar.querySelector('select');
    sel.value = String(rate());
    if (!sel.value) sel.value = '1';
    sel.addEventListener('change', function () { if (P) P.set('rate', sel.value); say([{ text: t('Velocidade da voz') + ': ' + sel.options[sel.selectedIndex].text }]); });
  }
  function updateBar() {
    if (!bar) return;
    var p = bar.querySelector('.prb-pause');
    p.textContent = paused ? '▶' : '⏸';
    p.setAttribute('aria-label', paused ? 'Continuar leitura' : 'Pausar leitura');
    p.disabled = !current;
    bar.querySelector('.prb-stop').disabled = !current && !queue.length;
  }

  // ---------- ligar / desligar ----------
  function syncToggles() {
    document.querySelectorAll('[data-reader-toggle]').forEach(function (b) {
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.classList.toggle('is-on', on);
    });
    var sw = document.querySelector('[data-pref="reader"]');
    if (sw) sw.checked = on;
  }
  function setOn(v, silent) {
    if (!supported) {
      if (window.PC && window.PC.toast) window.PC.toast('Seu navegador não tem leitura em voz alta.');
      return;
    }
    on = !!v;
    if (P && P.get('reader') !== (on ? '1' : '0')) P.set('reader', on ? '1' : '0');
    document.documentElement.classList.toggle('reader-on', on);
    if (on) {
      if (!bar) buildBar();
      bar.hidden = false;
      if (!silent) say([{ text: t('Leitor de voz ligado. Use Tab para andar pela página, ou o botão Ler a página.') }]);
    } else {
      stop(true);
      if (bar) bar.hidden = true;
      if (!silent) { var u = new SpeechSynthesisUtterance(t('Leitor de voz desligado.')); u.lang = langCode(); u.rate = rate(); synth.speak(u); }
    }
    syncToggles();
  }

  // item em foco (Tab) ou texto tocado
  document.addEventListener('focusin', function (e) {
    if (!on || e.target.closest('.pc-reader-bar') && e.target.tagName === 'SELECT') return;
    var el = e.target;
    if (el === document.body) return;
    say([{ text: describe(el), el: el }]);
  });
  document.addEventListener('click', function (e) {
    if (!on) return;
    var el = e.target.closest(BLOCKS);
    if (!el || e.target.closest('a, button, input, select, label, .pc-reader-bar')) return;
    say([{ text: clean(el.textContent), el: el }]);
  });
  document.addEventListener('keydown', function (e) {
    if (on && e.key === 'Escape' && current && !document.querySelector('.pcd-overlay')) stop();
  });

  // popups de correção e avisos são lidos sozinhos
  var lastToast = '';
  new MutationObserver(function (list) {
    if (!on) return;
    var toastChanged = false;
    list.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.nodeType === 1 && n.classList.contains('pcd-overlay')) {
          var box = n.querySelector('.pcd');
          setTimeout(function () {
            var items = [{ text: clean(box.querySelector('.pcd-title').textContent) }, { text: clean(box.querySelector('.pcd-msg').textContent) }];
            box.querySelectorAll('.pcd-item-text').forEach(function (x) { items.push({ text: clean(x.textContent), el: x.parentNode }); });
            say(items);
          }, 60);
        }
      });
      if (m.target.id === 'toast' || (m.target.parentNode && m.target.parentNode.id === 'toast')) toastChanged = true;
    });
    var toast = document.getElementById('toast');
    if (toastChanged && toast && toast.classList.contains('show')) {
      var txt = clean(toast.textContent);
      if (txt !== lastToast) { lastToast = txt; say([{ text: txt }], false); setTimeout(function () { lastToast = ''; }, 3600); }
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class'] });

  // botões de liga/desliga (topo, login) e interruptor da tela de acessibilidade
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-reader-toggle]');
    if (b) { e.preventDefault(); setOn(!on); }
  });
  document.addEventListener('change', function (e) {
    if (e.target.matches && e.target.matches('[data-pref="reader"]')) setOn(e.target.checked);
  });
  document.addEventListener('pc:lang', function () { if (on) stop(); });
  window.addEventListener('pagehide', function () { if (supported) synth.cancel(); });

  if (!supported) {
    document.querySelectorAll('[data-reader-toggle], [data-pref="reader"]').forEach(function (x) { x.disabled = true; x.setAttribute('title', 'Seu navegador não tem leitura em voz alta.'); });
  }
  if (supported && synth.getVoices().length === 0 && 'onvoiceschanged' in synth) synth.onvoiceschanged = function () {};

  window.PC = window.PC || {};
  window.PC.reader = { setOn: setOn, say: say, stop: stop, isOn: function () { return on; } };

  // continua ligado ao trocar de página (sem falar "ligado" de novo)
  if (P && P.get('reader') === '1') setOn(true, true);
  else syncToggles();
})();
