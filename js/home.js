/*
 * Página Início. Dono: js/home.js + css/home.css. Veja DESIGN.md (Revisão 4).
 *
 * 1. Preenche os textos da página a partir de window.PORTFOLIO (data.js).
 * 2. Hero: um grafo vivo num <canvas>. Os nós saem do caos e formam o nome,
 *    amostrado dos pixels do texto renderizado fora da tela. O ponteiro empurra
 *    e arrasta os nós; um clique roda BFS ou Dijkstra a partir do nó mais
 *    próximo e acende a árvore de busca em azul.
 *
 * Desempenho: um único requestAnimationFrame, devicePixelRatio até 2, grade
 * espacial (hash por célula) para vizinhos, nós proporcionais à área, pausa com
 * a aba oculta ou o hero fora da tela. Com prefers-reduced-motion o grafo é
 * desenhado uma vez, já formado, sem física nem onda.
 */
(function () {
  "use strict";

  var D = window.PORTFOLIO;
  if (!D) return;

  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ------------------------------------------------------------------ */
  /* Conteúdo                                                           */
  /* ------------------------------------------------------------------ */

  function el(tag, cls, texto) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (texto != null) n.textContent = texto;
    return n;
  }

  function preencher() {
    var p = D.pessoa || {};
    var nome = document.getElementById("hero-nome");
    if (nome && p.nome) {
      nome.textContent = "";
      nome.appendChild(el("span", null, p.nome));
      nome.appendChild(document.createTextNode(" "));
      nome.appendChild(el("span", null, p.sobrenome || ""));
    }
    var cargo = document.getElementById("hero-cargo");
    if (cargo && p.cargo) cargo.textContent = p.cargo;

    var resumo = document.getElementById("home-resumo");
    if (resumo && p.resumo) resumo.textContent = p.resumo;

    var meta = document.getElementById("home-meta");
    if (meta) {
      meta.textContent = "";
      if (p.local) meta.appendChild(document.createTextNode(p.local));
      if (p.disponivel && p.disponivelTexto) {
        if (p.local) meta.appendChild(document.createElement("br"));
        meta.appendChild(el("span", "apresenta__disponivel", p.disponivelTexto));
      }
      meta.hidden = !meta.childNodes.length;
    }

    var email = document.getElementById("home-email");
    var c = D.contato || {};
    if (email) email.textContent = c.email || "E-mail, GitHub e WhatsApp";

    var lista = document.getElementById("home-destaques");
    var projetos = (D.projetos || []).filter(function (x) { return x.destaque; }).slice(0, 3);
    if (lista && projetos.length) {
      lista.textContent = "";
      projetos.forEach(function (pr) {
        var li = el("li", "card");
        if (pr.imagem && pr.imagem.src) {
          var mold = el("div", "card__moldura");
          var img = el("img", "card__img");
          img.src = pr.imagem.src;
          img.alt = pr.imagem.alt || "";
          img.width = 800;
          img.height = 500;
          img.loading = "lazy";
          img.decoding = "async";
          mold.appendChild(img);
          li.appendChild(mold);
        }
        var corpo = el("div", "card__corpo");
        var metaTxt = [pr.categoria, pr.ano].filter(Boolean).join(", ");
        if (metaTxt) corpo.appendChild(el("p", "card__meta", metaTxt));
        var h = el("h3", "card__nome");
        var a = el("a", null, pr.nome);
        a.href = "projetos.html";
        h.appendChild(a);
        corpo.appendChild(h);
        if (pr.descricao) corpo.appendChild(el("p", "card__desc", pr.descricao));
        if (pr.pendente) {
          var tag = el("span", "card__pendente", "A confirmar");
          tag.title = pr.pendente;
          corpo.appendChild(tag);
        }
        li.appendChild(corpo);
        lista.appendChild(li);
      });
    }
  }

  preencher();

  /* ------------------------------------------------------------------ */
  /* Hero                                                               */
  /* ------------------------------------------------------------------ */

  var hero = document.getElementById("hero");
  if (!hero) return;
  var topo = document.getElementById("topo");
  var cargoEl = document.getElementById("hero-cargo");
  var dicaEl = document.getElementById("hud-dica");
  var statsEl = document.getElementById("hud-stats");
  var hudEl = document.getElementById("hud");
  var hudNos = statsEl && statsEl.querySelector('[data-hud="nos"]');
  var hudArestas = statsEl && statsEl.querySelector('[data-hud="arestas"]');
  var hudAlgo = statsEl && statsEl.querySelector('[data-hud="algo"]');
  var hudFps = statsEl && statsEl.querySelector('[data-hud="fps"]');

  var canvas = document.createElement("canvas");
  if (!canvas.getContext) return;
  var ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;
  canvas.className = "hero__canvas";
  canvas.setAttribute("aria-hidden", "true");
  hero.insertBefore(canvas, hero.firstChild);
  hero.classList.add("hero--viva");
  if (statsEl) statsEl.hidden = false;

  /* Altura do cabeçalho: o hero ocupa a tela menos o topo. */
  function medirTopo() {
    if (!topo) return;
    var h = topo.offsetHeight || 64;
    hero.style.setProperty("--hero-topo", h + "px");
  }
  medirTopo();
  if (topo && window.ResizeObserver) new ResizeObserver(medirTopo).observe(topo);

  /* Cores dos tokens. */
  var css = getComputedStyle(document.documentElement);
  function token(n, f) { return (css.getPropertyValue(n) || "").trim() || f; }
  var COR = {
    fundo: token("--preto", "#0a0a0a"),
    giz: token("--giz", "#ededed"),
    fumaca: token("--fumaca", "#9a9ca5"),
    azul: token("--destaque", "#2f6aff"),
    azulTexto: token("--destaque-texto", "#6e97ff"),
  };
  function rgba(hex, a) {
    var h = hex.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  }
  var EST = {
    aresta: [rgba(COR.giz, 0.1), rgba(COR.giz, 0.2), rgba(COR.giz, 0.34)],
    esticada: rgba(COR.azulTexto, 0.75),
    no: rgba(COR.giz, 0.92),
    ambNo: rgba(COR.fumaca, 0.55),
    ambAresta: rgba(COR.fumaca, 0.14),
    luz: [rgba(COR.azul, 0.35), rgba(COR.azulTexto, 0.7), rgba(COR.azulTexto, 1)],
    halo: rgba(COR.azul, 0.22),
    noLuz: rgba(COR.azulTexto, 1),
    anel: rgba(COR.azulTexto, 0.5),
  };

  /* ---------- Estado ---------- */
  var W = 0, H = 0, dpr = 1, celular = false;
  var N = 0;               // nós do nome
  var X, Y, VX, VY, TX, TY, ATRASO, CHEGADA, PAI;
  var EA, EB, REST, E = 0; // arestas fixas (topologia do nome)
  var ADJ0, ADJ;           // lista de adjacência compacta (CSR)
  var M = 0;               // nós soltos de fundo
  var AX, AY, AVX, AVY;
  var passo = 10;          // espaçamento da amostragem, em px
  var formado = false;     // alvos (nome) prontos
  var tForma = 0;          // instante em que a formação começou
  var fonteOk = false;

  var ponteiro = { dentro: false, x: 0, y: 0, apertado: false, ix: 0, iy: 0, t0: 0, arrastando: false, id: -1 };
  var pegos = [];          // nós presos no arrasto: [i, dx, dy, ...]
  var busca = null;        // { algo, origem, t0, max }
  var algoProx = 0;        // alterna BFS / Dijkstra
  var ultimaInteracao = 0;
  var arestasAmb = 0;

  /* ---------- Utilidades ---------- */
  function rand(a, b) { return a + Math.random() * (b - a); }
  function gutter() {
    return Math.max(16, Math.min(56, W * 0.04));
  }

  function tamanho() {
    var r = hero.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    celular = W < 700 || window.matchMedia("(pointer: coarse)").matches && W < 1000;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function nosAlvo() {
    var area = W * H;
    if (celular) return Math.round(Math.max(260, Math.min(460, area / 650)));
    return Math.round(Math.max(420, Math.min(1100, area / 1150)));
  }

  /* ---------- Amostragem do nome ---------- */
  function amostrar(alvo) {
    var p = D.pessoa || {};
    var a = String(p.nome || "Igor").toUpperCase();
    var b = String(p.sobrenome || "Romero").toUpperCase();
    var linhas = celular ? [a, b] : [a + " " + b];
    var familia = '"Sofia Sans Extra Condensed", "Arial Narrow", sans-serif';

    var off = document.createElement("canvas");
    off.width = W;
    off.height = H;
    var o = off.getContext("2d", { willReadFrequently: true });
    o.font = "900 100px " + familia;
    var maior = 0, cap = 0;
    linhas.forEach(function (l) {
      var m = o.measureText(l);
      maior = Math.max(maior, m.width);
      cap = Math.max(cap, m.actualBoundingBoxAscent || 70);
    });
    cap = cap / 100; // altura das maiúsculas por px de fonte

    var g = gutter();
    var hudH = hudEl ? hudEl.offsetHeight : 120;
    var topoLivre = Math.max(24, H * 0.06);
    var baseLivre = H - hudH - Math.max(40, H * 0.07);
    var altLivre = Math.max(80, baseLivre - topoLivre);
    var espaco = 0.14; // entre linhas, em alturas de maiúscula
    var porLargura = ((W - 2 * g) / maior) * 100;
    var porAltura = altLivre / (cap * (linhas.length + espaco * (linhas.length - 1)));
    var fs = Math.min(porLargura, porAltura);
    var capPx = cap * fs;
    var blocoH = capPx * (linhas.length + espaco * (linhas.length - 1));
    var y0 = topoLivre + (altLivre - blocoH) / 2;

    o.fillStyle = "#fff";
    o.textBaseline = "alphabetic";
    o.font = "900 " + fs + "px " + familia;
    linhas.forEach(function (l, i) {
      o.fillText(l, g, y0 + capPx * (i + 1) + capPx * espaco * i);
    });

    var dados = o.getImageData(0, 0, W, H).data;
    var cheios = 0;
    for (var yy = 0; yy < H; yy += 2) {
      for (var xx = 0; xx < W; xx += 2) if (dados[(yy * W + xx) * 4 + 3] > 127) cheios++;
    }
    var areaTexto = cheios * 4;
    // Malha triangular: cada ponto ocupa passo * passo * 0.866.
    passo = Math.max(4, Math.sqrt(areaTexto / (alvo * 0.866)));
    var dy = passo * 0.866;
    var pts = [];
    var linha = 0;
    for (var y = dy / 2; y < H; y += dy, linha++) {
      var desl = linha % 2 ? passo / 2 : 0;
      for (var x = desl + passo / 2; x < W; x += passo) {
        var px = x | 0, py = y | 0;
        if (dados[(py * W + px) * 4 + 3] > 127) {
          pts.push(x + rand(-0.16, 0.16) * passo, y + rand(-0.16, 0.16) * passo);
        }
      }
    }
    return pts;
  }

  /* ---------- Grade espacial ---------- */
  function Grade(cel) {
    this.cel = cel;
    this.cols = Math.ceil(W / cel) + 1;
    this.rows = Math.ceil(H / cel) + 1;
    this.cab = new Int32Array(this.cols * this.rows);
    this.prox = null;
  }
  Grade.prototype.encher = function (xs, ys, n) {
    this.cab.fill(-1);
    if (!this.prox || this.prox.length < n) this.prox = new Int32Array(n);
    for (var i = 0; i < n; i++) {
      var cx = Math.min(this.cols - 1, Math.max(0, (xs[i] / this.cel) | 0));
      var cy = Math.min(this.rows - 1, Math.max(0, (ys[i] / this.cel) | 0));
      var k = cy * this.cols + cx;
      this.prox[i] = this.cab[k];
      this.cab[k] = i;
    }
  };

  /* ---------- Construção do grafo ---------- */
  function construir() {
    var pts = amostrar(nosAlvo());
    var n = pts.length / 2;
    var velho = N;
    var oX = X, oY = Y, oVX = VX, oVY = VY;

    N = n;
    X = new Float32Array(n); Y = new Float32Array(n);
    VX = new Float32Array(n); VY = new Float32Array(n);
    TX = new Float32Array(n); TY = new Float32Array(n);
    ATRASO = new Float32Array(n);
    CHEGADA = new Float32Array(n).fill(Infinity);
    PAI = new Int32Array(n).fill(-1);

    var sx = 0;
    for (var i = 0; i < n; i++) {
      TX[i] = pts[2 * i];
      TY[i] = pts[2 * i + 1];
      if (i < velho && oX) {
        X[i] = oX[i]; Y[i] = oY[i]; VX[i] = oVX[i]; VY[i] = oVY[i];
      } else {
        X[i] = rand(0, W); Y[i] = rand(0, H);
        var ang = rand(0, Math.PI * 2), v = rand(80, 420);
        VX[i] = Math.cos(ang) * v; VY[i] = Math.sin(ang) * v;
      }
      // Os nós chegam numa varredura da esquerda para a direita, com ruído.
      ATRASO[i] = (TX[i] / W) * 0.7 + rand(0, 0.35);
      sx += TX[i];
    }

    // Arestas: vizinhos a até 1.3 passo na malha (grade espacial, sem O(n²)).
    var raio = passo * 1.32, r2 = raio * raio;
    var grade = new Grade(raio);
    grade.encher(TX, TY, n);
    var ea = [], eb = [];
    for (var a = 0; a < n; a++) {
      var cx = (TX[a] / raio) | 0, cy = (TY[a] / raio) | 0;
      for (var oy = -1; oy <= 1; oy++) {
        var ry = cy + oy;
        if (ry < 0 || ry >= grade.rows) continue;
        for (var ox = -1; ox <= 1; ox++) {
          var rx = cx + ox;
          if (rx < 0 || rx >= grade.cols) continue;
          for (var b = grade.cab[ry * grade.cols + rx]; b !== -1; b = grade.prox[b]) {
            if (b <= a) continue;
            var ddx = TX[a] - TX[b], ddy = TY[a] - TY[b];
            if (ddx * ddx + ddy * ddy <= r2) { ea.push(a); eb.push(b); }
          }
        }
      }
    }

    // Componentes (letras) ligadas por uma árvore geradora mínima entre elas,
    // para que a busca atravesse o nome inteiro.
    var uf = new Int32Array(n);
    for (i = 0; i < n; i++) uf[i] = i;
    function raiz(v) { while (uf[v] !== v) { uf[v] = uf[uf[v]]; v = uf[v]; } return v; }
    for (i = 0; i < ea.length; i++) {
      var ra = raiz(ea[i]), rb = raiz(eb[i]);
      if (ra !== rb) uf[ra] = rb;
    }
    var idComp = new Int32Array(n), mapa = {}, C = 0;
    for (i = 0; i < n; i++) {
      var r = raiz(i);
      if (mapa[r] === undefined) mapa[r] = C++;
      idComp[i] = mapa[r];
    }
    if (C > 1 && C < 200) {
      var melhor = new Float64Array(C * C).fill(Infinity);
      var parA = new Int32Array(C * C), parB = new Int32Array(C * C);
      for (a = 0; a < n; a++) {
        var ca = idComp[a];
        for (b = a + 1; b < n; b++) {
          var cb = idComp[b];
          if (ca === cb) continue;
          var dxx = TX[a] - TX[b], dyy = TY[a] - TY[b];
          var d2 = dxx * dxx + dyy * dyy;
          var k = ca < cb ? ca * C + cb : cb * C + ca;
          if (d2 < melhor[k]) { melhor[k] = d2; parA[k] = a; parB[k] = b; }
        }
      }
      // Prim entre componentes.
      var dentro = new Uint8Array(C), custo = new Float64Array(C).fill(Infinity), via = new Int32Array(C).fill(-1);
      custo[0] = 0;
      for (var it = 0; it < C; it++) {
        var u = -1;
        for (var q = 0; q < C; q++) if (!dentro[q] && (u < 0 || custo[q] < custo[u])) u = q;
        dentro[u] = 1;
        if (via[u] >= 0) { ea.push(parA[via[u]]); eb.push(parB[via[u]]); }
        for (q = 0; q < C; q++) {
          if (dentro[q]) continue;
          var kk = u < q ? u * C + q : q * C + u;
          if (melhor[kk] < custo[q]) { custo[q] = melhor[kk]; via[q] = kk; }
        }
      }
    }

    E = ea.length;
    EA = Int32Array.from(ea); EB = Int32Array.from(eb);
    REST = new Float32Array(E);
    var grau = new Int32Array(n);
    for (i = 0; i < E; i++) {
      REST[i] = Math.hypot(TX[EA[i]] - TX[EB[i]], TY[EA[i]] - TY[EB[i]]);
      grau[EA[i]]++; grau[EB[i]]++;
    }
    ADJ0 = new Int32Array(n + 1);
    for (i = 0; i < n; i++) ADJ0[i + 1] = ADJ0[i] + grau[i];
    ADJ = new Int32Array(ADJ0[n]);
    var pos = ADJ0.slice(0, n);
    for (i = 0; i < E; i++) { ADJ[pos[EA[i]]++] = EB[i]; ADJ[pos[EB[i]]++] = EA[i]; }

    // Nós soltos ao fundo: ligam-se por proximidade a cada quadro.
    var m = Math.round(n * (celular ? 0.1 : 0.12));
    var oAX = AX, oAY = AY, oM = M;
    M = m;
    AX = new Float32Array(m); AY = new Float32Array(m);
    AVX = new Float32Array(m); AVY = new Float32Array(m);
    for (i = 0; i < m; i++) {
      AX[i] = i < oM && oAX ? Math.min(W, oAX[i]) : rand(0, W);
      AY[i] = i < oM && oAY ? Math.min(H, oAY[i]) : rand(0, H);
      var ang2 = rand(0, Math.PI * 2), v2 = rand(6, 22);
      AVX[i] = Math.cos(ang2) * v2; AVY[i] = Math.sin(ang2) * v2;
    }

    busca = null;
    pegos = [];
    if (hudNos) hudNos.textContent = N.toLocaleString("pt-BR");
    if (hudArestas) hudArestas.textContent = E.toLocaleString("pt-BR");
  }

  /* ---------- Buscas ---------- */
  function maisProximo(x, y) {
    var best = -1, bd = Infinity;
    for (var i = 0; i < N; i++) {
      var dx = X[i] - x, dy = Y[i] - y, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }

  // Heap binário mínimo para o Dijkstra.
  function Heap(cap) { this.k = new Float64Array(cap); this.v = new Int32Array(cap); this.n = 0; }
  Heap.prototype.push = function (key, val) {
    var i = this.n++, k = this.k, v = this.v;
    while (i > 0) {
      var p = (i - 1) >> 1;
      if (k[p] <= key) break;
      k[i] = k[p]; v[i] = v[p]; i = p;
    }
    k[i] = key; v[i] = val;
  };
  Heap.prototype.pop = function () {
    var k = this.k, v = this.v, top = v[0], kn = k[--this.n], vn = v[this.n], i = 0, n = this.n;
    this.topo = k[0];
    while (true) {
      var l = 2 * i + 1;
      if (l >= n) break;
      var r = l + 1, c = r < n && k[r] < k[l] ? r : l;
      if (k[c] >= kn) break;
      k[i] = k[c]; v[i] = v[c]; i = c;
    }
    k[i] = kn; v[i] = vn;
    return top;
  };

  function rodarBusca(origem, agora, auto) {
    if (origem < 0 || !N) return;
    var algo = algoProx % 2 === 0 ? "BFS" : "Dijkstra";
    algoProx++;
    var dist = new Float64Array(N).fill(Infinity);
    PAI.fill(-1);
    dist[origem] = 0;
    var visitados = 0;
    if (algo === "BFS") {
      var fila = new Int32Array(N), ini = 0, fim = 0;
      fila[fim++] = origem;
      while (ini < fim) {
        var u = fila[ini++];
        visitados++;
        for (var j = ADJ0[u]; j < ADJ0[u + 1]; j++) {
          var w = ADJ[j];
          if (dist[w] === Infinity) { dist[w] = dist[u] + 1; PAI[w] = u; fila[fim++] = w; }
        }
      }
      for (var i = 0; i < N; i++) if (dist[i] !== Infinity) dist[i] *= passo; // saltos em px
    } else {
      var h = new Heap(ADJ.length + 1);
      var feito = new Uint8Array(N);
      h.push(0, origem);
      while (h.n) {
        var uu = h.pop();
        if (feito[uu]) continue;
        feito[uu] = 1;
        visitados++;
        for (var jj = ADJ0[uu]; jj < ADJ0[uu + 1]; jj++) {
          var ww = ADJ[jj];
          var nd = dist[uu] + Math.hypot(TX[uu] - TX[ww], TY[uu] - TY[ww]);
          if (nd < dist[ww]) { dist[ww] = nd; PAI[ww] = uu; h.push(nd, ww); }
        }
      }
    }
    var vel = celular ? 520 : 900; // px por segundo
    var max = 0;
    for (i = 0; i < N; i++) {
      if (dist[i] === Infinity) { CHEGADA[i] = Infinity; continue; }
      CHEGADA[i] = agora + dist[i] / vel;
      if (CHEGADA[i] > max) max = CHEGADA[i];
    }
    busca = { algo: algo, origem: origem, t0: agora, fim: max, visitados: visitados, auto: !!auto, ox: X[origem], oy: Y[origem] };
    if (hudAlgo) hudAlgo.textContent = algo + " do nó " + origem;
  }

  /* ---------- Ponteiro ---------- */
  function local(ev) {
    var r = canvas.getBoundingClientRect();
    return [ev.clientX - r.left, ev.clientY - r.top];
  }
  function raioEmpurra() { return celular ? 70 : 120; }

  function aoMover(ev) {
    var p = local(ev);
    ponteiro.x = p[0]; ponteiro.y = p[1];
    ponteiro.dentro = ev.pointerType === "mouse" || ponteiro.apertado;
    ultimaInteracao = performance.now() / 1000;
    if (ponteiro.apertado && !ponteiro.arrastando) {
      var dx = ponteiro.x - ponteiro.ix, dy = ponteiro.y - ponteiro.iy;
      if (dx * dx + dy * dy > 64) {
        ponteiro.arrastando = true;
        pegos = [];
        var rg = celular ? 60 : 90, rg2 = rg * rg;
        for (var i = 0; i < N; i++) {
          var ax = X[i] - ponteiro.ix, ay = Y[i] - ponteiro.iy;
          if (ax * ax + ay * ay < rg2) pegos.push(i, ax, ay);
        }
      }
    }
  }
  function aoApertar(ev) {
    if (ev.button !== undefined && ev.button > 0) return;
    var p = local(ev);
    ponteiro.apertado = true;
    ponteiro.arrastando = false;
    ponteiro.ix = ponteiro.x = p[0];
    ponteiro.iy = ponteiro.y = p[1];
    ponteiro.t0 = performance.now();
    ponteiro.dentro = true;
    ponteiro.id = ev.pointerId;
    ultimaInteracao = performance.now() / 1000;
    if (ev.pointerType === "mouse" && canvas.setPointerCapture) {
      try { canvas.setPointerCapture(ev.pointerId); } catch (e) { /* sem captura */ }
    }
  }
  function aoSoltar(ev) {
    if (!ponteiro.apertado) return;
    var foiClique = !ponteiro.arrastando && performance.now() - ponteiro.t0 < 600;
    ponteiro.apertado = false;
    ponteiro.arrastando = false;
    pegos = [];
    if (ev.pointerType !== "mouse") ponteiro.dentro = false;
    if (foiClique && formado) {
      var p = local(ev);
      rodarBusca(maisProximo(p[0], p[1]), performance.now() / 1000, false);
    }
    acordar();
  }
  function aoCancelar() {
    ponteiro.apertado = false;
    ponteiro.arrastando = false;
    ponteiro.dentro = false;
    pegos = [];
  }

  /* ---------- Física ---------- */
  function passoFisica(dt, t) {
    var tf = t - tForma;
    var kMax = 34, amort = Math.exp(-6.5 * dt);
    var R = raioEmpurra(), R2 = R * R, forca = celular ? 2600 : 4200;
    var empurra = ponteiro.dentro && !ponteiro.arrastando;
    var px = ponteiro.x, py = ponteiro.y;

    for (var i = 0; i < N; i++) {
      var ax = 0, ay = 0;
      if (formado) {
        var idade = tf - ATRASO[i];
        if (idade > 0) {
          var e = idade >= 0.9 ? 1 : idade / 0.9;
          e = e * e * (3 - 2 * e);
          ax += (TX[i] - X[i]) * kMax * e;
          ay += (TY[i] - Y[i]) * kMax * e;
        }
      }
      if (empurra) {
        var dx = X[i] - px, dy = Y[i] - py, d2 = dx * dx + dy * dy;
        if (d2 < R2 && d2 > 0.01) {
          var d = Math.sqrt(d2), f = 1 - d / R;
          f = f * f * forca / d;
          ax += dx * f; ay += dy * f;
        }
      }
      VX[i] = (VX[i] + ax * dt) * amort;
      VY[i] = (VY[i] + ay * dt) * amort;
      X[i] += VX[i] * dt;
      Y[i] += VY[i] * dt;
    }

    // Antes da fonte carregar, o caos fica dentro do hero.
    if (!formado) {
      for (i = 0; i < N; i++) {
        if (X[i] < 0 || X[i] > W) VX[i] = -VX[i];
        if (Y[i] < 0 || Y[i] > H) VY[i] = -VY[i];
      }
    }

    // Arrasto: os nós presos seguem o ponteiro; as arestas esticam.
    if (ponteiro.arrastando) {
      for (var k = 0; k < pegos.length; k += 3) {
        var j = pegos[k];
        var gx = px + pegos[k + 1] * 0.6, gy = py + pegos[k + 2] * 0.6;
        var s = 1 - Math.exp(-18 * dt);
        X[j] += (gx - X[j]) * s;
        Y[j] += (gy - Y[j]) * s;
        VX[j] = 0; VY[j] = 0;
      }
    }

    for (i = 0; i < M; i++) {
      AX[i] += AVX[i] * dt; AY[i] += AVY[i] * dt;
      if (AX[i] < -20) AX[i] = W + 20; else if (AX[i] > W + 20) AX[i] = -20;
      if (AY[i] < -20) AY[i] = H + 20; else if (AY[i] > H + 20) AY[i] = -20;
    }
  }

  /* ---------- Desenho ---------- */
  var gradeAmb = null;

  function desenhar(t) {
    ctx.fillStyle = COR.fundo;
    ctx.fillRect(0, 0, W, H);
    ctx.lineCap = "round";

    // Nós soltos e suas arestas por proximidade (grade espacial a cada quadro).
    var raioAmb = celular ? 70 : 110, ra2 = raioAmb * raioAmb;
    if (M) {
      if (!gradeAmb || gradeAmb.cel !== raioAmb || gradeAmb.cols !== Math.ceil(W / raioAmb) + 1 || gradeAmb.rows !== Math.ceil(H / raioAmb) + 1) {
        gradeAmb = new Grade(raioAmb);
      }
      gradeAmb.encher(AX, AY, M);
      ctx.beginPath();
      arestasAmb = 0;
      for (var a = 0; a < M; a++) {
        var cx = Math.max(0, Math.min(gradeAmb.cols - 1, (AX[a] / raioAmb) | 0));
        var cy = Math.max(0, Math.min(gradeAmb.rows - 1, (AY[a] / raioAmb) | 0));
        for (var oy = -1; oy <= 1; oy++) {
          var ry = cy + oy;
          if (ry < 0 || ry >= gradeAmb.rows) continue;
          for (var ox = -1; ox <= 1; ox++) {
            var rx = cx + ox;
            if (rx < 0 || rx >= gradeAmb.cols) continue;
            for (var b = gradeAmb.cab[ry * gradeAmb.cols + rx]; b !== -1; b = gradeAmb.prox[b]) {
              if (b <= a) continue;
              var dx = AX[a] - AX[b], dy = AY[a] - AY[b];
              if (dx * dx + dy * dy < ra2) { ctx.moveTo(AX[a], AY[a]); ctx.lineTo(AX[b], AY[b]); arestasAmb++; }
            }
          }
        }
      }
      ctx.strokeStyle = EST.ambAresta;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = EST.ambNo;
      ctx.beginPath();
      for (a = 0; a < M; a++) ctx.rect(AX[a] - 1, AY[a] - 1, 2, 2);
      ctx.fill();
    }

    // Arestas do nome, em 3 faixas de opacidade e uma para as esticadas.
    var p0 = new Path2D(), p1 = new Path2D(), p2 = new Path2D(), pe = new Path2D();
    for (var i = 0; i < E; i++) {
      var u = EA[i], v = EB[i];
      var ex = X[u] - X[v], ey = Y[u] - Y[v];
      var len = Math.sqrt(ex * ex + ey * ey);
      var q = len / REST[i];
      if (q > 12) continue;
      var path;
      if (q > 1.7 && q < 9) path = pe;
      else if (q > 6) path = p0;
      else if (q > 3) path = p1;
      else path = p2;
      path.moveTo(X[u], Y[u]);
      path.lineTo(X[v], Y[v]);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = EST.aresta[0]; ctx.stroke(p0);
    ctx.strokeStyle = EST.aresta[1]; ctx.stroke(p1);
    ctx.strokeStyle = EST.aresta[2]; ctx.stroke(p2);
    ctx.strokeStyle = EST.esticada; ctx.stroke(pe);

    // Busca: a árvore (pai -> filho) acende quando a frente de onda passa.
    var acesos = null;
    if (busca) {
      var l0 = new Path2D(), l1 = new Path2D(), l2 = new Path2D();
      acesos = new Path2D();
      var vivo = false, alcancados = 0;
      for (i = 0; i < N; i++) {
        var c = CHEGADA[i];
        if (c > t) { if (c !== Infinity) vivo = true; continue; }
        alcancados++;
        var idade = t - c;
        if (idade > 2.4) continue;
        vivo = true;
        var pai = PAI[i];
        if (pai >= 0) {
          var alvo = idade < 0.35 ? l2 : idade < 1.1 ? l1 : l0;
          alvo.moveTo(X[pai], Y[pai]);
          alvo.lineTo(X[i], Y[i]);
        }
        if (idade < 0.5) acesos.rect(X[i] - 2.2, Y[i] - 2.2, 4.4, 4.4);
      }
      ctx.lineWidth = 6; ctx.strokeStyle = EST.halo; ctx.stroke(l2);
      ctx.lineWidth = 1.5; ctx.strokeStyle = EST.luz[0]; ctx.stroke(l0);
      ctx.lineWidth = 2; ctx.strokeStyle = EST.luz[1]; ctx.stroke(l1);
      ctx.lineWidth = 2.5; ctx.strokeStyle = EST.luz[2]; ctx.stroke(l2);

      // Anel da frente de onda saindo da origem.
      var raioOnda = (t - busca.t0) * (celular ? 520 : 900);
      if (t < busca.fim) {
        ctx.beginPath();
        ctx.arc(busca.ox, busca.oy, Math.max(1, raioOnda), 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = EST.anel;
        ctx.globalAlpha = Math.max(0, 1 - (t - busca.t0) / Math.max(0.4, busca.fim - busca.t0));
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (hudAlgo) {
        hudAlgo.textContent = busca.algo + " do nó " + busca.origem + ", " + alcancados + "/" + busca.visitados;
      }
      if (!vivo) {
        busca = null;
        if (hudAlgo) hudAlgo.textContent = "ocioso";
      }
    }

    // Nós.
    var tam = celular ? 2 : 2.2, mt = tam / 2;
    ctx.fillStyle = EST.no;
    ctx.beginPath();
    for (i = 0; i < N; i++) ctx.rect(X[i] - mt, Y[i] - mt, tam, tam);
    ctx.fill();
    if (acesos) { ctx.fillStyle = EST.noLuz; ctx.fill(acesos); }
  }

  /* ---------- Laço ---------- */
  var rodando = false, visivel = true, ultimo = 0, rafId = 0;
  var quadros = 0, janela = 0;

  function quadro(ms) {
    rafId = 0;
    if (!rodando) return;
    var t = ms / 1000;
    var dt = ultimo ? Math.min(1 / 30, t - ultimo) : 1 / 60;
    ultimo = t;

    passoFisica(dt, t);
    desenhar(t);

    if (formado && !busca && !ponteiro.apertado && t - tForma > 3 && t - ultimaInteracao > 6) {
      ultimaInteracao = t;
      rodarBusca((Math.random() * N) | 0, t, true);
    }
    if (formado && !busca && hudAlgo && t - tForma > 1.6 && hudAlgo.textContent === "formando") {
      hudAlgo.textContent = "ocioso";
    }

    quadros++;
    if (!janela) janela = ms;
    if (ms - janela >= 500) {
      if (hudFps) hudFps.textContent = Math.round((quadros * 1000) / (ms - janela));
      quadros = 0;
      janela = ms;
    }
    rafId = requestAnimationFrame(quadro);
  }

  function acordar() {
    var deve = visivel && !document.hidden && !reduzido.matches;
    if (deve && !rodando) {
      rodando = true;
      ultimo = 0;
      janela = 0;
      quadros = 0;
      if (!rafId) rafId = requestAnimationFrame(quadro);
    } else if (!deve && rodando) {
      rodando = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  /* ---------- Modo estático (prefers-reduced-motion) ---------- */
  function desenharEstatico() {
    for (var i = 0; i < N; i++) { X[i] = TX[i]; Y[i] = TY[i]; VX[i] = 0; VY[i] = 0; }
    busca = null;
    desenhar(0);
    if (hudAlgo) hudAlgo.textContent = "nenhum, animação reduzida";
    if (hudFps) hudFps.textContent = "0";
  }

  /* ---------- Terminal ---------- */
  var textoCargo = cargoEl ? cargoEl.textContent : "";
  var digitado = null, cursorEl = null, timerDigita = 0;
  if (cargoEl) {
    cargoEl.textContent = "";
    var lido = el("span", "visualmente-oculto", textoCargo);
    lido.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap";
    digitado = el("span");
    digitado.setAttribute("aria-hidden", "true");
    cursorEl = el("span", "hud__cursor");
    cursorEl.setAttribute("aria-hidden", "true");
    cargoEl.appendChild(lido);
    cargoEl.appendChild(digitado);
    cargoEl.appendChild(cursorEl);
  }
  var promptEl = hero.querySelector(".hud__prompt");
  var textoPrompt = promptEl ? promptEl.textContent : "";

  function digitar() {
    clearTimeout(timerDigita);
    if (!digitado) return;
    if (reduzido.matches) {
      if (promptEl) promptEl.textContent = textoPrompt;
      digitado.textContent = textoCargo;
      return;
    }
    var i = 0, j = 0;
    if (promptEl) promptEl.textContent = "$";
    digitado.textContent = "";
    (function tic() {
      if (promptEl && i < textoPrompt.length) {
        i++;
        promptEl.textContent = textoPrompt.slice(0, Math.max(1, i));
        timerDigita = setTimeout(tic, i === textoPrompt.length ? 260 : 55);
        return;
      }
      if (j < textoCargo.length) {
        j++;
        digitado.textContent = textoCargo.slice(0, j);
        timerDigita = setTimeout(tic, 22 + Math.random() * 30);
      }
    })();
  }

  /* ---------- Dica ---------- */
  function atualizarDica() {
    if (!dicaEl) return;
    if (reduzido.matches) { dicaEl.hidden = true; return; }
    var toque = window.matchMedia("(hover: none)").matches;
    dicaEl.textContent = toque
      ? "Toque no grafo para rodar uma busca. Deslize na horizontal para puxar os nós."
      : "Passe o mouse para empurrar os nós, arraste para puxar e clique para rodar uma busca.";
    dicaEl.hidden = false;
  }

  /* ---------- Início ---------- */
  var largAnt = 0, altAnt = 0;

  function montar(primeira) {
    tamanho();
    construir();
    formado = fonteOk;
    if (formado && primeira !== false) tForma = performance.now() / 1000;
    largAnt = W; altAnt = H;
    if (reduzido.matches) {
      if (fonteOk) desenharEstatico();
      else desenhar(0);
    }
  }

  function aoRedimensionar() {
    var r = hero.getBoundingClientRect();
    var w = Math.round(r.width), h = Math.round(r.height);
    if (w === largAnt && Math.abs(h - altAnt) < 2) return;
    // Barra de endereço do celular: mudança só de altura pequena não refaz o nome.
    if (w === largAnt && Math.abs(h - altAnt) < 90) {
      tamanho();
      altAnt = H;
      if (reduzido.matches) desenhar(0);
      return;
    }
    tamanho();
    construir();
    largAnt = W; altAnt = H;
    if (reduzido.matches) { if (fonteOk) desenharEstatico(); }
    else if (fonteOk) { formado = true; tForma = performance.now() / 1000 - 0.9; }
  }

  atualizarDica();
  digitar();

  // Começa no caos imediatamente; o nome é amostrado quando a fonte chega.
  fonteOk = false;
  montar();
  if (!reduzido.matches) {
    // Sem alvos ainda: os nós voam soltos.
    for (var z = 0; z < N; z++) { X[z] = rand(0, W); Y[z] = rand(0, H); }
  }

  function quandoFonte() {
    if (fonteOk) return;
    fonteOk = true;
    tamanho();
    construir();
    formado = true;
    tForma = performance.now() / 1000;
    largAnt = W; altAnt = H;
    if (reduzido.matches) desenharEstatico();
    if (hudAlgo && !reduzido.matches) hudAlgo.textContent = "formando";
  }

  if (document.fonts && document.fonts.load) {
    var limite = setTimeout(quandoFonte, 2500);
    document.fonts.load('900 100px "Sofia Sans Extra Condensed"').then(function () {
      return document.fonts.ready;
    }).then(function () {
      clearTimeout(limite);
      quandoFonte();
    }, function () {
      clearTimeout(limite);
      quandoFonte();
    });
  } else {
    quandoFonte();
  }

  canvas.addEventListener("pointermove", aoMover);
  canvas.addEventListener("pointerdown", aoApertar);
  canvas.addEventListener("pointerup", aoSoltar);
  canvas.addEventListener("pointercancel", aoCancelar);
  canvas.addEventListener("pointerleave", function (ev) {
    if (!ponteiro.apertado || ev.pointerType !== "mouse") ponteiro.dentro = false;
  });

  if (window.ResizeObserver) {
    var tRes = 0;
    new ResizeObserver(function () {
      clearTimeout(tRes);
      tRes = setTimeout(aoRedimensionar, 120);
    }).observe(hero);
  } else {
    window.addEventListener("resize", aoRedimensionar);
  }

  if (window.IntersectionObserver) {
    new IntersectionObserver(function (ents) {
      visivel = ents[ents.length - 1].isIntersecting;
      acordar();
    }).observe(hero);
  }
  document.addEventListener("visibilitychange", acordar);

  function aoMudarMovimento() {
    atualizarDica();
    digitar();
    if (reduzido.matches) {
      acordar();
      if (fonteOk) desenharEstatico();
    } else {
      if (fonteOk) { formado = true; tForma = performance.now() / 1000; }
      acordar();
    }
  }
  if (reduzido.addEventListener) reduzido.addEventListener("change", aoMudarMovimento);
  else if (reduzido.addListener) reduzido.addListener(aoMudarMovimento);

  acordar();

  // Para a prova de desempenho: window.__grafo devolve os números atuais.
  window.__grafo = function () {
    return { nos: N, arestas: E, soltos: M, arestasSoltas: arestasAmb, passo: passo, dpr: dpr, rodando: rodando, algo: busca && busca.algo };
  };
})();
