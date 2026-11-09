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
  // Iniciar: se faltar documento, mostra um popup do site (não o confirm do navegador)
  // com cada item que falta e um botão "Já tenho" para marcar ali mesmo.
  function iniciar() {
    var faltando = [];
    springChecks.forEach(function (btn) {
      if (!isItemChecked(btn)) faltando.push(btn);
    });
    if (!faltando.length) { location.href = 'login.html'; return; }

    var restam = faltando.length;
    window.PC.dialog({
      type: 'warning',
      title: 'Faltam documentos',
      message: 'Você ainda não marcou estes itens. Já tem algum deles em mãos?',
      items: faltando.map(function (btn) {
        return {
          text: btn.getAttribute('aria-label'),
          fix: 'Já tenho',
          keepOpen: true,
          onClick: function (li, ctl) {
            if (btn._springCheck && !isItemChecked(btn)) btn._springCheck.toggle();
            upd();
            li.classList.add('done');
            var fix = li.querySelector('.pcd-fix');
            var tag = document.createElement('span');
            tag.className = 'pcd-done-tag';
            tag.textContent = '✓ Marcado';
            fix.replaceWith(tag);
            restam--;
            if (restam === 0) {
              ctl.close('pronto', true);
              window.PC.toast('Tudo pronto! Agora é só iniciar.');
              var desk = document.getElementById('btn-iniciar');
              window.PC.highlight(desk && desk.offsetParent ? '#btn-iniciar' : '#btn-iniciar-m');
            } else {
              var next = ctl.box.querySelector('.pcd-fix') || ctl.box.querySelector('.btn-primary');
              if (next) next.focus();
            }
          }
        };
      }),
      actions: [
        { label: 'Separar documentos', value: 'voltar', primary: true },
        { label: 'Continuar mesmo assim', value: 'continuar' }
      ]
    }).then(function (v) {
      if (v === 'continuar') location.href = 'login.html';
      else if (v === 'voltar') window.PC.highlight('#checklist');
    });
  }

  ['btn-iniciar', 'btn-iniciar-m'].forEach(function (id) {
    var e = document.getElementById(id);
    if (e) e.addEventListener('click', iniciar);
  });

  document.querySelectorAll('[data-ouv]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      window.PC.toast('Este canal é só ilustração neste protótipo.');
    });
  });


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
