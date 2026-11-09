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
