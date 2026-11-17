# Plano de design: portfólio do Igor

Documento de referência para quem trabalha no site (pessoas e agentes). Leia antes de mexer no layout.

## Conceito: "credencial de evento"

O site funciona como o programa de um evento ao vivo em que o Igor é a atração principal. O nome aparece enorme como num cartaz, os projetos entram como as "baterias" do evento e as certificações viram **credenciais de acesso**, com furo de cordão, emissor e número da credencial. A metáfora sai do próprio conteúdo: certificação = credencial.

Referência de energia: landonorris.com (fundo escuro, tipografia gigante condensada, um neon só, movimento forte). Não copiamos marca, cor, capacete, fotos nem textos de lá. O neon do Lando é verde-limão. O nosso é **rosa-volt**.

## Tokens (em `css/tokens.css`)

| Nome | Hex | Uso |
|---|---|---|
| `--preto` | `#000000` | fundo da página. Preto puro de propósito, sem cinza-azulado |
| `--grafite` | `#17181D` | superfícies: credenciais, visualizador, linhas da timeline |
| `--fumaca` | `#8E909A` | texto secundário (contraste 6.4:1 sobre o preto) |
| `--giz` | `#F2F1EE` | texto principal |
| `--volt` | `#FF2E93` | o único destaque (contraste 5.9:1 sobre o preto). Usar com moderação |
| `--volt-tinta` | `#000000` | texto sobre fundo volt |

Regra do neon: o volt aparece em **um só elemento grande por tela** (o nome no loader, a faixa do marquee, a linha em hover, o foco). Nunca vira gradiente nem degradê de fundo.

## Tipografia

- **Sofia Sans Extra Condensed** (Google Fonts, eixo `wght` 100–900; trocada da Big Shoulders porque o M dela parecia cortado em tamanho grande): toda a tipografia display. Nome, títulos de seção, nomes de projetos e o rodapé gigante. Caixa alta só na display, nunca em rótulos pequenos.
- **Archivo** (eixos `wght` e `wdth`): corpo, botões, metadados. Rótulos em caixa normal (sentence case).
- Sem fonte monoespaçada.

Escala (razão 1.333 a partir de 1rem = 17px no desktop e 16px no celular): `--t-1` 0.75rem, `--t0` 1rem, `--t1` 1.333rem, `--t2` 1.777rem, `--t3` 2.369rem, `--t4` clamp(3rem, 9vw, 8rem), `--t-mega` clamp(5rem, 22vw, 26rem).
Entrelinha do corpo 1.55, da display 0.82 a 0.9. Linhas de texto com no máximo 64ch.

## Layout

Tudo alinhado à esquerda numa grade de 12 colunas, com gutter de 16px no celular e `clamp(16px, 4vw, 56px)` no desktop. O nome do hero e o rodapé ocupam a largura inteira, de borda a borda.

```
HERO                         PROJETOS (linhas, não cards)
┌──────────────────────┐     ┌──────────────────────────────┐
│ Igor          Menu ● │     │ [Todos] [Next.js] [Godot]…   │
│                      │     │ COZY WORLD ━━━━━━━━━ 2026    │  ← destaque: linha alta com imagem
│ IGOR                 │     │ LAVA JATO ━━━━━━━━━━ 2026    │
│ GUERRA               │     │ ECOCITY ━━━━━━━━━━━━ 2025    │
│ Dev full stack…      │     │ projeto de exemplo ─ ─ ─     │  ← secundários: linha baixa
│ Role para ver ↓      │     └──────────────────────────────┘
└──────────────────────┘     hover: a linha enche de volt, o texto fica preto
                             e a imagem do projeto acompanha o cursor

CERTIFICAÇÕES = credenciais    CURRÍCULO
┌──○──┐ ┌──○──┐ ┌──○──┐         [PT  Ver | Baixar]  [EN  Ver | Baixar]
│NOME │ │NOME │ │NOME │         2026 ┃ cargo, empresa
│emiss│ │emiss│ │emiss│         2024 ┃ formação
│ID…  │ │ID…  │ │ID…  │
└─────┘ └─────┘ └─────┘
```

## Movimento

O momento marcante é **um só**: o nome do hero entra com o peso variável indo de 100 a 900 em batida (o loader termina nele) e, ao rolar, o peso afina de volta enquanto o nome sobe. O resto é discreto:

