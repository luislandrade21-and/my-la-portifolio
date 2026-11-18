/* Portfólio Luis Andrade - interação: menu, projetos (filtro, vistas), popup com galeria, mapa, formulário */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var n2 = function (k) { return String(k + 1).padStart(2, "0"); };
  var IMG = "img/p/";
  var PORTFOLIO_PDF = "cv/luis-andrade-portifolio-2025.pdf";
  var CIDADES = {
    lisboa: { nome: "Grande Lisboa", pais: "Portugal", map: "pt", x: 28, y: 290, lx: 14, ly: 4, anchor: "start" },
    vitoria: { nome: "Vitória, ES", pais: "Brasil", map: "br", x: 433, y: 340, lx: 14, ly: 4, anchor: "start" },
    campinas: { nome: "Campinas, SP", pais: "Brasil", map: "br", x: 347, y: 374, lx: -14, ly: 4, anchor: "end" }
  };

  // numeração fixa, pela ordem do site
  // ponto de enquadramento da capa quando a imagem é cortada (o resto fica ao centro)
  var POS = { orlas: "50% 100%", olival: "50% 0%" };
  PROJETOS.forEach(function (p, k) { p.n = n2(k); p.cover = IMG + p.imgs[0][0]; p.contain = p.slug === "tese"; p.pos = POS[p.slug] || "50% 50%"; });

  function meta(p) { return [p.kind, p.place, p.date].filter(Boolean).join(" · "); }
  function pdfOf(p) { return p.pdf ? { href: p.pdf, label: p.slug === "tese" ? "Baixar dissertação (PDF)" : "Caderno do projeto (PDF)" } : { href: PORTFOLIO_PDF, label: "Ver no portfólio completo (PDF)" }; }
  function short(p) { return p.slug === "tese" ? "Dissertação" : p.name.split(":")[0]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------------- menu ---------------- */
  $("navbtn").addEventListener("click", function () {
    var o = $("nav").classList.toggle("open");
    this.setAttribute("aria-expanded", o ? "true" : "false");
  });
  var links = document.querySelectorAll(".nav a.l");
  links.forEach(function (a) { a.addEventListener("click", function () { $("nav").classList.remove("open"); $("navbtn").setAttribute("aria-expanded", "false"); }); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["inicio", "sobre", "projetos", "estudos", "contato"].forEach(function (id) { var el = $(id); if (el) io.observe(el); });
  }

  /* ---------------- projetos ---------------- */
  var filtro = "all", vista = "ampla", lista = PROJETOS.slice(), i = 0;

  function aplicarFiltro() {
    lista = PROJETOS.filter(function (p) { return filtro === "all" || p.country === filtro; });
    i = 0;
    desenharTabs(); desenharGrade(); mostrar(0); mapaFiltro();
  }
  function desenharTabs() {
    var t = $("tabs"); t.innerHTML = "";
    lista.forEach(function (p, k) {
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("role", "tab");
      b.innerHTML = '<span class="n">' + p.n + "</span><span>" + esc(short(p)) + "</span>";
      b.addEventListener("click", function () { mostrar(k); });
      t.appendChild(b);
    });
  }
  function mostrar(k) {
    i = (k + lista.length) % lista.length;
    var p = lista[i], q = lista[(i + 1) % lista.length];
    var f = $("fimg");
    f.style.opacity = 0;
    setTimeout(function () { f.src = p.cover; f.alt = p.name + ", " + (p.imgs[0][3] || "imagem principal"); f.classList.toggle("contain", p.contain); f.style.objectPosition = p.pos; f.style.opacity = 1; }, 140);
    $("fcount").textContent = "· " + p.imgs.length + " imagens";
    var single = lista.length < 2;
    $("peek").hidden = single;
    if (!single) { $("pimg").src = q.cover; $("pimg").style.objectPosition = q.pos; $("pname").textContent = q.n + " " + short(q); }
    $("inum").textContent = p.n;
    $("iname").textContent = p.name;
    $("imeta").textContent = meta(p);
    $("idesc").textContent = p.desc.length > 320 ? p.desc.slice(0, p.desc.lastIndexOf(" ", 320)) + "…" : p.desc;
    var pd = pdfOf(p); $("ipdf").href = pd.href; $("ipdf").textContent = pd.label;
    [].forEach.call($("tabs").children, function (b, j) { b.setAttribute("aria-selected", j === i ? "true" : "false"); if (j === i && b.scrollIntoView) b.parentNode.scrollLeft = b.offsetLeft - 20; });
  }
  function desenharGrade() {
    var g = $("grade"); g.innerHTML = "";
    lista.forEach(function (p) {
      var d = document.createElement("div"); d.className = "gitem";
      d.innerHTML = '<button type="button"><div class="im"><img loading="lazy" src="' + p.cover + '" alt="' + esc(p.name) + '"' + (p.contain ? ' class="contain"' : "") + ' style="object-position:' + p.pos + '"></div>' +
        '<div class="cap"><span class="n">' + p.n + "</span><div><b>" + esc(p.name) + "</b><span>" + esc(p.place) + " · " + esc(p.date) + "</span></div></div></button>";
      d.querySelector("button").addEventListener("click", function () { abrir(p); });
      g.appendChild(d);
    });
  }
  document.querySelectorAll("[data-f]").forEach(function (b) {
    b.addEventListener("click", function () {
      filtro = b.dataset.f;
      document.querySelectorAll("[data-f]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      aplicarFiltro();
    });
  });
  // vistas das imagens (ampla / grade) e, à parte, o botão do mapa, que liga e desliga
  var vistaImg = "ampla";
  function verVista(v) {
    vista = v; if (v !== "mapa") vistaImg = v;
    $("ampla").hidden = v !== "ampla"; $("grade").hidden = v !== "grade"; $("mapav").hidden = v !== "mapa";
    document.querySelectorAll("[data-view]").forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.view === v ? "true" : "false"); });
    $("mapbtn").setAttribute("aria-pressed", v === "mapa" ? "true" : "false");
  }
  document.querySelectorAll("[data-view]").forEach(function (b) { b.addEventListener("click", function () { verVista(b.dataset.view); }); });
  $("mapbtn").addEventListener("click", function () { verVista(vista === "mapa" ? vistaImg : "mapa"); });
  $("fprev").addEventListener("click", function () { mostrar(i - 1); });
  $("peek").addEventListener("click", function () { mostrar(i + 1); });
  $("frame").addEventListener("click", function () { abrir(lista[i]); });
  $("ampla").addEventListener("keydown", function (e) {
    if (e.target.closest("button,a") && e.target.closest(".tabs") === null && e.target.id !== "frame") return;
    if (e.key === "ArrowRight") mostrar(i + 1);
    if (e.key === "ArrowLeft") mostrar(i - 1);
  });

  /* ---------------- popup com galeria ---------------- */
  var cur = null, ci = 0, lastFocus = null;
  function abrir(p) {
    if (!lastFocus || $("modal").hidden) lastFocus = document.activeElement;
    cur = p; ci = 0;
    $("mnum").textContent = p.n + " · " + (p.country === "pt" ? "Portugal" : "Brasil");
    $("mname").textContent = p.name;
    $("mtitle").textContent = p.name;
    $("mtags").innerHTML = (p.kind || "").split(/\s*[,·]\s*/).filter(Boolean).slice(0, 4).map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("");
    var rows = [["Local", p.place], ["Data", p.date], ["Tipo", p.kind], ["Área", p.area], ["Equipe", p.team], ["Orientação", p.advisor]];
    $("mdl").innerHTML = rows.filter(function (r) { return r[1]; }).map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("");
    $("mdesc").textContent = p.desc;
    var pd = pdfOf(p); $("mpdf").href = pd.href; $("mpdf").textContent = pd.label;
    var k = PROJETOS.indexOf(p), a = PROJETOS[(k - 1 + PROJETOS.length) % PROJETOS.length], z = PROJETOS[(k + 1) % PROJETOS.length];
    $("mppn").textContent = short(a); $("mpnn").textContent = short(z);
    $("mpp").onclick = function () { abrir(a); }; $("mpn").onclick = function () { abrir(z); };
    foto(0);
    $("modal").hidden = false; document.body.classList.add("lock");
    $("mclose").focus();
    document.querySelector(".mside").scrollTop = 0;
  }
  function foto(k) {
    ci = (k + cur.imgs.length) % cur.imgs.length;
    var im = cur.imgs[ci];
    $("mimg").src = IMG + im[0];
    $("mimg").alt = cur.name + (im[3] ? ", " + im[3] : ", imagem " + (ci + 1));
    $("mcap").textContent = im[3] && !/^Figura \d+$/.test(im[3]) ? im[3] : "";
    $("mcount").textContent = (ci + 1) + " / " + cur.imgs.length;
    var one = cur.imgs.length < 2; $("mprev").hidden = one; $("mnext").hidden = one;
    var pre = new Image(); pre.src = IMG + cur.imgs[(ci + 1) % cur.imgs.length][0];
  }
  function fechar() { $("modal").hidden = true; document.body.classList.remove("lock"); if (lastFocus) lastFocus.focus(); lastFocus = null; }
  $("mprev").addEventListener("click", function () { foto(ci - 1); });
  $("mnext").addEventListener("click", function () { foto(ci + 1); });
  $("mclose").addEventListener("click", fechar);
  $("mback").addEventListener("click", fechar);
  $("modal").addEventListener("keydown", function (e) {
    if (e.key === "Escape") fechar();
    else if (e.key === "ArrowRight") foto(ci + 1);
    else if (e.key === "ArrowLeft") foto(ci - 1);
    else if (e.key === "Tab") { // manter o foco dentro do popup
      var f = [].filter.call($("modal").querySelectorAll("button, a[href]"), function (x) { return !x.hidden; }), a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });
  // deslizar no telemóvel
  var sx = null;
  $("mimg").addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  $("mimg").addEventListener("touchend", function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) foto(ci + (dx < 0 ? 1 : -1)); sx = null; });

  /* ---------------- mapa Brasil + Portugal ---------------- */
  var SVGNS = "http://www.w3.org/2000/svg";
  $("brpath").setAttribute("d", MAPA_BR);
  $("ptpath").setAttribute("d", MAPA_PT);
  var pins = {};
  Object.keys(CIDADES).forEach(function (id) {
    var c = CIDADES[id];
    var ps = PROJETOS.filter(function (p) { return p.city === id; });
    var g = document.createElementNS(SVGNS, "g");
    g.setAttribute("class", "pin"); g.setAttribute("tabindex", "0"); g.setAttribute("role", "button");
    g.setAttribute("aria-label", c.nome + ": " + ps.length + (ps.length > 1 ? " projetos" : " projeto"));
    var r = ps.length > 1 ? 13 : 10;
    g.innerHTML = '<circle class="o" cx="' + c.x + '" cy="' + c.y + '" r="' + (r + 5) + '"/><circle class="c" cx="' + c.x + '" cy="' + c.y + '" r="' + r + '"/>' +
      '<text class="cnt" x="' + c.x + '" y="' + c.y + '">' + ps.length + "</text>" +
      '<text x="' + (c.x + c.lx + (c.anchor === "start" ? r : -r)) + '" y="' + (c.y + c.ly) + '" text-anchor="' + c.anchor + '">' + c.nome + "</text>";
    g.addEventListener("click", function () { lugar(id); });
    g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); lugar(id); } });
    $(c.map === "pt" ? "ptpins" : "brpins").appendChild(g);
    pins[id] = g;
  });
  // o mapa segue o filtro: só mostra o país escolhido
  function mapaFiltro() {
    var br = filtro !== "pt", pt = filtro !== "br";
    $("mpbr").hidden = !br; $("mppt").hidden = !pt;
    var m = document.querySelector(".maps");
    m.classList.toggle("one", !(br && pt)); m.classList.toggle("ptonly", pt && !br);
    var on = Object.keys(pins).filter(function (k) { return pins[k].classList.contains("on"); })[0];
    if (!on || CIDADES[on].map === (filtro === "pt" ? "br" : filtro === "br" ? "pt" : "")) lugar(filtro === "br" ? "vitoria" : "lisboa");
  }
  function lugar(id) {
    var c = CIDADES[id], ps = PROJETOS.filter(function (p) { return p.city === id; });
    Object.keys(pins).forEach(function (k) { pins[k].classList.toggle("on", k === id); });
    var box = $("maplist");
    box.innerHTML = "<h3>" + c.nome + "</h3><p>" + c.pais + " · " + ps.length + (ps.length > 1 ? " projetos" : " projeto") + "</p><ul></ul>";
    var ul = box.querySelector("ul");
    ps.forEach(function (p) {
      var li = document.createElement("li");
      li.innerHTML = '<button type="button"><img loading="lazy" src="' + p.cover + '" alt=""><div><b>' + esc(p.name) + "</b><span>" + esc(meta(p)) + "</span></div></button>";
      li.querySelector("button").addEventListener("click", function () { abrir(p); });
      ul.appendChild(li);
    });
  }

  // ligação a partir dos Estudos: abre o popup do projeto
  document.querySelectorAll("[data-abrir]").forEach(function (l) {
    l.addEventListener("click", function (e) {
      var p = PROJETOS.filter(function (x) { return x.slug === l.dataset.abrir; })[0];
      if (p) { e.preventDefault(); abrir(p); }
    });
  });

  /* ---------------- formulário (Netlify Forms) ---------------- */
  var form = $("contact-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = $("fmsg");
    if (!form.checkValidity()) { msg.textContent = "Preencha nome, email e mensagem."; form.reportValidity && form.reportValidity(); return; }
    msg.textContent = "A enviar…";
    fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(new FormData(form)).toString() })
      .then(function (r) { if (!r.ok) throw new Error(); msg.textContent = "Obrigado pela mensagem! Entrarei em contato em breve."; form.reset(); })
      .catch(function () { msg.textContent = "Ocorreu um erro. Por favor, tente novamente ou escreva para luis.ela.arquitetura@hotmail.com."; });
  });

  lugar("lisboa");
  aplicarFiltro();
})();
