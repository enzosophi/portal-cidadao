/* Tela de serviço — checklist com SpringCheck, progresso dinâmico, acordeão e validação com prevenção de erro */
(function () {
  'use strict';

  var springChecks = document.querySelectorAll('#checklist .spring-check');
  var cards = document.querySelectorAll('#checklist .checklist-card');
  var bar = document.getElementById('bar'), txt = document.getElementById('prog-txt');

  function isItemChecked(el) {
    if (!el) return false;
    if (el.matches('.spring-check')) return el.getAttribute('aria-checked') === 'true';
    if (el.matches('input[type="checkbox"]')) return el.checked;
    return false;
  }

  function upd() {
    var n = 0;
    springChecks.forEach(function (btn, idx) {
      var on = isItemChecked(btn);
      if (on) n++;
      if (cards[idx]) {
        cards[idx].classList.toggle('is-checked', on);
      }
    });

    var total = springChecks.length || 4;
    var pct = (n / total * 100);
    if (bar) bar.style.width = pct + '%';

    if (txt) {
      if (n === total) {
        txt.textContent = 'Tudo pronto para iniciar';
        txt.style.color = 'var(--ok)';
      } else {
        txt.textContent = n + ' de ' + total + ' separados';
        txt.style.color = 'var(--muted)';
      }
    }
  }

  springChecks.forEach(function (btn) {
    btn.addEventListener('spring-change', upd);
    btn.addEventListener('click', function () { setTimeout(upd, 10); });
  });

  // Clicking on card triggers the SpringCheck
  cards.forEach(function (card, idx) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('.spring-check')) return;
      var btn = springChecks[idx];
      if (btn && btn._springCheck) {
        btn._springCheck.toggle();
        upd();
      }
    });
  });

  // Initial update
  upd();

  // Acordeão (um aberto por vez)
  var btns = document.querySelectorAll('.acc > button');
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      btns.forEach(function (x) {
        x.setAttribute('aria-expanded', 'false');
        var p = document.getElementById(x.getAttribute('aria-controls'));
        if (p) p.classList.remove('open');
      });
      if (!open) {
        b.setAttribute('aria-expanded', 'true');
        var p = document.getElementById(b.getAttribute('aria-controls'));
        if (p) p.classList.add('open');
      }
    });
  });

  // Iniciar: avisa se faltar item, mas deixa continuar (usuário no controle)
  function iniciar() {
    var faltam = 0;
    springChecks.forEach(function (btn) {
      if (!isItemChecked(btn)) faltam++;
    });

    if (faltam && !confirm('Ainda faltam ' + faltam + ' item(ns) na lista de documentos. Deseja continuar mesmo assim?')) {
      window.PC.highlight('#checklist');
      return;
    }
    location.href = 'login.html';
  }

  ['btn-iniciar', 'btn-iniciar-m'].forEach(function (id) {
    var e = document.getElementById(id);
    if (e) e.addEventListener('click', iniciar);
  });

  document.querySelectorAll('[data-ouv]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      window.PC.toast(a.getAttribute('data-ouv') + ': canal ilustrativo neste protótipo.');
    });
  });

  // "Você está em" no celular: mostra o fim do caminho (a página atual)
  var crumbs = document.getElementById('crumbs-list');
  if (crumbs) crumbs.scrollLeft = crumbs.scrollWidth;

  // "Nesta página": destaca a seção que está sendo lida
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc a[href^="#"]'));
  var tocSections = tocLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function marcarSecao() {
    var linha = 140, atual = 0;
    tocSections.forEach(function (sec, i) {
      if (sec && sec.getBoundingClientRect().top <= linha) atual = i;
    });
    // chegou ao fim da página: a última seção é a atual
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) atual = tocSections.length - 1;
    tocLinks.forEach(function (a, i) {
      if (i === atual) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }
  if (tocLinks.length) {
    marcarSecao();
    window.addEventListener('scroll', marcarSecao, { passive: true });
    window.addEventListener('resize', marcarSecao);
  }

  document.querySelectorAll('[data-fb]').forEach(function (b) {
    b.addEventListener('click', function () {
      window.PC.toast('Obrigado pelo seu retorno!');
    });
  });
})();
