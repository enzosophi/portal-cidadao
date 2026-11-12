/* Login unificado — protótipo: valida só a forma, não envia nem guarda nada */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var cpf = $('cpf'), senha = $('senha'), form = $('form-login');

  function cpfValido(v) {
    v = v.replace(/\D/g, '');
    if (v.length !== 11 || /^(\d)\1+$/.test(v)) return false;
    for (var t = 9; t < 11; t++) {
      var s = 0;
      for (var i = 0; i < t; i++) s += +v[i] * (t + 1 - i);
      var d = ((s * 10) % 11) % 10;
      if (d !== +v[t]) return false;
    }
    return true;
  }
  function mask(v) {
    v = v.replace(/\D/g, '').slice(0, 11);
    return v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  function setState(input, msgEl, ok, text) {
    input.classList.toggle('invalid', ok === false);
    input.classList.toggle('valid', ok === true);
    input.setAttribute('aria-invalid', ok === false);
    msgEl.textContent = text || '';
    msgEl.className = 'msg' + (ok === false ? ' err' : '');
  }
  function checkCpf(final) {
    var d = cpf.value.replace(/\D/g, '');
    if (!d.length) return final ? (setState(cpf, $('cpf-msg'), false, 'Informe seu CPF.'), false) : (setState(cpf, $('cpf-msg'), null, ''), false);
    if (d.length < 11) return final ? (setState(cpf, $('cpf-msg'), false, 'O CPF tem 11 números. Faltam ' + (11 - d.length) + '.'), false) : false;
    if (!cpfValido(cpf.value)) { setState(cpf, $('cpf-msg'), false, 'CPF inválido. Confira os números.'); return false; }
    setState(cpf, $('cpf-msg'), true, '✓ CPF válido'); return true;
  }
  // o que está errado no CPF, em linguagem simples (para o popup de correção)
  function cpfProblem() {
    var d = cpf.value.replace(/\D/g, '');
    if (!d.length) return 'Você não digitou o CPF.';
    if (d.length < 11) return 'O CPF tem 11 números. Você digitou ' + d.length + '.';
    if (!cpfValido(cpf.value)) return 'Os números do CPF não conferem. Veja se algum dígito foi trocado.';
    return null;
  }
  function focusCpf() { cpf.focus(); cpf.select(); }

  cpf.addEventListener('input', function () {
    var raw = cpf.value;
    cpf.value = mask(raw);
    // letras ou símbolos: avisa na hora, sem esperar o envio
    if (/[^\d.\-\s]/.test(raw)) { setState(cpf, $('cpf-msg'), null, 'Use só números. Os pontos e o traço aparecem sozinhos.'); return; }
    checkCpf(false);
  });
  cpf.addEventListener('blur', function () { if (cpf.value) checkCpf(true); });

  // senha: mostrar/ocultar + aviso de Caps Lock (prevenção de erro)
  $('toggle-senha').addEventListener('click', function () {
    var show = senha.type === 'password';
    senha.type = show ? 'text' : 'password';
    this.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha');
    this.setAttribute('aria-pressed', show);
    this.classList.toggle('is-on', show);
  });
  function caps(e) {
    if (e.getModifierState && e.getModifierState('CapsLock')) { $('senha-msg').textContent = '⚠ Caps Lock está ligado.'; $('senha-msg').className = 'msg warn'; }
    else if ($('senha-msg').classList.contains('warn')) { $('senha-msg').textContent = ''; $('senha-msg').className = 'msg'; }
  }
  senha.addEventListener('keyup', caps); senha.addEventListener('keydown', caps);
  senha.addEventListener('input', function () { if (senha.value) setState(senha, $('senha-msg'), null, ''); });

  // =========================================================================
  // Recuperação de senha na mesma tela, com o andamento sempre visível.
  // A pesquisa do grupo mostrou que a maior queixa era abrir várias solicitações
  // sem saber o status: aqui cada etapa, o número do pedido e o status aparecem
  // o tempo todo, e cada erro diz o que fazer em seguida.
  // =========================================================================
  var rec = $('recover'), recBtn = $('btn-esqueci');
  var CODIGO_TESTE = '123456', TENTATIVAS = 3, ESPERA_REENVIO = 30;
  var recStep = 1, tentativas = TENTATIVAS, reenvioTimer = null;
  var stepsLi = rec.querySelectorAll('#rec-steps li');
  var panels = rec.querySelectorAll('.rec-panel');

  var STATUS = {
    1: 'Etapa 1 de 3: confirme seu CPF acima e escolha onde receber o código.',
    2: 'Etapa 2 de 3: código enviado. Digite os 6 números que você recebeu.',
    3: 'Etapa 3 de 3: código confirmado. Agora crie sua nova senha.',
    4: 'Pronto! Sua senha foi alterada.'
  };
  var BADGE = { 2: 'Aguardando código', 3: 'Código confirmado', 4: 'Concluído' };

  function irPara(step, focar) {
    recStep = step;
    panels.forEach(function (p) { p.hidden = +p.getAttribute('data-panel') !== step; });
    stepsLi.forEach(function (li, i) {
      var n = i + 1, feito = n < step, atual = n === step;
      li.classList.toggle('is-done', feito);
      li.classList.toggle('is-current', atual);
      if (atual) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      li.querySelector('.rec-step-state').textContent = feito ? ' (concluída)' : '';
    });
    $('rec-status').textContent = STATUS[step];
    $('rec-status').classList.toggle('is-done', step === 4);
    var proto = $('rec-protocol');
    proto.hidden = step === 1;
    if (BADGE[step]) $('rec-badge').textContent = BADGE[step];
    proto.classList.toggle('is-done', step === 4);
    if (focar) {
      var alvo = { 1: 'input[name="rec-canal"]:checked', 2: '#rec-code', 3: '#rec-pass', 4: '#btn-voltar-login' }[step];
      var el = rec.querySelector(alvo);
      if (el) el.focus();
    }
  }

  function reiniciarRecuperacao() {
    clearInterval(reenvioTimer);
    tentativas = TENTATIVAS;
    ['rec-code', 'rec-pass', 'rec-pass2'].forEach(function (id) { $(id).value = ''; $(id).classList.remove('invalid', 'valid'); });
    ['recover-msg', 'rec-code-msg', 'rec-pass2-msg'].forEach(function (id) { $(id).textContent = ''; $(id).className = 'msg'; });
    atualizarRegras();
    irPara(1);
  }

  recBtn.addEventListener('click', function () {
    var open = rec.classList.toggle('open');
    recBtn.setAttribute('aria-expanded', open);
  });
  function openRecover() {
    if (!rec.classList.contains('open')) recBtn.click();
    window.PC.highlight('#recover');
  }

  // Etapa 1 → 2: enviar o código
  function canal() { return rec.querySelector('input[name="rec-canal"]:checked').value; }
  function iniciarReenvio() {
    var b = $('btn-reenviar'), falta = ESPERA_REENVIO;
    clearInterval(reenvioTimer);
    b.disabled = true;
    b.textContent = 'Reenviar código em ' + falta + ' s';
    reenvioTimer = setInterval(function () {
      falta--;
      if (falta <= 0) { clearInterval(reenvioTimer); b.disabled = false; b.textContent = 'Reenviar código'; return; }
      b.textContent = 'Reenviar código em ' + falta + ' s';
    }, 1000);
  }
  function enviarCodigo() {
    tentativas = TENTATIVAS;
    $('rec-code').value = '';
    $('rec-code').classList.remove('invalid');
    $('rec-code').removeAttribute('aria-invalid');
    $('btn-confirmar-codigo').disabled = false;
    $('rec-sent-to').textContent = canal() === 'sms'
      ? 'Enviamos um SMS para o celular com final 4821. O código vale por 10 minutos.'
      : 'Enviamos um e-mail para j•••@email.com. O código vale por 10 minutos.';
    iniciarReenvio();
  }

  $('btn-enviar-codigo').addEventListener('click', function () {
    var m = $('recover-msg');
    if (!checkCpf(true)) {
      m.textContent = 'Digite um CPF válido acima.'; m.className = 'msg err';
      window.PC.dialog({
        type: 'warning',
        title: 'Precisamos do seu CPF',
        message: 'Para enviar o código de recuperação, digite seu CPF primeiro.',
        items: [{ text: cpfProblem(), fix: 'Digitar CPF', onClick: focusCpf }],
        actions: [{ label: 'Entendi', value: 'ok', primary: true }]
      });
      return;
    }
    m.textContent = ''; m.className = 'msg';
    $('rec-num').textContent = new Date().getFullYear() + '-' + String(Math.floor(100000 + Math.random() * 900000));
    enviarCodigo();
    irPara(2, true);
  });

  // Etapa 2 → 3: confirmar o código
  var code = $('rec-code');
  code.addEventListener('input', function () {
    var raw = code.value;
    code.value = raw.replace(/\D/g, '').slice(0, 6);
    if (/\D/.test(raw)) setState(code, $('rec-code-msg'), null, 'O código tem só números.');
    else if (code.classList.contains('invalid')) setState(code, $('rec-code-msg'), null, '');
  });
  $('btn-confirmar-codigo').addEventListener('click', function () {
    var v = code.value;
    if (v.length < 6) {
      setState(code, $('rec-code-msg'), false, v.length ? 'O código tem 6 números. Você digitou ' + v.length + '.' : 'Digite o código que você recebeu.');
      code.focus();
      return;
    }
    if (v !== CODIGO_TESTE) {
      tentativas--;
      code.select();
      if (tentativas > 0) {
        setState(code, $('rec-code-msg'), false, tentativas === 1
          ? 'Código incorreto. Você tem mais 1 tentativa.'
          : 'Código incorreto. Você tem mais ' + tentativas + ' tentativas.');
        return;
      }
      // bloqueia este código e oferece o caminho para seguir em frente
      setState(code, $('rec-code-msg'), false, 'Você errou 3 vezes. Por segurança, este código foi cancelado.');
      $('btn-confirmar-codigo').disabled = true;
      clearInterval(reenvioTimer);
      $('btn-reenviar').disabled = false;
      $('btn-reenviar').textContent = 'Reenviar código';
      window.PC.dialog({
        type: 'warning',
        title: 'Peça um novo código',
        message: 'Você errou o código 3 vezes. Por segurança, ele foi cancelado. Seu pedido continua aberto: é só pedir um novo código.',
        actions: [{ label: 'Enviar novo código', value: 'novo', primary: true }, { label: 'Agora não', value: 'nao' }]
      }).then(function (r) { if (r === 'novo') $('btn-reenviar').click(); });
      return;
    }
    setState(code, $('rec-code-msg'), true, '');
    clearInterval(reenvioTimer);
    irPara(3, true);
  });
  $('btn-reenviar').addEventListener('click', function () {
    enviarCodigo();
    setState(code, $('rec-code-msg'), null, 'Novo código enviado. O anterior não vale mais.');
    code.focus();
  });
  $('btn-trocar-canal').addEventListener('click', function () {
    clearInterval(reenvioTimer);
    irPara(1, true);
  });

  // Etapa 3 → concluído: nova senha, com os requisitos marcados enquanto digita
  var pass = $('rec-pass'), pass2 = $('rec-pass2');
  var REGRAS = {
    len: function (s) { return s.length >= 8; },
    letter: function (s) { return /[A-Za-zÀ-ÿ]/.test(s); },
    num: function (s) { return /\d/.test(s); }
  };
  function atualizarRegras() {
    var ok = true;
    rec.querySelectorAll('#rec-rules li').forEach(function (li) {
      var cumpre = REGRAS[li.getAttribute('data-rule')](pass.value);
      li.classList.toggle('is-ok', cumpre);
      li.querySelector('.rec-rule-state').textContent = cumpre ? ' (ok)' : ' (falta)';
      if (!cumpre) ok = false;
    });
    return ok;
  }
  pass.addEventListener('input', function () { atualizarRegras(); if (pass2.value) conferirRepeticao(false); });
  function conferirRepeticao(final) {
    if (!pass2.value) { if (final) setState(pass2, $('rec-pass2-msg'), false, 'Repita a nova senha.'); return false; }
    if (pass2.value !== pass.value) { setState(pass2, $('rec-pass2-msg'), false, 'As duas senhas estão diferentes.'); return false; }
    setState(pass2, $('rec-pass2-msg'), true, '✓ As senhas são iguais.');
    return true;
  }
  pass2.addEventListener('input', function () { conferirRepeticao(false); });
  $('btn-salvar-senha').addEventListener('click', function () {
    var regras = atualizarRegras(), igual = conferirRepeticao(true);
    if (!regras || !igual) {
      var items = [];
      if (!regras) items.push({ text: 'A nova senha ainda não cumpre todos os requisitos da lista.', fix: 'Ajustar senha', onClick: function () { pass.focus(); } });
      if (regras && !igual) items.push({ text: 'A senha repetida está diferente da nova senha.', fix: 'Repetir senha', onClick: function () { pass2.focus(); } });
      window.PC.dialog({
        type: 'error',
        title: 'Falta corrigir uma coisa',
        message: 'Ajuste o item abaixo para salvar a nova senha.',
        items: items,
        actions: [{ label: 'Entendi', value: 'ok', primary: true }]
      });
      return;
    }
    pass.value = ''; pass2.value = '';
    irPara(4, true);
  });

  // Concluído → volta ao login com o CPF preenchido
  $('btn-voltar-login').addEventListener('click', function () {
    rec.classList.remove('open');
    recBtn.setAttribute('aria-expanded', 'false');
    reiniciarRecuperacao();
    setState(senha, $('senha-msg'), null, 'Agora entre com a sua nova senha.');
    senha.focus();
  });

  // Enter dentro da recuperação avança a etapa (e não envia o login)
  rec.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.target.tagName !== 'INPUT') return;
    e.preventDefault();
    var btn = rec.querySelector('.rec-panel:not([hidden]) .rec-btn');
    if (btn && !btn.disabled) btn.click();
  });

  irPara(1);
  $('criar').addEventListener('click', function (e) { e.preventDefault(); window.PC.toast('Criar conta não existe neste protótipo.'); });

  // outras opções de identificação (simuladas)
  document.querySelectorAll('[data-alt]').forEach(function (b) {
    b.addEventListener('click', function () { window.PC.toast('Esta opção é só ilustração neste protótipo.'); });
  });

  // envio simulado com feedback de status
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var okCpf = checkCpf(true);
    var okSenha = senha.value.length >= 1;
    if (!okSenha) setState(senha, $('senha-msg'), false, 'Digite sua senha.');
    if (!okCpf || !okSenha) {
      // popup de correção: diz o que está errado e leva direto ao campo
      var items = [];
      if (!okCpf) items.push({ text: cpfProblem(), fix: 'Corrigir CPF', onClick: focusCpf });
      if (!okSenha) items.push({ text: 'Você não digitou a senha.', fix: 'Digitar senha', onClick: function () { senha.focus(); } });
      var actions = [{ label: 'Entendi', value: 'ok', primary: true }];
      if (!okSenha) actions.push({ label: 'Esqueci minha senha', value: 'esqueci' });
      window.PC.dialog({
        type: 'error',
        title: items.length > 1 ? 'Falta corrigir algumas coisas' : 'Falta corrigir uma coisa',
        message: items.length > 1 ? 'Ajuste os itens abaixo e tente de novo.' : 'Ajuste o item abaixo e tente de novo.',
        items: items,
        actions: actions
      }).then(function (v) {
        if (v === 'esqueci') openRecover();
        else if (v === 'ok') (okCpf ? senha : cpf).focus();
      });
      return;
    }
    var btn = $('btn-entrar');
    btn.disabled = true; btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Verificando…';
    $('status').textContent = 'Verificando seus dados…';
    senha.value = ''; // protótipo: descarta imediatamente
    setTimeout(function () { $('status').textContent = '✓ Tudo certo! Levando você ao início…'; }, 900);
    setTimeout(function () { location.href = 'home.html'; }, 1700);
  });

  // reconhecimento facial (simulado)
  var modal = $('modal-facial'), face = $('face'), st = $('facial-status'), startBtn = $('facial-start'), timers = [];
  function resetFace() { timers.forEach(clearTimeout); timers = []; face.className = 'face'; face.textContent = '🙂'; st.textContent = 'Coloque o rosto dentro do círculo.'; startBtn.disabled = false; }
  $('btn-facial').addEventListener('click', function () { modal.classList.add('open'); startBtn.focus(); });
  function closeModal() { modal.classList.remove('open'); resetFace(); $('btn-facial').focus(); }
  $('facial-cancel').addEventListener('click', closeModal);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
  startBtn.addEventListener('click', function () {
    startBtn.disabled = true; face.classList.add('scan'); st.textContent = 'Verificando… fique parado.';
    timers.push(setTimeout(function () { st.textContent = 'Comparando com o cadastro…'; }, 1400));
    timers.push(setTimeout(function () { face.className = 'face done'; face.textContent = '✓'; st.textContent = 'Identidade confirmada! Entrando…'; }, 2800));
    timers.push(setTimeout(function () { location.href = 'home.html'; }, 3800));
  });
})();
