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
      menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
  }

  // ---------- menus suspensos: categorias da navbar + idioma e cookies da barra superior ----------
  var triggers = document.querySelectorAll('.nav-trigger, .tb-trigger');
  function closeMenus(except) {
    triggers.forEach(function (t) {
      if (t === except) return;
      t.setAttribute('aria-expanded', 'false');
      var dd = document.getElementById(t.getAttribute('aria-controls'));
      if (dd) dd.classList.remove('open');
    });
  }
  triggers.forEach(function (t) {
    var dd = document.getElementById(t.getAttribute('aria-controls'));
    t.addEventListener('click', function () {
      var open = t.getAttribute('aria-expanded') !== 'true';
      closeMenus(t);
      t.setAttribute('aria-expanded', open);
      if (dd) dd.classList.toggle('open', open);
    });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' && dd) {
        e.preventDefault();
        if (t.getAttribute('aria-expanded') !== 'true') t.click();
        var first = dd.querySelector('a');
        if (first) first.focus();
      }
    });
    if (dd) {
      dd.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        var items = Array.prototype.slice.call(dd.querySelectorAll('a'));
        var i = items.indexOf(document.activeElement);
        if (i < 0) return;
        e.preventDefault();
        var next = items[i + (e.key === 'ArrowDown' ? 1 : -1)];
        (next || (e.key === 'ArrowUp' ? t : items[i])).focus();
      });
    }
  });
  if (triggers.length) {
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-item, .tb-item')) closeMenus();
    });
    document.addEventListener('focusin', function (e) {
      if (!e.target.closest('.nav-item, .tb-item')) closeMenus();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var open = document.querySelector('.nav-trigger[aria-expanded="true"], .tb-trigger[aria-expanded="true"]');
      if (open) { closeMenus(); open.focus(); }
    });
  }

  // idioma atual: só fecha o menu
  document.querySelectorAll('#dd-idioma a[aria-current]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); closeMenus(); });
  });

  // preferências de cookies (guardadas só neste navegador)
  document.querySelectorAll('[data-cookies]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-cookies');
      store('pc-cookies', v);
      closeMenus();
      window.PC.toast(v === 'todos' ? 'Preferência salva: todos os cookies aceitos.' : 'Preferência salva: apenas cookies essenciais.');
    });
  });

  // links de páginas que ainda não existem no protótipo
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-soon]');
    if (!a) return;
    e.preventDefault();
    window.PC.toast('"' + a.textContent.trim() + '" é ilustrativo neste protótipo.');
  });
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
    { t: 'Assinatura eletrônica', c: 'Documentos', u: 'home.html#mais-acessados' },
    { t: 'Carteira de Trabalho Digital', c: 'Trabalho', u: 'home.html#mais-acessados' },
    { t: 'Saúde digital (SUS)', c: 'Saúde', u: 'home.html#mais-acessados' },
    { t: 'Benefícios sociais', c: 'Assistência social', u: 'home.html#mais-acessados' }
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
    var idx = 0, timer = null;
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
      if (!reduce) timer = setInterval(function () {
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

    // ---------- linha contínua que dá uma volta em torno de cada perfil ----------
    // Um único traço horizontal passa por baixo dos avatares; em cada perfil ele sobe,
    // contorna o avatar num círculo completo e segue em frente. Um trecho azul percorre
    // a linha até o perfil selecionado e fecha o círculo em volta dele.
    var SVGNS = 'http://www.w3.org/2000/svg';
    var LOOP_R = 58;     // raio do laço (avatar tem 46px de raio + folga)
    var TAIL = 34;       // quanto do traço azul aparece antes/depois do laço
    var loopStarts = [], lineTotal = 0, lineDrawn = false;
    var lineSvg, lineBase, lineActive;

    if (perfilTrack) {
      lineSvg = document.createElementNS(SVGNS, 'svg');
      lineSvg.setAttribute('class', 'perfil-line');
      lineSvg.setAttribute('aria-hidden', 'true');
      lineSvg.setAttribute('focusable', 'false');
      lineBase = document.createElementNS(SVGNS, 'path');
      lineBase.setAttribute('class', 'perfil-line-base');
      lineActive = document.createElementNS(SVGNS, 'path');
      lineActive.setAttribute('class', 'perfil-line-active');
      lineSvg.appendChild(lineBase);
      lineSvg.appendChild(lineActive);
      perfilTrack.insertBefore(lineSvg, perfilTrack.firstChild);
    }

    function buildLine() {
      if (!lineSvg) return;
      var w = perfilTrack.scrollWidth, h = perfilTrack.offsetHeight;
      // A linha corre na altura do meio dos avatares. Em cada perfil ela chega pela esquerda
      // do anel, passa por cima, por baixo e por cima de novo (uma volta e meia) e sai pela
      // direita, seguindo em frente. Visualmente: um círculo completo atravessado pela linha.
      var R = LOOP_R, arc = ' A ' + R + ' ' + R + ' 0 0 1 ';
      var extra = 3 * Math.PI * R - 2 * R; // comprimento a mais que cada laço soma ao trecho reto
      var y = 0, d = '';
      loopStarts = [];
      perfilItems.forEach(function (item, i) {
        var av = item.querySelector('.perfil-avatar-circle');
        var cx = av.offsetLeft + av.offsetWidth / 2;
        y = av.offsetTop + av.offsetHeight / 2;
        if (i === 0) d = 'M 0 ' + y;
        d += ' L ' + (cx - R) + ' ' + y +
             arc + (cx + R) + ' ' + y +   // por cima
             arc + (cx - R) + ' ' + y +   // por baixo
             arc + (cx + R) + ' ' + y;    // por cima de novo e sai pela direita
        loopStarts.push((cx - R) + i * extra);
      });
      d += ' L ' + w + ' ' + y;
      lineSvg.setAttribute('width', w);
      lineSvg.setAttribute('height', h);
      lineSvg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      lineBase.setAttribute('d', d);
      lineActive.setAttribute('d', d);
      lineTotal = w + perfilItems.length * extra;
      lineBase.style.transition = 'none';
      lineBase.style.strokeDasharray = lineTotal;
      lineBase.style.strokeDashoffset = lineDrawn ? 0 : lineTotal;
      void lineBase.getBoundingClientRect();
      lineBase.style.transition = '';
      paintLine(currentPerfilIdx, true);
      // ao mudar a largura da tela, mantém o perfil ativo centralizado na faixa
      var activeItem = perfilItems[currentPerfilIdx], box = perfilTrack.parentElement;
      if (activeItem && box) box.scrollLeft = activeItem.offsetLeft - (box.clientWidth / 2) + (activeItem.clientWidth / 2);
    }

    function paintLine(i, instant) {
      if (!lineActive || !loopStarts.length) return;
      var start = Math.max(0, loopStarts[i] - TAIL);
      var len = 3 * Math.PI * LOOP_R + TAIL * 2;
      if (instant) lineActive.style.transition = 'none';
      lineActive.style.strokeDasharray = '0 ' + start + ' ' + len + ' ' + lineTotal;
      if (instant) {
        void lineActive.getBoundingClientRect();
        lineActive.style.transition = '';
      }
    }

    function revealLine() {
      if (lineDrawn || !lineBase) return;
      lineDrawn = true;
      lineBase.style.strokeDashoffset = 0;
      perfilSection.classList.add('line-in');
    }

    if (lineSvg) {
      if ('IntersectionObserver' in window) {
        var lineIO = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) { revealLine(); lineIO.disconnect(); }
        }, { threshold: 0.35 });
        lineIO.observe(perfilTrack);
      } else {
        lineDrawn = true;
        perfilSection.classList.add('line-in');
      }
      if ('ResizeObserver' in window) new ResizeObserver(buildLine).observe(perfilTrack);
      else window.addEventListener('resize', buildLine);
    }

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

    // Ícones (padrão Lucide) de cada serviço do painel de perfil
    var LUCIDE = {
      map: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
      banknote: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
      sprout: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
      shieldCheck: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
      shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
      smartphone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
      fileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
      idCard: '<path d="M16 10h2"/><path d="M16 14h2"/><path d="M6.17 15a3 3 0 0 1 5.66 0"/><circle cx="9" cy="11" r="2"/><rect x="2" y="5" width="20" height="14" rx="2"/>',
      landmark: '<path d="M10 18v-7"/><path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="M3 22h18"/><path d="M6 18v-7"/>',
      penLine: '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>',
      graduationCap: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
      ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',
      award: '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',
      receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
      chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
      building: '<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>',
      briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
      coins: '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>',
      wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
      plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
      luggage: '<path d="M6 20a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2"/><path d="M8 18V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14"/><path d="M10 20h4"/><circle cx="16" cy="20" r="2"/><circle cx="8" cy="20" r="2"/>',
      syringe: '<path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/>',
      info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
      chevronRight: '<path d="m9 18 6-6-6-6"/>'
    };
    var SVC_ICON = {
      'Cadastro Ambiental Rural (CAR)': 'map',
      'Pronaf — Crédito Rural Familiar': 'banknote',
      'Declaração de Aptidão (DAP / CAF)': 'sprout',
      'Seguro da Agricultura Familiar (Proagro)': 'shieldCheck',
      'Prova de Vida Digital pelo Celular': 'smartphone',
      'Extrato de Pagamento de Benefício': 'fileText',
      'Carteira da Pessoa Idosa': 'idCard',
      'Isenção de Imposto de Renda e IPTU': 'landmark',
      'Inscrição no ENEM e Consulta de Notas': 'penLine',
      'Prouni e FIES — Bolsas e Financiamento': 'graduationCap',
      'ID Jovem — Identidade Jovem Digital': 'ticket',
      'Certificação do Encceja': 'award',
      'Emitir Guia DAS-MEI Mensal': 'receipt',
      'Declaração Anual (DASN-SIMEI)': 'chart',
      'Formalização / Abrir MEI Grátis': 'building',
      'Emissão de NFS-e Nacional': 'fileText',
      'Carteira de Trabalho Digital (CTPS)': 'briefcase',
      'Solicitar Seguro-Desemprego': 'shield',
      'Consultar Abono Salarial PIS/Pasep': 'coins',
      'Extrato e Saque do FGTS': 'wallet',
      'Obter Passaporte Brasileiro': 'plane',
      'Alistar-se no Serviço Militar no Exterior': 'shield',
      'Declaração Eletrônica de Bens (e-DBV)': 'luggage',
      'Certificado de Vacinação (CIVP)': 'syringe'
    };
    function lucide(name, cls) {
      return '<svg class="' + (cls || 'lc') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (LUCIDE[name] || LUCIDE.fileText) + '</svg>';
    }
    function semEmoji(t) { return String(t).replace(/^[^\p{L}\p{N}]+/u, '').trim(); }

    function renderDisplay(p) {
      if (!perfilDisplay) return;

      var html = '';
      html += '<div class="pd-head">';
      html += '  <div>';
      html += '    <p class="pd-eyebrow">Serviços para o perfil</p>';
      html += '    <h3 class="pd-title">' + p.nome + '</h3>';
      html += '    <p class="pd-desc">' + p.descricao + '</p>';
      html += '  </div>';
      html += '  <span class="pd-count">' + p.servicos.length + ' serviços</span>';
      html += '</div>';

      html += '<ul class="pd-list">';
      p.servicos.forEach(function (s, i) {
        var soon = s.link === '#' ? ' data-soon' : '';
        html += '<li style="--i:' + i + '">';
        html += '<a class="pd-item" href="' + s.link + '"' + soon + '>';
        html += '  <span class="pd-ico">' + lucide(SVC_ICON[s.titulo]) + '</span>';
        html += '  <span class="pd-body">';
        html += '    <span class="pd-org">' + s.categoria + '</span>';
        html += '    <span class="pd-name">' + s.titulo + '</span>';
        html += '    <span class="pd-text">' + s.desc + '</span>';
        html += '    <span class="pd-tip">' + lucide('info', 'lc lc-sm') + '<span><strong>Bom saber:</strong> ' + s.tooltip + '</span></span>';
        html += '    <span class="pd-foot">';
        html += '      <span class="pd-tag">' + semEmoji(s.badge) + '</span>';
        html += '      <span class="pd-go">Acessar serviço' + lucide('chevronRight', 'lc lc-sm') + '</span>';
        html += '    </span>';
        html += '  </span>';
        html += '</a>';
        html += '</li>';
      });
      html += '</ul>';

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
      paintLine(currentPerfilIdx);

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
    buildLine();
    selectPerfil(0, false);
  }
})();