- loader de no máximo 1.2s;
- revelação ao rolar apenas nos títulos de seção e nas linhas de projeto (máscara de baixo para cima), não em todo parágrafo;
- marquee contínuo com as habilidades;
- hover forte nas linhas de projeto e nas credenciais (a credencial gira levemente e o furo do cordão acende em volt).

Com `prefers-reduced-motion: reduce`, nada se move sozinho: sem marquee animado (vira texto estático), sem loader animado, sem morph de peso, sem cursor customizado e com revelações já visíveis.

## Regras anti-template

- Sem rótulo em caixa alta acima dos títulos, sem "01 / 02" (exceto anos na timeline, que são sequência real).
- Sem metadados separados por "·": use quebra de linha ou vírgula.
- Sem "→" no fim de links e botões.
- Sem sombra cinza genérica nem um border-radius único em tudo. Credenciais têm cantos de 14px, botões são retos.
- Textos em português, voz ativa, botões dizem o que fazem ("Ver", "Baixar", "Verificar").

## Arquivos e donos

| Arquivo | Conteúdo |
|---|---|
| `data.js` | **todo o conteúdo**. É o único arquivo que o Igor edita |
| `index.html` | estrutura e pontos de montagem (`#hero`, `#sobre`, `#projetos`, `#curriculo`, `#certificacoes`, `#contato`) |
| `css/tokens.css` | tokens acima |
| `css/base.css` + `js/main.js` | shell: hero, sobre, contato, rodapé, loader, menu, marquee, cursor, revelações |
| `css/projetos.css` + `js/projetos.js` | seção de projetos e filtro |
| `css/documentos.css` + `js/documentos.js` | currículo, timeline, certificações e visualizador de PDF e imagem |

Ordem dos scripts (todos com `defer`): `data.js`, `projetos.js`, `documentos.js`, `main.js`. Os módulos de seção renderizam no carregamento. O `main.js` roda por último e liga as revelações e o cursor no que já está na página.

Contratos compartilhados:
- Elemento com `data-reveal` ganha a classe `.is-in` quando entra na tela (o `main.js` cuida disso).
- O cursor customizado cresce sobre `a, button, [data-cursor]`. Use `data-cursor="Ver"` para mostrar um texto dentro do cursor.
- `window.PORTFOLIO` (definido em `data.js`) é a única fonte de conteúdo.

---

## Revisão 2 (feedback do Igor, vale por cima do que estiver acima)

O Igor achou a navegação ruim, não gostou de como os projetos aparecem nem do rosa, e mandou o currículo real. Mudanças:

