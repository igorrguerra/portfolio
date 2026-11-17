/*
 * Seção de projetos: filtro por tecnologia + lista em linhas.
 * Conteúdo vem de window.PORTFOLIO.projetos. Veja DESIGN.md.
 */
(function () {
  "use strict";

  const secao = document.getElementById("projetos");
  const dados = window.PORTFOLIO && window.PORTFOLIO.projetos;
  if (!secao || !Array.isArray(dados)) return;

  const TODOS = "__todos__";
  const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
  const ponteiroFino = window.matchMedia("(hover: hover) and (pointer: fine)");

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
      if (f === null || f === undefined || f === false) return;
      n.append(f instanceof Node ? f : document.createTextNode(String(f)));
    });
    return n;
  }

  const plural = (n) => (n === 1 ? "1 projeto" : `${n} projetos`);

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

  const lista = el("ol", { class: "projetos-lista", role: "list" });
  const linhas = projetos.map(montarLinha);
  lista.append(...linhas.map((l) => l.li));

  const vazioTexto = el("p", { class: "projetos-vazio__texto" });
  const vazioBotao = el("button", { type: "button", class: "botao", text: "Ver todos" });
  const vazio = el("div", { class: "projetos-vazio", hidden: true }, vazioTexto, vazioBotao);

  const topo = el("div", { class: "projetos-topo" }, filtro, status);
  secao.replaceChildren(titulo, topo, lista, vazio);

  /* ---------- linha de projeto ---------- */

  function montarLinha(p) {
    const destaque = Boolean(p.destaque);
    const nomeId = "projeto-" + String(p.nome).toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const nome = el("h3", { class: "projeto__nome", id: nomeId }, p.nome);
    const cabeca = el(
      "div",
      { class: "projeto__cabeca" },
      nome,
      p.exemplo ? el("span", { class: "etiqueta-exemplo", text: "Exemplo" }) : null
    );

    const ano = el("p", { class: "projeto__ano" }, String(p.ano ?? ""));
    const desc = p.descricao ? el("p", { class: "projeto__desc" }, p.descricao) : null;
    const tecs = (p.tecnologias || []).length
      ? el("p", { class: "projeto__tec" }, el("span", { class: "projeto__oculto", text: "Tecnologias: " }), p.tecnologias.join(", "))
      : null;

    const links = el("ul", { class: "projeto__links", role: "list" });
    if (p.online) {
      links.append(
        el("li", null, el("a", { href: p.online, target: "_blank", rel: "noopener", "data-cursor": "Ver", "aria-describedby": nomeId, class: "projeto__link" }, "Ver online"))
      );
    }
    if (p.codigoPrivado) {
      links.append(el("li", { class: "projeto__privado" }, "Código privado"));
    } else if (p.codigo) {
      links.append(
        el("li", null, el("a", { href: p.codigo, target: "_blank", rel: "noopener", "data-cursor": "Ver", "aria-describedby": nomeId, class: "projeto__link" }, "Ver código"))
      );
    }

    let figura = null;
    if (destaque && p.imagem && p.imagem.src) {
      figura = el(
        "figure",
        { class: "projeto__imagem" },
        el("img", { src: p.imagem.src, alt: p.imagem.alt || "", width: "1600", height: "1000", loading: "lazy", decoding: "async" })
      );
    }

    const li = el(
      "li",
      {
        class: "projeto " + (destaque ? "projeto--destaque" : "projeto--secundario"),
        "data-reveal": true,
      },
      el("span", { class: "projeto__fundo", "aria-hidden": "true" }),
      el(
        "article",
        { class: "projeto__corpo", "aria-labelledby": nomeId },
        cabeca,
        ano,
        desc,
        tecs,
        links.childElementCount ? links : null,
        figura
      )
    );

    if (figura) ligarImagemFlutuante(li, figura);
    return { li, p };
  }

  /* ---------- imagem que segue o cursor (só ponteiro fino) ---------- */

  function ligarImagemFlutuante(li, figura) {
    let alvoX = 0, alvoY = 0, x = 0, y = 0, quadro = 0, ativo = false;

    function limitar(ev) {
      const r = li.getBoundingClientRect();
      const w = figura.offsetWidth;
      const h = figura.offsetHeight;
      // centro da imagem no cursor, sempre dentro da linha
      // (a revelação do main.js usa clip-path na linha e cortaria o que saísse dela)
      alvoX = Math.min(Math.max(ev.clientX - r.left - w / 2, 0), r.width - w);
      alvoY = h >= r.height ? (r.height - h) / 2 : Math.min(Math.max(ev.clientY - r.top - h / 2, 0), r.height - h);
    }

    function passo() {
      x += (alvoX - x) * 0.18;
      y += (alvoY - y) * 0.18;
      figura.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${((alvoX - x) * 0.02).toFixed(2)}deg)`;
      if (ativo && (Math.abs(alvoX - x) > 0.3 || Math.abs(alvoY - y) > 0.3)) {
        quadro = requestAnimationFrame(passo);
      } else {
        quadro = 0;
      }
    }

    li.addEventListener("pointerenter", (ev) => {
      if (!ponteiroFino.matches || ev.pointerType !== "mouse") return;
      limitar(ev);
      if (reduzMovimento.matches) {
        figura.style.transform = "";
        return;
      }
      // entra já no lugar do cursor, sem atravessar a linha
      x = alvoX;
      y = alvoY;
      ativo = true;
      li.classList.add("is-seguindo");
      if (!quadro) quadro = requestAnimationFrame(passo);
    });

    li.addEventListener("pointermove", (ev) => {
      if (!ativo) return;
      limitar(ev);
      if (!quadro) quadro = requestAnimationFrame(passo);
    });

    li.addEventListener("pointerleave", () => {
      ativo = false;
      if (quadro) cancelAnimationFrame(quadro);
      quadro = 0;
      li.classList.remove("is-seguindo");
      figura.style.transform = "";
    });
  }

  /* ---------- filtro ---------- */

  function aplicarFiltro(tec) {
    botoes.forEach((b) => b.setAttribute("aria-pressed", b.dataset.tec === tec ? "true" : "false"));

    let visiveis = 0;
    linhas.forEach(({ li, p }) => {
      const mostra = tec === TODOS || (p.tecnologias || []).includes(tec);
      const estavaOculto = li.hidden;
      li.hidden = !mostra;
      if (mostra) {
        visiveis++;
        // itens que voltam a aparecer não podem ficar presos no estado "antes da revelação"
        if (estavaOculto) li.classList.add("is-in");
      }
    });

    status.textContent = tec === TODOS ? plural(visiveis) : `${plural(visiveis)} com ${tec}`;

    const semResultado = visiveis === 0;
    lista.hidden = semResultado;
    vazio.hidden = !semResultado;
    if (semResultado) {
      vazioTexto.textContent = `Nenhum projeto com ${tec}. Escolha outra tecnologia ou veja todos.`;
    }
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
