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

- **Big Shoulders Display** (Google Fonts, eixo `wght` 100–900): toda a tipografia display. Nome, títulos de seção, nomes de projetos e o rodapé gigante. Caixa alta só na display, nunca em rótulos pequenos.
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
