/*
 * Seção de projetos: filtro por tecnologia + grade de cards (DESIGN.md, Revisão 2).
 * Conteúdo vem de window.PORTFOLIO.projetos.
 */
(function () {
  "use strict";

  const secao = document.getElementById("projetos");
  const dados = window.PORTFOLIO && window.PORTFOLIO.projetos;
  if (!secao || !Array.isArray(dados)) return;

  const TODOS = "__todos__";

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

  const titulo = el("h2", { id: "projetos-titulo", class: "titulo-secao", "data-reveal": true, text: "Projetos" });

  const filtro = el("div", { class: "projetos-filtro", role: "group", "aria-label": "Filtrar projetos por tecnologia" });
  const botoes = [TODOS, ...tecnologias].map((t) =>
    el("button", {
      type: "button",
      class: "projetos-filtro__botao",
      "data-tec": t,
      "aria-pressed": t === TODOS ? "true" : "false",
      text: t === TODOS ? "Todos" : t,
    })
  );
  filtro.append(...botoes);

  const status = el("p", { class: "projetos-status", "aria-live": "polite", "aria-atomic": "true" });

  const grade = el("ul", { class: "projetos-grade", role: "list" });
  const cards = projetos.map(montarCard);
  grade.append(...cards.map((c) => c.li));

  const vazioTexto = el("p", { class: "projetos-vazio__texto" });
  const vazioBotao = el("button", { type: "button", class: "botao botao--contorno", text: "Ver todos" });
  const vazio = el("div", { class: "projetos-vazio", hidden: true }, vazioTexto, vazioBotao);

  const topo = el("div", { class: "projetos-topo" }, filtro, status);
  secao.replaceChildren(titulo, topo, grade, vazio);

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
            el("img", { src: p.imagem.src, alt: p.imagem.alt || "", width: "1600", height: "1000", loading: "lazy", decoding: "async" })
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
      ? el("p", { class: "card-projeto__tec" }, el("span", { class: "card-projeto__oculto", text: "Tecnologias: " }), p.tecnologias.join(", "))
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
      { class: "card-projeto" + (p.destaque ? " card-projeto--destaque" : ""), "data-reveal": true },
      el("article", { class: "card-projeto__artigo", "aria-labelledby": nomeId }, figura, corpo)
    );
    return { li, p };
  }

  /* ---------- filtro ---------- */

  function aplicarFiltro(tec) {
    botoes.forEach((b) => b.setAttribute("aria-pressed", b.dataset.tec === tec ? "true" : "false"));

    let visiveis = 0;
    const destaquesVisiveis = [];
    cards.forEach(({ li, p }) => {
      const mostra = tec === TODOS || (p.tecnologias || []).includes(tec);
      const estavaOculto = li.hidden;
      li.hidden = !mostra;
      li.classList.remove("card-projeto--largo");
      if (mostra) {
        visiveis++;
        if (p.destaque) destaquesVisiveis.push(li);
        // card que volta a aparecer não pode ficar preso no estado "antes da revelação"
        if (estavaOculto) li.classList.add("is-in");
      }
    });
    // Com número ímpar de destaques, o primeiro ocupa a largura toda e os outros ficam em pares.
    if (destaquesVisiveis.length % 2 === 1) destaquesVisiveis[0].classList.add("card-projeto--largo");

    // Sem card sobrando sozinho na última fileira dos comuns.
    const comuns = cards.filter(({ li, p }) => !li.hidden && !p.destaque).map(({ li }) => li);
    comuns.forEach((li) => li.classList.remove("card-projeto--metade", "card-projeto--fim-tablet"));
    const resto = comuns.length % 3; // desktop: 3 por fileira
    const metades = resto === 1 && comuns.length >= 4 ? 4 : resto === 2 ? 2 : resto === 1 ? 1 : 0;
    comuns.slice(comuns.length - metades).forEach((li) => li.classList.add("card-projeto--metade"));
    if (comuns.length % 2 === 1) comuns[comuns.length - 1].classList.add("card-projeto--fim-tablet"); // tablet: 2 por fileira

    status.textContent = tec === TODOS ? plural(visiveis) : `${plural(visiveis)} com ${tec}`;

    const semResultado = visiveis === 0;
    grade.hidden = semResultado;
    vazio.hidden = !semResultado;
    if (semResultado) vazioTexto.textContent = `Nenhum projeto com ${tec}. Escolha outra tecnologia ou veja todos.`;

    window.observarRevelacoes?.(secao);
  }

  filtro.addEventListener("click", (ev) => {
    const b = ev.target.closest("button[data-tec]");
    if (b) aplicarFiltro(b.dataset.tec);
  });

  vazioBotao.addEventListener("click", () => {
    aplicarFiltro(TODOS);
    botoes[0].focus();
  });

  aplicarFiltro(TODOS);
})();
