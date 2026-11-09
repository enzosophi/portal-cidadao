/* Portal Cidadão — comportamento compartilhado (protótipo acadêmico) */
(function () {
  'use strict';

  // ---------- util ----------
  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) {
      return null;
    }
  }

  window.PC = {
    toast: function (text) {
      var t = document.getElementById('toast');
      if (!t) {
        t = document.createElement('div');
        t.id = 'toast';
        t.className = 'toast';
        t.setAttribute('role', 'status');
        document.body.appendChild(t);
      }
      t.textContent = text;
      t.classList.add('show');
      clearTimeout(t._h);
      t._h = setTimeout(function () {
        t.classList.remove('show');
      }, 3500);
    },
    highlight: function (sel) {
      var el = document.querySelector(sel);
      if (!el) return false;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.remove('hl');
      void el.offsetWidth;
      el.classList.add('hl');
      if (el.focus) {
        try {
          el.focus({ preventScroll: true });
        } catch (e) {}
      }
      return true;
    }
  };

  // ---------- modo escuro / alto contraste (persistente) ----------
  var hcBtn = document.querySelectorAll('[data-hc]');
  if (store('pc-hc') === '1') document.body.classList.add('hc');
  hcBtn.forEach(function (b) {
    b.setAttribute('aria-pressed', document.body.classList.contains('hc'));
    b.addEventListener('click', function () {
      var on = document.body.classList.toggle('hc');
      store('pc-hc', on ? '1' : '0');
      hcBtn.forEach(function (x) {
        x.setAttribute('aria-pressed', on);
      });
    });
  });

  // ---------- menu / busca no mobile ----------
  var menuBtn = document.getElementById('menu-toggle');
  var links = document.getElementById('nav-links');
  if (menuBtn && links) {
    menuBtn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
    });
  }
  var sBtn = document.getElementById('search-toggle');
  var sBox = document.getElementById('nav-search');
  if (sBtn && sBox) {
    sBtn.addEventListener('click', function () {
      var open = sBox.classList.toggle('open');
      sBtn.setAttribute('aria-expanded', open);
      if (open) document.getElementById('busca').focus();
    });
  }

  // ---------- busca na navbar com sugestões ----------
  var SERVICOS = [
    { t: 'Alistar-se no serviço militar', c: 'Serviço militar', u: 'alistamento.html' },
    { t: 'Entregar Imposto de Renda', c: 'Finanças', u: 'home.html#destaques' },
    { t: 'Consultar CPF', c: 'Documentos', u: 'home.html#mais-acessados' },
    { t: 'Obter passaporte', c: 'Viagens', u: 'home.html#mais-acessados' },
    { t: 'Emitir guia do MEI', c: 'Empresas', u: 'home.html#mais-acessados' },
    { t: 'Bolsa Família', c: 'Assistência social', u: 'home.html#destaques' },
    { t: 'Renegociação de dívidas', c: 'Finanças', u: 'home.html#destaques' },
    { t: 'Celular seguro', c: 'Segurança', u: 'home.html#destaques' },
    { t: 'Assinatura eletrônica', c: 'Documentos', u: 'home.html#mais-acessados' }
  ];
  window.PC.SERVICOS = SERVICOS;

  function norm(s) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  var input = document.getElementById('busca');
  var list = document.getElementById('suggest');
  if (input && list) {
    function render() {
      var q = norm(input.value.trim());
      list.innerHTML = '';
      if (q.length < 2) {
        list.classList.remove('open');
        input.setAttribute('aria-expanded', 'false');
        return;
      }
      var hits = SERVICOS.filter(function (s) {
        return norm(s.t + ' ' + s.c).indexOf(q) > -1;
      }).slice(0, 5);
      if (!hits.length) {
        list.innerHTML = '<li><span style="padding:.6rem .75rem;display:block">Nenhum serviço encontrado. Tente "CPF" ou "militar".</span></li>';
      } else {
        hits.forEach(function (s) {
          var li = document.createElement('li');
          li.innerHTML = '<a href="' + s.u + '"><span>' + s.t + '</span><small>' + s.c + '</small></a>';
          list.appendChild(li);
        });
      }
      list.classList.add('open');
      input.setAttribute('aria-expanded', 'true');
    }

    input.addEventListener('input', render);
    if (input.form) {
      input.form.addEventListener('submit', function (e) {
        e.preventDefault();
        var first = list.querySelector('a');
        if (first) location.href = first.getAttribute('href');
        else render();
      });
    }
    document.addEventListener('click', function (e) {
      if (!sBox || !sBox.contains(e.target)) list.classList.remove('open');
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') list.classList.remove('open');
      if (e.key === 'ArrowDown') {
        var a = list.querySelector('a');
        if (a) {
          e.preventDefault();
          a.focus();
        }
      }
    });
    // atalho "/" foca a busca
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
        e.preventDefault();
        if (sBox) sBox.classList.add('open');
        input.focus();
      }
    });
  }

  // ---------- footer: acordeão no mobile, aberto no desktop ----------
  var cols = document.querySelectorAll('.f-col');
  var mq = window.matchMedia('(max-width: 768px)');
  function footerMode() {
    cols.forEach(function (d) {
      d.open = !mq.matches;
    });
  }
  if (cols.length) {
    footerMode();
    (mq.addEventListener ? mq.addEventListener('change', footerMode) : mq.addListener(footerMode));
    cols.forEach(function (d) {
      var s = d.querySelector('summary');
      if (s) {
        s.addEventListener('click', function (e) {
          if (!mq.matches) e.preventDefault();
        });
      }
    });
  }

  // ---------- carrossel de destaques ----------
  var car = document.getElementById('carousel');
  if (car) {
    var track = car.querySelector('.track');
    var slides = car.querySelectorAll('.slide');
    var dotsBox = car.querySelector('.dots');
    var pauseBtn = car.querySelector('.car-pause');
    var idx = 0, timer = null, paused = false;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var animeLib = window.anime;
    var animateFn = animeLib && typeof animeLib.animate === 'function' ? animeLib.animate : null;
    var cubicBezierFn = animeLib && typeof animeLib.cubicBezier === 'function' ? animeLib.cubicBezier : null;
    var carouselEase = cubicBezierFn ? cubicBezierFn(0.5, 0, 0.9, 0.3) : 'cubic-bezier(0.5, 0, 0.9, 0.3)';

    slides.forEach(function (s, i) {
      var d = document.createElement('button');
      d.className = 'dot';
      d.type = 'button';
      d.setAttribute('aria-label', 'Ir para destaque ' + (i + 1));
      d.addEventListener('click', function () {
        go(i);
      });
      dotsBox.appendChild(d);
    });
    var dots = dotsBox.querySelectorAll('.dot');
    function go(i, instant) {
      idx = (i + slides.length) % slides.length;
      var targetX = (-100 * idx) + 'cqw';

      if (reduce || instant) {
        track.style.transform = 'translateX(' + targetX + ')';
      } else if (animateFn) {
        animateFn(track, {
          x: targetX,
          duration: 1000,
          ease: carouselEase
        });
      } else {
        track.style.transform = 'translateX(' + targetX + ')';
      }

      dots.forEach(function (d, k) {
        d.setAttribute('aria-current', k === idx);
      });
      slides.forEach(function (s, k) {
        s.setAttribute('aria-hidden', k !== idx);
        s.querySelectorAll('a').forEach(function (a) {
          a.tabIndex = k === idx ? 0 : -1;
        });
      });
    }
    function start() {
      stop();
      if (!paused && !reduce) timer = setInterval(function () {
        go(idx + 1);
      }, 5500);
    }
    function stop() {
      clearInterval(timer);
    }
    var prevBtn = car.querySelector('.prev');
    var nextBtn = car.querySelector('.next');
    if (prevBtn) prevBtn.addEventListener('click', function () { go(idx - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { go(idx + 1); });
    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        paused = !paused;
        pauseBtn.textContent = paused ? '▶ Retomar' : '⏸ Pausar';
        pauseBtn.setAttribute('aria-pressed', paused);
        paused ? stop() : start();
      });
    }
    car.addEventListener('mouseenter', stop);
    car.addEventListener('mouseleave', start);
    car.addEventListener('focusin', stop);
    car.addEventListener('focusout', start);
    car.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') go(idx - 1);
      if (e.key === 'ArrowRight') go(idx + 1);
    });
    // swipe
    var x0 = null;
    car.addEventListener('touchstart', function (e) {
      x0 = e.touches[0].clientX;
    }, { passive: true });
    car.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    go(0, true);
    start();
  }

  // =========================================================================
  // SISTEMA UNIVERSAL DE TOOLTIPS (MENSAGENS EXPLICATIVAS AO PASSAR O MOUSE)
  // =========================================================================
  var tooltipEl = document.createElement('div');
  tooltipEl.className = 'app-tooltip';
  tooltipEl.setAttribute('role', 'tooltip');
  tooltipEl.setAttribute('aria-hidden', 'true');
  tooltipEl.innerHTML = '<span class="tooltip-icon" aria-hidden="true">💡</span><div class="tooltip-body"></div>';
  document.body.appendChild(tooltipEl);

  var activeTarget = null;
  var tooltipBody = tooltipEl.querySelector('.tooltip-body');

  function showTooltip(el) {
    var text = el.getAttribute('data-tooltip') || el.getAttribute('title');
    if (!text) return;
    if (el.hasAttribute('title')) {
      el.setAttribute('data-tooltip-cached-title', text);
      el.removeAttribute('title');
    }

    activeTarget = el;
    tooltipBody.textContent = text;
    tooltipEl.classList.add('is-active');
    tooltipEl.setAttribute('aria-hidden', 'false');

    positionTooltip(el);
  }

  function hideTooltip() {
    activeTarget = null;
    tooltipEl.classList.remove('is-active');
    tooltipEl.setAttribute('aria-hidden', 'true');
  }

  function positionTooltip(el) {
    if (!el) return;
    var rect = el.getBoundingClientRect();
    var tipRect = tooltipEl.getBoundingClientRect();

    // Center horizontally above or below target
    var left = rect.left + (rect.width / 2) - (tipRect.width / 2);
    // Boundary check
    left = Math.max(12, Math.min(window.innerWidth - tipRect.width - 12, left));

    var top = rect.top - tipRect.height - 10;
    if (top < 10) {
      // Show below
      top = rect.bottom + 10;
    }

    tooltipEl.style.left = left + 'px';
    tooltipEl.style.top = top + 'px';
  }

  document.addEventListener('mouseover', function (e) {
    var target = e.target.closest('[data-tooltip], [title]');
    if (target) {
      showTooltip(target);
    }
  });

  document.addEventListener('mouseout', function (e) {
    var target = e.target.closest('[data-tooltip], [data-tooltip-cached-title]');
    if (target && target === activeTarget) {
      hideTooltip();
    }
  });

  document.addEventListener('focusin', function (e) {
    var target = e.target.closest('[data-tooltip], [title]');
    if (target) {
      showTooltip(target);
    }
  });

  document.addEventListener('focusout', function (e) {
    if (activeTarget) hideTooltip();
  });

  window.addEventListener('scroll', function () {
    if (activeTarget) positionTooltip(activeTarget);
  }, { passive: true });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && activeTarget) hideTooltip();
  });

  // =========================================================================
  // SERVIÇOS DIGITAIS POR PERFIL (INÍCIO GOV.BR STYLE)
  // =========================================================================
  var PERFIS = [
    {
      id: 'agricultor',
      nome: 'Agricultor',
      tagline: 'Produtor rural familiar e campo',
      icone: '🌾',
      descricao: 'Serviços especializados para o trabalhador do campo, incentivo à produção rural e regularização fundiária e ambiental.',
      servicos: [
        {
          titulo: 'Cadastro Ambiental Rural (CAR)',
          categoria: 'Meio Ambiente & Terra',
          icone: '🗺️',
          badge: '📄 Documento obrigatório',
          desc: 'Inscrição de imóveis rurais para regularidade ambiental, obtenção de crédito e licenças.',
          tooltip: 'Exige planta ou croqui do imóvel e documentos de posse/propriedade.',
          link: '#'
        },
        {
          titulo: 'Pronaf — Crédito Rural Familiar',
          categoria: 'Financiamento Agro',
          icone: '🚜',
          badge: '💰 Juros reduzidos',
          desc: 'Financiamento para custeio de safras, tratores, irrigação e infraestrutura da agricultura familiar.',
          tooltip: 'Exige DAP ou CAF ativa e projeto simplificado de custeio/investimento.',
          link: '#'
        },
        {
          titulo: 'Declaração de Aptidão (DAP / CAF)',
          categoria: 'Cadastro Oficial',
          icone: '🌱',
          badge: '📜 100% Online',
          desc: 'Emissão e renovação do Cadastro Nacional da Agricultura Familiar no portal gov.br.',
          tooltip: 'Comprova sua atividade rural perante bancos públicos e programas federais.',
          link: '#'
        },
        {
          titulo: 'Seguro da Agricultura Familiar (Proagro)',
          categoria: 'Proteção de Safra',
          icone: '🛡️',
          badge: '☔ Cobertura climática',
          desc: 'Proteção financeira em caso de perdas por seca, enchente, granizo ou geada.',
          tooltip: 'Requer laudo de comprovação de perdas agronômicas e aviso imediato.',
          link: '#'
        }
      ]
    },
    {
      id: 'idoso',
      nome: 'Idoso / Aposentado',
      tagline: 'Previdência, gratuidades e saúde da pessoa idosa',
      icone: '🧓',
      descricao: 'Acesso rápido a benefícios previdenciários, prova de vida digital, carteira interestadual e isenções tributárias.',
      servicos: [
        {
          titulo: 'Prova de Vida Digital pelo Celular',
          categoria: 'Previdência (INSS)',
          icone: '📱',
          badge: '🙂 Reconhecimento facial',
          desc: 'Faça a comprovação anual de vida sem sair de casa pelo aplicativo gov.br com biometria.',
          tooltip: 'Basta ter câmera no celular e conta gov.br nível Prata ou Ouro.',
          link: '#'
        },
        {
          titulo: 'Extrato de Pagamento de Benefício',
          categoria: 'INSS & Renda',
          icone: '📑',
          badge: '📄 Comprovante oficial',
          desc: 'Consulte datas de pagamento, valores líquidos e informe de rendimentos para o Imposto de Renda.',
          tooltip: 'Acesso imediato com CPF e senha. Aceito em bancos e órgãos oficiais.',
          link: '#'
        },
        {
          titulo: 'Carteira da Pessoa Idosa',
          categoria: 'Transporte & Cidadania',
          icone: '🪪',
          badge: '🚌 Viagens gratuitas',
          desc: 'Garante viagens gratuitas ou com 50% de desconto em linhas rodoviárias interestaduais.',
          tooltip: 'Para idosos acima de 60 anos com renda até 2 salários mínimos no CadÚnico.',
          link: '#'
        },
        {
          titulo: 'Isenção de Imposto de Renda e IPTU',
          categoria: 'Tributos & Direitos',
          icone: '🏛️',
          badge: '⚖️ Direito por lei',
          desc: 'Orientações e solicitação de dispensa tributária por faixa etária ou laudo médico.',
          tooltip: 'Exige certidão de nascimento/casamento ou laudo pericial oficial do SUS.',
          link: '#'
        }
      ]
    },
    {
      id: 'estudante',
      nome: 'Estudante',
      tagline: 'Exames nacionais, bolsas universitárias e meia-entrada',
      icone: '🎓',
      descricao: 'Tudo o que o estudante precisa para ingressar no ensino superior, obter bolsas e garantir descontos culturais.',
      servicos: [
        {
          titulo: 'Inscrição no ENEM e Consulta de Notas',
          categoria: 'Exames Nacionais',
          icone: '📝',
          badge: '🎯 Acesso Superior',
          desc: 'Consulte o cronograma, faça a sua inscrição e veja o espelho da redação corrigida.',
          tooltip: 'Requer CPF regular e cadastro unificado no Portal Cidadão / gov.br.',
          link: '#'
        },
        {
          titulo: 'Prouni e FIES — Bolsas e Financiamento',
          categoria: 'Ensino Superior',
          icone: '🏫',
          badge: '✨ Bolsas 100% e 50%',
          desc: 'Candidate-se a vagas em faculdades privadas utilizando as notas obtidas no ENEM.',
          tooltip: 'Requer comprovação de renda familiar per capita e notas mínimas do exame.',
          link: '#'
        },
        {
          titulo: 'ID Jovem — Identidade Jovem Digital',
          categoria: 'Cultura & Mobilidade',
          icone: '🪪',
          badge: '🎟️ Meia-entrada e viagem',
          desc: 'Desconto de 50% em cinemas, teatros, jogos e 2 passagens gratuitas entre estados.',
          tooltip: 'Destinado a jovens de 15 a 29 anos inscritos no Cadastro Único.',
          link: '#'
        },
        {
          titulo: 'Certificação do Encceja',
          categoria: 'Conclusão de Estudos',
          icone: '🎓',
          badge: '📜 Certificado Ensino Médio',
          desc: 'Obtenha a declaração parcial ou certificado de conclusão do Ensino Fundamental ou Médio.',
          tooltip: 'Consulta pelo número de inscrição do Encceja e CPF.',
          link: '#'
        }
      ]
    },
    {
      id: 'mei',
      nome: 'MEI (Microempreendedor)',
      tagline: 'Formalização, emissão de DAS, notas fiscais e declaração',
      icone: '💼',
      descricao: 'Ferramentas descomplicadas para manter o seu CNPJ em dia, pagar tributos unificados e emitir notas fiscais.',
      servicos: [
        {
          titulo: 'Emitir Guia DAS-MEI Mensal',
          categoria: 'Tributos e INSS',
          icone: '🧾',
          badge: '💳 Pix ou Boleto',
          desc: 'Gere a guia única de arrecadação do Simples Nacional em menos de 1 minuto sem burocracia.',
          tooltip: 'Informe apenas o CNPJ. Mantém seu negócio e cobertura do INSS em dia.',
          link: '#'
        },
        {
          titulo: 'Declaração Anual (DASN-SIMEI)',
          categoria: 'Prestação de Contas',
          icone: '📊',
          badge: '📅 Obrigatória anual',
          desc: 'Envie o faturamento bruto anual da sua empresa sem custos adicionais.',
          tooltip: 'Prazo até 31 de maio de cada ano. Mantém a regularidade fiscal do CNPJ.',
          link: '#'
        },
        {
          titulo: 'Formalização / Abrir MEI Grátis',
          categoria: 'Registro de CNPJ',
          icone: '🏢',
          badge: '⚡ CNPJ em minutos',
          desc: 'Abra sua empresa individual de forma 100% gratuita no portal oficial do empreendedor.',
          tooltip: 'Tenha em mãos CPF, título de eleitor ou recibo do IRPF e comprovante de endereço.',
          link: '#'
        },
        {
          titulo: 'Emissão de NFS-e Nacional',
          categoria: 'Notas Fiscais',
          icone: '📝',
          badge: '💻 Padrão Simplificado',
          desc: 'Emita notas fiscais de prestação de serviços pelo emissor nacional unificado.',
          tooltip: 'Requer cadastro no Emissor Nacional e certificado ou login gov.br.',
          link: '#'
        }
      ]
    },
    {
      id: 'trabalhador',
      nome: 'Trabalhador',
      tagline: 'Contratos CLT, carteira de trabalho, seguro e FGTS',
      icone: '👷',
      descricao: 'Acompanhe seus contratos profissionais, solicite benefícios trabalhistas e consulte saldos do FGTS e PIS.',
      servicos: [
        {
          titulo: 'Carteira de Trabalho Digital (CTPS)',
          categoria: 'Contratos e Vínculos',
          icone: '📘',
          badge: '📲 No celular',
          desc: 'Acompanhe anotações de salário, admissões, férias e histórico profissional completo.',
          tooltip: 'Acesso imediato com CPF e senha gov.br. Substitui a carteira de papel.',
          link: '#'
        },
        {
          titulo: 'Solicitar Seguro-Desemprego',
          categoria: 'Benefício ao Trabalhador',
          icone: '🛡️',
          badge: '💵 Auxílio temporário',
          desc: 'Dê entrada no benefício após demissão sem justa causa de forma 100% online.',
          tooltip: 'Requer número do Requerimento do Seguro-Desemprego entregue pelo empregador.',
          link: '#'
        },
        {
          titulo: 'Consultar Abono Salarial PIS/Pasep',
          categoria: 'Benefício Anual',
          icone: '💰',
          badge: '🏦 Até 1 salário mínimo',
          desc: 'Verifique se tem direito ao abono salarial, consulte valores e veja o calendário de pagamento.',
          tooltip: 'Para quem trabalhou pelo menos 30 dias com carteira assinada no ano-base.',
          link: '#'
        },
        {
          titulo: 'Extrato e Saque do FGTS',
          categoria: 'Fundo de Garantia',
          icone: '🏛️',
          badge: '🔒 Conta vinculada',
          desc: 'Acompanhe depósitos mensais feitos pelo empregador e solicite saques autorizados.',
          tooltip: 'Consulte saldo total por empresa e opção de Saque-Aniversário.',
          link: '#'
        }
      ]
    },
    {
      id: 'turista',
      nome: 'Turista & Exterior',
      tagline: 'Passaporte, alistamento militar e controle aduaneiro',
      icone: '✈️',
      descricao: 'Serviços essenciais para viajantes internacionais e cidadãos brasileiros residentes fora do país.',
      servicos: [
        {
          titulo: 'Obter Passaporte Brasileiro',
          categoria: 'Polícia Federal',
          icone: '🛂',
          badge: '🌎 Documento de viagem',
          desc: 'Preencha o formulário eletrônico, pague a taxa GRU e agende a coleta biométrica.',
          tooltip: 'Requer documento de identidade, quitação eleitoral e alistamento militar em dia.',
          link: '#'
        },
        {
          titulo: 'Alistar-se no Serviço Militar no Exterior',
          categoria: 'Consulado & Defesa',
          icone: '🪖',
          badge: '✅ 100% Online',
          desc: 'Regularize sua obrigação militar residindo fora do Brasil com apoio consular.',
          tooltip: 'Para jovens de 18 anos. Requer foto de identidade e comprovante no exterior.',
          link: 'alistamento.html'
        },
        {
          titulo: 'Declaração Eletrônica de Bens (e-DBV)',
          categoria: 'Receita Federal & Alfândega',
          icone: '🧳',
          badge: '📋 Alfândega aeroporto',
          desc: 'Declare bens e valores acima da cota ao entrar ou sair do território nacional.',
          tooltip: 'Evite filas e multas declarando eletronicamente antes do embarque.',
          link: '#'
        },
        {
          titulo: 'Certificado de Vacinação (CIVP)',
          categoria: 'Saúde Internacional',
          icone: '💉',
          badge: '🏥 Febre Amarela & Covid',
          desc: 'Emita o certificado internacional exigido por diversos países para entrada de turistas.',
          tooltip: 'Comprovação da vacina aplicada no SUS ou clínica credenciada pela Anvisa.',
          link: '#'
        }
      ]
    }
  ];

  var perfilSection = document.getElementById('perfis');
  if (perfilSection) {
    var perfilTrack = document.getElementById('perfil-track');
    var perfilItems = perfilSection.querySelectorAll('.perfil-item');
    var perfilDots = document.getElementById('perfil-dots');
    var perfilDisplay = document.getElementById('perfil-display');
    var prevPerfilBtn = document.getElementById('perfil-prev');
    var nextPerfilBtn = document.getElementById('perfil-next');
    var modalTodos = document.getElementById('modal-todos-perfis');
    var btnTodos = document.getElementById('btn-todos-perfis');
    var modalClose = document.getElementById('modal-perfis-fechar');
    var modalList = document.getElementById('modal-profiles-list');

    var currentPerfilIdx = 0;

    // Render dot indicators
    if (perfilDots) {
      PERFIS.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.className = 'perfil-dot' + (i === 0 ? ' is-active' : '');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Ver perfil ' + PERFIS[i].nome);
        dot.addEventListener('click', function () {
          selectPerfil(i, true);
        });
        perfilDots.appendChild(dot);
      });
    }

    // Render modal profile items
    if (modalList) {
      PERFIS.forEach(function (p, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'all-profile-btn';
        btn.innerHTML = '<span style="font-size:2rem">' + p.icone + '</span><span>' + p.nome + '</span>';
        btn.addEventListener('click', function () {
          selectPerfil(i, true);
          if (modalTodos) modalTodos.classList.remove('open');
        });
        modalList.appendChild(btn);
      });
    }

    function renderDisplay(p) {
      if (!perfilDisplay) return;

      var html = '';
      html += '<div class="perfil-display-header">';
      html += '  <div class="perfil-display-title-group">';
      html += '    <div class="perfil-display-avatar" aria-hidden="true">' + p.icone + '</div>';
      html += '    <div class="perfil-display-text">';
      html += '      <span class="doc-pill" style="margin-bottom:.25rem">Perfil selecionado: ' + p.nome + '</span>';
      html += '      <h3>Serviços recomendados para ' + p.nome + '</h3>';
      html += '      <p>' + p.descricao + '</p>';
      html += '    </div>';
      html += '  </div>';
      html += '</div>';

      html += '<div class="perfil-services-grid">';
      p.servicos.forEach(function (s) {
        html += '<a class="perfil-svc-card" href="' + s.link + '" data-tooltip="' + s.tooltip + '">';
        html += '  <div class="perfil-svc-head">';
        html += '    <div class="perfil-svc-ico" aria-hidden="true">' + s.icone + '</div>';
        html += '    <span class="doc-pill">' + s.badge + '</span>';
        html += '  </div>';
        html += '  <h4>' + s.titulo + '</h4>';
        html += '  <p>' + s.desc + '</p>';
        html += '  <div class="perfil-svc-foot">';
        html += '    <span>' + s.categoria + '</span>';
        html += '    <span>Acessar ➔</span>';
        html += '  </div>';
        html += '</a>';
      });
      html += '</div>';

      perfilDisplay.innerHTML = html;
    }

    function selectPerfil(idx, scrollIntoView) {
      currentPerfilIdx = (idx + PERFIS.length) % PERFIS.length;
      var targetPerfil = PERFIS[currentPerfilIdx];

      perfilItems.forEach(function (item, i) {
        var isTarget = i === currentPerfilIdx;
        item.classList.toggle('is-active', isTarget);
        item.setAttribute('aria-selected', isTarget);
      });

      var dots = perfilDots ? perfilDots.querySelectorAll('.perfil-dot') : [];
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === currentPerfilIdx);
      });

      renderDisplay(targetPerfil);

      if (scrollIntoView && perfilTrack) {
        var activeItem = perfilItems[currentPerfilIdx];
        if (activeItem) {
          var container = perfilTrack.parentElement;
          var scrollLeft = activeItem.offsetLeft - (container.clientWidth / 2) + (activeItem.clientWidth / 2);
          container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
      }
    }

    perfilItems.forEach(function (item, i) {
      item.addEventListener('click', function () {
        selectPerfil(i, true);
      });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectPerfil(i, true);
        }
      });
    });

    if (prevPerfilBtn) {
      prevPerfilBtn.addEventListener('click', function () {
        selectPerfil(currentPerfilIdx - 1, true);
      });
    }

    if (nextPerfilBtn) {
      nextPerfilBtn.addEventListener('click', function () {
        selectPerfil(currentPerfilIdx + 1, true);
      });
    }

    if (btnTodos && modalTodos) {
      btnTodos.addEventListener('click', function () {
        modalTodos.classList.add('open');
      });
    }

    if (modalClose && modalTodos) {
      modalClose.addEventListener('click', function () {
        modalTodos.classList.remove('open');
      });
      modalTodos.addEventListener('click', function (e) {
        if (e.target === modalTodos) modalTodos.classList.remove('open');
      });
    }

    // Initial render
    selectPerfil(0, false);
  }
})();
