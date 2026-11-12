# Portal Cidadão — protótipo de IHC

Protótipo navegável de um portal de serviços públicos, feito para a disciplina de **Interação Humano-Computador**. O objetivo é um site claro para pessoas de qualquer idade e nível de familiaridade com tecnologia.

## Acesse o site

🔗 **[enzosophi.github.io/portal-cidadao](https://enzosophi.github.io/portal-cidadao/)**

| Tela | Link |
|---|---|
| Índice do protótipo | https://enzosophi.github.io/portal-cidadao/portal-cidadao/index.html |
| Início | https://enzosophi.github.io/portal-cidadao/portal-cidadao/home.html |
| Entrar (login) | https://enzosophi.github.io/portal-cidadao/portal-cidadao/login.html |
| Página de serviço: Alistamento militar | https://enzosophi.github.io/portal-cidadao/portal-cidadao/alistamento.html |
| Acessibilidade | https://enzosophi.github.io/portal-cidadao/portal-cidadao/acessibilidade.html |

Funciona no computador e no celular. Nenhum dado é enviado ou guardado: o login, o reconhecimento facial e os serviços são apenas simulações. As preferências (tamanho do texto, cores, idioma) ficam salvas só no navegador de quem usa.

## O que observar em cada tela

**Início**
- Navbar com menus por categoria (Órgãos do governo, Serviços, Notícias, Ajuda) e busca com sugestões (tecle `/` para buscar). A busca entende sinônimos e corrige erros de digitação ("passaporrte" → "passaporte").
- Cada tópico numa faixa de cor própria: Destaques, Serviços por perfil, Mais acessados e Aplicativos do governo.
- Serviços por perfil (Agricultor, Idoso, Estudante, MEI, Trabalhador, Turista): uma linha animada contorna o perfil escolhido e os serviços dele aparecem logo abaixo.

**Entrar**
- CPF e senha na mesma tela, com campos grandes e mensagens de erro em texto (não só pela cor).
- Ao errar, um popup de correção explica o problema em linguagem simples e leva direto ao campo ("O CPF tem 11 números. Você digitou 7." → **Corrigir CPF**).
- Botão de olho para mostrar a senha, aviso de Caps Lock e recuperação de senha na própria tela.

**Alistamento militar**
- Barra **"Você está em"** e índice **"Nesta página"**, que acompanha a rolagem.
- Checklist de documentos com barra de progresso. Ao iniciar com algo faltando, o popup lista os itens e permite marcar ali mesmo ("Já tenho").

**Acessibilidade**
- Tamanho do texto (até 150%), cores para daltonismo (vermelho, verde, azul/amarelo e tons de cinza), alto contraste, sublinhar links, mais espaço no texto e reduzir animações.
- Idioma: português, inglês e espanhol, em todas as telas.

**Em todas as telas**
- Assistente de navegação no botão flutuante (canto inferior direito) e botão do VLibras (Libras).
- Layout responsivo: com o texto grande, o site se reorganiza como numa tela menor (menu ☰, colunas empilhadas).
- Respeita a opção "reduzir movimento" do sistema.

## Análise PACT

O protótipo foi pensado a partir do modelo **PACT** (Pessoas, Atividades, Contextos e Tecnologias). Cada tabela abaixo liga o que foi levantado na análise à decisão tomada no site.

### P — Pessoas

| Quem usa | Decisão no site |
|---|---|
| Pessoas de todas as idades, incluindo idosos e quem tem pouca prática com tecnologia | Textos e campos grandes, ações escritas por extenso ("Acessar serviço", "Iniciar serviço") e informações importantes sempre visíveis, sem depender de passar o mouse |
| Perfis com necessidades diferentes: agricultor, idoso/aposentado, estudante, MEI, trabalhador e brasileiro no exterior | Seção **Serviços por perfil** na Início, com os serviços de cada um |
| Pessoas com baixa visão | Tamanho do texto até 150%, alto contraste, mais espaço entre letras e linhas, links sublinhados e leitor de voz |
| Pessoas com daltonismo | Filtros de cor (vermelho, verde, azul/amarelo e tons de cinza) e erros informados em texto, não só pela cor |
| Pessoas surdas que usam Libras | Widget oficial do **VLibras** em todas as telas |
| Pessoas sensíveis a movimento | Opção para reduzir animações, além de respeitar o "reduzir movimento" do sistema |
| Quem usa teclado ou leitor de tela | Menus que abrem pelo teclado e navegam com as setas, Esc para fechar, foco visível e rótulos para leitores de tela |

### A — Atividades

| O que as pessoas fazem | Decisão no site |
|---|---|
| **Encontrar um serviço** (tarefa frequente e objetiva) | Busca na navbar com sugestões, sinônimos e correção de erros de digitação (atalho `/`), menus por categoria e "Mais acessados" em grade 3x3 |
| **Entrar na conta** (frequente e sujeita a erros) | CPF e senha na mesma tela, popup de correção que explica o erro e leva ao campo, aviso de Caps Lock, botão para mostrar a senha e recuperação sem sair da página |
| **Realizar um serviço** (pouco frequente, com várias etapas e documentos) | Checklist de documentos com barra de progresso, passo a passo numerado e popup que lista o que falta antes de começar, permitindo marcar ali mesmo |
| **Saber onde está no site** | Barra **"Você está em"** fixa no topo, menu da seção atual marcado na navbar e índice **"Nesta página"** que acompanha a rolagem |
| **Ajustar o site ao próprio jeito** | Tela de **Acessibilidade** com texto, cores, leitura, movimento e idioma, salvos para as próximas visitas |
| **Dar retorno ao órgão** | Ouvidoria (denúncia, reclamação, elogio, sugestão) e "Esta página ajudou?" |

### C — Contextos

| Situação de uso | Decisão no site |
|---|---|
| **Físico:** uso no celular, em qualquer lugar e muitas vezes com pressa | Layout responsivo, botão "Iniciar serviço" fixo no rodapé do celular e atalhos grandes para tocar |
| **Físico:** ambiente barulhento ou em que não dá para ler com calma | Leitor de voz que lê a página, o item em foco e os avisos de erro |
| **Social e institucional:** serviço público, às vezes uma obrigação legal, em que a confiança importa | Identidade visual do gov.br, linguagem simples, órgão responsável indicado em cada serviço, preferências de cookies e canais de ouvidoria |
| **Brasileiro morando fora do país ou estrangeiro** | Serviço de alistamento no exterior com apoio consular e site em português, inglês e espanhol |

### T — Tecnologias

| Tecnologia envolvida | Decisão no site |
|---|---|
| **Entrada:** toque, mouse e teclado | Áreas de toque maiores no celular e navegação completa pelo teclado |
| **Saída:** telas de vários tamanhos, texto ampliado, modo claro e escuro | Layout que se reorganiza do celular ao computador (e também quando o texto é aumentado) e preferências salvas entre as páginas |
| **Saída por voz e por Libras** | Leitor de voz com a voz do próprio navegador (Web Speech API) e widget do VLibras |
| **Acesso e autenticação** | Login por CPF e senha, reconhecimento facial, banco, QR code e certificado digital (simulados no protótipo) |
| **Distribuição e conexão** | Site estático no GitHub Pages: abre em qualquer navegador, sem instalar nada e sem enviar dados; o dicionário de tradução só é baixado quando o idioma não é português |

### Limitações e próximos passos

- Precisa de internet: o VLibras e a própria hospedagem dependem dela, e não há modo offline.
- O leitor de voz é um apoio para quem não tem leitor de tela; não substitui NVDA, VoiceOver ou TalkBack.
- Login, reconhecimento facial e serviços são simulações: nenhum dado real é verificado.

## Organização do código

| Arquivo | Para que serve |
|---|---|
| `js/prefs.js` | Lê e aplica as preferências de acessibilidade antes da página aparecer; ajusta os pontos de quebra ao tamanho do texto. |
| `js/main.js` | Comportamento comum: menus, busca, carrossel, perfis e o popup de correção (`PC.dialog`). |
| `js/i18n.js` + `js/i18n-dict.js` | Tradução PT → EN/ES. O dicionário só é baixado quando o idioma não é português. Para traduzir um texto novo, acrescente uma linha em `i18n-dict.js`. |
| `js/login.js`, `js/alistamento.js`, `js/acessibilidade.js` | Comportamento de cada tela. |
| `js/assistente.js`, `js/vlibras.js` | Assistente de navegação (regras locais, sem API externa) e widget oficial de Libras. |
| `src/components/SpringCheck.jsx` | Versão em React do checklist animado, só como referência; o site usa `js/spring-check.js`. |

## Rodar no próprio computador

Não precisa instalar nada: basta abrir `portal-cidadao/index.html` no navegador.
