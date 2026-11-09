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
    if (!cpfValido(cpf.value)) { setState(cpf, $('cpf-msg'), false, 'Esse CPF não parece válido. Confira os números.'); return false; }
    setState(cpf, $('cpf-msg'), true, '✓ CPF no formato correto'); return true;
  }
  cpf.addEventListener('input', function () { cpf.value = mask(cpf.value); checkCpf(false); });
  cpf.addEventListener('blur', function () { if (cpf.value) checkCpf(true); });

  // senha: mostrar/ocultar + aviso de Caps Lock (prevenção de erro)
  $('toggle-senha').addEventListener('click', function () {
    var show = senha.type === 'password';
    senha.type = show ? 'text' : 'password';
    this.textContent = show ? 'Ocultar' : 'Mostrar';
    this.setAttribute('aria-pressed', show);
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
  $('btn-enviar-codigo').addEventListener('click', function () {
    var m = $('recover-msg');
    if (!checkCpf(true)) { m.textContent = 'Preencha um CPF válido acima para continuar.'; m.className = 'msg err'; cpf.focus(); return; }
    m.className = 'msg'; m.textContent = '✓ (simulação) Código enviado. Nenhum dado real foi usado.';
  });
  $('criar').addEventListener('click', function (e) { e.preventDefault(); window.PC.toast('Criar conta não faz parte deste protótipo.'); });

  // envio simulado com feedback de status
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var okCpf = checkCpf(true);
    var okSenha = senha.value.length >= 1;
    if (!okSenha) setState(senha, $('senha-msg'), false, 'Informe sua senha. Esqueceu? Use "Esqueci minha senha".');
    if (!okCpf || !okSenha) { (okCpf ? senha : cpf).focus(); return; }
    var btn = $('btn-entrar');
    btn.disabled = true; btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Verificando…';
    $('status').textContent = 'Verificando seus dados…';
    senha.value = ''; // protótipo: descarta imediatamente
    setTimeout(function () { $('status').textContent = '✓ Tudo certo! Levando você ao início…'; }, 900);
    setTimeout(function () { location.href = 'home.html'; }, 1700);
  });

  // reconhecimento facial (simulado)
  var modal = $('modal-facial'), face = $('face'), st = $('facial-status'), startBtn = $('facial-start'), timers = [];
  function resetFace() { timers.forEach(clearTimeout); timers = []; face.className = 'face'; face.textContent = '🙂'; st.textContent = 'Posicione o rosto dentro do círculo.'; startBtn.disabled = false; }
  $('btn-facial').addEventListener('click', function () { modal.classList.add('open'); startBtn.focus(); });
  function closeModal() { modal.classList.remove('open'); resetFace(); $('btn-facial').focus(); }
  $('facial-cancel').addEventListener('click', closeModal);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
  startBtn.addEventListener('click', function () {
    startBtn.disabled = true; face.classList.add('scan'); st.textContent = 'Verificando… mantenha o rosto parado.';
    timers.push(setTimeout(function () { st.textContent = 'Comparando com o cadastro…'; }, 1400));
    timers.push(setTimeout(function () { face.className = 'face done'; face.textContent = '✓'; st.textContent = 'Identidade confirmada! Entrando…'; }, 2800));
    timers.push(setTimeout(function () { location.href = 'home.html'; }, 3800));
  });
})();
