/*
 * Motor interativo do portfólio:
 * 1. Simulação em Canvas 2D a 60fps no Hero (Rede Neural, Gravidade Elástica e Vórtice)
 * 2. Ondas de choque ao clicar/tocar que atravessam o canvas e as letras gigantes
 * 3. Física de molas por caractere em fonte variável + decodificação cyber
 * 4. Marquee reativo à velocidade de rolagem
 * 5. Botões magnéticos + Cards 3D com spotlight radial
 * 6. Paleta rápida de comandos (Cmd+K / Ctrl+K)
 */
(function () {
  "use strict";

  var DADOS = window.PORTFOLIO || {};
  var contato = DADOS.contato || {};
  var mqMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mqFino = window.matchMedia("(hover: hover) and (pointer: fine)");

  function semMovimento() {
    return mqMovimento.matches;
  }

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

  function normalizarBusca(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  /* ---------- Toast Rápido ---------- */
  var toastNo = null;
  var toastTimer = 0;

  function mostrarToast(msg) {
    if (!toastNo) {
      toastNo = el("div", { classe: "toast-acao", role: "status", "aria-live": "polite" });
      document.body.appendChild(toastNo);
    }
    toastNo.textContent = msg;
    toastNo.classList.add("is-visivel");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastNo.classList.remove("is-visivel");
    }, 2400);
  }

  /* ==========================================================================
   * 1 & 2 & 3. HERO ENGINE: CANVAS 2D + FÍSICA DAS LETRAS + SCRAMBLE
   * ========================================================================== */
  var hero = document.getElementById("hero");
  var canvas = document.getElementById("hero-canvas");
  var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  var telemetriaEl = document.getElementById("hero-telemetria");
  var especialidadeEl = document.getElementById("hero-especialidade");
  var botoesModo = hero ? Array.prototype.slice.call(hero.querySelectorAll("[data-modo-hero]")) : [];

  var larguraHero = 0;
  var alturaHero = 0;
  var dpr = 1;
  var modoAtual = "rede"; // "rede" | "gravidade" | "vortice"
  var polaridadeVortice = 1;
  var heroVisivel = true;
  var animandoHero = false;

  // Estado do ponteiro relativo ao hero
  var ponteiro = {
    x: -9999,
    y: -9999,
    vx: 0,
    vy: 0,
    ativo: false,
  };

  // Estruturas das simulações
  var nosRede = [];
  var faiscas = [];
  var ondas = [];
  var malha = { cols: 0, lins: 0, espaco: 48, pontos: [] };
  var trilhasVortice = [];

  // Estado cinético de cada letra de IGOR ROMERO
  var estadoLetras = [];
  var GLIFOS = "01/<>_#+=*%$";

  function coletarLetras() {
    if (!hero) return;
    var spans = Array.prototype.slice.call(hero.querySelectorAll(".hero__letra"));
    estadoLetras = spans.map(function (sp, idx) {
      return {
        el: sp,
        real: sp.getAttribute("data-letra") || sp.textContent,
        idx: idx,
        cx: 0,
        cy: 0,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        peso: 900,
        brilho: 0,
        energizada: false,
      };
    });
    atualizarCentrosLetras();
  }

  function atualizarCentrosLetras() {
    if (!hero || !estadoLetras.length) return;
    var rHero = hero.getBoundingClientRect();
    estadoLetras.forEach(function (L) {
      var prev = L.el.style.transform;
      L.el.style.transform = "none";
      var r = L.el.getBoundingClientRect();
      L.cx = r.left - rHero.left + r.width * 0.5;
      L.cy = r.top - rHero.top + r.height * 0.5;
      L.el.style.transform = prev;
    });
  }
  window.atualizarCentrosLetras = atualizarCentrosLetras;

  function criarNosRede() {
    var qtd = larguraHero < 700 ? 42 : Math.min(92, Math.floor((larguraHero * alturaHero) / 14500));
    nosRede = [];
    for (var i = 0; i < qtd; i++) {
      var x = Math.random() * larguraHero;
      var y = Math.random() * alturaHero;
      nosRede.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 0.75,
        vy: (Math.random() - 0.5) * 0.75,
        r: 1.4 + Math.random() * 2.1,
        fase: Math.random() * Math.PI * 2,
      });
    }
  }

  function criarMalhaGravidade() {
    var espaco = larguraHero < 700 ? 54 : 46;
    var cols = Math.ceil(larguraHero / espaco) + 1;
    var lins = Math.ceil(alturaHero / espaco) + 1;
    var pontos = [];
    for (var j = 0; j < lins; j++) {
      for (var i = 0; i < cols; i++) {
        var ox = i * espaco;
        var oy = j * espaco;
        pontos.push({ ox: ox, oy: oy, x: ox, y: oy, vx: 0, vy: 0 });
      }
    }
    malha = { cols: cols, lins: lins, espaco: espaco, pontos: pontos };
  }

  function criarTrilhasVortice() {
    var qtd = larguraHero < 700 ? 75 : 155;
    trilhasVortice = [];
    for (var i = 0; i < qtd; i++) {
      var x = Math.random() * larguraHero;
      var y = Math.random() * alturaHero;
      trilhasVortice.push({
        x: x,
        y: y,
        px: x,
        py: y,
        vel: 1.1 + Math.random() * 1.9,
        tam: 1 + Math.random() * 1.6,
        cor: Math.random() > 0.25 ? "#2f6aff" : "#8eb0ff",
      });
    }
  }

  function redimensionarCanvas() {
    if (!hero || !canvas || !ctx) return;
    var r = hero.getBoundingClientRect();
    larguraHero = Math.max(1, Math.floor(r.width));
    alturaHero = Math.max(1, Math.floor(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(larguraHero * dpr);
    canvas.height = Math.floor(alturaHero * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    criarNosRede();
    criarMalhaGravidade();
    criarTrilhasVortice();
    atualizarCentrosLetras();

    if (semMovimento()) desenharQuadroEstatico();
  }

  function dispararOnda(x, y, forca) {
    if (semMovimento() || !larguraHero) return;
    var cx = typeof x === "number" ? x : larguraHero * 0.5;
    var cy = typeof y === "number" ? y : alturaHero * 0.48;
    var f = forca || 1;

    ondas.push({
      x: cx,
      y: cy,
      r: 8,
      maxR: Math.max(larguraHero, alturaHero) * 0.95,
      vel: 14 * Math.min(1.25, Math.max(0.85, f)),
      forca: f,
    });

    var qtdFaiscas = Math.round(22 * f);
    for (var i = 0; i < qtdFaiscas; i++) {
      var ang = (Math.PI * 2 * i) / qtdFaiscas + (Math.random() - 0.5) * 0.25;
      var v = (2.8 + Math.random() * 6.5) * f;
      faiscas.push({
        x: cx,
        y: cy,
        vx: Math.cos(ang) * v,
        vy: Math.sin(ang) * v,
        vida: 1,
        decaimento: 0.018 + Math.random() * 0.02,
        r: 1.3 + Math.random() * 2,
      });
    }

    if (modoAtual === "vortice") {
      polaridadeVortice *= -1;
    }
    iniciarLoopHero();
  }
  window.dispararOndaHero = dispararOnda;

  function definirModoHero(novoModo) {
    if (["rede", "gravidade", "vortice"].indexOf(novoModo) === -1) return;
    modoAtual = novoModo;
    botoesModo.forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-modo-hero") === novoModo ? "true" : "false");
    });
    if (ctx && larguraHero) {
      ctx.clearRect(0, 0, larguraHero, alturaHero);
    }
    dispararOnda(
      ponteiro.ativo ? ponteiro.x : larguraHero * 0.5,
      ponteiro.ativo ? ponteiro.y : alturaHero * 0.46,
      0.85
    );
  }
  window.definirModoHero = definirModoHero;

  // Decodificação cyber letra por letra (Scramble)
  var timerScramble = 0;
  function decodificarHero() {
    if (semMovimento() || !estadoLetras.length) return;
    clearInterval(timerScramble);
    var passo = 0;
    var totalPassos = estadoLetras.length * 3 + 8;

    timerScramble = setInterval(function () {
      passo++;
      estadoLetras.forEach(function (L, idx) {
        var limiar = idx * 2.4 + 5;
        if (passo >= limiar) {
          L.el.textContent = L.real;
          L.el.classList.remove("is-decodificando");
        } else {
          L.el.textContent = GLIFOS[Math.floor(Math.random() * GLIFOS.length)];
          L.el.classList.add("is-decodificando");
          L.vy -= 0.7;
          L.brilho = 0.85;
        }
      });

      if (passo >= totalPassos) {
        clearInterval(timerScramble);
        estadoLetras.forEach(function (L) {
          L.el.textContent = L.real;
          L.el.classList.remove("is-decodificando");
        });
      }
    }, 28);
  }

  function iniciarEntradaHero() {
    atualizarCentrosLetras();
    decodificarHero();
    dispararOnda(larguraHero * 0.5, alturaHero * 0.46, 1.15);
  }
  window.iniciarEntradaHero = iniciarEntradaHero;

  /* ---------- Desenho dos 3 Modos no Canvas ---------- */
  function atualizarOndasEFaiscas() {
    // Ondas de choque expansivas
    for (var i = ondas.length - 1; i >= 0; i--) {
      var o = ondas[i];
      o.r += o.vel;
      o.vel *= 0.988;
      var vida = 1 - o.r / o.maxR;
      if (vida <= 0.01) {
        ondas.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(110, 151, 255," + (vida * 0.55).toFixed(3) + ")";
      ctx.lineWidth = 2.2 * vida + 0.6;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(o.x, o.y, Math.max(0, o.r - 12), 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(47, 106, 255," + (vida * 0.22).toFixed(3) + ")";
      ctx.lineWidth = 8 * vida;
      ctx.stroke();
      ctx.restore();
    }

    // Faíscas cinéticas
    for (var j = faiscas.length - 1; j >= 0; j--) {
      var f = faiscas[j];
      f.x += f.vx;
      f.y += f.vy;
      f.vx *= 0.95;
      f.vy *= 0.95;
      f.vida -= f.decaimento;
      if (f.vida <= 0) {
        faiscas.splice(j, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * f.vida, 0, Math.PI * 2);
      ctx.fillStyle = f.vida > 0.6 ? "#ffffff" : "rgba(110, 151, 255," + f.vida.toFixed(3) + ")";
      ctx.fill();
    }
  }

  function focoAtivo(tempo) {
    if (ponteiro.ativo) {
      return { x: ponteiro.x, y: ponteiro.y, vx: ponteiro.vx, vy: ponteiro.vy, real: true };
    }
    // Atrator orbital Lissajous suave quando o mouse está fora, mantendo a tela viva
    var t = tempo * 0.00065;
    return {
      x: larguraHero * (0.58 + Math.sin(t) * 0.28),
      y: alturaHero * (0.46 + Math.sin(t * 1.7) * 0.22),
      vx: Math.cos(t) * 2,
      vy: Math.cos(t * 1.7) * 2,
      real: false,
    };
  }

  function simularRede(tempo) {
    ctx.clearRect(0, 0, larguraHero, alturaHero);

    var foco = focoAtivo(tempo);
    var distMax = larguraHero < 700 ? 124 : 162;
    var distMax2 = distMax * distMax;

    for (var i = 0; i < nosRede.length; i++) {
      var p = nosRede[i];

      // Interação com o ponteiro ou atrator autônomo
      var dx = foco.x - p.x;
      var dy = foco.y - p.y;
      var d2 = dx * dx + dy * dy;
      var limite = foco.real ? 56000 : 34000;
      if (d2 < limite && d2 > 4) {
        var d = Math.sqrt(d2);
        var f = (1 - d / Math.sqrt(limite)) * (foco.real ? 0.06 : 0.025);
        p.vx += (dx / d) * f + (-dy / d) * f * 0.7 + foco.vx * 0.003;
        p.vy += (dy / d) * f + (dx / d) * f * 0.7 + foco.vy * 0.003;
      }

      // Impacto das ondas de choque
      for (var w = 0; w < ondas.length; w++) {
        var o = ondas[w];
        var ox = p.x - o.x;
        var oy = p.y - o.y;
        var od = Math.sqrt(ox * ox + oy * oy) || 1;
        if (Math.abs(od - o.r) < 36) {
          var imp = (1 - o.r / o.maxR) * 2.6 * o.forca;
          p.vx += (ox / od) * imp;
          p.vy += (oy / od) * imp;
        }
      }

      // Movimento orgânico base + amortecimento
      p.vx += Math.cos(tempo * 0.0007 + p.fase) * 0.01;
      p.vy += Math.sin(tempo * 0.0008 + p.fase) * 0.01;
      p.vx *= 0.976;
      p.vy *= 0.976;

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -20) p.x = larguraHero + 20;
      else if (p.x > larguraHero + 20) p.x = -20;
      if (p.y < -20) p.y = alturaHero + 20;
      else if (p.y > alturaHero + 20) p.y = -20;
    }

    // Halo energético de fundo no foco
    var raioHalo = foco.real ? 210 : 170;
    var grad = ctx.createRadialGradient(foco.x, foco.y, 0, foco.x, foco.y, raioHalo);
    grad.addColorStop(0, foco.real ? "rgba(47, 106, 255, 0.24)" : "rgba(47, 106, 255, 0.14)");
    grad.addColorStop(1, "rgba(47, 106, 255, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(foco.x, foco.y, raioHalo, 0, Math.PI * 2);
    ctx.fill();

    // Conexões entre nós próximos
    ctx.lineWidth = 1.05;
    for (var a = 0; a < nosRede.length; a++) {
      var na = nosRede[a];
      for (var b = a + 1; b < nosRede.length; b++) {
        var nb = nosRede[b];
        var lx = na.x - nb.x;
        var ly = na.y - nb.y;
        var ld2 = lx * lx + ly * ly;
        if (ld2 < distMax2) {
          var alfa = (1 - Math.sqrt(ld2) / distMax) * 0.42;
          ctx.strokeStyle = "rgba(88, 138, 255," + alfa.toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(na.x, na.y);
          ctx.lineTo(nb.x, nb.y);
          ctx.stroke();
        }
      }

      // Sinapses diretas com o foco
      var cx = foco.x - na.x;
      var cy = foco.y - na.y;
      var cd2 = cx * cx + cy * cy;
      var alcanceFoco = foco.real ? 48000 : 28000;
      if (cd2 < alcanceFoco) {
        var calfa = (1 - Math.sqrt(cd2) / Math.sqrt(alcanceFoco)) * (foco.real ? 0.78 : 0.42);
        ctx.strokeStyle = "rgba(128, 168, 255," + calfa.toFixed(3) + ")";
        ctx.lineWidth = 1.35;
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(foco.x, foco.y);
        ctx.stroke();
        ctx.lineWidth = 1.05;
      }

      // Desenha o nó
      ctx.beginPath();
      ctx.arc(na.x, na.y, na.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(165, 195, 255, 0.88)";
      ctx.fill();
    }

    atualizarOndasEFaiscas();
  }

  function simularGravidade(tempo) {
    ctx.clearRect(0, 0, larguraHero, alturaHero);
    var foco = focoAtivo(tempo);
    var pts = malha.pontos;
    var cols = malha.cols;
    var lins = malha.lins;

    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      var fx = (p.ox - p.x) * 0.085;
      var fy = (p.oy - p.y) * 0.085;

      fx += Math.sin(tempo * 0.0015 + p.oy * 0.015) * 0.11;
      fy += Math.cos(tempo * 0.0013 + p.ox * 0.015) * 0.11;

      var dx = foco.x - p.x;
      var dy = foco.y - p.y;
      var d2 = dx * dx + dy * dy;
      var raioG = foco.real ? 66000 : 42000;
      if (d2 < raioG && d2 > 9) {
        var d = Math.sqrt(d2);
        var pull = Math.pow(1 - d / Math.sqrt(raioG), 2) * (foco.real ? 5.6 : 3.4);
        fx += (dx / d) * pull;
        fy += (dy / d) * pull;
      }

      // Ondas de choque deformam a malha elástica
      for (var w = 0; w < ondas.length; w++) {
        var o = ondas[w];
        var ox = p.x - o.x;
        var oy = p.y - o.y;
        var od = Math.sqrt(ox * ox + oy * oy) || 1;
        if (Math.abs(od - o.r) < 38) {
          var chute = (1 - o.r / o.maxR) * 7.2 * o.forca;
          fx += (ox / od) * chute;
          fy += (oy / od) * chute;
        }
      }

      p.vx = (p.vx + fx) * 0.84;
      p.vy = (p.vy + fy) * 0.84;
      p.x += p.vx;
      p.y += p.vy;
    }

    // Linhas horizontais e verticais com brilho proporcional à tensão
    ctx.lineWidth = 1;
    for (var r = 0; r < lins; r++) {
      ctx.beginPath();
      for (var c = 0; c < cols; c++) {
        var pt = pts[r * cols + c];
        if (c === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = "rgba(88, 134, 255, 0.16)";
      ctx.stroke();
    }

    for (var c2 = 0; c2 < cols; c2++) {
      ctx.beginPath();
      for (var r2 = 0; r2 < lins; r2++) {
        var pt2 = pts[r2 * cols + c2];
        if (r2 === 0) ctx.moveTo(pt2.x, pt2.y);
        else ctx.lineTo(pt2.x, pt2.y);
      }
      ctx.strokeStyle = "rgba(88, 134, 255, 0.16)";
      ctx.stroke();
    }

    // Destaca os vértices sob alta tensão gravitacional
    for (var k = 0; k < pts.length; k++) {
      var pk = pts[k];
      var tensao = Math.abs(pk.x - pk.ox) + Math.abs(pk.y - pk.oy);
      if (tensao > 3.5) {
        var a = Math.min(0.92, tensao / 28);
        ctx.beginPath();
        ctx.arc(pk.x, pk.y, Math.min(3.2, 1.1 + tensao * 0.07), 0, Math.PI * 2);
        ctx.fillStyle = tensao > 18 ? "#ffffff" : "rgba(110, 151, 255," + a.toFixed(3) + ")";
        ctx.fill();
      }
    }

    atualizarOndasEFaiscas();
  }

  function simularVortice(tempo) {
    // Rastro suave com fade translúcido
    ctx.fillStyle = "rgba(10, 10, 10, 0.18)";
    ctx.fillRect(0, 0, larguraHero, alturaHero);

    var t = tempo * 0.00045;
    for (var i = 0; i < trilhasVortice.length; i++) {
      var p = trilhasVortice[i];
      p.px = p.x;
      p.py = p.y;

      var ang =
        (Math.sin(p.x * 0.0045 + t) + Math.cos(p.y * 0.0045 - t * 1.2)) *
        Math.PI *
        polaridadeVortice;

      var vx = Math.cos(ang) * p.vel;
      var vy = Math.sin(ang) * p.vel;

      if (ponteiro.ativo) {
        var dx = ponteiro.x - p.x;
        var dy = ponteiro.y - p.y;
        var d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (d < 280) {
          var f = (1 - d / 280) * 3.1;
          vx += (-dy / d) * f * polaridadeVortice + (dx / d) * f * 0.35;
          vy += (dx / d) * f * polaridadeVortice + (dy / d) * f * 0.35;
        }
      }

      for (var w = 0; w < ondas.length; w++) {
        var o = ondas[w];
        var ox = p.x - o.x;
        var oy = p.y - o.y;
        var od = Math.sqrt(ox * ox + oy * oy) || 1;
        if (Math.abs(od - o.r) < 40) {
          var imp = (1 - o.r / o.maxR) * 8 * o.forca;
          vx += (ox / od) * imp;
          vy += (oy / od) * imp;
        }
      }

      p.x += vx;
      p.y += vy;

      var saiu = p.x < 0 || p.x > larguraHero || p.y < 0 || p.y > alturaHero;
      if (saiu) {
        p.x = Math.random() * larguraHero;
        p.y = Math.random() * alturaHero;
        p.px = p.x;
        p.py = p.y;
      } else {
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = p.cor;
        ctx.lineWidth = p.tam;
        ctx.stroke();
      }
    }

    atualizarOndasEFaiscas();
  }

  function desenharQuadroEstatico() {
    if (!ctx || !larguraHero) return;
    ctx.clearRect(0, 0, larguraHero, alturaHero);
    for (var a = 0; a < nosRede.length; a++) {
      var na = nosRede[a];
      for (var b = a + 1; b < nosRede.length; b++) {
        var nb = nosRede[b];
        var d = Math.hypot(na.x - nb.x, na.y - nb.y);
        if (d < 140) {
          ctx.strokeStyle = "rgba(78, 128, 255," + ((1 - d / 140) * 0.22).toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(na.x, na.y);
          ctx.lineTo(nb.x, nb.y);
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(na.x, na.y, na.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(148, 180, 255, 0.65)";
      ctx.fill();
    }
  }

  /* ---------- Física por Letra do Hero ---------- */
  function atualizarFisicaLetras(tempo) {
    if (!estadoLetras.length) return;
    var scrollP = alturaHero ? Math.min(1, Math.max(0, window.scrollY / (alturaHero * 0.78))) : 0;
    var pesoBaseScroll = 900 - 580 * scrollP;

    for (var i = 0; i < estadoLetras.length; i++) {
      var L = estadoLetras[i];
      var fx = -L.x * 0.14;
      var fy = -L.y * 0.14;
      var pesoAlvo = pesoBaseScroll + Math.sin(tempo * 0.0028 + i * 0.55) * 45 * (1 - scrollP);
      var energiaCursor = 0;

      if (ponteiro.ativo) {
        var dx = L.cx - ponteiro.x;
        var dy = L.cy - ponteiro.y;
        var d = Math.sqrt(dx * dx + dy * dy) || 1;
        var raio = 230;
        if (d < raio) {
          var prox = 1 - d / raio;
          energiaCursor = prox;
          var empurrao = prox * prox * 4.2;
          fx += (dx / d) * empurrao;
          fy += (dy / d) * empurrao - prox * 1.6;
          pesoAlvo = 260 + (1 - prox) * 640;
        }
      }

      // Onda de choque atingindo fisicamente cada letra
      for (var w = 0; w < ondas.length; w++) {
        var o = ondas[w];
        var ox = L.cx - o.x;
        var oy = L.cy - o.y;
        var od = Math.sqrt(ox * ox + oy * oy) || 1;
        if (Math.abs(od - o.r) < 48) {
          var forcaOnda = (1 - o.r / o.maxR) * 5.2 * o.forca;
          fx += (ox / od) * forcaOnda;
          fy += (oy / od) * forcaOnda - 1.8 * o.forca;
          L.brilho = Math.min(1, L.brilho + 0.45);
        }
      }

      L.vx = (L.vx + fx) * 0.78;
      L.vy = (L.vy + fy) * 0.78;
      L.x += L.vx;
      L.y += L.vy;

      pesoAlvo = Math.max(150, Math.min(900, pesoAlvo));
      L.peso += (pesoAlvo - L.peso) * 0.22;
      L.brilho = Math.max(energiaCursor * 0.9, L.brilho * 0.91);

      var rot = Math.max(-7, Math.min(7, L.vx * 0.85));
      var esc = 1 + L.brilho * 0.045;
      var yFinal = L.y - scrollP * 26;

      L.el.style.fontWeight = String(Math.round(L.peso));
      L.el.style.transform =
        "translate3d(" +
        L.x.toFixed(1) +
        "px," +
        yFinal.toFixed(1) +
        "px,0) rotate(" +
        rot.toFixed(2) +
        "deg) scale(" +
        esc.toFixed(3) +
        ")";

      var deveBrilhar = L.brilho > 0.34;
      if (deveBrilhar !== L.energizada) {
        L.energizada = deveBrilhar;
        L.el.classList.toggle("is-energizada", deveBrilhar);
      }
    }
  }

  /* ---------- Loop Principal do Hero + FPS Real ---------- */
  var ultimoTempoFps = performance.now();
  var quadrosFps = 0;

  function quadroHero(tempo) {
    if (!heroVisivel || document.hidden || semMovimento()) {
      animandoHero = false;
      return;
    }

    if (ctx && larguraHero) {
      if (modoAtual === "rede") simularRede(tempo);
      else if (modoAtual === "gravidade") simularGravidade(tempo);
      else simularVortice(tempo);
    }

    atualizarFisicaLetras(tempo);

    ponteiro.vx *= 0.85;
    ponteiro.vy *= 0.85;

    // Atualiza telemetria de FPS a cada ~500ms
    quadrosFps++;
    if (telemetriaEl && tempo - ultimoTempoFps >= 520) {
      var fps = Math.min(120, Math.round((quadrosFps * 1000) / (tempo - ultimoTempoFps)));
      var nomeModo = modoAtual === "rede" ? "REDE" : modoAtual === "gravidade" ? "GRAV" : "FLOW";
      telemetriaEl.textContent = fps + " FPS · " + nomeModo;
      quadrosFps = 0;
      ultimoTempoFps = tempo;
    }

    requestAnimationFrame(quadroHero);
  }

  function iniciarLoopHero() {
    if (animandoHero || semMovimento() || !hero) return;
    animandoHero = true;
    ultimoTempoFps = performance.now();
    quadrosFps = 0;
    requestAnimationFrame(quadroHero);
  }

  function ligarEventosHero() {
    if (!hero) return;

    hero.addEventListener(
      "pointermove",
      function (e) {
        var r = hero.getBoundingClientRect();
        var nx = e.clientX - r.left;
        var ny = e.clientY - r.top;
        if (ponteiro.ativo) {
          ponteiro.vx = nx - ponteiro.x;
          ponteiro.vy = ny - ponteiro.y;
          var vel = Math.hypot(ponteiro.vx, ponteiro.vy);
          if (vel > 16 && faiscas.length < 70 && !semMovimento()) {
            faiscas.push({
              x: nx,
              y: ny,
              vx: (Math.random() - 0.5) * 2.4 + ponteiro.vx * 0.08,
              vy: (Math.random() - 0.5) * 2.4 + ponteiro.vy * 0.08,
              vida: 0.85,
              decaimento: 0.04,
              r: 1.5,
            });
          }
        }
        ponteiro.x = nx;
        ponteiro.y = ny;
        ponteiro.ativo = true;
      },
      { passive: true }
    );

    hero.addEventListener("pointerleave", function () {
      ponteiro.ativo = false;
    });

    hero.addEventListener("click", function (e) {
      if (e.target.closest("a, button")) return;
      var r = hero.getBoundingClientRect();
      dispararOnda(e.clientX - r.left, e.clientY - r.top, 1.05);
    });

    botoesModo.forEach(function (b) {
      b.addEventListener("click", function () {
        definirModoHero(b.getAttribute("data-modo-hero"));
      });
    });

    // Cicla especialidades técnicas com scramble
    if (especialidadeEl) {
      var ESPECIALIDADES = [
        "Next.js · TypeScript · Interfaces",
        "SaaS · Supabase · PostgreSQL",
        "Canvas 2D · Motion · UI Interativa",
        "Engenharia Full Stack · Produtos Web",
      ];
      var idxEsp = 0;

      function trocarEspecialidade() {
        idxEsp = (idxEsp + 1) % ESPECIALIDADES.length;
        var alvo = ESPECIALIDADES[idxEsp];
        if (semMovimento()) {
          especialidadeEl.textContent = alvo;
          return;
        }
        var p = 0;
        var tEsp = setInterval(function () {
          p++;
          if (p >= 10) {
            clearInterval(tEsp);
            especialidadeEl.textContent = alvo;
          } else {
            var revelado = Math.floor((p / 10) * alvo.length);
            var cauda = "";
            for (var c = revelado; c < Math.min(alvo.length, revelado + 5); c++) {
              cauda += GLIFOS[Math.floor(Math.random() * GLIFOS.length)];
            }
            especialidadeEl.textContent = alvo.slice(0, revelado) + cauda;
          }
        }, 28);
      }

      especialidadeEl.addEventListener("click", function (e) {
        e.stopPropagation();
        trocarEspecialidade();
      });

      setInterval(function () {
        if (heroVisivel && !document.hidden && !semMovimento()) trocarEspecialidade();
      }, 3800);
    }

    // Pausa o motor do Hero automaticamente quando fora da tela
    if ("IntersectionObserver" in window) {
      var ioHero = new IntersectionObserver(
        function (entradas) {
          entradas.forEach(function (en) {
            heroVisivel = en.isIntersecting;
            if (heroVisivel) iniciarLoopHero();
          });
        },
        { threshold: 0.02 }
      );
      ioHero.observe(hero);
    }

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && heroVisivel) iniciarLoopHero();
    });
  }

  /* ==========================================================================
   * 4. MARQUEE REATIVO À VELOCIDADE DE ROLAGEM
   * ========================================================================== */
  function ligarMarqueeReativo() {
    var marquee = document.querySelector(".marquee");
    var trilho = marquee && marquee.querySelector(".marquee__trilho");
    var grupo = marquee && marquee.querySelector(".marquee__grupo");
    if (!marquee || !trilho || !grupo || semMovimento()) return;

    marquee.classList.add("is-js-marquee");
    var pos = 0;
    var direcao = -1;
    var impulsoScroll = 0;
    var ultimoY = window.scrollY || 0;
    var pausado = false;
    var marqueeVisivel = true;

    marquee.addEventListener("pointerenter", function () {
      pausado = true;
    });
    marquee.addEventListener("pointerleave", function () {
      pausado = false;
    });

    window.addEventListener(
      "scroll",
      function () {
        var y = window.scrollY || 0;
        var dy = y - ultimoY;
        ultimoY = y;
        if (Math.abs(dy) > 0.5) {
          direcao = dy > 0 ? -1 : 1;
          impulsoScroll = Math.min(16, Math.abs(dy) * 0.28);
        }
      },
      { passive: true }
    );

    if ("IntersectionObserver" in window) {
      var ioM = new IntersectionObserver(function (ens) {
        marqueeVisivel = ens[0].isIntersecting;
      });
      ioM.observe(marquee);
    }

    function passoMarquee() {
      if (!semMovimento()) {
        if (marqueeVisivel && !document.hidden) {
          var larg = grupo.offsetWidth || 1;
          var velBase = pausado ? 0.2 : 1.05;
          pos += direcao * (velBase + impulsoScroll);
          impulsoScroll *= 0.9;

          if (pos <= -larg) pos += larg;
          else if (pos > 0) pos -= larg;

          trilho.style.transform = "translate3d(" + pos.toFixed(1) + "px, 0, 0)";
          var skew = -18 + direcao * Math.min(12, impulsoScroll * 1.2);
          marquee.style.setProperty("--marquee-skew", skew.toFixed(1) + "deg");
        }
        requestAnimationFrame(passoMarquee);
      }
    }
    requestAnimationFrame(passoMarquee);
  }

  /* ==========================================================================
   * 5. BOTÕES MAGNÉTICOS + CARDS DE PROJETO COM SPOTLIGHT E TILT 3D
   * ========================================================================== */
  function ligarMagneticosECards() {
    if (!mqFino.matches || semMovimento()) return;

    // Botões magnéticos
    var magneticos = Array.prototype.slice.call(document.querySelectorAll("[data-magnetico]"));
    magneticos.forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        if (semMovimento()) return;
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width * 0.5)) * 0.24;
        var dy = (e.clientY - (r.top + r.height * 0.5)) * 0.28;
        btn.style.transform = "translate3d(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px,0)";
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.transform = "";
      });
    });

    // Spotlight radial e inclinação 3D suave nos cards de projeto
    var artigos = Array.prototype.slice.call(document.querySelectorAll(".card-projeto__artigo"));
    artigos.forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        if (semMovimento()) return;
        var r = card.getBoundingClientRect();
        var x = e.clientX - r.left;
        var y = e.clientY - r.top;
        card.style.setProperty("--mx", x.toFixed(0) + "px");
        card.style.setProperty("--my", y.toFixed(0) + "px");

        var rx = ((y / r.height - 0.5) * -4.2).toFixed(2);
        var ry = ((x / r.width - 0.5) * 4.2).toFixed(2);
        card.style.transform = "rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
      });

      card.addEventListener("pointerleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ==========================================================================
   * 6. PALETA DE COMANDOS (Cmd+K / Ctrl+K)
   * ========================================================================== */
  var dialogoCmd = document.getElementById("comando");
  var origemFocoCmd = null;
  var campoCmd = null;
  var listaCmd = null;
  var itensFiltrados = [];
  var indiceCmd = 0;

  function obterComandos() {
    var cmds = [
      { grupo: "Navegação", titulo: "Ir para o Início (Hero)", atalho: "Seção", acao: function () { window.irParaSecao("hero"); } },
      { grupo: "Navegação", titulo: "Ir para Sobre e Habilidades", atalho: "Seção", acao: function () { window.irParaSecao("sobre"); } },
      { grupo: "Navegação", titulo: "Ir para Projetos", atalho: "Seção", acao: function () { window.irParaSecao("projetos"); } },
      { grupo: "Navegação", titulo: "Ir para Currículo e Trajetória", atalho: "Seção", acao: function () { window.irParaSecao("curriculo"); } },
      { grupo: "Navegação", titulo: "Ir para Certificações", atalho: "Seção", acao: function () { window.irParaSecao("certificacoes"); } },
      { grupo: "Navegação", titulo: "Ir para Contato", atalho: "Seção", acao: function () { window.irParaSecao("contato"); } },

      {
        grupo: "Simulação Interativa (Hero)",
        titulo: "Ativar modo Rede Neural",
        atalho: "Tecla 1",
        acao: function () {
          window.irParaSecao("hero");
          definirModoHero("rede");
          mostrarToast("Simulação: Rede Neural ativada");
        },
      },
      {
        grupo: "Simulação Interativa (Hero)",
        titulo: "Ativar modo Campo Gravitacional",
        atalho: "Tecla 2",
        acao: function () {
          window.irParaSecao("hero");
          definirModoHero("gravidade");
          mostrarToast("Simulação: Campo Gravitacional ativado");
        },
      },
      {
        grupo: "Simulação Interativa (Hero)",
        titulo: "Ativar modo Vórtice de Fluxo",
        atalho: "Tecla 3",
        acao: function () {
          window.irParaSecao("hero");
          definirModoHero("vortice");
          mostrarToast("Simulação: Vórtice de Fluxo ativado");
        },
      },
      {
        grupo: "Simulação Interativa (Hero)",
        titulo: "Disparar Onda de Choque no Hero",
        atalho: "Pulso",
        acao: function () {
          window.irParaSecao("hero");
          setTimeout(function () {
            decodificarHero();
            dispararOnda(larguraHero * 0.5, alturaHero * 0.46, 1.35);
          }, 120);
        },
      },
    ];

    var btnCv = document.querySelector("#curriculo button[data-arquivo]");
    if (btnCv) {
      cmds.push({
        grupo: "Ações Rápidas",
        titulo: "Visualizar Currículo em PDF",
        atalho: "PDF",
        acao: function () {
          btnCv.click();
        },
      });
    }

    if (contato.email && typeof window.copiarTextoPortfolio === "function") {
      cmds.push({
        grupo: "Ações Rápidas",
        titulo: "Copiar e-mail (" + contato.email + ")",
        atalho: "Copiar",
        acao: function () {
          window.copiarTextoPortfolio(contato.email).then(function () {
            mostrarToast("E-mail copiado: " + contato.email);
          });
        },
      });
    }

    if (contato.github) {
      cmds.push({
        grupo: "Ações Rápidas",
        titulo: "Abrir perfil no GitHub",
        atalho: "Externo",
        acao: function () {
          window.open(contato.github, "_blank", "noopener");
        },
      });
    }

    if (contato.whatsapp) {
      var num = String(contato.whatsapp).replace(/\D/g, "");
      var msg = contato.mensagemWhatsapp ? "?text=" + encodeURIComponent(contato.mensagemWhatsapp) : "";
      cmds.push({
        grupo: "Ações Rápidas",
        titulo: "Conversar no WhatsApp",
        atalho: "Externo",
        acao: function () {
          window.open("https://wa.me/" + num + msg, "_blank", "noopener");
        },
      });
    }

    return cmds;
  }

  function montarDialogoComandos() {
    if (!dialogoCmd || campoCmd) return;

    var tituloOculto = el("h2", { id: "comando-titulo", classe: "visualmente-oculto", texto: "Menu rápido de comandos" });
    campoCmd = el("input", {
      type: "search",
      classe: "comando__campo",
      placeholder: "Digite uma seção, modo visual ou ação...",
      autocomplete: "off",
      spellcheck: "false",
      "aria-label": "Filtrar comandos",
    });

    var btnEsc = el("button", { type: "button", classe: "comando__esc", texto: "ESC" });
    btnEsc.addEventListener("click", function () {
      dialogoCmd.close();
    });

    listaCmd = el("ul", { classe: "comando__lista", role: "listbox", "aria-label": "Ações disponíveis" });
    var rodape = el("div", { classe: "comando__rodape" }, [
      el("span", { texto: "↑↓ navegar · Enter executar" }),
      el("span", { texto: "Igor Romero · Dev Portfolio" }),
    ]);

    dialogoCmd.replaceChildren(
      tituloOculto,
      el("div", { classe: "comando__topo" }, [campoCmd, btnEsc]),
      listaCmd,
      rodape
    );

    campoCmd.addEventListener("input", function () {
      indiceCmd = 0;
      renderizarListaComandos(campoCmd.value);
    });

    campoCmd.addEventListener("keydown", function (e) {
      if (!itensFiltrados.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        indiceCmd = (indiceCmd + 1) % itensFiltrados.length;
        destacarComandoSelecionado();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        indiceCmd = (indiceCmd - 1 + itensFiltrados.length) % itensFiltrados.length;
        destacarComandoSelecionado();
      } else if (e.key === "Enter") {
        e.preventDefault();
        executarComando(itensFiltrados[indiceCmd]);
      }
    });

    dialogoCmd.addEventListener("click", function (e) {
      if (e.target === dialogoCmd) dialogoCmd.close();
    });

    dialogoCmd.addEventListener("close", function () {
      if (origemFocoCmd && typeof origemFocoCmd.focus === "function") {
        origemFocoCmd.focus();
      }
      origemFocoCmd = null;
    });
  }

  function renderizarListaComandos(termo) {
    var q = normalizarBusca(termo).trim();
    var todos = obterComandos();
    itensFiltrados = todos.filter(function (c) {
      if (!q) return true;
      return normalizarBusca(c.titulo + " " + c.grupo + " " + c.atalho).indexOf(q) !== -1;
    });

    listaCmd.textContent = "";
    if (!itensFiltrados.length) {
      listaCmd.appendChild(el("li", { classe: "comando__vazio", texto: "Nenhum comando encontrado." }));
      return;
    }

    var ultimoGrupo = "";
    itensFiltrados.forEach(function (item, idx) {
      if (item.grupo !== ultimoGrupo) {
        ultimoGrupo = item.grupo;
        listaCmd.appendChild(el("li", { classe: "comando__grupo", "aria-hidden": "true", texto: item.grupo }));
      }
      var btn = el(
        "button",
        {
          type: "button",
          classe: "comando__item" + (idx === indiceCmd ? " is-selecionado" : ""),
          role: "option",
          "aria-selected": idx === indiceCmd ? "true" : "false",
        },
        [
          el("span", { texto: item.titulo }),
          el("span", { classe: "comando__atalho", texto: item.atalho }),
        ]
      );
      btn.addEventListener("pointerenter", function () {
        indiceCmd = idx;
        destacarComandoSelecionado();
      });
      btn.addEventListener("click", function () {
        executarComando(item);
      });
      item._botao = btn;
      listaCmd.appendChild(el("li", null, [btn]));
    });
  }

  function destacarComandoSelecionado() {
    itensFiltrados.forEach(function (it, i) {
      if (!it._botao) return;
      var sel = i === indiceCmd;
      it._botao.classList.toggle("is-selecionado", sel);
      it._botao.setAttribute("aria-selected", sel ? "true" : "false");
      if (sel && it._botao.scrollIntoView) {
        it._botao.scrollIntoView({ block: "nearest" });
      }
    });
  }

  function executarComando(item) {
    if (!item) return;
    origemFocoCmd = null;
    dialogoCmd.close();
    item.acao();
  }

  function abrirComandos(origem) {
    if (!dialogoCmd || typeof dialogoCmd.showModal !== "function") return;
    montarDialogoComandos();
    if (dialogoCmd.open) {
      dialogoCmd.close();
      return;
    }
    origemFocoCmd = origem || document.activeElement;
    campoCmd.value = "";
    indiceCmd = 0;
    renderizarListaComandos("");
    dialogoCmd.showModal();
    campoCmd.focus();
  }
  window.abrirComandos = abrirComandos;

  // Atalhos globais de teclado (Cmd+K / Ctrl+K e teclas 1, 2, 3 no Hero)
  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      abrirComandos(document.activeElement);
      return;
    }

    var tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea" || tag === "select" || e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.querySelector("dialog[open]")) return;

    if (heroVisivel && (e.key === "1" || e.key === "2" || e.key === "3")) {
      var mapa = { "1": "rede", "2": "gravidade", "3": "vortice" };
      definirModoHero(mapa[e.key]);
      var rotulos = { "1": "Rede Neural", "2": "Campo Gravitacional", "3": "Vórtice de Fluxo" };
      mostrarToast("Modo: " + rotulos[e.key]);
    }
  });

  /* ---------- Inicialização ---------- */
  function iniciarTudo() {
    coletarLetras();
    redimensionarCanvas();
    ligarEventosHero();
    iniciarLoopHero();
    ligarMarqueeReativo();
    ligarMagneticosECards();

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        atualizarCentrosLetras();
      });
    }
  }

  var timerResize = 0;
  window.addEventListener("resize", function () {
    clearTimeout(timerResize);
    timerResize = setTimeout(function () {
      redimensionarCanvas();
    }, 120);
  });

  if (mqMovimento.addEventListener) {
    mqMovimento.addEventListener("change", function () {
      if (semMovimento()) {
        desenharQuadroEstatico();
        estadoLetras.forEach(function (L) {
          L.el.style.transform = "";
          L.el.style.fontWeight = "";
          L.el.classList.remove("is-energizada", "is-decodificando");
        });
      } else {
        iniciarLoopHero();
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciarTudo);
  else iniciarTudo();
})();
