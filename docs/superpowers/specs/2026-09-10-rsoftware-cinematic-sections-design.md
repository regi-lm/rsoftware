# RSoftware — experiência visual e narrativa de rolagem

**Data:** 2026-09-10  
**Status:** aprovado em conversa, aguardando revisão do documento  
**Escopo:** evolução visual e comportamental do site estático existente

## Objetivo

Transformar as principais seções da página em uma experiência visual coesa e cinematográfica, usando o vídeo fornecido no hero, imagens contextuais nos cards e sequências de rolagem controladas. A mudança deve funcionar no desktop e em dispositivos móveis sem prejudicar leitura, navegação por teclado ou acesso ao conteúdo quando as bibliotecas de animação não estiverem disponíveis.

## Direção visual

- Preservar a identidade escura do site, o azul `#4cc9ff`, tipografia atual, bordas discretas e cantos já definidos.
- Usar fotografias com linguagem tecnológica, enquadramento documental e contraste adequado ao tema escuro.
- Pesquisar referências de composição no Pinterest, mas usar somente imagens do Unsplash no produto final.
- Tratar todas as fotografias de cards como decorativas: elas ficam atrás do conteúdo, recebem gradientes escuros e não substituem informação textual.
- Manter títulos, descrições, números e controles sempre em primeiro plano e legíveis.

## Hero em vídeo

- Copiar `C:\Users\REGINALDO LIMA\Downloads\Programador_digitando_em_notebook_20260910203555.mp4` para `dist/assets/video/hero-programador.mp4`.
- Usar um elemento `<video>` absoluto cobrindo o hero com `autoplay`, `muted`, `loop`, `playsinline` e `preload="metadata"`.
- O vídeo continuará reproduzindo inclusive quando `prefers-reduced-motion` estiver ativo, conforme decisão explícita do usuário.
- Não exibir controles nem reproduzir áudio. O atributo `muted` e a propriedade `defaultMuted` devem garantir silêncio desde a inicialização.
- Aplicar uma camada escura e um gradiente azulado sobre o vídeo para preservar o contraste do texto.
- Manter um fundo degradê como fallback enquanto o vídeo carrega ou caso não possa ser reproduzido.
- Remover do carregamento da página o canvas do hero, o script Three.js e a inicialização de `hero-three.js`.

## Espaçamento antes de Serviços

A seção Sobre permanece entre Hero e Serviços. O respiro adicional será aplicado antes da seção Serviços, aumentando a separação visual entre o bloco introdutório e o início da narrativa de cards.

## Serviços

- Cada um dos quatro serviços terá uma fotografia distinta e semanticamente relacionada:
  1. Sites institucionais — equipe ou profissional construindo presença digital.
  2. Landing pages — composição de interface, campanha ou análise de conversão.
  3. Sistemas web — dashboard, dados ou operação digital.
  4. Aplicações web — produto interativo em notebook ou múltiplos dispositivos.
- As imagens serão carregadas como `<img loading="lazy">`, posicionadas atrás do conteúdo e cobertas por overlays.
- Os cards continuarão em uma pilha vertical com `position: sticky` e offsets progressivos.
- O mesmo empilhamento funcionará abaixo de 980 px; o CSS responsivo não converterá mais esses cards em blocos comuns.
- GSAP acrescentará entrada com profundidade, escala e opacidade. O sticky nativo continuará funcional se GSAP não carregar.

## Skills

- Os oito cards serão organizados em quatro pares: 1/5, 2/6, 3/7 e 4/8.
- Os quatro primeiros definem as posições visuais da grade; os quatro últimos ocupam as mesmas células e ficam acima deles ao final.
- Grade por viewport:
  - desktop: quatro colunas por uma linha;
  - tablet: duas colunas por duas linhas;
  - celular: uma coluna por quatro linhas.
- A área da grade será fixada com ScrollTrigger durante a sequência. O comprimento de rolagem será suficiente para completar os quatro encaixes antes de liberar a seção seguinte.
- Os cards inferiores entrarão individualmente de baixo, com perspectiva, blur, leve rotação e escala, terminando sem deslocamento exatamente sobre seus pares.
- A ordem será 5 sobre 1, 6 sobre 2, 7 sobre 3 e 8 sobre 4.
- Ao redimensionar a viewport, as posições e o ScrollTrigger serão recalculados.
- Com movimento reduzido ou sem GSAP, os oito cards serão apresentados como uma lista normal e acessível, sem pinning.

## Projetos

- O track horizontal/grade atual será substituído pelo mesmo formato visual usado em Serviços: cards largos, verticais e empilhados por sticky scroll.
- Cada projeto exibirá número, categoria, título, descrição, ícones de tecnologias e ação disponível.
- Nomes textuais das tecnologias serão removidos da superfície visual. Cada ícone terá `alt` ou texto oculto com o nome da tecnologia.
- O mapa inicial de ícones cobrirá HTML, CSS, JavaScript, React, Node.js, Supabase e GSAP usando Devicon ou Simple Icons.
- Projetos com tecnologia desconhecida usarão um fallback visual neutro com o nome acessível.
- Quando `project.image` estiver vazio, o card usará o fundo escuro atual; quando houver imagem, ela ocupará o plano de fundo com overlay.
- O empilhamento sticky e a animação de profundidade funcionarão também no mobile.

