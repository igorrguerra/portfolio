/*
 * Currículo, linha do tempo, certificações (credenciais) e visualizador de PDF e imagem.
 * Todo o conteúdo vem de window.PORTFOLIO (data.js). Aqui só ficam rótulos de interface.
 */
(function () {
  "use strict";

  var dados = window.PORTFOLIO || {};
  var MESES = ["jan.", "fev.", "mar.", "abr.", "maio", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
  var EXT_IMAGEM = /\.(png|jpe?g|webp|gif|avif|svg)$/i;

  /* ---------- utilitários ---------- */

  // Cria elemento com atributos e filhos. Texto entra sempre como nó de texto (escapado).
  function el(tag, attrs, filhos) {
    var n = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === "class") n.className = v;
        else if (k === "text") n.textContent = v;
        else n.setAttribute(k, v === true ? "" : v);
      });
    }
    (filhos || []).forEach(function (f) {
      if (f === null || f === undefined || f === false) return;
      n.appendChild(typeof f === "string" ? document.createTextNode(f) : f);
    });
    return n;
  }

  function etiquetaExemplo(item) {
    return item && item.exemplo ? el("span", { class: "etiqueta-exemplo", text: "Exemplo" }) : null;
  }

  // Etiqueta "A confirmar" (texto completo no title) para itens com pendente.
  function etiquetaPendente(item) {
    return item && item.pendente
      ? el("span", { class: "etiqueta-pendente", title: item.pendente, text: "A confirmar" })
      : null;
  }

  // Linha pequena e visível com o que falta preencher.
  function notaPendente(item, classe) {
    return item && item.pendente
      ? el("p", { class: "doc-pendente" + (classe ? " " + classe : "") }, ["Falta: " + item.pendente])
      : null;
  }

  function nomeArquivo(caminho) {
    return String(caminho || "").split("/").pop();
  }

  function formatarData(aaaaMm) {
    var m = /^(\d{4})-(\d{2})/.exec(String(aaaaMm || ""));
    if (!m) return String(aaaaMm || "");
    var i = parseInt(m[2], 10) - 1;
    return (MESES[i] || "") + " " + m[1];
  }

  function vazio(v) {
    return v === null || v === undefined || v === "";
  }

  function periodo(item) {
    if (!vazio(item.periodo)) return String(item.periodo);
    if (vazio(item.inicio)) return vazio(item.fim) ? "Em andamento" : "Até " + item.fim;
    if (vazio(item.fim)) return item.inicio + " até hoje";
    if (String(item.fim) === String(item.inicio)) return String(item.inicio);
    return item.inicio + " a " + item.fim;
  }

  function botaoVer(rotulo, arquivo, titulo, classe) {
    var b = el("button", {
      type: "button",
      class: classe,
      "data-cursor": "Ver",
      "data-arquivo": arquivo,
      "data-titulo": titulo,
      text: rotulo,
    });
    b.addEventListener("click", function () {
      abrirVisualizador(arquivo, titulo, b);
    });
    return b;
  }

  /* ---------- currículo ---------- */

  function montarCurriculo() {
    var secao = document.getElementById("curriculo");
    var cv = dados.curriculo;
    if (!secao || !cv) return;

    // Na página curriculo.html o shell.js já criou o h1 "curriculo-titulo" na abertura.
    var titulo = document.getElementById("curriculo-titulo")
      ? null
      : el("h2", { id: "curriculo-titulo", class: "titulo-secao", text: "Currículo" });

    var listaArquivos = (cv.arquivos || []).filter(function (a) { return a && a.arquivo; });
    var arquivos = el("div", { class: "cv-arquivos" + (listaArquivos.length === 1 ? " cv-arquivos--unico" : "") });
    listaArquivos.forEach(function (a) {
      var tituloDoc = "Currículo em " + a.idioma;
      arquivos.appendChild(
        el("article", { class: "cv-arquivo" }, [
          el("p", { class: "cv-arquivo__sigla", "aria-hidden": "true", text: a.sigla }),
          el("div", { class: "cv-arquivo__info" }, [
            el("h3", { class: "cv-arquivo__idioma", text: a.idioma }),
            etiquetaExemplo(a),
            etiquetaPendente(a),
            el("p", { class: "cv-arquivo__formato", text: "Currículo completo em PDF" }),
            notaPendente(a),
          ]),
          el("div", { class: "cv-arquivo__acoes" }, [
            botaoVer("Ver", a.arquivo, tituloDoc, "botao botao--cheio"),
            el("a", {
              class: "botao botao--contorno",
              href: a.arquivo,
              download: nomeArquivo(a.arquivo),
              "aria-label": "Baixar currículo em " + a.idioma,
              text: "Baixar",
            }),
          ]),
        ])
      );
    });

    var lista = el("ol", { class: "linha-tempo", "aria-label": "Experiência e formação, da mais recente para a mais antiga" });
    (cv.linhaDoTempo || []).forEach(function (item) {
      var formacao = item.tipo === "formacao";
      // Sem ano de início: mostra "Agora" (em andamento) ou o ano de fim no lugar do ano grande.
      var semAno = vazio(item.inicio);
      var marco = !semAno ? String(item.inicio) : vazio(item.fim) ? "Agora" : String(item.fim);
      lista.appendChild(
        el("li", { class: "linha-tempo__item linha-tempo__item--" + (formacao ? "formacao" : "experiencia") }, [
          el("p", { class: "linha-tempo__ano" + (semAno ? " linha-tempo__ano--texto" : ""), "aria-hidden": "true", text: marco }),
          el("div", { class: "linha-tempo__corpo" }, [
            el("p", { class: "linha-tempo__meta" }, [
              el("span", { class: "linha-tempo__tipo", text: formacao ? "Formação" : "Experiência" }),
              el("span", { class: "linha-tempo__periodo", text: periodo(item) }),
              etiquetaExemplo(item),
              etiquetaPendente(item),
            ]),
            el("h3", { class: "linha-tempo__titulo", text: item.titulo }),
            el("p", { class: "linha-tempo__lugar", text: item.lugar }),
            item.descricao ? el("p", { class: "linha-tempo__descricao", text: item.descricao }) : null,
            notaPendente(item),
          ]),
        ])
      );
    });

    secao.textContent = "";
    if (titulo) secao.appendChild(titulo);
    secao.appendChild(arquivos);
    secao.appendChild(el("h3", { class: "linha-tempo__titulo-grupo", text: "Trajetória" }));
    secao.appendChild(lista);
  }

  /* ---------- certificações ---------- */

  function montarCertificacoes() {
    var secao = document.getElementById("certificacoes");
    var certs = dados.certificacoes;
    if (!secao || !certs) return;

    var grade = el("ul", { class: "credenciais" + (certs.length <= 2 ? " credenciais--poucas" : "") });
    certs.forEach(function (c) {
      var andamento = c.status === "andamento";
      var acoes = el("div", { class: "credencial__acoes" }, [
        c.arquivo ? botaoVer("Ver certificado", c.arquivo, c.nome, "botao botao--contorno credencial__ver") : null,
        c.verificar
          ? el("a", {
              class: "credencial__verificar",
              href: c.verificar,
              target: "_blank",
              rel: "noopener noreferrer",
              "aria-label": "Verificar " + c.nome + " (abre em nova aba)",
              text: "Verificar",
            })
          : null,
      ]);

      grade.appendChild(
        el("li", { class: "credencial-cordao" + (andamento ? " credencial-cordao--andamento" : "") }, [
          el("article", { class: "credencial" }, [
            el("span", { class: "credencial__furo", "aria-hidden": "true" }),
            el("div", { class: "credencial__topo" }, [
              c.emissor ? el("p", { class: "credencial__emissor", text: c.emissor }) : null,
              el("div", { class: "credencial__etiquetas" }, [
                andamento ? el("span", { class: "etiqueta-andamento", text: "Em andamento" }) : null,
                etiquetaExemplo(c),
                etiquetaPendente(c),
              ]),
            ]),
            el("h3", { class: "credencial__nome", text: c.nome }),
            el("dl", { class: "credencial__dados" }, [
              el("div", null, [el("dt", { text: "Situação" }), el("dd", { text: andamento ? "Em andamento" : "Concluída" })]),
              c.data ? el("div", null, [el("dt", { text: "Emitida em" }), el("dd", null, [el("time", { datetime: c.data, text: formatarData(c.data) })])]) : null,
              c.credencial ? el("div", null, [el("dt", { text: "Credencial" }), el("dd", { class: "credencial__id", text: c.credencial })]) : null,
            ]),
            notaPendente(c, "credencial__pendente"),
            acoes.childNodes.length ? acoes : null,
          ]),
        ])
      );
    });

    secao.textContent = "";
    // Na página certificacoes.html o shell.js já criou o h1 "certificacoes-titulo" na abertura.
    if (!document.getElementById("certificacoes-titulo")) {
      secao.appendChild(el("h2", { id: "certificacoes-titulo", class: "titulo-secao", text: "Certificações" }));
    }
    secao.appendChild(grade);
  }

  /* ---------- visualizador ---------- */

  var dialogo = document.getElementById("visualizador");
  var quemAbriu = null;
  var partes = null;

  function montarVisualizador() {
    if (!dialogo || partes) return;
    partes = {
      titulo: el("h2", { id: "visualizador-titulo", class: "visualizador__titulo" }),
      abrir: el("a", { class: "visualizador__link", target: "_blank", rel: "noopener", text: "Abrir em nova aba" }),
      baixar: el("a", { class: "botao botao--cheio visualizador__baixar", text: "Baixar" }),
      fechar: el("button", { type: "button", class: "visualizador__fechar", "aria-label": "Fechar visualizador" }, [
        el("span", { "aria-hidden": "true", text: "Fechar" }),
      ]),
      conteudo: el("div", { class: "visualizador__conteudo" }),
    };
    dialogo.textContent = "";
    dialogo.appendChild(
      el("div", { class: "visualizador__caixa" }, [
        el("header", { class: "visualizador__cabecalho" }, [
          partes.titulo,
          el("div", { class: "visualizador__acoes" }, [partes.abrir, partes.baixar]),
          partes.fechar,
        ]),
        partes.conteudo,
      ])
    );

    partes.fechar.addEventListener("click", function () {
      dialogo.close();
    });

    // Clique no fundo (fora da caixa) fecha.
    dialogo.addEventListener("click", function (e) {
      // O <dialog> é transparente e ocupa a tela; a caixa é o filho.
      if (e.target === dialogo) dialogo.close();
    });

    dialogo.addEventListener("close", function () {
      document.documentElement.classList.remove("visualizador-aberto");
      partes.conteudo.textContent = ""; // descarrega o PDF
      if (quemAbriu && typeof quemAbriu.focus === "function") quemAbriu.focus();
      quemAbriu = null;
    });
  }

  function abrirVisualizador(arquivo, titulo, origem) {
    if (!dialogo || typeof dialogo.showModal !== "function") {
      window.open(arquivo, "_blank", "noopener");
      return;
    }
    montarVisualizador();
    quemAbriu = origem || document.activeElement;

    partes.titulo.textContent = titulo;
    partes.abrir.href = arquivo;
    partes.abrir.setAttribute("aria-label", "Abrir " + titulo + " em nova aba");
    partes.baixar.href = arquivo;
    partes.baixar.setAttribute("download", nomeArquivo(arquivo));
    partes.baixar.setAttribute("aria-label", "Baixar " + titulo);

    partes.conteudo.textContent = "";
    if (EXT_IMAGEM.test(arquivo)) {
      partes.conteudo.className = "visualizador__conteudo visualizador__conteudo--imagem";
      partes.conteudo.appendChild(el("img", { src: arquivo, alt: titulo, decoding: "async" }));
    } else {
      partes.conteudo.className = "visualizador__conteudo visualizador__conteudo--pdf";
      partes.conteudo.appendChild(
        el("object", { data: arquivo + "#view=FitH", type: "application/pdf", class: "visualizador__pdf", "aria-label": titulo }, [
          el("div", { class: "visualizador__sem-pdf" }, [
            el("p", { text: "Seu navegador não mostra PDF aqui. Baixe o arquivo." }),
            el("a", { class: "botao botao--cheio", href: arquivo, download: nomeArquivo(arquivo), text: "Baixar PDF" }),
          ]),
        ])
      );
    }

    document.documentElement.classList.add("visualizador-aberto");
    dialogo.showModal();
    partes.fechar.focus();
  }

  /* ---------- início ---------- */

  montarCurriculo();
  montarCertificacoes();
  montarVisualizador();
})();