**Cores: escuro + azul elétrico** (tokens em `css/tokens.css`, o rosa saiu):
`--preto #0A0A0A` fundo, `--grafite #151619` superfícies, `--grafite-2 #22242A` bordas, `--fumaca #9A9CA5` texto secundário, `--giz #EDEDED` texto, `--destaque #2F6BFF` para preenchimentos, barras e foco, `--destaque-texto #6E97FF` para **texto e linhas finas** em azul sobre o fundo escuro (o #2F6BFF não passa AA como texto pequeno), `--destaque-tinta #FFFFFF` para texto sobre fundo azul.
A variável antiga `--volt` foi renomeada para `--destaque` em todos os arquivos.

**Navegação: barra fixa com links.** O menu em tela cheia sai. Topo fixo com "Igor Romero" à esquerda e os links Sobre, Projetos, Currículo, Certificações e Contato sempre visíveis no desktop, com a seção atual marcada (barra azul embaixo e `aria-current="true"`), via IntersectionObserver. Fundo do topo sólido ou com blur leve, legível sobre qualquer seção. No celular (< 900px), botão "Menu" que abre um painel simples (lista grande de links, sem cortina dramática), com Esc, foco preso e foco de volta. Rolar até a seção tem que compensar a altura do topo (`scroll-margin-top`).

**Projetos: grade de cards com imagem sempre visível.** Nada de imagem que só aparece no hover. Cada card mostra imagem 16:10, categoria (Produto ou Faculdade), ano, nome, descrição, tecnologias e botões claros: "Ver online", "Ver código" (ou o texto "Código privado") e o link `extra` (ex.: "Ver vídeo", "Abrir no Colab"). Os de `destaque: true` vêm primeiro e ocupam mais espaço (ex.: o primeiro ocupa 2 colunas no desktop, ou os 3 destaques numa fileira maior). Grade de 3 colunas no desktop, 2 no tablet e 1 no celular. Filtro por tecnologia continua. Hover discreto e claro: borda azul, leve zoom na imagem. Todo o card não precisa ser um link, mas os botões precisam ser grandes e óbvios.

**Novos campos em `data.js`** (os módulos precisam suportar):
- `pessoa.disponivelTexto`, `sobre.idiomas[]` ({idioma, nivel}).
- Projeto: `categoria`, `extra` ({rotulo, url} ou null), `pendente` (texto).
- Linha do tempo: `inicio` pode ser null, `periodo` (texto que substitui o período calculado), `pendente`.
- Certificação: `status` ("concluida" | "andamento"), `data`/`credencial`/`arquivo`/`verificar` podem ser null (esconder a linha correspondente), `pendente`.
- Qualquer item com `pendente: "texto"` mostra uma etiqueta "A confirmar" com o texto em `title` e numa linha pequena visível, para o Igor saber o que falta preencher.
- `contato.linkedin` pode ser null (esconder).
- `curriculo.arquivos` pode ter 1 item só (bloco único, sem buraco na grade).

---

## Revisão 3 (vale por cima de tudo acima)

O Igor pediu para tirar a navegação ("fica toda bugada") e algo com mais cara de evento. Os bugs eram de rolagem: topo fixo aparecendo no meio da tela, faixas pretas no celular (revelações com `opacity: 0` + `clip-path`) e coisas animando sem parar.

**Shell sem navegação.** Fixo só nos cantos: "IGOR ROMERO" à esquerda (volta ao topo) e o botão azul "Fale comigo" à direita (vai a `#contato`). Sem barra, sem menu, sem "seção atual". O `<header class="cantos">` é filho direto do `<body>` e nenhum ancestral tem `transform`, `filter` ou `backdrop-filter`. "Pular para o conteúdo" continua.

**Rolagem.** Lenis 1.1.13 (unpkg, CSS recomendado embutido no `base.css`), só com mouse/trackpad e sem movimento reduzido; em toque fica a rolagem nativa. Âncoras passam por `window.rolarPara()` (Lenis ou `scrollTo`). O visualizador recebe `data-lenis-prevent` e o Lenis para enquanto ele está aberto.

**Um laço de quadro só.** `main.js` roda um `requestAnimationFrame` por evento de rolagem/resize; módulos se registram em `window.efeitosRolagem` com `{ medir(), quadro(estado) }`. Parada a página, nada se move (a faixa azul também anda com a rolagem, não com o relógio). Tudo que se move usa `transform`; o CSS nunca esconde conteúdo à espera de JS, e os estados de movimento só existem com `html.movimento`.

**Sequência.**
1. Hero preso (240svh, 200svh no celular): IGOR / ROMERO de borda a borda, ROMERO encostado à direita (uma linha só em tela muito baixa e larga). Ao rolar, as duas palavras se afastam, o nome encolhe e sai, e o resumo sobe até o centro.
2. Faixa azul inclinada (-3°) com as habilidades.
3. Sobre: título gigante, `sobre.texto[0]` como frase grande que acende palavra por palavra (as apagadas ficam cinza, nunca invisíveis), depois o resto do texto, habilidades e idiomas.
4. Projetos: no desktop (≥ 1024px, sem movimento reduzido) o palco prende e a faixa de cards anda na horizontal; a altura da seção = altura do palco + (largura da faixa − largura da janela), recalculada no resize e no filtro. Barra azul de progresso embaixo. Foco por teclado num card fora da tela rola até ele. Abaixo disso, lista vertical de cards (1/2/3 colunas). Filtro: Todos + 6 tecnologias mais comuns + seletor "Mais". O último item convida para o GitHub.
5. Currículo e certificações (lógica intacta, títulos gigantes).
6. Contato: e-mail encaixado de borda a borda, Copiar e-mail, GitHub, WhatsApp (LinkedIn só se existir). Rodapé com o nome de borda a borda em azul.

**Títulos de seção** em tamanho de cartaz (`min(15vw, 15rem)`, sem quebra) entram deslizando da direita ligados à rolagem.

**Movimento reduzido:** sem Lenis, sem hero preso, sem faixa horizontal (vira lista), faixa azul reta e estática, frase toda acesa, sem loader e sem cursor.

**Cursor:** a posição vai na propriedade `translate` (a `scale` do CSS multiplicava o `transform` e deixava o ponto longe do mouse).

**Prova de rolagem:** Playwright com `mouse.wheel` em passos de 600px (o Chromium do Playwright dobra o delta, então o script pede 300), 1440x900 e 390x844 com toque, com e sem movimento reduzido; screenshot por passo, folha de miniaturas e checagens de topo em 0, `scrollWidth`, console e 404.
