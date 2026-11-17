/*
 * Shell do portfólio (DESIGN.md, Revisão 3): cantos fixos, loader, hero preso
 * à rolagem, faixa azul, sobre, contato, rodapé, rolagem suave e cursor.
 * Último script defer da página. Todo o conteúdo vem de window.PORTFOLIO (data.js).
 *
 * Movimento: um único laço de quadro (requestAnimationFrame) roda só quando a
 * página rola ou muda de tamanho. Tudo que se move usa transform; nada fica
 * escondido esperando um observer. Se este script falhar, o conteúdo continua
 * visível e a página rola normalmente.
 */
(function () {
  "use strict";

  var DADOS = window.PORTFOLIO || {};
  var pessoa = DADOS.pessoa || {};
  var sobre = DADOS.sobre || {};
  var contato = DADOS.contato || {};

  var raiz = document.documentElement;
  raiz.classList.add("js");

  var mqReduzido = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mqMouse = window.matchMedia("(hover: hover) and (pointer: fine)");
  function semMovimento() {
    return mqReduzido.matches;
  }
  raiz.classList.toggle("movimento", !semMovimento());

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

  function limitar(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  // Desacelera no fim (cúbica).
  function suave(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function alturaTela() {
    return window.innerHeight || raiz.clientHeight;
  }

  /* ---------- Laço de quadro único ---------- */
  // Módulos de seção (projetos.js) se registram em window.efeitosRolagem
  // com { medir(), quadro(estado) }. medir() roda no carregamento e no resize;
  // quadro() roda no máximo uma vez por frame, só quando algo mudou.
  var efeitos = (window.efeitosRolagem = window.efeitosRolagem || []);
  var pedido = false;

  function rodarQuadro() {
    pedido = false;
    var estado = { y: window.scrollY, vh: alturaTela(), vw: raiz.clientWidth };
    for (var i = 0; i < efeitos.length; i++) {
      try {
        efeitos[i].quadro && efeitos[i].quadro(estado);
      } catch (err) {
        if (window.console) console.error(err);
      }
    }
  }

  function pedirQuadro() {
    if (!pedido) {
      pedido = true;
      requestAnimationFrame(rodarQuadro);
    }
  }

  function medirTudo() {
    for (var i = 0; i < efeitos.length; i++) {
      try {
        efeitos[i].medir && efeitos[i].medir();
      } catch (err) {
        if (window.console) console.error(err);
      }
    }
    pedirQuadro();
  }
  window.pedirQuadro = pedirQuadro;
  window.medirEfeitos = medirTudo;

  /* ---------- Cantos fixos ---------- */
  // Só o nome (volta ao topo) e "Fale comigo" (vai ao contato). Sem menu.
  var cantos = document.getElementById("topo");
  if (cantos) {
    var cantoNome = cantos.querySelector(".cantos__nome");
    if (cantoNome && nomeCompleto()) cantoNome.textContent = nomeCompleto();
  }

  /* ---------- Hero ---------- */
  var hero = document.getElementById("hero");
  var heroPalco = null;
  var heroNome = null;
  var heroResumo = null;
  var heroBase = null;
  var heroLinhas = [];

  function montarHero() {
    if (!hero) return;
    heroLinhas = [
      el("span", { classe: "hero__linha", texto: pessoa.nome || "" }),
      pessoa.sobrenome ? el("span", { classe: "hero__linha", texto: pessoa.sobrenome }) : null,
    ].filter(Boolean);
    heroNome = el("h1", { id: "hero-nome", classe: "hero__nome" }, [heroLinhas[0], " ", heroLinhas[1] || null]);

    heroResumo = pessoa.resumo ? el("p", { classe: "hero__resumo", texto: pessoa.resumo }) : null;

    var cargo = el("p", { classe: "hero__cargo" }, [
      pessoa.cargo || "",
      pessoa.local ? el("span", { classe: "hero__local", texto: pessoa.local }) : null,
    ]);
    var lado = el("div", { classe: "hero__lado" }, [
      pessoa.disponivel ? el("p", { classe: "status", texto: textoDisponivel() }) : null,
      pessoa.exemplo ? el("p", null, [etiquetaExemplo()]) : null,
      pendente(pessoa.pendente),
      el("a", { href: "#sobre", classe: "hero__rolagem" }, ["Role para ver os projetos"]),
    ]);
    heroBase = el("div", { classe: "hero__base" }, [cargo, lado]);

    heroPalco = el("div", { classe: "hero__palco" }, [heroNome, heroResumo, heroBase]);
    hero.replaceChildren(heroPalco);
  }

  // Encaixa um texto na largura disponível, medindo no peso 900 (o mais largo).
  // Devolve a largura medida a 100px para quem precisar decidir o layout.
  function medirA100(alvo, partes) {
    var pesoAntes = alvo.style.fontWeight;
    alvo.style.fontWeight = "900";
    alvo.style.fontSize = "100px";
    var larguras = partes.map(function (p) {
      return p.getBoundingClientRect().width;
    });
    alvo.style.fontWeight = pesoAntes;
    alvo.style.fontSize = "";
    return larguras;
  }

  function larguraUtil(caixa) {
    var est = getComputedStyle(caixa);
    return caixa.clientWidth - px(est.paddingLeft) - px(est.paddingRight);
  }

  function encaixar(alvo, partes, propriedade, caixa, maxPx) {
    if (!alvo || !partes.length) return;
    var maior = Math.max.apply(null, medirA100(alvo, partes));
    if (!maior) return;
    var tam = Math.floor(((100 * larguraUtil(caixa)) / maior) * 0.985 * 10) / 10;
    if (maxPx) tam = Math.min(tam, maxPx);
    alvo.style.setProperty(propriedade, tam + "px");
  }

  // Nome de borda a borda em duas linhas: IGOR encostado à esquerda, ROMERO à
  // direita, no maior tamanho que cabe na altura. Se a altura só deixar a
  // palavra mais larga com menos de 78% da largura (tela muito baixa e larga),
  // vira uma linha só, também de borda a borda.
  function encaixarHero() {
    if (!heroNome || !heroLinhas.length) return;
    heroNome.classList.remove("hero__nome--uma");
    var largura = larguraUtil(heroPalco);
    var med = medirA100(heroNome, heroLinhas);
    var entrelinha = 0.8;
    var vh = alturaTela();
    var estPalco = getComputedStyle(heroPalco);
    var reservado = px(estPalco.paddingTop) + px(estPalco.paddingBottom) + (heroBase ? heroBase.offsetHeight : 0) + 32;
    var alturaMax = Math.max(120, vh - reservado);

    var maisLarga = Math.max.apply(null, med);
    var tamDuas = Math.min((100 * largura) / maisLarga, alturaMax / (entrelinha * heroLinhas.length));
    var tam;
    if (heroLinhas.length > 1 && (tamDuas * maisLarga) / 100 < largura * 0.78) {
      // Uma linha: soma das palavras + o espaço entre elas (~0.18em).
      heroNome.classList.add("hero__nome--uma");
      var soma = med.reduce(function (a, b) {
        return a + b;
      }, 0) + 18;
      tam = Math.min((100 * largura) / soma, alturaMax / entrelinha);
    } else {
      tam = tamDuas;
    }
    tam = Math.floor(tam * 0.985 * 10) / 10;
    heroNome.style.setProperty("--nome-tam", tam + "px");
    heroNome.classList.add("is-medido");
  }

  // Hero preso: ao rolar, o nome encolhe, as duas palavras se afastam e saem,
  // e o resumo sobe até o centro da tela. Progresso p de 0 a 1 ao longo do hero.
  var efeitoHero = {
    altura: 0,
    ultimo: -1,
    medir: function () {
      this.altura = hero ? hero.offsetHeight : 0;
      this.ultimo = -1;
    },
    quadro: function (e) {
      if (!heroNome || semMovimento()) return;
      var curso = this.altura - e.vh;
      if (curso <= 0) return;
      var p = limitar(e.y / curso, 0, 1);
      if (p === this.ultimo) return;
      this.ultimo = p;

      var a = suave(limitar(p / 0.6, 0, 1)); // saída do nome
      var b = suave(limitar((p - 0.22) / 0.58, 0, 1)); // entrada do resumo
      var abre = (a * e.vw * 0.09).toFixed(1);
      heroNome.style.transform =
        "translate3d(0," + (-a * e.vh * 0.16).toFixed(1) + "px,0) scale(" + (1 - a * 0.42).toFixed(4) + ")";
      heroNome.style.opacity = String(Math.max(0, 1 - a * 1.15).toFixed(3));
      if (heroLinhas[0]) heroLinhas[0].style.transform = "translate3d(" + -abre + "px,0,0)";
      if (heroLinhas[1]) heroLinhas[1].style.transform = "translate3d(" + abre + "px,0,0)";
      if (heroBase) {
        heroBase.style.transform = "translate3d(0," + (a * e.vh * 0.12).toFixed(1) + "px,0)";
        heroBase.style.opacity = String(Math.max(0, 1 - a * 1.6).toFixed(3));
      }
      if (heroResumo) heroResumo.style.transform = "translate3d(0," + ((1 - b) * e.vh * 0.75).toFixed(1) + "px,0)";
    },
    limpar: function () {
      [heroNome, heroBase, heroResumo].concat(heroLinhas).forEach(function (n) {
        if (n) {
          n.style.transform = "";
          n.style.opacity = "";
        }
      });
      this.ultimo = -1;
    },
  };

  /* ---------- Loader ---------- */
  // Cobre a tela por menos de 1.2s: o nome aparece exatamente sobre o do hero,
  // engorda de 100 a 900 e a cortina sobe. Desligado com movimento reduzido.
  var loader = document.querySelector(".loader");

  function rodarLoader(fontesProntas) {
    if (!loader) return Promise.resolve();
    function terminar() {
      loader.classList.add("is-fim");
    }
    if (semMovimento() || !heroNome) {
      terminar();
      return Promise.resolve();
    }

    var nome = heroNome.cloneNode(true);
    nome.removeAttribute("id");
    nome.classList.add("loader__nome");
    nome.removeAttribute("style");
    Array.prototype.forEach.call(nome.querySelectorAll("[style]"), function (n) {
      n.removeAttribute("style");
    });
    loader.replaceChildren(nome);

    function alinhar() {
      var r = heroNome.getBoundingClientRect();
      nome.className = heroNome.className + " loader__nome";
      nome.style.fontSize = getComputedStyle(heroNome).fontSize;
      nome.style.width = r.width.toFixed(1) + "px"; // ROMERO encosta à direita, como no hero
      nome.style.transform = "translate(" + r.left.toFixed(1) + "px," + r.top.toFixed(1) + "px)";
    }

    // Espera as fontes por no máximo 100ms, preservando o orçamento do loader.
    var espera = new Promise(function (ok) {
      setTimeout(ok, 100);
    });
    return Promise.race([fontesProntas, espera]).then(function () {
      encaixarHero();
      alinhar();
      var duracao = Math.min(640, Math.max(0, 1150 - performance.now()));
      var ritmo = duracao / 640;
      loader.style.transitionDuration = Math.round(400 * ritmo) + "ms";
      [100, 400, 700, 900].forEach(function (peso, i) {
        setTimeout(function () {
          nome.style.fontWeight = String(peso);
        }, i * 60 * ritmo);
      });
      return new Promise(function (ok) {
        setTimeout(function () {
          loader.classList.add("is-saindo");
        }, 240 * ritmo);
        setTimeout(function () {
          terminar();
          ok();
        }, duracao);
      });
    });
  }

  /* ---------- Faixa azul (marquee) ---------- */
  // Anda com a rolagem, não com o relógio: parada a página, a faixa para.
  var faixa = document.querySelector(".faixa");
  var faixaTrilho = null;

  function montarFaixa() {
    var itens = sobre.habilidades || [];
    if (!faixa || !itens.length) return;
    function grupo() {
      var ul = el("ul", { classe: "faixa__grupo" });
      itens.forEach(function (h) {
        ul.appendChild(el("li", { classe: "faixa__item", texto: h }));
      });
      return ul;
    }
    faixaTrilho = el("div", { classe: "faixa__trilho" }, [grupo(), grupo(), grupo()]);
    faixa.replaceChildren(el("div", { classe: "faixa__fita" }, [faixaTrilho]));
  }

  var efeitoFaixa = {
    grupo: 0,
    topo: 0,
    ultimo: null,
    medir: function () {
      var g = faixaTrilho && faixaTrilho.firstChild;
      this.grupo = g ? g.getBoundingClientRect().width : 0;
      this.ultimo = null;
    },
    quadro: function (e) {
      if (!faixaTrilho || !this.grupo || semMovimento()) return;
      var x = -((e.y * 0.45) % this.grupo) - this.grupo * 0.5;
      x = Math.round(x * 10) / 10;
      if (x === this.ultimo) return;
      this.ultimo = x;
      faixaTrilho.style.transform = "translate3d(" + x + "px,0,0)";
    },
  };

  /* ---------- Sobre ---------- */
  var sobreFrase = null;
  var sobrePalavras = [];

  function montarSobre() {
    var secao = document.getElementById("sobre");
    if (!secao) return;
    var textos = (sobre.texto || []).slice();
    var titulo = el("h2", { id: "sobre-titulo", classe: "titulo-secao" }, ["Sobre"]);

    // Primeiro parágrafo vira a frase grande; com movimento, acende palavra por palavra.
    var primeira = textos.shift();
    if (primeira) {
      sobreFrase = el("p", { classe: "sobre__frase" });
      if (!semMovimento()) {
        primeira.split(/\s+/).forEach(function (palavra, i) {
          if (i) sobreFrase.appendChild(document.createTextNode(" "));
          var s = el("span", { classe: "palavra", texto: palavra });
          sobrePalavras.push(s);
          sobreFrase.appendChild(s);
        });
        sobreFrase.classList.add("is-dividida");
      } else sobreFrase.textContent = primeira;
    }

    var texto = el(
      "div",
      { classe: "sobre__texto" },
      textos.map(function (p) {
        return el("p", { texto: p });
      })
    );
    if (sobre.exemplo) texto.appendChild(el("p", null, [etiquetaExemplo()]));
    if (sobre.pendente) texto.appendChild(pendente(sobre.pendente));

    var listas = el("div", { classe: "sobre__listas" });
    if ((sobre.habilidades || []).length) {
      var lista = el("ul", { classe: "sobre__lista", "aria-labelledby": "sobre-habilidades" });
      sobre.habilidades.forEach(function (h) {
        lista.appendChild(el("li", { texto: h }));
      });
      listas.appendChild(
        el("div", { classe: "sobre__bloco" }, [el("h3", { id: "sobre-habilidades", classe: "sobre__subtitulo", texto: "Com o que trabalho" }), lista])
      );
    }
    if ((sobre.idiomas || []).length) {
      var idiomas = el("ul", { classe: "sobre__idiomas", "aria-labelledby": "sobre-idiomas" });
      sobre.idiomas.forEach(function (d) {
        idiomas.appendChild(
          el("li", null, [el("span", { texto: d.idioma || "" }), d.nivel ? el("span", { classe: "sobre__nivel", texto: d.nivel }) : null])
        );
      });
      listas.appendChild(
        el("div", { classe: "sobre__bloco" }, [el("h3", { id: "sobre-idiomas", classe: "sobre__subtitulo", texto: "Idiomas" }), idiomas])
      );
    }
    secao.replaceChildren(titulo, sobreFrase, el("div", { classe: "sobre__grade" }, [texto, listas]));
  }

  // A frase acende da primeira à última palavra enquanto atravessa a tela.
  var efeitoFrase = {
    acesas: -1,
    medir: function () {
      this.acesas = -1;
    },
    quadro: function (e) {
      if (!sobreFrase || !sobrePalavras.length) return;
      var n = sobrePalavras.length;
      if (!semMovimento()) {
        var r = sobreFrase.getBoundingClientRect();
        var inicio = e.vh * 0.88; // topo da frase entra por baixo
        var fim = e.vh * 0.42 - r.height; // base da frase passa de 42% da tela
        n = Math.round(limitar((inicio - r.top) / (inicio - fim), 0, 1) * sobrePalavras.length);
      }
      if (n === this.acesas) return;
      var antes = this.acesas < 0 ? 0 : this.acesas;
      var de = Math.min(antes, n);
      var ate = Math.max(this.acesas < 0 ? sobrePalavras.length : antes, n);
      for (var i = de; i < ate; i++) sobrePalavras[i].classList.toggle("is-acesa", i < n);
      this.acesas = n;
    },
  };

  /* ---------- Títulos de seção: entram deslizando com a rolagem ---------- */
  var titulos = [];
  var efeitoTitulos = {
    medir: function () {
      titulos = Array.prototype.slice.call(document.querySelectorAll("main .titulo-secao"));
      titulos.forEach(function (t) {
        t._ultimo = null;
      });
    },
    quadro: function (e) {
      if (semMovimento()) return;
      var lidos = titulos.map(function (t) {
        return t.getBoundingClientRect().top;
      });
      titulos.forEach(function (t, i) {
        var topo = lidos[i];
        if (topo > e.vh * 1.2 || topo < -e.vh) return; // fora de alcance: não mexe
        var k = suave(limitar((e.vh - topo) / (e.vh * 0.55), 0, 1));
        var x = Math.round((1 - k) * e.vw * 0.14);
        if (x === t._ultimo) return;
        t._ultimo = x;
        t.style.transform = x ? "translate3d(" + x + "px,0,0)" : "";
      });
    },
  };

  /* ---------- Contato ---------- */
  var contatoEmail = null;

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
    var filhos = [el("h2", { id: "contato-titulo", classe: "titulo-secao" }, ["Contato"])];

    if (pessoa.disponivel) filhos.push(el("p", { classe: "status contato__status", texto: textoDisponivel() }));

    if (contato.email) {
      contatoEmail = el("span", { classe: "contato__email-texto", texto: contato.email });
      filhos.push(el("p", { classe: "contato__linha-email" }, [el("a", { href: "mailto:" + contato.email, classe: "contato__email" }, [contatoEmail])]));

      var aviso = el("p", { classe: "contato__aviso", role: "status", "aria-live": "polite" });
      var botao = el("button", { type: "button", classe: "botao botao--cheio" }, ["Copiar e-mail"]);
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
      var acoes = el("div", { classe: "contato__acoes" }, [botao]);
      if (contato.github) acoes.appendChild(linkExterno(contato.github, "GitHub", "botao botao--contorno"));
      if (contato.whatsapp) {
        var num = String(contato.whatsapp).replace(/\D/g, "");
        var msg = contato.mensagemWhatsapp ? "?text=" + encodeURIComponent(contato.mensagemWhatsapp) : "";
        acoes.appendChild(linkExterno("https://wa.me/" + num + msg, "WhatsApp", "botao botao--contorno"));
      }
      if (contato.linkedin) acoes.appendChild(linkExterno(contato.linkedin, "LinkedIn", "botao botao--contorno"));
      if (contato.exemplo) acoes.appendChild(etiquetaExemplo());
      filhos.push(acoes, aviso);
    }
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

  function encaixarTextos() {
    if (rodapeGigante) encaixar(rodapeGigante, [rodapeGigante.firstChild], "--rodape-tam", rodape, 0);
    var secaoContato = document.getElementById("contato");
    if (contatoEmail && secaoContato) {
      var rem = px(getComputedStyle(raiz).fontSize) || 16;
      encaixar(contatoEmail.parentNode, [contatoEmail], "--email-tam", secaoContato, 11 * rem);
    }
  }

  /* ---------- Títulos display: quebra só em espaços ---------- */
  // O navegador quebra linha depois de "-" (FRONT-END). Envolver a palavra
  // em .sem-quebra (white-space: nowrap) deixa só os espaços como quebra.
  var SELETOR_DISPLAY = ".titulo-secao, .card-projeto__nome, .credencial__nome, h1, h2, h3, h4";

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

  // Contrato antigo (data-reveal / .is-in) mantido por compatibilidade:
  // nada é escondido por CSS; aqui só marcamos e protegemos hífens.
  function observarRevelacoes(raizBusca) {
    var base = raizBusca || document;
    protegerHifens(base);
    if (base.matches && base.matches("[data-reveal]")) base.classList.add("is-in");
    Array.prototype.forEach.call(base.querySelectorAll("[data-reveal]"), function (n) {
      n.classList.add("is-in");
    });
  }
  window.observarRevelacoes = observarRevelacoes;

  /* ---------- Rolagem suave (Lenis) e âncoras ---------- */
  var lenis = null;

  function ligarLenis() {
    // Só com mouse/trackpad e sem movimento reduzido. Em toque fica a rolagem nativa.
    if (lenis || typeof window.Lenis !== "function" || semMovimento() || !mqMouse.matches) return;
    try {
      lenis = new window.Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true });
    } catch (err) {
      lenis = null;
      return;
    }
    window.lenis = lenis;
    function laco(t) {
      if (!lenis) return;
      lenis.raf(t);
      requestAnimationFrame(laco);
    }
    requestAnimationFrame(laco);

    // Visualizador aberto: a página para e a roda funciona dentro do diálogo.
    var dialogo = document.getElementById("visualizador");
    if (dialogo) dialogo.setAttribute("data-lenis-prevent", "");
    if ("MutationObserver" in window) {
      new MutationObserver(function () {
        if (!lenis) return;
        if (raiz.classList.contains("visualizador-aberto")) lenis.stop();
        else lenis.start();
      }).observe(raiz, { attributes: true, attributeFilter: ["class"] });
    }
  }

  function desligarLenis() {
    if (!lenis) return;
    lenis.destroy();
    lenis = null;
    window.lenis = null;
  }

  // Rola até um elemento (ou posição) sem depender do scroll-behavior do CSS.
  function rolarPara(alvo, opcoes) {
    var imediato = !!(opcoes && opcoes.imediato) || semMovimento();
    var y = typeof alvo === "number" ? alvo : alvo === hero ? 0 : alvo.getBoundingClientRect().top + window.scrollY;
    y = Math.max(0, Math.round(y));
    if (lenis) {
      lenis.scrollTo(y, { immediate: imediato, duration: imediato ? 0 : 1.2, force: true });
    } else {
      window.scrollTo({ top: y, behavior: imediato ? "auto" : "smooth" });
    }
  }
  window.rolarPara = rolarPara;

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = decodeURIComponent(a.getAttribute("href").slice(1));
    var alvo = id ? document.getElementById(id) : null;
    if (!alvo) return;
    e.preventDefault();
    rolarPara(alvo);
    if (history.pushState) history.pushState(null, "", "#" + id);
    // Foco acompanha a âncora (leitores de tela e teclado), sem pular a tela.
    var foco = alvo;
    if (!foco.hasAttribute("tabindex") && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(foco.tagName)) foco.setAttribute("tabindex", "-1");
    try {
      foco.focus({ preventScroll: true });
    } catch (err) {
      /* navegadores antigos */
    }
  });

  /* ---------- Cursor ---------- */
  function ligarCursor() {
    var cursor = document.querySelector(".cursor");
    if (!cursor || !mqMouse.matches || semMovimento()) return;
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
      if (Math.abs(alvoX - x) < 0.1 && Math.abs(alvoY - y) < 0.1) {
        x = alvoX;
        y = alvoY;
        rodando = false;
      } else requestAnimationFrame(quadro);
      // A propriedade translate vem antes de scale na composição: a escala do
      // CSS não multiplica a posição (com transform, o ponto ficava fora do mouse).
      cursor.style.translate = x.toFixed(1) + "px " + y.toFixed(1) + "px";
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
      var t = e.target.closest ? e.target.closest("a, button, select, [data-cursor]") : null;
      var rotulo = t && t.getAttribute("data-cursor");
      cursor.classList.toggle("is-grande", !!t && !rotulo);
      cursor.classList.toggle("is-texto", !!rotulo);
      texto.textContent = rotulo || "";
    });

    raiz.addEventListener("pointerleave", function () {
      cursor.classList.remove("is-visivel");
    });
    window.addEventListener("blur", function () {
      cursor.classList.remove("is-visivel");
    });

    // Só agora o CSS troca o cursor do sistema: se algo acima falhar, ele fica.
    raiz.classList.add("cursor-on");
  }

  /* ---------- Início ---------- */
  montarHero();
  montarFaixa();
  montarSobre();
  montarContato();
  montarRodape();

  // Ordem: hero e faixa antes dos módulos de seção, títulos por último.
  efeitos.unshift(efeitoHero, efeitoFaixa, efeitoFrase);
  efeitos.push(efeitoTitulos);

  encaixarHero();
  encaixarTextos();

  var fontesProntas = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  fontesProntas.then(function () {
    encaixarHero();
    encaixarTextos();
    medirTudo();
  });

  window.addEventListener("scroll", pedirQuadro, { passive: true });

  var timerTela = 0;
  var larguraAntes = raiz.clientWidth;
  window.addEventListener("resize", function () {
    clearTimeout(timerTela);
    timerTela = setTimeout(function () {
      // No celular a barra de endereço muda só a altura: não reencaixa o nome por isso.
      var mudouLargura = raiz.clientWidth !== larguraAntes;
      larguraAntes = raiz.clientWidth;
      if (mudouLargura || mqMouse.matches) {
        encaixarHero();
        encaixarTextos();
      }
      medirTudo();
    }, 120);
  });

  // Mudanças de altura do documento (imagens, fontes, filtro) remedem os efeitos.
  if ("ResizeObserver" in window) {
    var alturaDoc = 0;
    new ResizeObserver(function () {
      var h = document.body.scrollHeight;
      if (h === alturaDoc) return;
      alturaDoc = h;
      medirTudo();
    }).observe(document.body);
  }

  if (mqReduzido.addEventListener) {
    mqReduzido.addEventListener("change", function () {
      raiz.classList.toggle("movimento", !semMovimento());
      if (semMovimento()) {
        desligarLenis();
        efeitoHero.limpar();
        if (faixaTrilho) faixaTrilho.style.transform = "";
        titulos.forEach(function (t) {
          t.style.transform = "";
        });
        sobrePalavras.forEach(function (s) {
          s.classList.add("is-acesa");
        });
      } else ligarLenis();
      encaixarHero();
      medirTudo();
    });
  }

  rodarLoader(fontesProntas);

  // Projetos e documentos renderizam antes (scripts defer anteriores); os
  // efeitos, a rolagem suave e o cursor ligam depois deles.
  function finalizar() {
    observarRevelacoes(document);
    ligarLenis();
    ligarCursor();
    medirTudo();
    // Entrada com #ancora na URL: posiciona depois que as alturas existem.
    if (location.hash.length > 1) {
      var alvo = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (alvo) rolarPara(alvo, { imediato: true });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", finalizar);
  else finalizar();
})();
