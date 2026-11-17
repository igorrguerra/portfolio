/*
 * Shell do portfólio: topo com navegação, loader, hero, marquee, sobre, contato,
 * rodapé, revelações e cursor. Último script defer da página.
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

  var mqMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mqCursor = window.matchMedia("(hover: hover) and (pointer: fine)");
  function semMovimento() {
    return mqMovimento.matches;
  }

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

  function linkExterno(href, texto, classe) {
    return el("a", { href: href, classe: classe, target: "_blank", rel: "noopener" }, [texto]);
  }

  function nomeCompleto() {
    return [pessoa.nome, pessoa.sobrenome].filter(Boolean).join(" ");
  }

  function px(valor) {
    return parseFloat(valor) || 0;
  }

  /* ---------- Topo com navegação ---------- */
  // Desktop: links sempre visíveis, seção atual marcada (aria-current).
  // Abaixo de 900px: botão "Menu" abre um painel simples com os mesmos links.
  var topo = document.getElementById("topo");
  var SECOES = [
    { id: "sobre", rotulo: "Sobre" },
    { id: "projetos", rotulo: "Projetos" },
    { id: "curriculo", rotulo: "Currículo" },
    { id: "certificacoes", rotulo: "Certificações" },
    { id: "contato", rotulo: "Contato" },
  ];
  var mqPainel = window.matchMedia("(max-width: 899px)");
  var botaoMenu = null;
  var nav = null;
  var painelAberto = false;

  function montarTopo() {
    if (!topo) return;
    var lista = el("ul", { classe: "topo__lista" });
    SECOES.forEach(function (s) {
      if (!document.getElementById(s.id)) return;
      lista.appendChild(el("li", null, [el("a", { href: "#" + s.id, classe: "topo__link", "data-secao": s.id }, [s.rotulo])]));
    });
    nav = el("nav", { id: "navegacao", classe: "topo__nav", "aria-label": "Seções" }, [lista]);
    botaoMenu = el("button", { type: "button", classe: "topo__menu", "aria-expanded": "false", "aria-controls": "navegacao" }, [
      el("span", { classe: "topo__menu-texto", texto: "Menu" }),
      el("span", { classe: "topo__icone", "aria-hidden": "true" }),
    ]);
    topo.replaceChildren(el("a", { href: "#hero", classe: "topo__nome" }, [nomeCompleto()]), nav, botaoMenu);

    botaoMenu.addEventListener("click", function () {
      if (painelAberto) fecharPainel(true);
      else abrirPainel();
    });
    // Clicar num link fecha o painel; a âncora segue normal (scroll-margin-top compensa o topo).
    lista.addEventListener("click", function (e) {
      if (e.target.closest("a") && painelAberto) fecharPainel(false);
    });
    var mudouLargura = function () {
      if (!mqPainel.matches && painelAberto) fecharPainel(false);
    };
    if (mqPainel.addEventListener) mqPainel.addEventListener("change", mudouLargura);
  }

  function medirTopo() {
    if (topo) raiz.style.setProperty("--topo-alt", Math.ceil(topo.getBoundingClientRect().height) + "px");
  }

  function abrirPainel() {
    painelAberto = true;
    nav.classList.add("is-aberto");
    raiz.classList.add("sem-rolagem");
    botaoMenu.setAttribute("aria-expanded", "true");
    botaoMenu.querySelector(".topo__menu-texto").textContent = "Fechar";
    var primeiro = nav.querySelector("a");
    if (primeiro) primeiro.focus();
    document.addEventListener("keydown", teclasPainel);
  }

  function fecharPainel(devolverFoco) {
    painelAberto = false;
    nav.classList.remove("is-aberto");
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
    var itens = [botaoMenu].concat(Array.prototype.slice.call(nav.querySelectorAll("a[href]")));
    var i = itens.indexOf(document.activeElement);
    e.preventDefault();
    var prox = e.shiftKey ? (i <= 0 ? itens.length - 1 : i - 1) : i === -1 || i === itens.length - 1 ? 0 : i + 1;
    itens[prox].focus();
  }

  // Marca a seção que cruza a faixa logo abaixo do topo.
  function ligarSecaoAtual() {
    if (!nav || !("IntersectionObserver" in window)) return;
    var links = {};
    Array.prototype.forEach.call(nav.querySelectorAll("[data-secao]"), function (a) {
      links[a.getAttribute("data-secao")] = a;
    });
    var visiveis = {};
    function marcar() {
      var atual = null;
      SECOES.forEach(function (s) {
        if (visiveis[s.id]) atual = atual || s.id;
      });
      Object.keys(links).forEach(function (id) {
        if (id === atual) links[id].setAttribute("aria-current", "true");
        else links[id].removeAttribute("aria-current");
      });
    }
    var io = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (en) {
          visiveis[en.target.id] = en.isIntersecting;
        });
        marcar();
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    Object.keys(links).forEach(function (id) {
      io.observe(document.getElementById(id));
    });
  }

  /* ---------- Hero ---------- */
  var hero = document.getElementById("hero");
  var heroNome = null;

  function montarHero() {
    if (!hero) return;
    heroNome = el("h1", { id: "hero-nome", classe: "hero__nome" }, [
      el("span", { classe: "hero__linha", texto: pessoa.nome || "" }),
      " ",
      pessoa.sobrenome ? el("span", { classe: "hero__linha", texto: pessoa.sobrenome }) : null,
    ]);

    var cargo = el("p", { classe: "hero__cargo" }, [
      pessoa.cargo || "",
      pessoa.local ? el("span", { classe: "hero__local", texto: pessoa.local }) : null,
    ]);

    var texto = el("div", { classe: "hero__texto" }, [
      pessoa.resumo ? el("p", { classe: "hero__resumo", texto: pessoa.resumo }) : null,
      pessoa.disponivel ? el("p", { classe: "status", texto: textoDisponivel() }) : null,
      pessoa.exemplo ? el("p", null, [etiquetaExemplo()]) : null,
      pendente(pessoa.pendente),
    ]);

    var rolagem = el("a", { href: "#sobre", classe: "hero__rolagem" }, [
      el("span", { texto: "Role para ver os projetos" }),
      el("span", { classe: "hero__linha-rolagem", "aria-hidden": "true" }),
    ]);

    hero.replaceChildren(heroNome, el("div", { classe: "hero__info" }, [cargo, texto, rolagem]));
  }

  // Encaixa as linhas na largura disponível, medindo no peso 900 (o mais largo).
  function encaixar(alvo, linhas, propriedade, caixa, maxPx) {
    if (!alvo || !linhas.length) return;
    var estilo = getComputedStyle(caixa);
    var largura = caixa.clientWidth - px(estilo.paddingLeft) - px(estilo.paddingRight);
    var pesoAntes = alvo.style.fontWeight;
    alvo.style.fontWeight = "900";
    alvo.style.setProperty(propriedade, "100px");
    var maior = 0;
    linhas.forEach(function (l) {
      maior = Math.max(maior, l.getBoundingClientRect().width);
    });
    alvo.style.fontWeight = pesoAntes;
    if (!maior) return;
    var tam = Math.floor(((100 * largura) / maior) * 0.99 * 10) / 10;
    if (maxPx) tam = Math.min(tam, maxPx);
    alvo.style.setProperty(propriedade, tam + "px");
  }

  function encaixarHero() {
    if (!heroNome) return;
    var rem = px(getComputedStyle(raiz).fontSize) || 16;
    var linhas = Array.prototype.slice.call(heroNome.querySelectorAll(".hero__linha"));
    var entrelinha = (px(getComputedStyle(heroNome).lineHeight) / px(getComputedStyle(heroNome).fontSize)) || 0.82;
    var alturaLinhas = Math.max(1, linhas.length) * entrelinha; // altura do nome em "em"
    var vh = document.documentElement.clientHeight || window.innerHeight;

    // A primeira tela mostra nome, cargo e a indicação de rolagem:
    // o nome fica com o que sobra da altura, e no máximo 62% dela.
    var est = getComputedStyle(hero);
    var info = hero.querySelector(".hero__info");
    var outros = px(est.paddingTop) + px(est.paddingBottom) + (info ? info.offsetHeight + px(getComputedStyle(info).paddingTop) : 0);
    var tetoAltura = Math.min(0.62 * vh, vh - outros) / alturaLinhas;

    // Teto final: 26rem (maior valor de --t-mega), com piso de 3.5rem.
    var teto = Math.max(3.5 * rem, Math.min(26 * rem, tetoAltura));
    heroNome.classList.add("is-medido");
    encaixar(heroNome, linhas, "--nome-tam", hero, teto);
    medirHero();
  }

  /* Morph do nome ao rolar: peso de 900 para 200 e o nome sobe um pouco. */
  var heroAltura = 0;
  var morphPendente = false;
  var ultimoP = -1;

  function medirHero() {
    heroAltura = hero ? hero.offsetHeight : 0;
  }

  function aplicarMorph() {
    morphPendente = false;
    if (!heroNome || semMovimento() || !heroAltura) return;
    var p = Math.min(1, Math.max(0, window.scrollY / (heroAltura * 0.75)));
    if (p === ultimoP) return;
    ultimoP = p;
    var peso = Math.round(900 - 700 * p);
    heroNome.style.fontWeight = String(peso);
    heroNome.style.transform = "translate3d(0," + (-p * window.innerHeight * 0.07).toFixed(1) + "px,0)";
  }

  function pedirMorph() {
    if (!morphPendente) {
      morphPendente = true;
      requestAnimationFrame(aplicarMorph);
    }
  }

  function ligarMorph() {
    if (!heroNome) return;
    heroNome.classList.add("is-morph");
    window.addEventListener("scroll", pedirMorph, { passive: true });
    pedirMorph();
  }

  function limparMorph() {
    if (!heroNome) return;
    heroNome.style.fontWeight = "";
    heroNome.style.transform = "";
    ultimoP = -1;
  }

  /* ---------- Loader ---------- */
  var loader = document.querySelector(".loader");

  function rodarLoader(fontesProntas) {
    if (!loader) return Promise.resolve();
    function terminar() {
      loader.classList.add("is-fim");
      raiz.classList.remove("sem-rolagem");
    }
    if (semMovimento() || !heroNome) {
      terminar();
      return Promise.resolve();
    }

    raiz.classList.add("sem-rolagem");
    var nome = el("p", { classe: "loader__nome" }, [
      el("span", { texto: pessoa.nome || "" }),
      pessoa.sobrenome ? el("span", { texto: pessoa.sobrenome }) : null,
    ]);
    loader.replaceChildren(nome);

    function alinhar() {
      // O nome do loader fica exatamente sobre o nome do hero.
      var r = heroNome.getBoundingClientRect();
      nome.style.fontSize = getComputedStyle(heroNome).fontSize;
      nome.style.transform = "translate(" + r.left + "px," + r.top + "px)";
    }
    // Se as fontes chegarem no meio do loader, o hero é reencaixado; realinha.
    fontesProntas.then(function () {
      if (nome.style.transform && !loader.classList.contains("is-fim")) alinhar();
    });

    // Espera as fontes por no máximo 100ms, preservando o orçamento do loader.
    var espera = new Promise(function (ok) {
      setTimeout(ok, 100);
    });
    return Promise.race([fontesProntas, espera]).then(function () {
      encaixarHero();
      alinhar();
      var pesos = [100, 400, 700, 900];
      return new Promise(function (ok) {
        pesos.forEach(function (peso, i) {
          setTimeout(function () {
            nome.style.fontWeight = String(peso);
          }, i * 70);
        });
        setTimeout(function () {
          loader.classList.add("is-saindo");
          raiz.classList.remove("sem-rolagem");
        }, 240);
        setTimeout(function () {
          terminar();
          ok();
        }, 680);
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
    // Dois grupos iguais: o trilho anda -50% e emenda sem corte.
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
          el("li", null, [el("span", { texto: d.idioma || "" }), d.nivel ? el("span", { classe: "sobre__nivel", texto: d.nivel }) : null])
        );
      });
      habilidades.appendChild(el("h3", { id: "sobre-idiomas", classe: "sobre__subtitulo", texto: "Idiomas" }));
      habilidades.appendChild(idiomas);
    }
    secao.replaceChildren(titulo, el("div", { classe: "sobre__grade" }, [texto, habilidades]));
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

  function montarContato() {
    var secao = document.getElementById("contato");
    if (!secao) return;
    var filhos = [el("h2", { id: "contato-titulo", classe: "titulo-secao", "data-reveal": true }, ["Contato"])];

    if (pessoa.disponivel) filhos.push(el("p", { classe: "status contato__status", texto: textoDisponivel() }));

    if (contato.email) {
      filhos.push(el("p", null, [el("a", { href: "mailto:" + contato.email, classe: "contato__email" }, [contato.email])]));

      var aviso = el("p", { classe: "contato__aviso", role: "status", "aria-live": "polite" });
      var botao = el("button", { type: "button", classe: "botao botao--contorno" }, ["Copiar e-mail"]);
      var timer = 0;
      botao.addEventListener("click", function () {
        copiarTexto(contato.email).then(
          function () {
            botao.textContent = "E-mail copiado";
            aviso.textContent = "E-mail copiado";
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
  // O navegador quebra linha depois de "-" (FRONT-END). Envolver a palavra
  // em .sem-quebra (white-space: nowrap) deixa só os espaços como quebra.
  var SELETOR_DISPLAY = ".titulo-secao, .projeto__nome, .credencial__nome, h1, h2, h3, h4";

  function protegerHifens(raizBusca) {
    var base = raizBusca || document;
    var alvos = Array.prototype.slice.call(base.querySelectorAll(SELETOR_DISPLAY));
    if (base.matches && base.matches(SELETOR_DISPLAY)) alvos.push(base);
    alvos.forEach(function (t) {
      if (t.closest(".sem-quebra") || getComputedStyle(t).fontFamily.indexOf("Big Shoulders") === -1) return;
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
      x += (alvoX - x) * 0.22;
      y += (alvoY - y) * 0.22;
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

    // Só agora o CSS troca o cursor do sistema: se algo acima falhar, ele fica.
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

  var fontesProntas = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  fontesProntas.then(function () {
    medirTopo();
    encaixarHero();
    encaixarRodape();
    ajustarMarquee();
  });

  rodarLoader(fontesProntas).then(function () {
    if (!semMovimento()) ligarMorph();
  });

  var timerTela = 0;
  window.addEventListener("resize", function () {
    clearTimeout(timerTela);
    timerTela = setTimeout(function () {
      medirTopo();
      encaixarHero();
      encaixarRodape();
      ajustarMarquee();
      ultimoP = -1;
      pedirMorph();
    }, 120);
  });

  mqMovimento.addEventListener &&
    mqMovimento.addEventListener("change", function () {
      if (semMovimento()) {
        limparMorph();
        revelarTudo(document);
      } else ligarMorph();
    });

  // Projetos e documentos renderizam antes (scripts defer anteriores ou no
  // DOMContentLoaded); as revelações e o cursor ligam depois deles.
  function finalizar() {
    observarRevelacoes(document);
    ligarSecaoAtual();
    ligarCursor();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", finalizar);
  else finalizar();
})();
