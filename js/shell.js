/*
 * Shell do portfólio (Revisão 4): cabeçalho com navegação entre páginas,
 * rodapé, abertura das páginas internas, Sobre e Contato.
 * Carrega antes do script de cada página (projetos.js, documentos.js, home.js).
 * Nada aqui depende de rolagem: sem IntersectionObserver, sem listener de scroll.
 * Todo o conteúdo vem de window.PORTFOLIO (data.js).
 */
(function () {
  "use strict";

  var DADOS = window.PORTFOLIO || {};
  var pessoa = DADOS.pessoa || {};
  var sobre = DADOS.sobre || {};
  var contato = DADOS.contato || {};

  var raiz = document.documentElement;
  raiz.classList.add("js");

  var corpo = document.body;
  var PAGINA = (corpo && corpo.getAttribute("data-pagina")) || "";
  // Prefixo dos links. O 404 pode abrir em qualquer caminho, então usa data-base="/portfolio/".
  var BASE = (corpo && corpo.getAttribute("data-base")) || "";

  var PAGINAS = [
    { id: "inicio", rotulo: "Início", href: "index.html" },
    { id: "sobre", rotulo: "Sobre", href: "sobre.html" },
    { id: "projetos", rotulo: "Projetos", href: "projetos.html" },
    { id: "curriculo", rotulo: "Currículo", href: "curriculo.html" },
    { id: "certificacoes", rotulo: "Certificações", href: "certificacoes.html" },
    { id: "contato", rotulo: "Contato", href: "contato.html" },
  ];

  /* ---------- Utilitários ---------- */
  // Cria elementos sem innerHTML: texto sempre via textContent.
  function el(tag, attrs, filhos) {
    var no = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === "texto") no.textContent = v;
        else if (k === "classe") no.className = v;
        else no.setAttribute(k, v === true ? "" : v);
      });
    }
    (filhos || []).forEach(function (f) {
      if (f === null || f === undefined || f === false) return;
      no.appendChild(typeof f === "string" ? document.createTextNode(f) : f);
    });
    return no;
  }

  function href(p) {
    // O Início com base absoluta vira a própria pasta (/portfolio/), como no GitHub Pages.
    if (BASE && p.id === "inicio") return BASE;
    return BASE + p.href;
  }

  function etiquetaExemplo() {
    return el("span", { classe: "etiqueta-exemplo", texto: "Exemplo" });
  }

  // Etiqueta "A confirmar" + linha pequena com o que falta (campo pendente).
  function pendente(texto) {
    if (!texto) return null;
    return el("div", { classe: "pendente" }, [
      el("span", { classe: "etiqueta-pendente", title: texto, texto: "A confirmar" }),
      el("p", { classe: "nota-pendente", texto: texto }),
    ]);
  }

  function textoDisponivel() {
    return pessoa.disponivelTexto || "Aberto a novos projetos";
  }

  function linkExterno(url, texto, classe) {
    return el("a", { href: url, classe: classe, target: "_blank", rel: "noopener" }, [texto]);
  }

  function nomeCompleto() {
    return [pessoa.nome, pessoa.sobrenome].filter(Boolean).join(" ");
  }

  function px(valor) {
    return parseFloat(valor) || 0;
  }

  function vazio(v) {
    return v === null || v === undefined || v === "";
  }

  function contar(n, um, varios) {
    return n + " " + (n === 1 ? um : varios);
  }

  function juntar(partes) {
    partes = partes.filter(Boolean);
    if (partes.length < 2) return partes.join("");
    return partes.slice(0, -1).join(", ") + " e " + partes[partes.length - 1];
  }

  function linkWhatsapp() {
    if (!contato.whatsapp) return null;
    var num = String(contato.whatsapp).replace(/\D/g, "");
    var msg = contato.mensagemWhatsapp ? "?text=" + encodeURIComponent(contato.mensagemWhatsapp) : "";
    return "https://wa.me/" + num + msg;
  }

  /* ---------- Cabeçalho ---------- */
  // Links comuns entre páginas. A atual vem de body[data-pagina] e ganha aria-current="page".
  // Abaixo de 960px: botão Menu abre uma lista simples logo abaixo do cabeçalho.
  var topo = document.getElementById("topo");
  var mqMenu = window.matchMedia("(max-width: 959px)");
  var botaoMenu = null;
  var nav = null;

  function montarTopo() {
    if (!topo) return;
    var lista = el("ul", { classe: "topo__lista" });
    PAGINAS.forEach(function (p) {
      lista.appendChild(
        el("li", null, [
          el("a", { href: href(p), classe: "topo__link", "aria-current": p.id === PAGINA ? "page" : null }, [p.rotulo]),
        ])
      );
    });
    nav = el("nav", { id: "navegacao", classe: "topo__nav", "aria-label": "Páginas" }, [lista]);
    botaoMenu = el("button", { type: "button", classe: "topo__menu", "aria-expanded": "false", "aria-controls": "navegacao" }, [
      el("span", { classe: "topo__menu-texto", texto: "Menu" }),
      el("span", { classe: "topo__icone", "aria-hidden": "true" }),
    ]);
    var nome = el("a", { href: href(PAGINAS[0]), classe: "topo__nome" }, [nomeCompleto()]);
    topo.replaceChildren(el("div", { classe: "topo__barra" }, [nome, botaoMenu]), nav);

    botaoMenu.addEventListener("click", function () {
      definirMenu(botaoMenu.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuAberto()) {
        definirMenu(false);
        botaoMenu.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (menuAberto() && !topo.contains(e.target)) definirMenu(false);
    });
    var mudou = function () {
      if (!mqMenu.matches) definirMenu(false);
    };
    if (mqMenu.addEventListener) mqMenu.addEventListener("change", mudou);
  }

  function menuAberto() {
    return !!botaoMenu && botaoMenu.getAttribute("aria-expanded") === "true";
  }

  function definirMenu(abrir) {
    if (!botaoMenu) return;
    botaoMenu.setAttribute("aria-expanded", abrir ? "true" : "false");
    botaoMenu.querySelector(".topo__menu-texto").textContent = abrir ? "Fechar" : "Menu";
    topo.classList.toggle("is-aberto", abrir);
  }

  /* ---------- Abertura das páginas internas ---------- */
  // Título display grande + uma linha de contexto, antes da seção da página.
  // O h1 usa o id que a seção já referencia (aria-labelledby="<pagina>-titulo").
  function contextoProjetos() {
    var lista = DADOS.projetos || [];
    if (!lista.length) return "";
    var porCategoria = {};
    lista.forEach(function (p) {
      if (p.categoria) porCategoria[p.categoria] = (porCategoria[p.categoria] || 0) + 1;
    });
    var nomes = { Produto: ["produto", "produtos"], Faculdade: ["trabalho da faculdade", "trabalhos da faculdade"] };
    var partes = Object.keys(porCategoria).map(function (c) {
      var n = nomes[c] || [c.toLowerCase(), c.toLowerCase()];
      return contar(porCategoria[c], n[0], n[1]);
    });
    return contar(lista.length, "projeto", "projetos") + (partes.length ? ": " + juntar(partes) + "." : ".") + " Filtre por tecnologia.";
  }

  function contextoCertificacoes() {
    var lista = DADOS.certificacoes || [];
    if (!lista.length) return "";
    var andamento = lista.filter(function (c) { return c.status === "andamento"; }).length;
    var concluidas = lista.length - andamento;
    return juntar([
      concluidas ? contar(concluidas, "concluída", "concluídas") : "",
      andamento ? andamento + " em andamento" : "",
    ]) + ".";
  }

  function contextoPagina() {
    switch (PAGINA) {
      case "sobre":
        return [pessoa.cargo, pessoa.local].filter(Boolean).join(", em ") + ".";
      case "projetos":
        return contextoProjetos();
      case "curriculo":
        return "Experiência, formação e o currículo em PDF para ver ou baixar.";
      case "certificacoes":
        return contextoCertificacoes();
      case "contato":
        return pessoa.disponivel ? textoDisponivel() + "." : "";
      default:
        return "";
    }
  }

  function montarAbertura() {
    var pagina = null;
    PAGINAS.forEach(function (p) {
      if (p.id === PAGINA && p.id !== "inicio") pagina = p;
    });
    var secao = pagina && document.getElementById(pagina.id);
    if (!secao) return;
    var contexto = contextoPagina();
    var linha = contexto
      ? el("p", { classe: "abertura__contexto" + (PAGINA === "contato" && pessoa.disponivel ? " status" : ""), texto: contexto })
      : null;
    var abertura = el("header", { classe: "abertura" }, [
      el("h1", { id: pagina.id + "-titulo", classe: "titulo-secao abertura__titulo", texto: pagina.rotulo }),
      linha,
    ]);
    secao.parentNode.insertBefore(abertura, secao);
  }

  /* ---------- Sobre ---------- */
  function itensAgora() {
    // Só o que os dados já dizem que está em andamento (linha do tempo sem fim
    // e certificações "andamento"), sem repetir o mesmo título.
    var vistos = {};
    var itens = [];
    var cv = DADOS.curriculo || {};
    (cv.linhaDoTempo || []).forEach(function (item) {
      if (!vazio(item.fim) || !item.titulo || vistos[item.titulo]) return;
      vistos[item.titulo] = true;
      var periodo = !vazio(item.periodo) ? item.periodo : !vazio(item.inicio) ? "Desde " + item.inicio : "Em andamento";
      itens.push({ titulo: item.titulo, lugar: item.lugar, periodo: periodo, pendente: item.pendente });
    });
    (DADOS.certificacoes || []).forEach(function (c) {
      if (c.status !== "andamento" || !c.nome || vistos[c.nome]) return;
      vistos[c.nome] = true;
      itens.push({ titulo: c.nome, lugar: c.emissor, periodo: "Em andamento", pendente: c.pendente });
    });
    return itens;
  }

  function montarSobre() {
    var secao = document.getElementById("sobre");
    if (!secao) return;
    var blocos = [];

    var texto = el(
      "div",
      { classe: "sobre__texto" },
      (sobre.texto || []).map(function (p) {
        return el("p", { texto: p });
      })
    );
    if (sobre.exemplo) texto.appendChild(el("p", null, [etiquetaExemplo()]));
    if (sobre.pendente) texto.appendChild(pendente(sobre.pendente));

    var agora = itensAgora();
    var blocoAgora = null;
    if (agora.length) {
      var lista = el("ul", { classe: "agora__lista", "aria-labelledby": "sobre-agora" });
      agora.forEach(function (a) {
        lista.appendChild(
          el("li", { classe: "agora__item" }, [
            el("p", { classe: "agora__titulo", texto: a.titulo }),
            a.lugar ? el("p", { classe: "agora__lugar", texto: a.lugar }) : null,
            el("p", { classe: "agora__periodo", texto: a.periodo }),
            pendente(a.pendente),
          ])
        );
      });
      blocoAgora = el("div", { classe: "agora" }, [
        el("h2", { id: "sobre-agora", classe: "sobre__subtitulo", texto: "O que estou fazendo agora" }),
        lista,
      ]);
    }
    blocos.push(el("div", { classe: "sobre__grade" }, [texto, blocoAgora]));

    if ((sobre.habilidades || []).length) {
      var habilidades = el("ul", { classe: "habilidades", "aria-labelledby": "sobre-habilidades" });
      sobre.habilidades.forEach(function (h) {
        habilidades.appendChild(el("li", { classe: "habilidades__item", texto: h }));
      });
      blocos.push(
        el("div", { classe: "sobre__bloco" }, [
          el("h2", { id: "sobre-habilidades", classe: "sobre__subtitulo", texto: "Com o que trabalho" }),
          habilidades,
        ])
      );
    }

    if ((sobre.idiomas || []).length) {
      var idiomas = el("ul", { classe: "idiomas", "aria-labelledby": "sobre-idiomas" });
      sobre.idiomas.forEach(function (d) {
        idiomas.appendChild(
          el("li", { classe: "idiomas__item" }, [
            el("span", { classe: "idiomas__nome", texto: d.idioma || "" }),
            d.nivel ? el("span", { classe: "idiomas__nivel", texto: d.nivel }) : null,
          ])
        );
      });
      blocos.push(
        el("div", { classe: "sobre__bloco" }, [
          el("h2", { id: "sobre-idiomas", classe: "sobre__subtitulo", texto: "Idiomas" }),
          idiomas,
        ])
      );
    }

    secao.replaceChildren.apply(secao, blocos);
  }

  /* ---------- Contato ---------- */
  function copiarTexto(texto) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(texto);
    return new Promise(function (ok, falha) {
      var area = el("textarea", { readonly: true, style: "position:fixed;top:0;left:-9999px" });
      area.value = texto;
      document.body.appendChild(area);
      area.select();
      var deu = false;
      try {
        deu = document.execCommand("copy");
      } catch (err) {
        deu = false;
      }
      area.remove();
      if (deu) ok();
      else falha(new Error("cópia indisponível"));
    });
  }

  // E-mail gigante que só quebra depois do "@" (e, se ainda não couber, em qualquer ponto).
  function emailQuebravel(email) {
    var i = email.indexOf("@");
    if (i < 0) return [email];
    return [email.slice(0, i + 1), el("wbr"), email.slice(i + 1)];
  }

  function montarContato() {
    var secao = document.getElementById("contato");
    if (!secao) return;
    var filhos = [];

    if (contato.email) {
      filhos.push(
        el("p", { classe: "contato__email-linha" }, [
          el("a", { href: "mailto:" + contato.email, classe: "contato__email" }, emailQuebravel(contato.email)),
        ])
      );

      var aviso = el("p", { classe: "contato__aviso", role: "status", "aria-live": "polite" });
      var botao = el("button", { type: "button", classe: "botao botao--cheio" }, ["Copiar e-mail"]);
      var timer = 0;
      botao.addEventListener("click", function () {
        copiarTexto(contato.email).then(
          function () {
            // O botão já mostra a confirmação; o aviso só repete para leitores de tela.
            botao.textContent = "E-mail copiado";
            aviso.classList.add("visualmente-oculto");
            aviso.textContent = "E-mail copiado";
          },
          function () {
            aviso.classList.remove("visualmente-oculto");
            aviso.textContent = "Não deu para copiar. Selecione o e-mail acima e copie.";
          }
        );
        clearTimeout(timer);
        timer = setTimeout(function () {
          botao.textContent = "Copiar e-mail";
          aviso.textContent = "";
        }, 2600);
      });
      filhos.push(el("div", { classe: "contato__acoes" }, [botao, contato.exemplo ? etiquetaExemplo() : null, aviso]));
    }

    var redes = el("ul", { classe: "contato__redes" });
    function rede(url, rotulo, detalhe) {
      redes.appendChild(
        el("li", { classe: "contato__item" }, [
          linkExterno(url, rotulo, "contato__rede"),
          detalhe ? el("p", { classe: "contato__detalhe", texto: detalhe }) : null,
        ])
      );
    }
    if (contato.github) rede(contato.github, "GitHub", contato.github.replace(/^https?:\/\//, ""));
    var wa = linkWhatsapp();
    if (wa) rede(wa, "WhatsApp", "Abre a conversa com uma mensagem pronta");
    if (contato.linkedin) rede(contato.linkedin, "LinkedIn", contato.linkedin.replace(/^https?:\/\/(www\.)?/, ""));
    if (redes.children.length) filhos.push(redes);
    if (contato.pendente) filhos.push(pendente(contato.pendente));

    secao.replaceChildren.apply(secao, filhos);
  }

  /* ---------- Rodapé ---------- */
  var rodape = document.getElementById("rodape");
  var rodapeGigante = null;

  function montarRodape() {
    if (!rodape) return;
    rodapeGigante = el("p", { classe: "rodape__gigante", "aria-hidden": "true" }, [el("span", { texto: nomeCompleto() })]);

    var paginas = el("ul", { classe: "rodape__lista" });
    PAGINAS.forEach(function (p) {
      paginas.appendChild(
        el("li", null, [el("a", { href: href(p), classe: "rodape__link", "aria-current": p.id === PAGINA ? "page" : null }, [p.rotulo])])
      );
    });
    if (contato.github) paginas.appendChild(el("li", null, [linkExterno(contato.github, "GitHub", "rodape__link")]));

    rodape.replaceChildren(
      rodapeGigante,
      el("div", { classe: "rodape__base" }, [
        el("nav", { classe: "rodape__nav", "aria-label": "Rodapé" }, [paginas]),
        el("p", { classe: "rodape__direitos", texto: "© " + new Date().getFullYear() + " " + nomeCompleto() }),
      ])
    );
  }

  // O nome grande ocupa a largura do rodapé (medido; não depende de rolagem).
  function encaixarRodape() {
    if (!rodapeGigante) return;
    var linha = rodapeGigante.firstChild;
    var estilo = getComputedStyle(rodape);
    var largura = rodape.clientWidth - px(estilo.paddingLeft) - px(estilo.paddingRight);
    rodapeGigante.style.setProperty("--rodape-tam", "100px");
    var medida = linha.getBoundingClientRect().width;
    if (!medida || !largura) return;
    rodapeGigante.style.setProperty("--rodape-tam", Math.floor(((100 * largura) / medida) * 0.99 * 10) / 10 + "px");
  }

  /* ---------- Títulos display: quebra só em espaços ---------- */
  // O navegador quebra linha depois de "-" (FRONT-END). Envolver a palavra
  // em .sem-quebra (white-space: nowrap) deixa só os espaços como quebra.
  var SELETOR_DISPLAY = ".titulo-secao, .projeto__nome, .credencial__nome, h1, h2, h3, h4";

  function protegerHifens(raizBusca) {
    var base = raizBusca || document;
    var alvos = Array.prototype.slice.call(base.querySelectorAll(SELETOR_DISPLAY));
    if (base.matches && base.matches(SELETOR_DISPLAY)) alvos.push(base);
    alvos.forEach(function (t) {
      if (t.closest(".sem-quebra") || getComputedStyle(t).fontFamily.indexOf("Sofia Sans Extra Condensed") === -1) return;
      var andador = document.createTreeWalker(t, NodeFilter.SHOW_TEXT);
      var nos = [];
      while (andador.nextNode()) {
        var n = andador.currentNode;
        if (/\S-\S/.test(n.nodeValue) && !(n.parentNode.closest && n.parentNode.closest(".sem-quebra"))) nos.push(n);
      }
      nos.forEach(function (n) {
        var frag = document.createDocumentFragment();
        n.nodeValue.split(/(\S*\S-\S\S*)/).forEach(function (parte, i) {
          if (!parte) return;
          frag.appendChild(i % 2 ? el("span", { classe: "sem-quebra", texto: parte }) : document.createTextNode(parte));
        });
        n.parentNode.replaceChild(frag, n);
      });
    });
  }
  // projetos.js chama isto depois de refiltrar. Não revela nem esconde nada:
  // na Revisão 4 todo conteúdo já nasce visível.
  window.observarRevelacoes = protegerHifens;

  /* ---------- Início ---------- */
  montarTopo();
  montarAbertura();
  montarSobre();
  montarContato();
  montarRodape();
  encaixarRodape();

  // Os eventos de fonte não bastam: a troca da fonte reserva pela display
  // acontece depois do document.fonts.ready e o nome saía cortado ("IGOR ROM").
  // Um ResizeObserver no nome reajusta sempre que a largura dele sair do encaixe.
  function conferirRodape() {
    if (!rodapeGigante) return;
    var estilo = getComputedStyle(rodape);
    var largura = rodape.clientWidth - px(estilo.paddingLeft) - px(estilo.paddingRight);
    var medida = rodapeGigante.firstChild.getBoundingClientRect().width;
    if (largura && Math.abs(medida - largura * 0.99) > largura * 0.01) encaixarRodape();
  }
  if (rodapeGigante && window.ResizeObserver) {
    var quadro = 0;
    new ResizeObserver(function () {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(conferirRodape);
    }).observe(rodapeGigante.firstChild);
  }
  if (document.fonts) document.fonts.ready.then(conferirRodape);

  var timerTela = 0;
  window.addEventListener("resize", function () {
    clearTimeout(timerTela);
    timerTela = setTimeout(encaixarRodape, 120);
  });

  // projetos.js e documentos.js rodam depois (defer); protege os títulos deles também.
  function finalizar() {
    protegerHifens(document);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", finalizar);
  else finalizar();
})();