## Processo

- Cada uma das seis etapas terá uma fotografia distinta:
  1. Descoberta — pesquisa, conversa ou levantamento de necessidades.
  2. Estratégia — planejamento, notas ou organização de prioridades.
  3. Design — wireframes, interface ou prototipação.
  4. Desenvolvimento — código e implementação.
  5. Validação — testes, revisão ou controle de qualidade.
  6. Entrega e evolução — lançamento, acompanhamento ou crescimento.
- As etapas ocuparão o mesmo palco visual e serão trocadas conforme a rolagem.
- Em cada transição, a etapa ativa perde opacidade, profundidade e nitidez; a seguinte entra na mesma posição e assume o foco.
- A seção ficará fixada até que todas as seis etapas sejam apresentadas, tanto no desktop quanto no mobile.
- A barra de progresso acompanhará a etapa ativa.
- Sem GSAP ou com movimento reduzido, os seis cards aparecerão em fluxo vertical normal.

## FAQ

A terceira pergunta continuará com o mesmo texto, mas seu conteúdo será envolvido por um único elemento de texto. O ícone permanecerá como o segundo item do botão, eliminando o espaçamento irregular criado pelos elementos internos da marca RSoftware.

## WhatsApp

- Número: `+5591984536649`.
- Mensagem de encaminhamento para todos os links de WhatsApp: `Olá! Vim pelo site da RSoftware e gostaria de ter um forte posicionamento online.`
- O botão de envio do formulário não será convertido em link de WhatsApp e manterá seu fluxo e estilo atuais.
- Os demais CTAs de WhatsApp usarão fundo `#25D366`, texto branco e o logotipo branco do WhatsApp.
- A legenda do CTA da seção Contato será `Falar no WhatsApp`.
- Será adicionado um botão circular flutuante no canto inferior direito com `position: fixed`, respeitando `env(safe-area-inset-right)`, `env(safe-area-inset-bottom)` e o espaçamento lateral do site.
- O botão flutuante terá rótulo acessível, foco visível, abrirá em nova aba e ficará acima do conteúdo sem encobrir o menu mobile.
- Todos os links serão produzidos pela função central existente de URL do WhatsApp, com número sanitizado e mensagem codificada.

## Arquitetura de animação

O arquivo de animações será dividido em funções internas independentes:

- `initServiceStack()` — entrada e profundidade dos serviços.
- `initSkillsOverlay()` — pinning e encaixe dos quatro pares de Skills.
- `initProjectStack()` — entrada e profundidade dos projetos.
- `initProcessSequence()` — pinning, transições e progresso do Processo.

`initAnimations()` continuará sendo o único ponto público de inicialização. Cada função validará a presença dos elementos e retornará silenciosamente quando a seção não existir. ScrollTriggers serão reconstruídos quando os breakpoints alterarem a geometria relevante.

## Responsividade e acessibilidade

- Serviços, Skills, Projetos e Processo manterão suas narrativas de rolagem no mobile.
- Os tamanhos e durações serão reduzidos em telas baixas para evitar conteúdo cortado.
- Nenhuma informação existirá somente dentro de uma imagem.
- Conteúdo encoberto durante sequências fixadas não deverá receber foco indevido.
- Links e botões manterão área de toque mínima de 44 px e estados de foco visíveis.
- O botão flutuante respeitará safe areas e não ficará sob o footer ou o menu mobile.
- `prefers-reduced-motion` removerá pinning, blur, rotação e scrub das seções, mantendo o conteúdo em fluxo normal. O vídeo continuará ativo por decisão do usuário.

## Desempenho e falhas

- O vídeo local tem aproximadamente 1,7 MB e usa H.264; não será transcodificado nesta alteração.
- Fotografias do Unsplash usarão parâmetros de largura, qualidade e formato automático.
- Imagens fora da primeira viewport usarão carregamento tardio.
- Gradientes e cores de fundo garantirão legibilidade se uma imagem externa falhar.
- A remoção de Three.js evita carregar uma biblioteca e uma cena que deixam de ser usadas.
- Nenhuma animação impedirá acesso ao conteúdo quando JavaScript ou GSAP falharem.

## Testes e validação

O desenvolvimento seguirá TDD. Antes das alterações de produção, serão criados testes que falhem pelos motivos esperados para:

- número e mensagem codificados do WhatsApp;
- marcação do vídeo com reprodução silenciosa e contínua;
- remoção da inicialização Three.js do hero;
- estrutura de imagens nos cards de Serviços e Processo;
- renderização dos ícones de tecnologia dos Projetos;
- estrutura normalizada da terceira pergunta do FAQ;
- configuração e estados essenciais das quatro sequências de animação;
- presença e acessibilidade do botão flutuante.

Ao final serão executados todos os testes Node, checagem de sintaxe dos módulos, `git diff --check`, revisão de código e uma requisição HTTP local com resposta não-erro. Testes visuais em navegador não fazem parte deste escopo, pois não foram solicitados.

## Entrega e publicação

A implementação será registrada em commits locais após validação. Como este é um Site existente, a versão online só será atualizada após um pedido explícito do usuário para publicar.
