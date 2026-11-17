/*
 * Seção de projetos (DESIGN.md, Revisão 3).
 * Desktop (>= 1024px) com movimento: a seção prende (sticky) e a faixa de cards
 * anda na horizontal conforme a rolagem vertical. A altura da seção sai da
 * largura da faixa e é recalculada no resize e no filtro.
 * Abaixo de 1024px ou com movimento reduzido: lista vertical normal de cards.
 * Conteúdo vem de window.PORTFOLIO.projetos. O quadro de animação é o laço único
 * do main.js (window.efeitosRolagem).
 */
(function () {
  "use strict";

  const secao = document.getElementById("projetos");
  const dados = window.PORTFOLIO && window.PORTFOLIO.projetos;
  if (!secao || !Array.isArray(dados)) return;

  const github = window.PORTFOLIO.contato && window.PORTFOLIO.contato.github;
  const TODOS = "__todos__";
  const VISIVEIS_NO_FILTRO = 6;
  const mqFaixa = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");

  // Destaques primeiro, mantendo a ordem do data.js dentro de cada grupo.
  const projetos = dados
    .map((p, i) => ({ p, i }))
    .sort((a, b) => (b.p.destaque ? 1 : 0) - (a.p.destaque ? 1 : 0) || a.i - b.i)
    .map(({ p }) => p);

  // Tecnologias ordenadas por frequência (empate: ordem alfabética).
  const contagem = new Map();
  projetos.forEach((p) => (p.tecnologias || []).forEach((t) => contagem.set(t, (contagem.get(t) || 0) + 1)));
  const tecnologias = [...contagem.keys()].sort(
    (a, b) => contagem.get(b) - contagem.get(a) || a.localeCompare(b, "pt-BR")
  );
  const principais = tecnologias.slice(0, VISIVEIS_NO_FILTRO);
  const outras = tecnologias.slice(VISIVEIS_NO_FILTRO);

  function el(tag, attrs, ...filhos) {
    const n = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === null || v === undefined || v === false) continue;
        if (k === "class") n.className = v;
        else if (k === "text") n.textContent = v;
        else n.setAttribute(k, v === true ? "" : v);
      }
    }
    filhos.flat().forEach((f) => {
      if (f === null || f === undefined || f === false || f === "") return;
      n.append(f instanceof Node ? f : document.createTextNode(String(f)));
    });
    return n;
  }

  const plural = (n) => (n === 1 ? "1 projeto" : `${n} projetos`);
  const slug = (s) =>
    "projeto-" + String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  /* ---------- estrutura ---------- */

  const titulo = el("h2", { id: "projetos-titulo", class: "titulo-secao projetos__titulo", text: "Projetos" });

  // Filtro compacto: Todos + as 6 tecnologias mais comuns + um seletor "Mais".
  const filtro = el("div", { class: "projetos-filtro", role: "group", "aria-label": "Filtrar projetos por tecnologia" });
  const botoes = [TODOS, ...principais].map((t) =>
    el("button", {
      type: "button",
      class: "projetos-filtro__botao",
      "data-tec": t,
      "aria-pressed": t === TODOS ? "true" : "false",
      text: t === TODOS ? "Todos" : t,
    })
  );
  filtro.append(...botoes);

  let seletor = null;
  if (outras.length) {
    seletor = el(
      "select",
      { class: "projetos-filtro__mais", "aria-label": "Mais tecnologias" },
      el("option", { value: "", text: "Mais" }),
      outras.map((t) => el("option", { value: t, text: t }))
    );
    filtro.append(seletor);
  }

  const status = el("p", { class: "projetos-status", "aria-live": "polite", "aria-atomic": "true" });

  const trilho = el("ul", { class: "projetos__trilho", role: "list" });
  const cards = projetos.map(montarCard);
  trilho.append(...cards.map((c) => c.li));

  let fim = null;
  if (github) {
    fim = el(
      "li",
      { class: "projetos__fim" },
      el("p", { class: "projetos__fim-texto", text: "Tem mais código no GitHub" }),
      el("a", { class: "botao botao--cheio", href: github, target: "_blank", rel: "noopener", text: "Abrir GitHub" })
    );
    trilho.append(fim);
  }

  const janela = el("div", { class: "projetos__janela" }, trilho);
  const barra = el("span", { class: "projetos__barra" });
  const progresso = el("div", { class: "projetos__progresso", "aria-hidden": "true" }, barra);

  const vazioTexto = el("p", { class: "projetos-vazio__texto" });
  const vazioBotao = el("button", { type: "button", class: "botao botao--contorno", text: "Ver todos" });
  const vazio = el("div", { class: "projetos-vazio", hidden: true }, vazioTexto, vazioBotao);

  const cabeca = el("div", { class: "projetos__cabeca" }, titulo, el("div", { class: "projetos__controles" }, filtro, status));
  const palco = el("div", { class: "projetos__palco" }, cabeca, janela, vazio, progresso);
  secao.replaceChildren(palco);

  /* ---------- card ---------- */

  function link(href, texto, classe, nomeId) {
    return el(
      "a",
      { href, class: "botao " + classe, target: "_blank", rel: "noopener", "data-cursor": "Ver", "aria-describedby": nomeId },
      texto
    );
  }

  function montarCard(p) {
    const nomeId = slug(p.nome);

    const figura =
      p.imagem && p.imagem.src
        ? el(
            "figure",
            { class: "card-projeto__imagem" },
            el("img", { src: p.imagem.src, alt: p.imagem.alt || "", width: "1600", height: "1000", decoding: "async" })
          )
        : el("div", { class: "card-projeto__imagem card-projeto__imagem--vazia", "aria-hidden": "true" });

    const meta = el(
      "p",
      { class: "card-projeto__meta" },
      p.categoria ? el("span", { class: "card-projeto__categoria" }, p.categoria) : null,
      p.ano ? el("span", { class: "card-projeto__ano" }, String(p.ano)) : null
    );

    const etiquetas = [];
    if (p.exemplo) etiquetas.push(el("span", { class: "etiqueta-exemplo", text: "Exemplo" }));
    if (p.pendente) etiquetas.push(el("span", { class: "etiqueta-pendente", title: p.pendente, text: "A confirmar" }));

    const nome = el("h3", { class: "card-projeto__nome", id: nomeId }, p.nome);
    const desc = p.descricao ? el("p", { class: "card-projeto__desc" }, p.descricao) : null;
    const tecs = (p.tecnologias || []).length
      ? el("p", { class: "card-projeto__tec" }, el("span", { class: "visualmente-oculto", text: "Tecnologias: " }), p.tecnologias.join(", "))
      : null;
    const pendente = p.pendente ? el("p", { class: "card-projeto__pendente" }, p.pendente) : null;

    const acoes = el("div", { class: "card-projeto__acoes" });
    if (p.online) acoes.append(link(p.online, "Ver online", "botao--cheio", nomeId));
    if (p.codigoPrivado) acoes.append(el("span", { class: "card-projeto__privado" }, "Código privado"));
    else if (p.codigo) acoes.append(link(p.codigo, "Ver código", "botao--contorno", nomeId));
    if (p.extra && p.extra.url) acoes.append(link(p.extra.url, p.extra.rotulo || "Abrir", "botao--contorno", nomeId));

    const corpo = el(
      "div",
      { class: "card-projeto__corpo" },
      meta.childElementCount ? meta : null,
      nome,
      etiquetas.length ? el("p", { class: "card-projeto__etiquetas" }, etiquetas) : null,
      desc,
      tecs,
      pendente,
      acoes.childElementCount ? acoes : null
    );

    const li = el(
      "li",
      { class: "card-projeto" + (p.destaque ? " card-projeto--destaque" : "") },
      el("article", { class: "card-projeto__artigo", "aria-labelledby": nomeId }, figura, corpo)
    );
    return { li, p };
  }

  /* ---------- faixa horizontal ---------- */

  let modoFaixa = false;
  let curso = 0; // quanto a faixa anda na horizontal (px) = quanto a seção rola a mais
  let ultimoX = null;

  function aplicarModo() {
    modoFaixa = mqFaixa.matches;
    secao.classList.toggle("projetos--faixa", modoFaixa);
    if (!modoFaixa) {
      secao.style.height = "";
      trilho.style.transform = "";
      barra.style.transform = "";
      curso = 0;
    }
  }

  function medir() {
    if (modoFaixa !== mqFaixa.matches) aplicarModo();
    ultimoX = null;
    if (!modoFaixa) return;
    curso = Math.max(0, Math.ceil(trilho.scrollWidth - janela.clientWidth));
    const alvo = Math.ceil(palco.offsetHeight + curso) + "px";
    if (secao.style.height !== alvo) secao.style.height = alvo;
  }

  function quadro() {
    if (!modoFaixa) return;
    const topo = secao.getBoundingClientRect().top;
    const p = curso ? Math.min(1, Math.max(0, -topo / curso)) : 0;
    const x = Math.round(p * curso);
    if (x === ultimoX) return;
    ultimoX = x;
    trilho.style.transform = `translate3d(${-x}px,0,0)`;
    barra.style.transform = `scaleX(${p.toFixed(4)})`;
  }

  (window.efeitosRolagem = window.efeitosRolagem || []).push({ medir, quadro });

  // Teclado: ao focar um card fora da janela, rola a página até ele aparecer.
  trilho.addEventListener("focusin", (ev) => {
    if (!modoFaixa || !curso) return;
    const item = ev.target.closest(".card-projeto, .projetos__fim");
    if (!item) return;
    const inicio = secao.getBoundingClientRect().top + window.scrollY;
    const alvoX = Math.min(curso, Math.max(0, item.offsetLeft - janela.clientWidth * 0.1));
    rolar(inicio + alvoX, true);
  });

  function rolar(y, imediato) {
    if (window.rolarPara) window.rolarPara(y, { imediato });
    else window.scrollTo(0, y);
  }

  /* ---------- filtro ---------- */

  function aplicarFiltro(tec) {
    botoes.forEach((b) => b.setAttribute("aria-pressed", b.dataset.tec === tec ? "true" : "false"));
    if (seletor) {
      const daLista = outras.includes(tec);
      seletor.value = daLista ? tec : "";
      seletor.classList.toggle("is-ativo", daLista);
    }

    let visiveis = 0;
    cards.forEach(({ li, p }) => {
      const mostra = tec === TODOS || (p.tecnologias || []).includes(tec);
      li.hidden = !mostra;
      if (mostra) visiveis++;
    });

    status.textContent = tec === TODOS ? plural(visiveis) : `${plural(visiveis)} com ${tec}`;

    const semResultado = visiveis === 0;
    janela.hidden = semResultado;
    vazio.hidden = !semResultado;
    if (semResultado) vazioTexto.textContent = `Nenhum projeto com ${tec}. Escolha outra tecnologia ou veja todos.`;

    // A faixa mudou de largura: remede e, se a seção já estava rolada, volta ao primeiro card.
    medir();
    if (modoFaixa && secao.getBoundingClientRect().top < 0) rolar(secao.getBoundingClientRect().top + window.scrollY, true);
    if (window.pedirQuadro) window.pedirQuadro();
  }

  filtro.addEventListener("click", (ev) => {
    const b = ev.target.closest("button[data-tec]");
    if (b) aplicarFiltro(b.dataset.tec);
  });

  if (seletor) {
    seletor.addEventListener("change", () => aplicarFiltro(seletor.value || TODOS));
  }

  vazioBotao.addEventListener("click", () => {
    aplicarFiltro(TODOS);
    botoes[0].focus();
  });

  if (mqFaixa.addEventListener) mqFaixa.addEventListener("change", () => window.medirEfeitos && window.medirEfeitos());

  aplicarModo();
  aplicarFiltro(TODOS);
})();
