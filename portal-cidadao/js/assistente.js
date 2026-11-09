/* Assistente de navegação com regras locais. */
(function () {
  'use strict';
  var page = document.body.getAttribute('data-page') || 'home';

  var DESTINOS = {
    login: { label: 'Abrir página de login', href: 'login.html' },
    alistamento: { label: 'Abrir alistamento militar', href: 'alistamento.html' },
    passaporte: { label: 'Ver serviço de passaporte', href: 'home.html#mais-acessados' },
    busca: { label: 'Ir para a busca de serviços', href: 'home.html#busca' }
  };

  var SUGESTOES = {
    home: [
      { l: 'Como faço login?', a: 'login' },
      { l: 'Onde pesquiso um serviço?', a: 'busca' },
      { l: 'Quero me alistar no serviço militar', a: 'alistamento' }
    ],
    login: [
      { l: 'Esqueci minha senha', a: 'esqueci' },
      { l: 'Entrar com o rosto', a: 'facial' },
      { l: 'Voltar para o início', a: 'home' }
    ],
    alistamento: [
      { l: 'O que preciso ter em mãos?', a: 'docs' },
      { l: 'Como iniciar o serviço?', a: 'iniciar' },
      { l: 'Falar com a ouvidoria', a: 'ouvidoria' }
    ]
  };

  var ACOES = {
    login: function () { if (page === 'login') return say('Você já está na tela de entrada. Digite CPF e senha no mesmo formulário.', window.PC.highlight('#cpf')); say('Vou te levar para a tela de entrada.'); setTimeout(function () { location.href = 'login.html'; }, 900); },
    busca: function () { var ok = window.PC.highlight('#busca'); if (ok) { var s = document.getElementById('nav-search'); if (s) s.classList.add('open'); say('A busca fica sempre na barra superior. Dica: aperte a tecla "/" para ir direto até ela.'); } },
    alistamento: function () { say('Abrindo o serviço de alistamento militar.'); setTimeout(function () { location.href = 'alistamento.html'; }, 900); },
    esqueci: function () { var b = document.getElementById('btn-esqueci'); if (b) { b.click(); window.PC.highlight('#recover'); say('Abri a recuperação de senha na própria tela, sem você perder o que já digitou.'); } },
    facial: function () { var b = document.getElementById('btn-facial'); if (b) { window.PC.highlight('#btn-facial'); say('Esse é o botão de reconhecimento facial. Toque nele para simular a entrada.'); } },
    home: function () { say('Voltando para o início.'); setTimeout(function () { location.href = 'home.html'; }, 900); },
    docs: function () { window.PC.highlight('#checklist'); say('Marquei na tela a lista do que ter em mãos. Vá marcando conforme separa.'); },
    iniciar: function () { window.PC.highlight('#btn-iniciar'); say('Esse é o botão para iniciar. Se faltar algo na lista, eu aviso antes.'); },
    ouvidoria: function () { window.PC.highlight('#ouvidoria'); say('Aqui estão os canais de ouvidoria: denúncia, reclamação, elogio e sugestão.'); }
  };

  var REGRAS = [
    { k: ['login', 'entrar', 'acessar conta', 'cpf'], a: 'login' },
    { k: ['senha', 'esqueci', 'recuper'], a: 'esqueci' },
    { k: ['rosto', 'facial', 'biometria'], a: 'facial' },
    { k: ['buscar', 'pesquis', 'procur', 'servico'], a: 'busca' },
    { k: ['alist', 'militar', 'exercito'], a: 'alistamento' },
    { k: ['documento', 'preciso ter', 'levar'], a: 'docs' },
    { k: ['iniciar', 'comecar'], a: 'iniciar' },
    { k: ['ouvidoria', 'reclama', 'denuncia', 'sugest', 'elogio'], a: 'ouvidoria' },
    { k: ['viaj', 'passaporte', 'exterior', 'embarq', 'turismo'], a: 'passaporte' },
    { k: ['imposto', 'renda', 'declar'], a: 'busca' },
    { k: ['beneficio', 'aposent', 'inss', 'saude', 'sus'], a: 'busca' },
    { k: ['inicio', 'home', 'voltar'], a: 'home' }
  ];

  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  function localIntent(text) {
    var n = norm(text), hit = null;
    REGRAS.some(function (r) {
      return r.k.some(function (k) {
        if (n.indexOf(k) > -1) { hit = r.a; return true; }
      });
    });
    return hit;
  }

  function destinationLink(destination) {
    var target = DESTINOS[destination];
    if (!target) return null;
    var link = document.createElement('a');
    link.className = 'assist-link'; link.href = target.href; link.textContent = target.label;
    return link;
  }

  function suggest(destination, text) {
    say(text);
    var link = destinationLink(destination);
    if (link) {
      var wrap = document.createElement('div'); wrap.className = 'assist-destination';
      wrap.appendChild(link); body.appendChild(wrap);
    }
  }

  // ---- DOM ----
  var fab = document.createElement('button');
  fab.className = 'fab'; fab.type = 'button'; fab.id = 'assist-fab';
  fab.setAttribute('aria-label', 'Abrir assistente de navegação');
  fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-controls', 'assist');
  fab.innerHTML = '<span aria-hidden="true">💬</span>';

  var card = document.createElement('section');
  card.className = 'assist'; card.id = 'assist';
  card.setAttribute('role', 'dialog'); card.setAttribute('aria-label', 'Assistente de navegação');
  card.innerHTML =
    '<div class="assist-head"><div><strong>Assistente</strong><small>Te ajudo a navegar</small></div>' +
    '<button type="button" id="assist-close" aria-label="Fechar assistente">×</button></div>' +
    '<div class="assist-body" id="assist-body" aria-live="polite"></div>' +
    '<form class="assist-form" id="assist-form"><label class="sr-only" for="assist-q">Pergunte algo</label>' +
    '<input class="input" id="assist-q" placeholder="Ex.: esqueci minha senha" autocomplete="off">' +
    '<button class="btn btn-primary" type="submit">Enviar</button></form>' +
    '<p class="assist-note">O assistente funciona localmente no seu navegador. Não envie dados pessoais.</p>';
  document.body.appendChild(card);
  document.body.appendChild(fab);

  var body = card.querySelector('#assist-body');
  function bubble(text, who) {
    var b = document.createElement('div'); b.className = 'bubble ' + who; b.textContent = text;
    body.appendChild(b); body.scrollTop = body.scrollHeight; return b;
  }
  function say(text) { bubble(text, 'bot'); }
  function chips(items) {
    var w = document.createElement('div'); w.className = 'chips';
    items.forEach(function (s) {
      var c = document.createElement('button'); c.type = 'button'; c.className = 'chip'; c.textContent = s.l;
      c.addEventListener('click', function () { bubble(s.l, 'me'); run(s.a); });
      w.appendChild(c);
    });
    body.appendChild(w);
  }
  function run(a) { setTimeout(function () { ACOES[a] && ACOES[a](); }, 250); }

  var started = false;
  function open() {
    card.classList.add('open'); fab.setAttribute('aria-expanded', 'true');
    fab.setAttribute('aria-label', 'Fechar assistente de navegação');
    if (!started) {
      started = true;
      say('Olá! Posso te levar até um serviço ou mostrar onde fica algo nesta tela. O que você quer fazer?');
      chips(SUGESTOES[page] || SUGESTOES.home);
    }
    card.querySelector('#assist-q').focus();
  }
  function close() {
    card.classList.remove('open'); fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-label', 'Abrir assistente de navegação'); fab.focus();
  }
  fab.addEventListener('click', function () { card.classList.contains('open') ? close() : open(); });
  card.querySelector('#assist-close').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && card.classList.contains('open')) close(); });

  card.querySelector('#assist-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var q = card.querySelector('#assist-q'); var txt = q.value.trim(); if (!txt) return;
    bubble(txt, 'me'); q.value = '';
    var hit = localIntent(txt);
    if (hit === 'passaporte') suggest('passaporte', 'Gostaria de realizar a requisição de um passaporte?');
    else if (hit) run(hit);
    else { say('Não encontrei informações sobre o que você está buscando. Tente uma destas opções:'); chips(SUGESTOES[page] || SUGESTOES.home); }
  });

  // abre automaticamente via ?assistente=1 (usado pelo índice do protótipo)
  if (/[?&]assistente=1/.test(location.search)) open();
})();
