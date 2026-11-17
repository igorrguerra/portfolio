// Loader: contador 0 → 100 e depois sobe a cortina
const loader = document.querySelector(".loader");
const num = document.querySelector(".loader-num");
let n = 0;
const timer = setInterval(() => {
  n = Math.min(100, n + Math.ceil(Math.random() * 12));
  num.textContent = n;
  if (n === 100) {
    clearInterval(timer);
    setTimeout(() => {
      loader.classList.add("saiu");
      document.body.classList.add("carregado");
    }, 200);
  }
}, 60);

// Cursor que segue o mouse (com atraso suave)
const cursor = document.querySelector(".cursor");
let mx = 0, my = 0, cx = 0, cy = 0;
addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
(function loop() {
  cx += (mx - cx) * 0.18;
  cy += (my - cy) * 0.18;
  cursor.style.left = cx + "px";
  cursor.style.top = cy + "px";
  requestAnimationFrame(loop);
})();
document.querySelectorAll("a, button").forEach((el) => {
  el.addEventListener("mouseenter", () => cursor.classList.add("grande"));
  el.addEventListener("mouseleave", () => cursor.classList.remove("grande"));
});

// Menu em tela cheia
const toggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");
function setMenu(aberto) {
  menu.classList.toggle("aberto", aberto);
  menu.setAttribute("aria-hidden", !aberto);
  toggle.setAttribute("aria-expanded", aberto);
  toggle.textContent = aberto ? "Fechar" : "Menu";
}
toggle.addEventListener("click", () => setMenu(!menu.classList.contains("aberto")));
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

// Elementos aparecem ao rolar
const obs = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("visivel"); obs.unobserve(e.target); }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
