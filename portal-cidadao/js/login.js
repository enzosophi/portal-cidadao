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

  // recuperação na mesma tela
  var rec = $('recover'), recBtn = $('btn-esqueci');
  recBtn.addEventListener('click', function () {
    var open = rec.classList.toggle('open');
    recBtn.setAttribute('aria-expanded', open);
  });
  function openRecover() {
    if (!rec.classList.contains('open')) recBtn.click();
    window.PC.highlight('#recover');
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
    m.className = 'msg'; m.textContent = '✓ Código enviado (simulação).';
  });
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
