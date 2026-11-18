/*
 * Shell do portfólio: navegação flutuante com indicador deslizante, loader laser,
 * hero estrutural, marquee, sobre, contato, rodapé, revelações e cursor.
 * Todo o conteúdo vem de window.PORTFOLIO (data.js).
 */
(function () {
  "use strict";

  var DADOS = window.PORTFOLIO || {};
  var pessoa = DADOS.pessoa || {};
  var sobre = DADOS.sobre || {};
  var contato = DADOS.contato || {};
  var listaProjetos = Array.isArray(DADOS.projetos) ? DADOS.projetos : [];

  var raiz = document.documentElement;
  raiz.classList.add("js");

  var mqMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mqCursor = window.matchMedia("(hover: hover) and (pointer: fine)");
  var mqMobile = window.matchMedia("(max-width: 1039px)");
  var ehMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || "");

  function semMovimento() {
    return mqMovimento.matches;
  }

  /* ---------- Utilitários ---------- */
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

  function etiquetaExemplo() {
    return el("span", { classe: "etiqueta-exemplo", texto: "Exemplo" });
  }

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

  function linkExterno(href, texto, classe) {
    return el("a", { href: href, classe: classe, target: "_blank", rel: "noopener" }, [texto]);
  }

  function nomeCompleto() {
    return [pessoa.nome, pessoa.sobrenome].filter(Boolean).join(" ");
  }

  function px(valor) {
    return parseFloat(valor) || 0;
  }

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
  window.copiarTextoPortfolio = copiarTexto;

  /* ---------- Navegação com Indicador Deslizante + Progresso ---------- */
  var topo = document.getElementById("topo");
  var SECOES = [
    { id: "hero", rotulo: "Início" },
    { id: "sobre", rotulo: "Sobre" },
    { id: "projetos", rotulo: "Projetos", contador: listaProjetos.length || null },
    { id: "curriculo", rotulo: "Currículo" },
    { id: "certificacoes", rotulo: "Certificações" },
    { id: "contato", rotulo: "Contato" },
  ];

  var barraTopo = null;
  var navDesktop = null;
  var indicador = null;
  var fantasma = null;
  var botaoMenu = null;
  var painelMobile = null;
  var linksDesktop = {};
  var linksMobile = {};
  var painelAberto = false;
  var secaoAtual = "hero";
  var secaoTravada = null;
  var timerTrava = 0;
  var scrollRaf = false;

  function montarTopo() {
    if (!topo) return;

    var listaDesktop = el("ul", { classe: "topo__lista" });
    var listaMobile = el("ul", { classe: "topo__painel-lista" });

    SECOES.forEach(function (s) {
      if (!document.getElementById(s.id)) return;

      var filhosLink = [el("span", { texto: s.rotulo })];
      if (s.contador) {
        filhosLink.push(el("span", { classe: "topo__contador", texto: String(s.contador) }));
      }
      var aDesk = el("a", { href: "#" + s.id, classe: "topo__link", "data-secao": s.id }, filhosLink);
      linksDesktop[s.id] = aDesk;
      listaDesktop.appendChild(el("li", null, [aDesk]));

      var aMob = el("a", { href: "#" + s.id, classe: "topo__painel-link", "data-secao": s.id }, [
        el("span", { texto: s.rotulo }),
      ]);
      linksMobile[s.id] = aMob;
      listaMobile.appendChild(el("li", null, [aMob]));
    });

    fantasma = el("span", { classe: "topo__fantasma", "aria-hidden": "true" });
    indicador = el("span", { classe: "topo__indicador", "aria-hidden": "true" });
    navDesktop = el("nav", { id: "navegacao-desktop", classe: "topo__nav", "aria-label": "Seções principais" }, [
      fantasma,
      indicador,
      listaDesktop,
    ]);

    var botaoCmd = el(
      "button",
      {
        type: "button",
        classe: "topo__cmd",
        "data-magnetico": "true",
        "aria-label": "Abrir menu rápido de comandos",
        title: "Menu rápido (" + (ehMac ? "⌘K" : "Ctrl+K") + ")",
      },
      [
        el("span", { classe: "topo__cmd-rotulo", texto: "Comandos" }),
        el("kbd", { classe: "topo__kbd", texto: ehMac ? "⌘K" : "Ctrl K" }),
      ]
    );
    botaoCmd.addEventListener("click", function () {
      if (painelAberto) fecharPainel(false);
      if (typeof window.abrirComandos === "function") window.abrirComandos(botaoCmd);
    });

    botaoMenu = el(
      "button",
      {
        type: "button",
        classe: "topo__menu",
        "aria-expanded": "false",
        "aria-controls": "navegacao-mobile",
      },
      [
        el("span", { classe: "topo__menu-texto", texto: "Menu" }),
        el("span", { classe: "topo__icone", "aria-hidden": "true" }),
      ]
    );

    var marca = el("a", { href: "#hero", classe: "topo__nome" }, [
      pessoa.disponivel ? el("span", { classe: "topo__ponto", "aria-hidden": "true" }) : null,
      el("span", { texto: nomeCompleto() }),
    ]);

    var progresso = el("span", { classe: "topo__progresso", "aria-hidden": "true" });
    barraTopo = el("div", { classe: "topo__barra" }, [
      marca,
      navDesktop,
      el("div", { classe: "topo__direita" }, [botaoCmd, botaoMenu]),
      progresso,
    ]);

    // Ações rápidas dentro do menu mobile
    var acoesMobile = el("div", { classe: "topo__painel-rodape" });
    var btnCmdMob = el("button", { type: "button", classe: "botao botao--fantasma", texto: "Buscar / Comandos" });
    btnCmdMob.addEventListener("click", function () {
      fecharPainel(false);
      if (typeof window.abrirComandos === "function") window.abrirComandos(botaoCmd);
    });
    acoesMobile.appendChild(btnCmdMob);
    if (contato.github) acoesMobile.appendChild(linkExterno(contato.github, "GitHub", "botao botao--contorno"));
    if (contato.whatsapp) {
      var num = String(contato.whatsapp).replace(/\D/g, "");
      var msg = contato.mensagemWhatsapp ? "?text=" + encodeURIComponent(contato.mensagemWhatsapp) : "";
      acoesMobile.appendChild(linkExterno("https://wa.me/" + num + msg, "WhatsApp", "botao botao--cheio"));
    }

    painelMobile = el("nav", { id: "navegacao-mobile", classe: "topo__painel", "aria-label": "Menu móvel" }, [
      listaMobile,
      acoesMobile,
    ]);

    topo.replaceChildren(barraTopo, painelMobile);

    // Hover fantasma na barra desktop
    listaDesktop.addEventListener("pointerover", function (e) {
      var link = e.target.closest(".topo__link");
      if (!link || !fantasma) return;
      posicionarPilula(fantasma, link);
      fantasma.classList.add("is-visivel");
    });
    navDesktop.addEventListener("pointerleave", function () {
      if (fantasma) fantasma.classList.remove("is-visivel");
    });

    // Controle do menu mobile
    botaoMenu.addEventListener("click", function () {
      if (painelAberto) fecharPainel(true);
      else abrirPainel();
    });

    painelMobile.addEventListener("click", function (e) {
      if (e.target === painelMobile && painelAberto) fecharPainel(true);
    });

    if (mqMobile.addEventListener) {
      mqMobile.addEventListener("change", function () {
        if (!mqMobile.matches && painelAberto) fecharPainel(false);
        posicionarIndicadorAtivo();
      });
    }

    // Intercepta links internos de seção para rolagem precisa e indicador imediato
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a || a.classList.contains("pular")) return;
      var hash = a.getAttribute("href");
      if (!hash || hash.length < 2) return;
      var id = hash.slice(1);
      var alvo = document.getElementById(id);
      if (!alvo) return;
      e.preventDefault();
      irParaSecao(id);
    });
  }

  function posicionarPilula(pilula, link) {
    if (!pilula || !link || !navDesktop) return;
    var rNav = navDesktop.getBoundingClientRect();
    var rLink = link.getBoundingClientRect();
    if (!rLink.width) return;
    var x = rLink.left - rNav.left;
    pilula.style.width = rLink.width.toFixed(1) + "px";
    pilula.style.transform = "translate3d(" + x.toFixed(1) + "px, 0, 0)";
  }

  function posicionarIndicadorAtivo() {
    var link = linksDesktop[secaoAtual];
    if (!indicador || !link || mqMobile.matches) {
      if (indicador) indicador.classList.remove("is-ativo");
      return;
    }
    posicionarPilula(indicador, link);
    indicador.classList.add("is-ativo");
  }

  function definirSecaoAtiva(id) {
    if (!id || (!linksDesktop[id] && !linksMobile[id])) return;
    secaoAtual = id;
    Object.keys(linksDesktop).forEach(function (k) {
      if (k === id) linksDesktop[k].setAttribute("aria-current", "true");
      else linksDesktop[k].removeAttribute("aria-current");
    });
    Object.keys(linksMobile).forEach(function (k) {
      if (k === id) linksMobile[k].setAttribute("aria-current", "true");
      else linksMobile[k].removeAttribute("aria-current");
    });
    posicionarIndicadorAtivo();
  }

  function irParaSecao(id) {
    var alvo = document.getElementById(id);
    if (!alvo) return;
    if (painelAberto) fecharPainel(false);

    if (linksDesktop[id] || linksMobile[id]) {
      secaoTravada = id;
      definirSecaoAtiva(id);
      clearTimeout(timerTrava);
      timerTrava = setTimeout(function () {
        secaoTravada = null;
        pedirAtualizacaoNav();
      }, semMovimento() ? 60 : 780);
    }

    var altTopo = topo ? topo.getBoundingClientRect().height : 76;
    var y = id === "hero" ? 0 : Math.max(0, alvo.getBoundingClientRect().top + window.scrollY - altTopo + 6);
    window.scrollTo({ top: y, behavior: semMovimento() ? "auto" : "smooth" });
    if (history.replaceState) {
      history.replaceState(null, "", id === "hero" ? window.location.pathname + window.location.search : "#" + id);
    }
  }
  window.irParaSecao = irParaSecao;

  function medirTopo() {
    if (topo && barraTopo) {
      var h = Math.ceil(barraTopo.getBoundingClientRect().height + 16);
      raiz.style.setProperty("--topo-alt", h + "px");
    }
    posicionarIndicadorAtivo();
  }

  function abrirPainel() {
    if (!painelMobile || !botaoMenu) return;
    painelAberto = true;
    painelMobile.classList.add("is-aberto");
    raiz.classList.add("sem-rolagem");
    botaoMenu.setAttribute("aria-expanded", "true");
    botaoMenu.querySelector(".topo__menu-texto").textContent = "Fechar";
    var primeiro = painelMobile.querySelector("a, button");
    if (primeiro) primeiro.focus();
    document.addEventListener("keydown", teclasPainel);
  }

  function fecharPainel(devolverFoco) {
    if (!painelMobile || !botaoMenu) return;
    painelAberto = false;
    painelMobile.classList.remove("is-aberto");
    raiz.classList.remove("sem-rolagem");
    botaoMenu.setAttribute("aria-expanded", "false");
    botaoMenu.querySelector(".topo__menu-texto").textContent = "Menu";
    document.removeEventListener("keydown", teclasPainel);
    if (devolverFoco) botaoMenu.focus();
  }

  function teclasPainel(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      fecharPainel(true);
      return;
    }
    if (e.key !== "Tab") return;
    var focaveis = [botaoMenu].concat(
      Array.prototype.slice.call(painelMobile.querySelectorAll("a[href], button:not([disabled])"))
    );
    var idx = focaveis.indexOf(document.activeElement);
    e.preventDefault();
    var prox = e.shiftKey
      ? idx <= 0
        ? focaveis.length - 1
        : idx - 1
      : idx === -1 || idx === focaveis.length - 1
      ? 0
      : idx + 1;
    focaveis[prox].focus();
  }

  function atualizarNavegacao() {
    scrollRaf = false;
    var y = window.scrollY || window.pageYOffset || 0;
    var vh = window.innerHeight || document.documentElement.clientHeight || 1;
    var total = Math.max(1, document.documentElement.scrollHeight - vh);
    var p = Math.min(1, Math.max(0, y / total));

    if (topo) topo.classList.toggle("is-rolando", y > 24);
    if (barraTopo) barraTopo.style.setProperty("--progresso", p.toFixed(4));

    if (secaoTravada) return;

    // Se chegou ao fim da página, destaca a última seção disponível
    if (y + vh >= document.documentElement.scrollHeight - 36 && y > 80) {
      for (var j = SECOES.length - 1; j >= 0; j--) {
        if (document.getElementById(SECOES[j].id)) {
          if (secaoAtual !== SECOES[j].id) definirSecaoAtiva(SECOES[j].id);
          return;
        }
      }
    }

    var linhaCorte = vh * 0.34;
    var candidata = "hero";
    SECOES.forEach(function (s) {
      var sec = document.getElementById(s.id);
      if (!sec) return;
      if (sec.getBoundingClientRect().top <= linhaCorte) {
        candidata = s.id;
      }
    });
    if (candidata !== secaoAtual) definirSecaoAtiva(candidata);
  }

  function pedirAtualizacaoNav() {
    if (!scrollRaf) {
      scrollRaf = true;
      requestAnimationFrame(atualizarNavegacao);
    }
  }

  /* ---------- Hero ---------- */
  var hero = document.getElementById("hero");
  var heroNome = null;

  function criarLinhaLetras(palavra) {
    var spanLinha = el("span", { classe: "hero__linha", "aria-hidden": "true" });
    Array.from(String(palavra || "")).forEach(function (ch) {
      if (ch === " ") {
        spanLinha.appendChild(document.createTextNode("\u00A0"));
      } else {
        spanLinha.appendChild(el("span", { classe: "hero__letra", "data-letra": ch, texto: ch }));
      }
    });
    return spanLinha;
  }

  function montarHero() {
    if (!hero) return;

    var canvas = el("canvas", { id: "hero-canvas", classe: "hero__canvas", "aria-hidden": "true" });
    var vinheta = el("div", { classe: "hero__vinheta", "aria-hidden": "true" });

    // HUD interativo no topo do hero
    var statusHud = el("div", { classe: "hero__hud-esq" }, [
      pessoa.disponivel ? el("span", { classe: "status", texto: textoDisponivel() }) : null,
      pessoa.local ? el("span", { classe: "hero__local-tag", texto: pessoa.local }) : null,
    ]);

    var botoesModo = [
      { id: "rede", rotulo: "Rede" },
      { id: "gravidade", rotulo: "Gravidade" },
      { id: "vortice", rotulo: "Vórtice" },
    ].map(function (m, idx) {
      return el("button", {
        type: "button",
        classe: "hero__modo",
        "data-modo-hero": m.id,
        "aria-pressed": idx === 0 ? "true" : "false",
        texto: m.rotulo,
      });
    });

    var controlesHud = el("div", { classe: "hero__hud-dir" }, [
      el("div", { classe: "hero__modos", role: "group", "aria-label": "Simulação interativa de fundo" }, botoesModo),
      el("span", { id: "hero-telemetria", classe: "hero__telemetria", "aria-hidden": "true", texto: "60 FPS" }),
    ]);

    var hud = el("div", { classe: "hero__hud" }, [statusHud, controlesHud]);

    // Nome gigante em fonte variável letra por letra
    heroNome = el(
      "h1",
      { id: "hero-nome", classe: "hero__nome", "aria-label": nomeCompleto() },
      [
        criarLinhaLetras(pessoa.nome || ""),
        pessoa.sobrenome ? criarLinhaLetras(pessoa.sobrenome) : null,
      ]
    );

    var cargoBloco = el("div", { classe: "hero__bloco-cargo" }, [
      el("p", { classe: "hero__cargo" }, [
        el("span", { texto: pessoa.cargo || "Desenvolvedor full stack" }),
        el("span", { id: "hero-especialidade", classe: "hero__especialidade", texto: "Next.js · TypeScript · Interfaces" }),
      ]),
      pessoa.resumo ? el("p", { classe: "hero__resumo", texto: pessoa.resumo }) : null,
      pessoa.exemplo ? el("p", null, [etiquetaExemplo()]) : null,
      pendente(pessoa.pendente),
    ]);

    var dicaTexto = mqCursor.matches
      ? "Mova o cursor pelas letras ou clique na tela para disparar ondas"
      : "Toque ou arraste na tela para interagir com o campo";

    var acoesBloco = el("div", { classe: "hero__bloco-acoes" }, [
      el("div", { classe: "hero__acoes" }, [
        el("a", { href: "#projetos", classe: "botao botao--cheio", "data-magnetico": "true", texto: "Ver projetos" }),
        el("a", { href: "#curriculo", classe: "botao botao--contorno", "data-magnetico": "true", texto: "Currículo" }),
        el("a", { href: "#contato", classe: "botao botao--fantasma", "data-magnetico": "true", texto: "Contato" }),
      ]),
      el("p", { classe: "hero__dica", "aria-hidden": "true", texto: dicaTexto }),
    ]);

    var conteudo = el("div", { classe: "hero__conteudo" }, [
      hud,
      heroNome,
      el("div", { classe: "hero__info" }, [cargoBloco, acoesBloco]),
    ]);

    hero.replaceChildren(canvas, vinheta, conteudo);
  }

  // Encaixa linhas display na largura disponível medindo sempre no peso 900.
  function encaixar(alvo, linhas, propriedade, caixa, maxPx) {
    if (!alvo || !linhas.length || !caixa) return;
    var estilo = getComputedStyle(caixa);
    var largCaixa = Math.min(caixa.clientWidth, document.documentElement.clientWidth || caixa.clientWidth);
    var largura = largCaixa - px(estilo.paddingLeft) - px(estilo.paddingRight);
    alvo.classList.add("is-medindo");
    var pesoAntes = alvo.style.fontWeight;
    alvo.style.fontWeight = "900";
    alvo.style.setProperty(propriedade, "100px");
    var maior = 0;
    linhas.forEach(function (l) {
      maior = Math.max(maior, l.getBoundingClientRect().width);
    });
    alvo.style.fontWeight = pesoAntes;
    alvo.classList.remove("is-medindo");
    if (!maior) return;
    var tam = Math.floor(((100 * largura) / maior) * 0.985 * 10) / 10;
    if (maxPx) tam = Math.min(tam, maxPx);
    alvo.style.setProperty(propriedade, tam + "px");
  }

  function encaixarHero() {
    if (!heroNome || !hero) return;
    var rem = px(getComputedStyle(raiz).fontSize) || 16;
    var linhas = Array.prototype.slice.call(heroNome.querySelectorAll(".hero__linha"));
    var entrelinha = px(getComputedStyle(heroNome).lineHeight) / px(getComputedStyle(heroNome).fontSize) || 0.82;
    var alturaLinhas = Math.max(1, linhas.length) * entrelinha;
    var vh = document.documentElement.clientHeight || window.innerHeight;

    var est = getComputedStyle(hero);
    var hud = hero.querySelector(".hero__hud");
    var info = hero.querySelector(".hero__info");
    var ocupados =
      px(est.paddingTop) +
      px(est.paddingBottom) +
      (hud ? hud.offsetHeight + 16 : 0) +
      (info ? info.offsetHeight + 20 : 0);

    var tetoAltura = Math.min(0.56 * vh, vh - ocupados) / alturaLinhas;
    var teto = Math.max(3.4 * rem, Math.min(24 * rem, tetoAltura));
    heroNome.classList.add("is-medido");
    encaixar(heroNome, linhas, "--nome-tam", hero, teto);
    if (typeof window.atualizarCentrosLetras === "function") window.atualizarCentrosLetras();
  }
  window.reencaixarHero = encaixarHero;

  /* ---------- Loader Rápido ---------- */
  var loader = document.querySelector(".loader");

  function rodarLoader(fontesProntas) {
    if (!loader) return Promise.resolve();
    function terminar() {
      loader.classList.add("is-fim");
    }
    if (semMovimento()) {
      terminar();
      return Promise.resolve();
    }

    var barra = el("div", { classe: "loader__barra" }, [el("span", { classe: "loader__laser" })]);
    loader.replaceChildren(barra);
    requestAnimationFrame(function () {
      loader.classList.add("is-carregando");
    });

    var espera = new Promise(function (ok) {
      setTimeout(ok, 60);
    });

    return Promise.race([fontesProntas, espera]).then(function () {
      encaixarHero();
      return new Promise(function (ok) {
        setTimeout(function () {
          loader.classList.add("is-saindo");
          if (typeof window.iniciarEntradaHero === "function") window.iniciarEntradaHero();
        }, 120);
        setTimeout(function () {
          terminar();
          ok();
        }, 460);
      });
    });
  }

  /* ---------- Marquee ---------- */
  var marquee = document.querySelector(".marquee");

  function montarMarquee() {
    var itens = sobre.habilidades || [];
    if (!marquee || !itens.length) return;
    function grupo() {
      var ul = el("ul", { classe: "marquee__grupo" });
      itens.forEach(function (h) {
        ul.appendChild(el("li", { classe: "marquee__item", texto: h }));
      });
      return ul;
    }
    marquee.replaceChildren(el("div", { classe: "marquee__trilho" }, [grupo(), grupo()]));
    ajustarMarquee();
  }

  function ajustarMarquee() {
    var g = marquee && marquee.querySelector(".marquee__grupo");
    if (!g) return;
    var largura = g.getBoundingClientRect().width;
    if (largura) marquee.style.setProperty("--marquee-dur", Math.max(20, largura / 70).toFixed(1) + "s");
  }

  /* ---------- Sobre ---------- */
  function montarSobre() {
    var secao = document.getElementById("sobre");
    if (!secao) return;
    var titulo = el("h2", { id: "sobre-titulo", classe: "titulo-secao", "data-reveal": true }, ["Sobre"]);
    var texto = el(
      "div",
      { classe: "sobre__texto" },
      (sobre.texto || []).map(function (p) {
        return el("p", { texto: p });
      })
    );
    if (sobre.exemplo) texto.appendChild(el("p", null, [etiquetaExemplo()]));
    if (sobre.pendente) texto.appendChild(pendente(sobre.pendente));

    var habilidades = null;
    if ((sobre.habilidades || []).length) {
      var lista = el("ul", { classe: "sobre__lista", "aria-labelledby": "sobre-habilidades" });
      sobre.habilidades.forEach(function (h) {
        lista.appendChild(el("li", { texto: h }));
      });
      habilidades = el("div", { classe: "sobre__habilidades" }, [
        el("h3", { id: "sobre-habilidades", classe: "sobre__subtitulo", texto: "Com o que trabalho" }),
        lista,
      ]);
    }
    if ((sobre.idiomas || []).length) {
      habilidades = habilidades || el("div", { classe: "sobre__habilidades" });
      var idiomas = el("ul", { classe: "sobre__idiomas", "aria-labelledby": "sobre-idiomas" });
      sobre.idiomas.forEach(function (d) {
        idiomas.appendChild(
          el("li", null, [
            el("span", { texto: d.idioma || "" }),
            d.nivel ? el("span", { classe: "sobre__nivel", texto: d.nivel }) : null,
          ])
        );
      });
      habilidades.appendChild(el("h3", { id: "sobre-idiomas", classe: "sobre__subtitulo", texto: "Idiomas" }));
      habilidades.appendChild(idiomas);
    }
    secao.replaceChildren(titulo, el("div", { classe: "sobre__grade" }, [texto, habilidades]));
  }

  /* ---------- Contato ---------- */
  function montarContato() {
    var secao = document.getElementById("contato");
    if (!secao) return;
    var filhos = [el("h2", { id: "contato-titulo", classe: "titulo-secao", "data-reveal": true }, ["Contato"])];

    if (pessoa.disponivel) filhos.push(el("p", { classe: "status contato__status", texto: textoDisponivel() }));

    if (contato.email) {
      filhos.push(el("p", null, [el("a", { href: "mailto:" + contato.email, classe: "contato__email" }, [contato.email])]));

      var aviso = el("p", { classe: "contato__aviso", role: "status", "aria-live": "polite" });
      var botao = el("button", { type: "button", classe: "botao botao--contorno", "data-magnetico": "true" }, ["Copiar e-mail"]);
      var timer = 0;
      botao.addEventListener("click", function () {
        copiarTexto(contato.email).then(
          function () {
            botao.textContent = "E-mail copiado";
            aviso.textContent = "E-mail copiado para a área de transferência";
          },
          function () {
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
    function rede(href, rotulo) {
      redes.appendChild(el("li", null, [linkExterno(href, rotulo, "contato__rede")]));
    }
    if (contato.linkedin) rede(contato.linkedin, "LinkedIn");
    if (contato.github) rede(contato.github, "GitHub");
    if (contato.whatsapp) {
      var num = String(contato.whatsapp).replace(/\D/g, "");
      var msg = contato.mensagemWhatsapp ? "?text=" + encodeURIComponent(contato.mensagemWhatsapp) : "";
      rede("https://wa.me/" + num + msg, "WhatsApp");
    }
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
    rodape.replaceChildren(
      rodapeGigante,
      el("div", { classe: "rodape__base" }, [
        el("p", { texto: "© " + new Date().getFullYear() + " " + nomeCompleto() }),
        el("a", { href: "#hero", classe: "rodape__topo", texto: "Voltar ao topo" }),
      ])
    );
  }

  function encaixarRodape() {
    if (!rodapeGigante) return;
    encaixar(rodapeGigante, [rodapeGigante.firstChild], "--rodape-tam", rodape, 0);
  }

  /* ---------- Títulos display: quebra só em espaços ---------- */
  var SELETOR_DISPLAY = ".titulo-secao, .card-projeto__nome, .credencial__nome, h2, h3, h4";

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

  /* ---------- Revelações ---------- */
  var observador = null;

  function revelarTudo(raizBusca) {
    var base = raizBusca || document;
    if (base.matches && base.matches("[data-reveal]")) base.classList.add("is-in");
    Array.prototype.forEach.call(base.querySelectorAll("[data-reveal]"), function (n) {
      n.classList.add("is-in");
    });
  }

  function observarRevelacoes(raizBusca) {
    var base = raizBusca || document;
    protegerHifens(base);
    if (semMovimento() || !("IntersectionObserver" in window)) {
      revelarTudo(base);
      return;
    }
    if (!observador) {
      observador = new IntersectionObserver(
        function (entradas) {
          entradas.forEach(function (en) {
            if (en.isIntersecting) {
              en.target.classList.add("is-in");
              observador.unobserve(en.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.01 }
      );
    }
    var alvos = Array.prototype.slice.call(base.querySelectorAll("[data-reveal]:not(.is-in)"));
    if (base.matches && base.matches("[data-reveal]:not(.is-in)")) alvos.unshift(base);
    alvos.forEach(function (n) {
      observador.observe(n);
    });
  }
  window.observarRevelacoes = observarRevelacoes;

  /* ---------- Cursor ---------- */
  function ligarCursor() {
    var cursor = document.querySelector(".cursor");
    if (!cursor || !mqCursor.matches || semMovimento()) return;
    var texto = el("span", { classe: "cursor__texto" });
    cursor.replaceChildren(texto);

    var alvoX = -100,
      alvoY = -100,
      x = -100,
      y = -100,
      rodando = false;

    function quadro() {
      x += (alvoX - x) * 0.24;
      y += (alvoY - y) * 0.24;
      cursor.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
      if (Math.abs(alvoX - x) > 0.1 || Math.abs(alvoY - y) > 0.1) requestAnimationFrame(quadro);
      else rodando = false;
    }

    function campo(n) {
      return n.closest && n.closest("input, textarea, select, [contenteditable], dialog");
    }

    document.addEventListener(
      "pointermove",
      function (e) {
        if (e.pointerType && e.pointerType !== "mouse") return;
        alvoX = e.clientX;
        alvoY = e.clientY;
        if (x < -50) {
          x = alvoX;
          y = alvoY;
        }
        cursor.classList.toggle("is-visivel", !campo(e.target));
        if (!rodando) {
          rodando = true;
          requestAnimationFrame(quadro);
        }
      },
      { passive: true }
    );

    document.addEventListener("pointerover", function (e) {
      var t = e.target.closest ? e.target.closest("a, button, [data-cursor]") : null;
      var rotulo = t && t.getAttribute("data-cursor");
      cursor.classList.toggle("is-grande", !!t && !rotulo);
      cursor.classList.toggle("is-texto", !!rotulo);
      texto.textContent = rotulo || "";
    });

    document.documentElement.addEventListener("pointerleave", function () {
      cursor.classList.remove("is-visivel");
    });
    window.addEventListener("blur", function () {
      cursor.classList.remove("is-visivel");
    });

    raiz.classList.add("cursor-on");
  }

  /* ---------- Início ---------- */
  montarTopo();
  medirTopo();
  montarHero();
  montarMarquee();
  montarSobre();
  montarContato();
  montarRodape();

  encaixarHero();
  encaixarRodape();
  definirSecaoAtiva("hero");

  window.addEventListener("scroll", pedirAtualizacaoNav, { passive: true });
  pedirAtualizacaoNav();

  var fontesProntas = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  fontesProntas.then(function () {
    medirTopo();
    encaixarHero();
    encaixarRodape();
    ajustarMarquee();
    posicionarIndicadorAtivo();
  });

  rodarLoader(fontesProntas);

  var timerTela = 0;
  window.addEventListener("resize", function () {
    clearTimeout(timerTela);
    timerTela = setTimeout(function () {
      medirTopo();
      encaixarHero();
      encaixarRodape();
      ajustarMarquee();
      pedirAtualizacaoNav();
    }, 100);
  });

  if (mqMovimento.addEventListener) {
    mqMovimento.addEventListener("change", function () {
      if (semMovimento()) revelarTudo(document);
    });
  }

  function finalizar() {
    observarRevelacoes(document);
    ligarCursor();
    posicionarIndicadorAtivo();
    if (window.location.hash && window.location.hash.length > 1) {
      var hashId = window.location.hash.slice(1);
      if (document.getElementById(hashId)) {
        setTimeout(function () {
          irParaSecao(hashId);
        }, 60);
      }
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", finalizar);
  else finalizar();
})();
