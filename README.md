# Portal Cidadão — protótipo de IHC

Protótipo navegável de um portal de serviços públicos, feito para a disciplina de **Interação Humano-Computador**. O objetivo é um site claro para pessoas de qualquer idade e nível de familiaridade com tecnologia.

## Acesse o site

**🔗 https://enzosophi.github.io/portal-cidadao/**

| Tela | Link |
|---|---|
| Índice do protótipo | https://enzosophi.github.io/portal-cidadao/portal-cidadao/index.html |
| Início | https://enzosophi.github.io/portal-cidadao/portal-cidadao/home.html |
| Entrar (login) | https://enzosophi.github.io/portal-cidadao/portal-cidadao/login.html |
| Página de serviço: Alistamento militar | https://enzosophi.github.io/portal-cidadao/portal-cidadao/alistamento.html |

Funciona no computador e no celular. Nenhum dado é enviado ou guardado: o login, o reconhecimento facial e os serviços são apenas simulações.

## O que observar em cada tela

**Início**
- Navbar com menus por categoria (Órgãos do governo, Serviços, Notícias, Ajuda) e busca com sugestões (tecle `/` para buscar).
- Barra superior com idioma, preferências de cookies e modo claro/escuro.
- Serviços por perfil (Agricultor, Idoso, Estudante, MEI, Trabalhador, Turista): uma linha animada contorna o perfil escolhido e os serviços dele aparecem logo abaixo.
- "Mais acessados" em grade 3x3, com ícones grandes.

**Entrar**
- CPF e senha na mesma tela, com campos grandes e mensagens de erro em texto (não só pela cor).
- Botão de olho para mostrar a senha e aviso de Caps Lock.
- Recuperação de senha na própria tela, sem perder o que já foi digitado.

**Alistamento militar**
- Barra **"Você está em"**, fixa no topo, mostrando o caminho da página. O menu **Serviços** fica marcado na navbar.
- Índice **"Nesta página"**, que acompanha a rolagem.
- Checklist de documentos com barra de progresso e passo a passo numerado.

**Em todas as telas**
- Assistente de navegação no botão flutuante (canto inferior direito).
- Modo escuro que fica salvo entre as páginas.
- Respeita a opção "reduzir movimento" do sistema.

## Rodar no próprio computador

Não precisa instalar nada: basta abrir `portal-cidadao/index.html` no navegador.
