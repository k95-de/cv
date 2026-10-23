/* ============================================================================
   THE FLOW · November edition · interaction + motion
   Needs: gsap, ScrollTrigger, Lenis, CV (content.js), HeatField (fluid.js)
   ========================================================================== */
(function () {
"use strict";

const root = document.documentElement;
root.classList.add("js");
const $ = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const isMobile = () => innerWidth < 760;
if (reduced) root.classList.add("no-anim");

const hasGsap = !!(window.gsap && window.ScrollTrigger);
if (hasGsap) gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------ language */
let LANG = "en";
try { LANG = localStorage.getItem("flow-lang") || ""; } catch (e) { LANG = ""; }
if (LANG !== "en" && LANG !== "de") LANG = /^de\b/i.test(navigator.language || "") ? "de" : "en";

const pick = v => (v && typeof v === "object" && !Array.isArray(v)) ? (v[LANG] != null ? v[LANG] : v.en) : v;
function t(path) {
  let o = CV;
  for (const k of path.split(".")) { o = o ? o[k] : undefined; }
  if (o === undefined) o = CV.ui[path];
  return pick(o);
}
/* ------------------------------------------------------------ mode: "flow" (cinematic) or "recruiter" (30 s summary) */
function readMode() {
  try {
    const q = new URLSearchParams(location.search).get("mode");
    if (q === "recruiter") return true;
    if (q === "flow" || q === "full") return false;
  } catch (e) {}
  if (/^#recruiter$/i.test(location.hash)) return true;
  try { return localStorage.getItem("flow-mode") === "recruiter"; } catch (e) { return false; }
}
let REC = readMode();
if (REC) root.classList.add("rec-on");
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ------------------------------------------------------------ text splitting */
function splitChars(el, baseDelay) {
  const text = el.textContent.trim();
  const grad = el.classList.contains("grad");
  const total = Array.from(text.replace(/\s+/g, "")).length;
  let k = 0;
  el.innerHTML = text.split(/\s+/).map(word =>
    '<span class="w">' + Array.from(word).map(ch => {
      const i = k++;
      let st = "--d:" + ((baseDelay || 0) + i * 0.035).toFixed(3);
      if (grad) st += ";background-size:" + (total * 100) + "% 100%;background-position:" + (total > 1 ? (i / (total - 1) * 100).toFixed(2) : 0) + "% 0";
      return '<span class="ch" style="' + st + '">' + esc(ch) + "</span>";
    }).join("") + "</span>"
  ).join(" ");
}
function splitWords(el) {
  const text = el.textContent.trim();
  el.innerHTML = text.split(/\s+/).map(w => '<span class="w"><i>' + esc(w) + "</i></span>").join(" ");
}

/* ------------------------------------------------------------ thermal colours */
const STOPS = ["#1D4ED8", "#2ED1F2", "#3EDB8A", "#F5E142", "#FF8F24", "#F2352E"];
const LOADER_STOPS = ["#0B1E5B", "#1D4ED8", "#2ED1F2", "#3EDB8A", "#F5E142", "#FF8F24", "#F2352E"];
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function thermal(x, stops) {
  stops = stops || STOPS;
  x = Math.max(0, Math.min(1, x)) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x)), f = x - i;
  const a = hex2rgb(stops[i]), b = hex2rgb(stops[i + 1]);
  return "rgb(" + a.map((v, j) => Math.round(v + (b[j] - v) * f)).join(",") + ")";
}

/* ------------------------------------------------------------ build content */
function applyStatic() {
  root.lang = LANG;
  $$("[data-t]").forEach(el => {
    const v = t(el.getAttribute("data-t"));
    if (v == null) return;
    el.textContent = v;
    if (el.classList.contains("split-words")) splitWords(el);
    if (el.classList.contains("split-chars")) splitChars(el);
  });
  $$(".lang button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === LANG)));
  soundLabel();
  updateCoolLabel();
  if (!finePointer) $("#heat-hint").textContent = t("tapHint");
}

function buildHeroName() {
  splitChars($(".h-first"), 0.15);
  splitChars($(".h-last"), 0.38);
  splitChars($(".ft-name .split-chars"), 0);
}

function buildMarquee() {
  const items = CV.marquee.map((m, i) => '<span style="--bp:' + Math.round(i / (CV.marquee.length - 1) * 100) + '%">' + esc(m) + "</span>").join("");
  $("#mq").innerHTML = items + items;
}

function buildAbout() {
  const hot = /^(heat|wärme|1d|1d-modelle\.?|validated|validierte|man|traton|change\.?|ändern|muss\.?)[,.]?$/i;
  const words = t("about.statement").split(/\s+/);
  $("#statement").innerHTML = words.map(w => '<span class="sw' + (hot.test(w) ? " hot" : "") + '">' + esc(w) + "</span>").join(" ");
  $("#facts").innerHTML = CV.about.facts.map(f =>
    '<li><b data-n="' + f.n + '" data-pre="' + (f.pre || "") + '">' + (f.pre || "") + f.n + "</b><span>" + esc(pick(f.label)) + "</span></li>").join("");
}

function buildStations() {
  const list = CV.stations, n = list.length;
  const html = list.map((s, i) => {
    const c = thermal(i / (n - 1));
    const kind = s.kind === "job" ? "job" : "edu";
    let gate = "";
    if (s.gate === "start") gate = '<p class="gate mono">' + esc(t("gateOpen")) + "</p>";
    if (s.gate === "done") gate = '<p class="gate mono">' + esc(t("gatePass")) + "</p>";
    const bullets = s.bullets ? '<ul class="st-bul">' + pick(s.bullets).map(b => "<li>" + esc(b) + "</li>").join("") + "</ul>" : "";
    const tools = s.tools ? '<div class="st-tools">' + s.tools.map(x => "<span>" + esc(x) + "</span>").join("") + "</div>" : "";
    /* responsive sizes: 640 / 960 / 1280 px wide webp; the sheen mask is set later from
       the already-downloaded image (no second download, see the load listener) */
    const b = s.img ? s.img.replace(/\.webp$/, "") : "";
    const media = s.img ? '<figure class="st-media"><img data-src="' + b + '-960.webp" data-srcset="' + b + "-640.webp 640w, " + b + "-960.webp 960w, " + b + '-1280.webp 1280w" sizes="(min-width: 1000px) min(44vw, 80vh), min(520px, calc(100vw - 76px))" alt="" loading="eager" decoding="async" width="1280" height="859" /><span class="sheen"></span></figure>' : "";
    return '<li class="st ' + kind + '" data-i="' + i + '" data-year="' + esc(s.years.slice(0, 4)) + '" style="--c:' + c + '">' +
      '<div class="st-text">' + gate +
        '<p class="st-years" aria-label="' + esc(s.years) + '">' + esc(s.years) + "</p>" +
        (s.dur ? '<p class="st-dur mono">' + esc(pick(s.dur)) + "</p>" : "") +
        '<h3 class="st-org">' + esc(pick(s.org)) + "</h3>" +
        '<p class="st-role">' + esc(pick(s.role)) + "</p>" +
        '<p class="st-place">' + esc(pick(s.place)) + "</p>" +
        bullets + tools +
      "</div>" + media + "</li>";
  }).join("");
  const end = '<li class="st st-end" style="--c:' + STOPS[STOPS.length - 1] + '"><div class="st-text"><p class="gate mono">' + esc(t("availShort")) + '</p><h3 class="st-org">' +
    esc(t("circuit.end")) + "</h3><p>" + esc(t("circuit.endLine")) + "</p></div></li>";
  $("#stations").innerHTML = html + end;
  $("#cc-tot").textContent = String(n).padStart(2, "0");
  lazyImages();
}

/* own lazy loader: browsers' native lazy thresholds are huge on phones (all 9 images
   were fetched at start). Images get their srcset only when they come within ~1 screen.
   width/height attributes keep the box size, so nothing jumps when they arrive. */
let lazyIO = null;
function loadImg(im) {
  if (!im.dataset.srcset) return;
  im.srcset = im.dataset.srcset; im.src = im.dataset.src;
  delete im.dataset.srcset; delete im.dataset.src;
}
function lazyImages() {
  const ims = $$("#stations img[data-srcset]");
  if (lazyIO) lazyIO.disconnect();
  if (!("IntersectionObserver" in window)) { ims.forEach(loadImg); return; }
  lazyIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { loadImg(e.target); lazyIO.unobserve(e.target); }
  }), { rootMargin: "100% 100% 100% 100%" });
  ims.forEach(im => lazyIO.observe(im));
  /* warm-up: once the page is idle, fetch every station image in the background,
     so the sideways career scroll never waits for a picture */
  const sd = navigator.connection && navigator.connection.saveData;
  if (!sd) {
    const warm = () => $$("#stations img[data-srcset]").forEach((im, i) => setTimeout(() => loadImg(im), i * 120));
    if ("requestIdleCallback" in window) requestIdleCallback(warm, { timeout: 2500 }); else setTimeout(warm, 1800);
  }
}

function buildKit() {
  $("#kit-grid").innerHTML = CV.kit.groups.map((g, i) => {
    const items = pick(g.items);
    return '<article class="kcard"><span class="kn mono">0' + (i + 1) + " / 0" + CV.kit.groups.length + "</span><h3>" + esc(pick(g.h)) +
      "</h3><ul>" + items.map(x => "<li>" + esc(x) + "</li>").join("") + "</ul></article>";
  }).join("");
  $("#certs").innerHTML = CV.kit.certs.map(c => "<li><b>" + esc(c.t) + "</b><span>" + esc(c.by) + "</span><em class=\"mono\">" + c.y + "</em></li>").join("");
}

function buildEdu() {
  $("#edu-list").innerHTML = CV.edu.items.map(e =>
    '<div class="edu-row"><div><p class="deg">' + esc(e.deg) + '</p></div><div><p class="y mono">' + esc(e.y) + "</p><h3>" + esc(pick(e.name)) +
    '</h3><p class="wh">' + esc(pick(e.where)) + '</p><p class="nt">' + esc(pick(e.note)) + "</p></div></div>").join("");
  $("#langs").innerHTML = CV.edu.langs.map(l => '<li><b>' + esc(pick(l.l)) + "</b><span>" + esc(pick(l.v)) + '</span><i style="--p:' + l.p + '"></i></li>').join("");
}

/* recruiter mode: one calm summary page (also what gets printed) */
function buildRec() {
  const R = CV.rec, C = CV.contact;
  const jobs = CV.stations.filter(s => s.kind === "job").slice().reverse();
  /* show design roles next to the simulation roles, not only MAN/TRATON */
  const keep = ["network", "bus", "flux", "stress", "mold", "aero"];
  const main = jobs.filter(s => keep.some(k => (s.img || "").includes(k))), earlier = jobs.filter(s => !main.includes(s));
  const ic = {
    dl: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v12M6 11l6 6 6-6M5 20h14" /></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v12H3zM3 7l9 6 9-6" /></svg>',
    in: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9v10M5 5v.01M10 19v-6a3 3 0 0 1 6 0v6M10 9v10M16 13v6M19 19v-6a3 3 0 0 0-3-3" /></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" /></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>',
    arrow: '<svg class="rs-arr" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>'
  };
  const n = R.strengths.length;
  const strengths = R.strengths.map((s, i) =>
    '<li class="rs-anim" style="--c:' + thermal(0.12 + i / (n - 1) * 0.88) + '"><span class="rs-n mono"><i></i>0' + (i + 1) + "</span><div><h3>" + esc(pick(s.h)) + "</h3><p>" + esc(pick(s.p)) + "</p></div></li>").join("");
  const exp = main.map((s, i) =>
    '<li class="rs-anim" style="--c:' + thermal(1 - i / (main.length - 1) * 0.85) + '"><p class="rs-dur mono">' + esc(pick(s.dur)) + "</p><p class=\"rs-org\">" + esc(pick(s.org)) +
    '</p><p class="rs-jr">' + esc(pick(s.role)) + "</p></li>").join("");
  const earl = earlier.map(s => "<span>" + esc(pick(s.org)) + " <em>" + esc(s.years) + "</em></span>").join("");
  const edu = CV.edu.items.map((e, i) =>
    '<li class="rs-anim"><p class="rs-deg"><b>' + esc(e.deg) + '</b> <span class="mono">' + esc(e.y) + "</span></p><p class=\"rs-en\">" + esc(pick(e.name)) +
    '</p><p class="rs-ew">' + esc(pick(e.where)).replace(/ \(.*\)$/, "") + "" + "</p></li>").join("");
  const langs = CV.edu.langs.map(l => '<li><b>' + esc(pick(l.l)) + "</b><span>" + esc(pick(l.v)) + '</span><i style="--p:' + l.p + '"></i></li>').join("");
  const tools = R.tools.map(x => "<li>" + esc(x) + "</li>").join("");

  $("#rec-sheet").innerHTML =
    '<div class="rs-id">' +
      '<div class="rs-photo rs-anim"><img src="assets/portrait-360.webp" srcset="assets/portrait-360.webp 360w, assets/portrait-720.webp 720w" sizes="128px" alt="' + esc(pick(R.photoAlt)) + '" width="360" height="360" decoding="async" /></div>' +
      '<div class="rs-who rs-anim">' +
        '<p class="rs-sub mono">' + esc(t("hero.sub")) + "</p>" +
        '<h1 id="rec-name" tabindex="-1"><span>' + esc(CV.hero.first) + '</span> <span class="rs-last">' + esc(CV.hero.last) + "</span></h1>" +
        '<p class="rs-role">' + esc(t("hero.role")) + "</p>" +
        '<p class="rs-line serif">' + esc(t("hero.line")) + "</p>" +
        '<ul class="rs-tags">' +
          '<li class="is-ok"><i class="ok"></i>' + esc(t("availShort")) + "</li>" +
          "<li>" + ic.pin + esc(pick(R.location)) + "</li>" +
          "<li>" + esc(pick(R.reloc)) + "</li>" +
          "<li>" + esc(t("contact.citizen")) + "</li>" +
        "</ul>" +
      "</div>" +
      '<div class="rs-cta rs-anim">' +
        '<a class="rs-primary" href="mailto:' + C.email + '">' + ic.mail +
          '<span class="rs-pt"><b>' + esc(pick(R.emailCta)) + '</b><small class="mono">' + esc(C.email) + "</small></span>" + ic.arrow + "</a>" +
        '<div class="rs-sec">' +
          '<a class="rs-btn" href="' + C.cv + '" download>' + ic.dl + "<span>" + esc(pick(R.cvShort)) + "</span></a>" +
          '<a class="rs-btn" href="' + C.linkedinUrl + '" target="_blank" rel="noopener">' + ic.in + '<span>LinkedIn</span><span class="sr-only"> (' + esc(pick(R.newTab)) + ")</span></a>" +
        "</div>" +
        '<button class="rs-share mono" type="button" id="rec-copy">' + ic.link + '<span data-label="' + esc(pick(R.copy)) + '">' + esc(pick(R.copy)) + "</span></button>" +
        '<p class="rs-mail mono">' + esc(C.email) + "</p>" +
      "</div>" +
    "</div>" +
    '<div class="rs-grid">' +
      '<section class="rs-col rs-str" aria-labelledby="rs-h-str"><h2 class="rs-h mono" id="rs-h-str">' + esc(pick(R.strengthsTitle)) + "</h2><ol>" + strengths + "</ol></section>" +
      '<section class="rs-col rs-exp" aria-labelledby="rs-h-exp"><h2 class="rs-h mono" id="rs-h-exp">' + esc(pick(R.expTitle)) + '</h2><ol class="rs-tl">' + exp + "</ol>" +
        '<p class="rs-earlier rs-anim"><b class="mono">' + esc(pick(R.earlier)) + "</b>" + earl + "</p></section>" +
      '<div class="rs-col rs-side">' +
        '<section aria-labelledby="rs-h-tools"><h2 class="rs-h mono" id="rs-h-tools">' + esc(pick(R.toolsTitle)) + '</h2><ul class="rs-tools rs-anim">' + tools + "</ul></section>" +
        '<section aria-labelledby="rs-h-edu"><h2 class="rs-h mono" id="rs-h-edu">' + esc(pick(R.eduTitle)) + '</h2><ol class="rs-edu">' + edu + "</ol></section>" +
        '<section aria-labelledby="rs-h-lang"><h2 class="rs-h mono" id="rs-h-lang">' + esc(pick(R.langTitle)) + '</h2><ul class="rs-langs rs-anim">' + langs + "</ul></section>" +
      "</div>" +
    "</div>" +
    '<p class="rs-print-foot">' + esc(C.email) + " · linkedin.com/in/khaled-de · " + esc(pick(R.location)) + "</p>";

  const cp = $("#rec-copy");
  cp.addEventListener("click", () => {
    const lab = $("span", cp), url = recUrl();
    const done = () => { lab.textContent = t("copied") + " ✓"; cp.classList.add("ok"); setTimeout(() => { lab.textContent = lab.dataset.label; cp.classList.remove("ok"); }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, done);
    else { const ta = document.createElement("textarea"); ta.value = url; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) {} ta.remove(); done(); }
  });
  updateRecLabels();
}
function recUrl() {
  try { const u = new URL(location.href); u.hash = ""; u.searchParams.set("mode", "recruiter"); return u.toString(); }
  catch (e) { return location.href.split("#")[0]; }
}
function updateRecLabels() {
  $$("[data-rec-toggle]").forEach(b => {
    b.setAttribute("aria-checked", String(REC));
    b.setAttribute("aria-label", t("rec.toggle") + " · " + t(REC ? "rec.switchOn" : "rec.switchOff"));
    b.title = REC ? t("rec.full") : t("rec.toggle");
  });
}

function buildAll() {
  applyStatic();
  buildHeroName();
  buildMarquee();
  buildAbout();
  buildStations();
  buildKit();
  buildEdu();
  buildRec();
  buildTransfers();
}

/* ------------------------------------------------------------ heat field: adaptive quality
   Tier 0 = baked still image (very weak devices, reduced motion, no WebGL)
   Tier 1-3 = live fluid with growing grid, solver iterations and pixel ratio.
   A 1-second frame-time probe after the loader (and a watchdog later) steps down
   when the device cannot hold the frame rate. Never steps back up (no flicker). */
const TIERS = [
  null,
  { name: "low",  sim: 64,  dye: 256, iter: 8,  dpr: 0.75, fps: 30 },
  { name: "mid",  sim: 96,  dye: 384, iter: 14, dpr: 1,    fps: 60 },
  { name: "high", sim: 128, dye: 768, iter: 20, dpr: 1.5,  fps: 60 }
];
function pickTier() {
  const mem = navigator.deviceMemory || 8, cores = navigator.hardwareConcurrency || 8;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  let t = isMobile() || !finePointer ? 2 : 3;
  if (mem <= 4 || cores <= 4) t = Math.min(t, 2);
  if (mem <= 2 || cores <= 2 || saveData) t = 1;
  if (mem < 1) t = 0;
  if (reduced) t = 0;
  const force = /[?&]q=([0-3])\b/.exec(location.search);   /* ?q=0..3 forces a tier (testing) */
  if (force) t = +force[1];
  return t;
}
const canvas = $("#field");
const fallback = $(".field-fallback");
let tier = pickTier();
let field = null;
function goStatic() {
  if (field) { try { field.destroy(); } catch (e) {} }
  field = null; tier = 0;
  root.classList.add("field-static");
}
if (tier > 0) {
  try {
    field = new HeatField(canvas, { mobile: isMobile(), quality: TIERS[tier] });
    if (!field.ok) field = null;
  } catch (e) { console.warn(e); field = null; }
  if (field) field.prime(30); else { root.classList.add("no-gl"); goStatic(); }
} else goStatic();

/* pause the simulation when nobody can see it */
let fieldOnScreen = true;
if ("IntersectionObserver" in window) {
  new IntersectionObserver(es => { fieldOnScreen = es[es.length - 1].isIntersecting; }).observe(canvas);
}
document.addEventListener("visibilitychange", () => { probe.reset(); });

/* frame-time probe + watchdog */
const probe = {
  on: false, sum: 0, n: 0, start: 0, slow: 0,
  reset() { this.sum = 0; this.n = 0; this.start = 0; },
  begin() { this.on = true; this.reset(); },
  add(now, dtMs) {
    if (!this.on || !field || document.hidden || !fieldOnScreen || menuOpen) { this.reset(); return; }
    if (!this.start) { this.start = now; return; }
    if (dtMs > 500) return;                       /* tab switch, background throttling, debugger: not the field's fault */
    this.sum += dtMs; this.n++;
    const win = this.slow === -1 ? 2000 : 1000;   /* first probe 1 s, then 2 s watchdog windows */
    if (now - this.start < win) return;
    if (this.n < 3) { this.reset(); return; }     /* too few frames to judge */
    const avg = this.sum / this.n;
    const budget = 1000 / TIERS[tier].fps;
    const tooSlow = avg > budget * 1.35;
    this.reset();
    if (this.slow !== -1) {                       /* first probe decides at once */
      this.slow = -1;
      if (tooSlow) stepDown();
      return;
    }
    if (tooSlow) { if (++this.watch >= 2) { this.watch = 0; stepDown(); } } else this.watch = 0;
  },
  watch: 0
};
function stepDown() {
  if (!field) return;
  if (tier <= 1) { goStatic(); applyFx(); return; }
  tier--;
  field.setQuality(TIERS[tier]);
  probe.slow = 0;                                 /* re-probe the new tier for 1 s */
  applyFx();
}
/* "fx-lite": low/static quality tier, phones/touch and reduced motion get no grain,
   no type skew and no section-transfer bands (polish effects that cost frame time) */
function applyFx() {
  const lite = reduced || tier <= 1 || isMobile() || !finePointer;
  root.classList.toggle("fx-lite", lite);
  if (lite) { try { skewNow = 0; skewSet.forEach(el => { el.style.transform = ""; }); } catch (e) { /* not set up yet at boot */ } }
}
applyFx();
addEventListener("resize", applyFx);

/* pointer heat */
let lastP = null;
function heatAt(clientX, clientY, gain) {
  if (!field || reduced) return;
  const x = clientX / innerWidth, y = 1 - clientY / innerHeight;
  if (lastP) {
    const dx = x - lastP.x, dy = y - lastP.y, sp = Math.hypot(dx, dy);
    if (sp > 0.0004) field.splat(x, y, dx * 5200, dy * 5200, Math.min(0.9, 0.05 + sp * 22) * (gain || 1));
  }
  lastP = { x, y };
}
addEventListener("pointermove", e => { if (e.pointerType === "mouse" || e.pointerType === "pen") heatAt(e.clientX, e.clientY); }, { passive: true });
addEventListener("touchstart", e => { const p = e.touches[0]; lastP = null; heatAt(p.clientX, p.clientY); }, { passive: true });
addEventListener("touchmove", e => { const p = e.touches[0]; heatAt(p.clientX, p.clientY, 1.4); }, { passive: true });
document.addEventListener("pointerleave", () => { lastP = null; });

/* ------------------------------------------------------------ sound (off by default) */
let soundOn = false;
const sfx = null; // sound removed on Khaled's request (23 Oct 2026); the button stays hidden
let soundWanted = false;
try { soundWanted = localStorage.getItem("flow-sound") === "on"; } catch (e) {}
function soundLabel() {
  const b = $("#sound");
  b.setAttribute("aria-pressed", String(soundOn));
  const lab = t(soundOn ? "soundOn" : "soundOff");
  b.title = lab + " (M)";
  b.setAttribute("aria-label", lab + " (M)");
  $("#sound [data-t]").textContent = lab;
}
function setSound(on, quiet) {
  if (!sfx) return;
  soundOn = on;
  if (on) sfx.enable(!quiet); else { sfx.toggle(false); sfx.disable(); }
  if (on && !quiet) setTimeout(() => sfx.toggle(true), 60);
  try { localStorage.setItem("flow-sound", on ? "on" : "off"); } catch (e) {}
  soundLabel();
}
function blip(f) { if (sfx && soundOn) sfx.blip(f); }
function tick(bright) { if (sfx && soundOn) sfx.tick(bright); }
$("#sound").addEventListener("click", () => setSound(!soundOn));
if (!sfx) $("#sound").hidden = true;
/* remembered "on": audio may only start after a user gesture, so arm it for the first one
   (reduced-motion visitors always start in silence) */
if (sfx && soundWanted && !reduced) {
  const arm = e => {
    if ((e.target && e.target.closest && e.target.closest("#sound")) || e.key === "m" || e.key === "M") { cleanup(); return; }
    cleanup(); if (!soundOn) setSound(true);
  };
  const cleanup = () => ["pointerdown", "keydown", "touchstart"].forEach(ev => removeEventListener(ev, arm, true));
  ["pointerdown", "keydown", "touchstart"].forEach(ev => addEventListener(ev, arm, true));
}
document.addEventListener("visibilitychange", () => { if (sfx) sfx.sleep(document.hidden); });

/* ------------------------------------------------------------ smooth scroll */
let lenis = null;
if (!reduced && window.Lenis) {
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.95 });
  if (hasGsap) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  lenis.stop();
  if (hasGsap) ScrollTrigger.addEventListener("refresh", () => lenis.resize());
}
/* late images change the page height: re-measure once they arrive */
let imgT = 0;
document.addEventListener("load", e => {
  if (e.target.tagName !== "IMG") return;
  const sheen = e.target.nextElementSibling;
  if (sheen && sheen.classList.contains("sheen") && getComputedStyle(sheen).display !== "none") {
    const u = "url(" + (e.target.currentSrc || e.target.src) + ")";
    sheen.style.webkitMaskImage = u; sheen.style.maskImage = u;
  }
  clearTimeout(imgT);
  imgT = setTimeout(() => { if (hasGsap) ScrollTrigger.refresh(); else if (lenis) lenis.resize(); }, 200);
}, true);
function scrollToTarget(target, immediate) {
  if (typeof target === "number") {
    if (lenis) lenis.scrollTo(target, { duration: 1.8, immediate: !!immediate, easing: x => 1 - Math.pow(1 - x, 4) });
    else scrollTo({ top: target, behavior: reduced ? "auto" : "smooth" });
    return;
  }
  const el = typeof target === "string" ? $(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.6, immediate: !!immediate, easing: x => 1 - Math.pow(1 - x, 4) });
  else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
}
/* thermal page transition: a hot sheet sweeps across, we jump, it sweeps off */
let transiting = false;
function thermalJump(target, after) {
  const w = $("#wipe");
  if (!hasGsap || reduced || transiting) { scrollToTarget(target, true); if (after) after(); return; }
  transiting = true;
  root.classList.add("transiting");
  gsap.timeline({ onComplete: () => { transiting = false; root.classList.remove("transiting"); } })
    .set(w, { clipPath: "inset(100% 0 0 0)" })
    .to(w, { clipPath: "inset(0% 0 0 0)", duration: 0.55, ease: "expo.in" })
    .add(() => { if (after) after(); scrollToTarget(target, true); ScrollTrigger.update(); if (field) for (let i = 0; i < 5; i++) field.splat(0.1 + i * 0.2, 0.02, 0, 900, 0.5, 0.003); })
    .to(w, { clipPath: "inset(0 0 100% 0)", duration: 0.85, ease: "expo.out", delay: 0.08 });
}
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute("href");
  if (id.length < 2) return;
  e.preventDefault();
  const target = id === "#main" ? 0 : id;
  const focusIt = () => { const el = id === "#main" ? $("#main") : $(id); if (!el) return; if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: true }); };
  if (menuOpen && a.closest("#menu")) {
    /* menu jump: wipe covers, menu closes underneath, page lands, wipe lifts */
    thermalJump(target, () => { closeMenu(true); focusIt(); });
  } else {
    if (menuOpen) closeMenu();
    scrollToTarget(target);
    setTimeout(focusIt, 900);
  }
});

/* ------------------------------------------------------------ menu */
let menuOpen = false;
const menu = $("#menu"), menuBtn = $("#menu-btn");
let menuTl = null;
function btnCenter() { const r = menuBtn.getBoundingClientRect(); return (r.left + r.width / 2) + "px " + (r.top + r.height / 2) + "px"; }
function openMenu() {
  menuOpen = true; menu.hidden = false; root.classList.add("menu-open");
  $("header").classList.remove("hide");
  $("#main").inert = true;
  menuBtn.setAttribute("aria-expanded", "true");
  menuBtn.querySelector("[data-t]").textContent = t("close");
  if (lenis) lenis.stop();
  if (sfx && soundOn) sfx.toggle(true);
  if (hasGsap && !reduced) {
    if (menuTl) menuTl.kill();
    const at = btnCenter(), R = Math.hypot(innerWidth, innerHeight) * 1.05;
    menuTl = gsap.timeline()
      .fromTo(menu, { clipPath: "circle(0px at " + at + ")" }, { clipPath: "circle(" + R + "px at " + at + ")", duration: 1.0, ease: "expo.inOut" }, 0)
      .fromTo($(".mn-iso", menu), { scale: 0.6, opacity: 0, rotate: -20 }, { scale: 1, opacity: 1, rotate: 0, duration: 1.6, ease: "expo.out" }, 0.15)
      .fromTo($$(".mn-list b", menu), { yPercent: 115, rotate: 3, skewX: -8 }, { yPercent: 0, rotate: 0, skewX: 0, duration: 1.05, ease: "expo.out", stagger: 0.065 }, 0.32)
      .fromTo($$(".mn-list span", menu), { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out", stagger: 0.065 }, 0.45)
      .fromTo($$(".mn-list a", menu), { "--ln": 0 }, { "--ln": 1, duration: 1.0, ease: "expo.inOut", stagger: 0.065 }, 0.4)
      .fromTo($(".mn-foot", menu), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" }, 0.7);
  }
  setTimeout(() => { const a = $(".mn-list a", menu); if (a) a.focus({ preventScroll: true }); }, 60);
}
function closeMenu(instant) {
  menuOpen = false; root.classList.remove("menu-open");
  $("#main").inert = false;
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.querySelector("[data-t]").textContent = t("menu");
  if (lenis) lenis.start();
  if (sfx && soundOn && !instant) sfx.toggle(false);
  if (menuTl) { menuTl.kill(); menuTl = null; }
  if (hasGsap && !reduced && !instant) {
    menuTl = gsap.timeline({ onComplete: () => { if (!menuOpen) menu.hidden = true; } })
      .to($$(".mn-list b", menu), { yPercent: -110, duration: 0.45, ease: "expo.in", stagger: 0.035 }, 0)
      .to($(".mn-foot", menu), { opacity: 0, duration: 0.3 }, 0)
      .to(menu, { clipPath: "circle(0px at " + btnCenter() + ")", duration: 0.75, ease: "expo.inOut" }, 0.18);
  } else menu.hidden = true;
}
menuBtn.addEventListener("click", () => menuOpen ? closeMenu() : openMenu());
addEventListener("keydown", e => {
  if (e.key === "Escape" && menuOpen) { closeMenu(); menuBtn.focus(); }
  const tg = e.target && e.target.closest ? e.target : null;
  if ((e.key === "m" || e.key === "M") && !e.ctrlKey && !e.metaKey && !e.altKey && !e.repeat && !(tg && tg.closest("input,textarea,[contenteditable]"))) setSound(!soundOn);
});
/* menu: hovering an item shows its big index behind the list */
$$(".mn-list a", menu).forEach(a => a.addEventListener("pointerenter", () => {
  const n = $(".mn-big", menu); if (n) { n.textContent = $("span", a).textContent; n.classList.add("on"); }
  menu.style.setProperty("--mt", a.parentElement.dataset.temp || "0");
}));
$(".mn-list", menu).addEventListener("pointerleave", () => { const n = $(".mn-big", menu); if (n) n.classList.remove("on"); });

/* ------------------------------------------------------------ copy link */
$("#copy").addEventListener("click", () => {
  const url = location.href.split("#")[0];
  const done = () => { const b = $("#copy"); b.textContent = t("copied") + " ✓"; b.classList.add("ok"); setTimeout(() => { b.textContent = t("copyLink"); b.classList.remove("ok"); }, 1800); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, done);
  else { const ta = document.createElement("textarea"); ta.value = url; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) {} ta.remove(); done(); }
});

/* ------------------------------------------------------------ recruiter mode toggle */
const recLayer = $("#rec");
const baseTitle = document.title;
let recFallback = 0, recOpener = null;
function setRecURL(on) {
  try {
    const u = new URL(location.href);
    if (on) u.searchParams.set("mode", "recruiter"); else u.searchParams.delete("mode");
    if (!on && /^#recruiter$/i.test(u.hash)) u.hash = "";
    if (u.toString() !== location.href) history.replaceState(history.state, "", u.toString());
  } catch (e) {}
}
function recOrigin(btn) {
  const el = btn && btn.offsetParent !== null ? btn : $("#rec-btn");
  const r = el.getBoundingClientRect();
  return (r.left + r.width / 2).toFixed(0) + "px " + (r.top + r.height / 2).toFixed(0) + "px";
}
function applyRecState() {
  root.classList.toggle("rec-on", REC);
  $("#main").inert = REC;
  hdr.inert = REC;
  document.title = REC ? t("rec.docTitle") : baseTitle;
  updateRecLabels();
}
function setRec(on, opts) {
  opts = opts || {};
  if (on === REC && !opts.force) return;
  if (on && menuOpen) closeMenu();
  REC = on;
  try { localStorage.setItem("flow-mode", on ? "recruiter" : "flow"); } catch (e) {}
  setRecURL(on);
  clearTimeout(recFallback);
  const animate = hasGsap && !reduced && !opts.instant;
  if (hasGsap) { gsap.killTweensOf(recLayer); gsap.killTweensOf($$(".rs-anim", recLayer)); }
  if (on) {
    recOpener = opts.from || null;
    recLayer.hidden = false;
    recLayer.scrollTop = 0;
    applyRecState();
    if (lenis) lenis.stop();
    if (animate) {
      const o = recOrigin(opts.from);
      gsap.fromTo(recLayer, { clipPath: "circle(0px at " + o + ")" },
        { clipPath: "circle(" + Math.ceil(Math.hypot(innerWidth, innerHeight)) + "px at " + o + ")", duration: 0.9, ease: "expo.inOut", clearProps: "clipPath" });
      gsap.fromTo($$(".rs-anim", recLayer), { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.035, delay: 0.32, clearProps: "transform,opacity" });
    }
    if (!opts.boot) setTimeout(() => { const h = $("#rec-name"); if (h) h.focus({ preventScroll: true }); }, animate ? 450 : 0);
  } else {
    applyRecState();
    if (lenis && root.classList.contains("loaded")) lenis.start();
    const finish = () => { if (!REC) { recLayer.hidden = true; recLayer.style.clipPath = ""; } };
    if (animate) {
      gsap.to(recLayer, { clipPath: "circle(0px at " + recOrigin(recOpener) + ")", duration: 0.7, ease: "expo.inOut", onComplete: finish });
      recFallback = setTimeout(finish, 1200); /* in case rAF is paused (hidden tab) */
    } else finish();
    const back = recOpener && recOpener.offsetParent !== null ? recOpener : $("#rec-btn");
    setTimeout(() => back.focus({ preventScroll: true }), 50);
  }
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-rec-toggle]");
  if (!b) return;
  setRec(!REC, { from: REC ? null : b });
});
$("#rec-print").addEventListener("click", () => { try { window.print(); } catch (e) {} });
addEventListener("hashchange", () => { if (/^#recruiter$/i.test(location.hash) && !REC) setRec(true); });
addEventListener("keydown", e => { if (e.key === "Escape" && REC && !menuOpen && !e.defaultPrevented) setRec(false); });

/* ------------------------------------------------------------ cursor + magnetic */
const cur = $("#cur"), curLab = $(".cur-lab"), curCtx = $(".cur-ctx");
const cpos = { x: innerWidth / 2, y: innerHeight / 2, rx: innerWidth / 2, ry: innerHeight / 2, vx: 0, vy: 0 };
let overLink = null;
if (finePointer && !reduced) {
  root.classList.add("has-cursor");
  addEventListener("pointermove", e => { cpos.x = e.clientX; cpos.y = e.clientY; cur.classList.add("moved"); }, { passive: true });
  document.addEventListener("pointerover", e => {
    const tgt = e.target.closest("[data-cursor]");
    const link = e.target.closest("a,button");
    if (link !== overLink) { overLink = link; if (link) tick(!!tgt); }
    if (tgt) { cur.classList.add("is-hover"); cur.classList.remove("is-link"); curLab.textContent = tgt.getAttribute("data-cursor"); }
    else if (link) { cur.classList.add("is-link"); cur.classList.remove("is-hover"); }
    else { cur.classList.remove("is-hover", "is-link"); }
    /* links leave a little heat behind */
    if (link && field && !link.closest("#menu")) field.splat(e.clientX / innerWidth, 1 - e.clientY / innerHeight, 0, 140, 0.35, 0.0016);
  });
  document.addEventListener("pointerdown", () => cur.classList.add("press"));
  document.addEventListener("pointerup", () => cur.classList.remove("press"));
  /* magnetic: every element marked .magnetic (strong) or [data-magnet] (gentle) */
  const mags = $$(".magnetic, .tbtn, .lang button, .ct-links a, .ct-links button, .mn-foot a, .ft-row a, .logo");
  mags.forEach(el => {
    const k = el.classList.contains("magnetic") ? 0.35 : 0.22;
    const inner = el.querySelector(".orb-txt, svg");
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2), my = e.clientY - (r.top + r.height / 2);
      if (!hasGsap) return;
      gsap.to(el, { x: mx * k, y: my * k, duration: 0.5, ease: "power3.out" });
      if (inner && el.classList.contains("btn-orb")) gsap.to(inner, { x: mx * 0.18, y: my * 0.18, duration: 0.5, ease: "power3.out" });
    });
    el.addEventListener("pointerleave", () => {
      if (!hasGsap) return;
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1,0.4)" });
      if (inner && el.classList.contains("btn-orb")) gsap.to(inner, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1,0.4)" });
    });
  });
}
const dot = $(".cur-dot"), ring = $(".cur-ring");
let ctxText = "", ctxTemp = -1, ctxCol = "";
function moveCursor() {
  if (!root.classList.contains("has-cursor")) return;
  const px = cpos.rx, py = cpos.ry;
  cpos.rx += (cpos.x - cpos.rx) * 0.18; cpos.ry += (cpos.y - cpos.ry) * 0.18;
  cpos.vx += ((cpos.rx - px) - cpos.vx) * 0.25; cpos.vy += ((cpos.ry - py) - cpos.vy) * 0.25;
  const sp = cur.classList.contains("is-hover") ? 0 : Math.min(1, Math.hypot(cpos.vx, cpos.vy) / 40);
  const ang = sp ? Math.atan2(cpos.vy, cpos.vx) * 180 / Math.PI : 0;
  dot.style.transform = "translate3d(" + cpos.x + "px," + cpos.y + "px,0)";
  /* the ring stretches along the direction of travel, like a droplet */
  ring.style.transform = "translate3d(" + cpos.rx + "px," + cpos.ry + "px,0) rotate(" + ang.toFixed(1) + "deg) scale(" + (1 + sp * 0.35).toFixed(3) + "," + (1 - sp * 0.22).toFixed(3) + ")";
  curCtx.style.transform = "translate3d(" + (cpos.rx + 30) + "px," + (cpos.ry + 18) + "px,0)";
  /* temperature-like context label: section name + the same °C as the thermometer */
  const temp = Math.round(20 + shownProg() * 75);
  const name = curSection;
  if (temp !== ctxTemp || name !== ctxText) {
    ctxTemp = temp; ctxText = name;
    curCtx.firstChild.textContent = name;
    curCtx.lastChild.textContent = temp + " °C";
    const col = thermal((temp - 20) / 75);
    if (col !== ctxCol) { ctxCol = col; cur.style.setProperty("--tc", col); }
  }
}

/* spotlight on kit cards */
document.addEventListener("pointermove", e => {
  const card = e.target.closest && e.target.closest(".kcard");
  if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty("--mx", (e.clientX - r.left) + "px");
  card.style.setProperty("--my", (e.clientY - r.top) + "px");
}, { passive: true });

/* ------------------------------------------------------------ scroll choreography */
let ctx = null, isH = false, circuitTween = null, revealOK = true;
const hudSec = $("#hud-sec"), thFill = $("#th-fill"), thVal = $("#th-val");
let contactGlow = 0, heroOut = 0, coolDown = 0, scrollProg = 0, curSection = "Source";
/* what the thermometer (and the cursor label) shows: hot (95 °C) at the top, cooling to 20 °C at the bottom */
const shownProg = () => Math.max(0, Math.min(1, 1 - scrollProg));
function paintThermo() {
  const p = shownProg();
  thFill.style.transform = "scaleY(" + p.toFixed(4) + ")";
  thVal.textContent = Math.round(20 + p * 75) + "°";
}

/* text scramble: glyphs settle left to right into the real label */
const GLYPHS = "°±∆∂≈∞01Ø#%/<>=+×";
const scrambles = new WeakMap();
function scramble(el, finalText, dur) {
  if (!el) return;
  finalText = finalText != null ? finalText : el.textContent;
  if (reduced) { el.textContent = finalText; return; }
  const prev = scrambles.get(el); if (prev) cancelAnimationFrame(prev);
  const chars = Array.from(finalText), n = chars.length, D = dur || 650, t0 = performance.now();
  const step = now => {
    const p = Math.min(1, (now - t0) / D);
    let s = "";
    for (let i = 0; i < n; i++) {
      const c = chars[i];
      if (c === " " || c === "·" || p >= (i + 1) / n * 0.85 + 0.15) s += c;
      else s += GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = s;
    if (p < 1) scrambles.set(el, requestAnimationFrame(step)); else { el.textContent = finalText; scrambles.delete(el); }
  };
  scrambles.set(el, requestAnimationFrame(step));
}

/* section transitions: a thermal band wipes across, isotherm lines draw behind it */
function buildTransfers() {
  $$(".xfer").forEach(x => x.remove());
  ["#about", "#kit", "#edu", "#contact"].forEach((sel, k) => {
    const s = $(sel); if (!s) return;
    const x = document.createElement("div");
    x.className = "xfer"; x.setAttribute("aria-hidden", "true");
    const amp = 10 + k * 2;
    const path = j => {
      let d = "M0 " + (40 + j * 9);
      for (let i = 1; i <= 8; i++) d += " S" + (i * 125 - 62) + " " + (40 + j * 9 + (i % 2 ? -amp : amp) * (1 - j * 0.25)) + " " + (i * 125) + " " + (40 + j * 9);
      return d;
    };
    x.innerHTML = '<i class="xf-band"></i><svg viewBox="0 0 1000 80" preserveAspectRatio="none"><defs><linearGradient id="xg' + k + '" x1="0" x2="1"><stop offset="0" stop-color="#1D4ED8"/><stop offset=".35" stop-color="#2ED1F2"/><stop offset=".6" stop-color="#3EDB8A"/><stop offset=".8" stop-color="#FF8F24"/><stop offset="1" stop-color="#F2352E"/></linearGradient></defs>' +
      [0, 1, 2].map(j => '<path pathLength="1" d="' + path(j) + '" stroke="url(#xg' + k + ')" style="--j:' + j + '"/>').join("") + "</svg>";
    s.prepend(x);
  });
}

function wantHorizontal() { return !reduced && hasGsap && innerWidth >= 1000 && innerHeight >= 600; }

function setupMotion() {
  isH = wantHorizontal();
  root.classList.toggle("is-h", isH);
  if (!hasGsap) { $$(".reveal-up, .split-chars").forEach(el => el.classList.add("is-in")); return; }

  ctx = gsap.context(() => {
    /* the pinned circuit goes first so every later trigger measures after its pin spacer */
    setupCircuit();
    ScrollTrigger.create({ trigger: "#circuit", start: "top bottom+=500", once: true,
      onEnter: () => $$("#stations img").slice(0, 3).forEach(loadImg) });
    const sections = [
      ["#hero", "00 · " + (LANG === "de" ? "Quelle" : "Source")],
      ["#about", t("about.kicker")], ["#circuit", t("circuit.kicker")], ["#kit", t("kit.kicker")],
      ["#edu", t("edu.kicker")], ["#contact", t("contact.kicker")]
    ];
    sections.forEach(([sel, label]) => ScrollTrigger.create({
      trigger: sel, start: "top 50%",
      end: (sel === "#circuit" && isH) ? () => "+=" + ($("#track").scrollWidth - innerWidth + innerHeight) : "bottom 50%",
      onToggle: self => {
        if (!self.isActive) return;
        curSection = label.replace(/^\d+\s*·\s*/, "");
        if (hudSec && hudSec.textContent !== label) scramble(hudSec, label, 520);
      }
    }));

    /* global progress: thermometer (cools back down in the footer) */
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: self => { scrollProg = self.progress; paintThermo(); }
    });

    /* end-of-page cool-down: the field and the hum sink to ice blue */
    ScrollTrigger.create({ trigger: ".foot", start: "top 85%", end: "bottom bottom",
      onUpdate: s => { coolDown = s.progress; root.style.setProperty("--cool", s.progress.toFixed(3)); updateCoolLabel(); },
      onLeaveBack: () => { coolDown = 0; root.style.setProperty("--cool", "0"); updateCoolLabel(); } });

    /* section transitions: thermal band + isotherm draw, scrubbed with the scroll */
    $$(".xfer").forEach(x => {
      const band = $(".xf-band", x), paths = $$("path", x);
      if (reduced) return;
      gsap.timeline({ scrollTrigger: { trigger: x, start: "top 95%", end: "top 45%", scrub: 0.7 } })
        .fromTo(band, { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, ease: "power2.in", duration: 0.45 }, 0)
        .to(band, { scaleX: 0, transformOrigin: "100% 50%", ease: "power2.out", duration: 0.45 }, 0.45)
        .fromTo(paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "power1.inOut", duration: 0.7, stagger: 0.1 }, 0.2);
    });

    /* section labels scramble in */
    $$(".kicker").forEach(k => {
      const txt = k.textContent;
      ScrollTrigger.create({ trigger: k, start: "top 90%", onEnter: () => scramble(k, txt, 700), onEnterBack: () => scramble(k, txt, 500) });
    });

    /* hero fades into the field as you leave it */
    ScrollTrigger.create({ trigger: "#hero", start: "top top", end: "bottom top", onUpdate: s => { heroOut = s.progress; } });
    if (!reduced) {
      gsap.to(".h-name", { yPercent: -18, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".h-portrait", { yPercent: 30, scale: 0.9, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
    }
    ScrollTrigger.create({ trigger: "#contact", start: "top 80%", end: "bottom bottom", onUpdate: s => { contactGlow = s.progress; }, onLeaveBack: () => { contactGlow = 0; } });

    /* statement: words light up as you read */
    const words = $$("#statement .sw");
    if (reduced) words.forEach(w => w.style.opacity = 1);
    else gsap.to(words, { opacity: 1, ease: "none", stagger: 0.12,
      scrollTrigger: { trigger: "#statement", start: "top 78%", end: "bottom 42%", scrub: 0.6 } });

    /* counters */
    $$("#facts b").forEach(b => {
      const n = +b.dataset.n, pre = b.dataset.pre || "";
      if (reduced || !revealOK) { b.textContent = pre + n; return; }
      const o = { v: 0 };
      b.textContent = pre + "0";
      ScrollTrigger.create({ trigger: b, start: "top 88%", once: true,
        onEnter: () => gsap.to(o, { v: n, duration: 1.6, ease: "power3.out", onUpdate: () => { b.textContent = pre + Math.round(o.v); } }) });
    });

    /* split titles */
    $$(".split-words").forEach(el => {
      const ws = $$(".w > i", el);
      if (reduced || !revealOK) return;
      gsap.from(ws, { yPercent: 110, rotate: 4, duration: 1.1, ease: "expo.out", stagger: 0.07,
        scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    });
    /* char splits outside the hero (contact, footer) */
    $$(".contact .split-chars, .foot .split-chars").forEach(el => {
      if (!revealOK) { el.classList.add("is-in"); return; }
      ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => el.classList.add("is-in") });
    });
    /* generic reveals */
    $$(".kicker, .cc-intro, .kcard, .certs li, .edu-row, .langs li, .ct-line, .ct-actions, .ct-cit, .facts li").forEach(el => {
      if (reduced || !revealOK) return;
      gsap.from(el, { y: 40, opacity: 0, duration: 1.1, ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });
    ScrollTrigger.create({ trigger: "#langs", start: "top 85%", once: true, onEnter: () => $("#langs").classList.add("on") });
    if (reduced || !revealOK) $("#langs").classList.add("on");
  });
  watchSkew();
}

function setupCircuit() {
  const track = $("#track"), pipe = $(".pipe"), sts = $$("#stations .st");
  const yearEl = $("#cc-year"), idxEl = $("#cc-idx"), barEl = $("#cc-bar");
  const n = CV.stations.length;
  let cur = -1;
  function setActive(i) {
    if (i === cur || i < 0) return;
    cur = i;
    const st = sts[Math.min(i, sts.length - 1)];
    const y = st && st.dataset.year;
    if (y && yearEl) yearEl.textContent = y;
    if (idxEl) idxEl.textContent = String(Math.min(i + 1, n)).padStart(2, "0");
    sts.forEach((s, j) => s.classList.toggle("on", j === i));
    blip(660 + i * 30);
  }

  if (isH) {
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    circuitTween = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: {
        trigger: "#circuit", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: self => {
          const x = -dist() * self.progress;
          const center = -x + innerWidth * 0.55;
          const frac = Math.min(1, Math.max(0, center / track.scrollWidth));
          pipe.style.setProperty("--pipe-empty", (1 - frac).toFixed(4));
          if (barEl) barEl.style.transform = "scaleX(" + self.progress.toFixed(4) + ")";
          let best = 0;
          for (let i = 0; i < sts.length; i++) { if (sts[i].offsetLeft <= center) best = i; }
          setActive(Math.min(best, n - 1));
        }
      }
    });
    gsap.timeline({ scrollTrigger: { trigger: "#circuit", start: "top top", end: () => "+=" + innerWidth * 0.3, scrub: true } })
      .to(".cc-head", { opacity: 0, x: -120, ease: "none" }, 0)
      .fromTo(".cc-year", { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "none" }, 0.4);
    if (revealOK) sts.forEach(st => {
      const parts = $$(".st-text > *", st);
      gsap.from(parts, { y: 50, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.05,
        scrollTrigger: { trigger: st, containerAnimation: circuitTween, start: "left 88%", toggleActions: "play none none reverse" } });
      const media = $(".st-media", st);
      if (media) {
        gsap.from(media, { clipPath: "inset(0 0 0 100%)", scale: 1.15, duration: 1.4, ease: "expo.out",
          scrollTrigger: { trigger: st, containerAnimation: circuitTween, start: "left 75%", toggleActions: "play none none reverse" } });
        gsap.fromTo($("img", media), { xPercent: 8 }, { xPercent: -8, ease: "none",
          scrollTrigger: { trigger: st, containerAnimation: circuitTween, start: "left right", end: "right left", scrub: true } });
      }
    });
  } else {
    ScrollTrigger.create({ trigger: track, start: "top 65%", end: "bottom 65%",
      onUpdate: s => pipe.style.setProperty("--pipe-empty", (1 - s.progress).toFixed(4)) });
    sts.forEach((st, i) => {
      ScrollTrigger.create({ trigger: st, start: "top 60%", end: "bottom 60%", onToggle: s => { if (s.isActive) setActive(i); } });
      if (reduced || !revealOK) return;
      gsap.from($$(".st-text > *, .st-media", st), { y: 40, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.05,
        scrollTrigger: { trigger: st, start: "top 85%", once: true } });
    });
  }
}

/* ------------------------------------------------------------ marquee (velocity reactive) */
let mqX = 0;
const mq = $("#mq");
function marquee(dt, vel) {
  if (!mq || reduced) return;
  const half = mq.scrollWidth / 2;
  if (!half) return;
  mqX -= (60 + Math.min(900, Math.abs(vel) * 40)) * dt * (vel < -0.5 ? -1 : 1);
  if (mqX <= -half) mqX += half;
  if (mqX > 0) mqX -= half;
  const skew = Math.max(-10, Math.min(10, vel * 0.35));
  mq.style.transform = "translate3d(" + mqX.toFixed(1) + "px,0,0) skewX(" + (-skew).toFixed(2) + "deg)";
}

/* ------------------------------------------------------------ main loop */
let lastT = performance.now(), scrollEmit = 0, lastSY = 0, lastField = 0, lastFbOp = -1;
const hdr = $("header");
function loop(now) {
  const rawMs = now - lastT;
  const dt = Math.min(0.05, rawMs / 1000); lastT = now;
  probe.add(now, rawMs);
  const vel = lenis ? lenis.velocity : 0;
  moveCursor();
  const sy = lenis ? lenis.scroll : scrollY;
  if (Math.abs(sy - lastSY) > 6) {
    hdr.classList.toggle("hide", sy > lastSY && sy > innerHeight * 0.6 && !menuOpen);
    lastSY = sy;
  }
  if (!REC) { marquee(dt, vel); skewType(vel); }
  const dim = Math.max(0, Math.min(1, heroOut * 1.15)) * (1 - 0.6 * contactGlow * (1 - coolDown)) * (1 - 0.25 * coolDown);
  if (field && !reduced) {
    /* paused: tab hidden, canvas off screen, covered by the menu or by recruiter mode */
    const run = !document.hidden && fieldOnScreen && !menuOpen && !REC;
    /* cap the simulation at 60 fps (30 on the low tier), also on 120 Hz screens */
    const budget = 1000 / TIERS[tier].fps;
    if (run && now - lastField >= budget - 2) {
      lastField = now;
      field.dim = dim;
      field.ambient = (0.55 + 0.45 * (1 - Math.min(1, heroOut)) + 0.6 * contactGlow) * (1 - 0.85 * coolDown);
      field.cool = coolDown;
      scrollEmit += dt;
      if (Math.abs(vel) > 1 && scrollEmit > 0.05) {
        scrollEmit = 0;
        field.splat(0.15 + Math.random() * 0.7, vel > 0 ? 0.02 : 0.98, (Math.random() - 0.5) * 80, (vel > 0 ? 1 : -1) * Math.min(600, Math.abs(vel) * 18), 0.12);
      }
      field.tick(now);
    }
  } else if (!field && fallback) {
    /* still image: dim it behind the content, like the live field (opacity only, no repaint) */
    const op = reduced ? 0.6 : +(1 - 0.65 * dim).toFixed(2);
    if (op !== lastFbOp) { lastFbOp = op; fallback.style.opacity = op; }
  }
  if (sfx && soundOn) sfx.update(Math.abs(vel), field ? field.energy * 0.7 + scrollProg * 0.3 : scrollProg, coolDown);
}

/* scroll-velocity skew on big type (only elements on screen are touched) */
let skewNow = 0;
const skewSet = new Set();
const skewIO = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) skewSet.add(en.target); else { skewSet.delete(en.target); en.target.style.transform = ""; }
}), { rootMargin: "10% 0px" }) : null;
function watchSkew() {
  if (!skewIO || reduced) return;
  skewIO.disconnect(); skewSet.clear();
  $$(".sec-title, .statement, .ct-big, .ft-name, .edu-row .deg, .facts b, html:not(.is-h) .cc-title").forEach(el => skewIO.observe(el));
}
function skewType(vel) {
  if (reduced || !skewSet.size || root.classList.contains("fx-lite")) return;
  const target = Math.max(-7, Math.min(7, -vel * 0.22));
  const next = skewNow + (target - skewNow) * 0.12;
  if (Math.abs(next - skewNow) < 0.004 && Math.abs(next) < 0.02) { if (skewNow !== 0) { skewNow = 0; skewSet.forEach(el => el.style.transform = ""); } return; }
  skewNow = next;
  const tf = "skewY(" + (skewNow * 0.5).toFixed(3) + "deg) skewX(" + (skewNow * 0.35).toFixed(3) + "deg)";
  skewSet.forEach(el => { el.style.transform = tf; });
}

function updateCoolLabel() {
  paintThermo();
  const tEl = $("#fc-temp"), lab = $("#fc-lab"), box = $(".ft-cool");
  if (!tEl) return;
  const done = coolDown > 0.97;
  tEl.textContent = Math.round(95 - coolDown * 75);
  const want = t(done ? "coolDone" : "coolDown");
  if (lab.textContent !== want) { if (done) scramble(lab, want, 600); else lab.textContent = want; }
  box.classList.toggle("done", done);
  if (done && !box.dataset.chimed) { box.dataset.chimed = "1"; if (sfx && soundOn) sfx.toggle(false); }
  if (coolDown < 0.5) delete box.dataset.chimed;
}
if (hasGsap) gsap.ticker.add(() => loop(performance.now()));
else { const r = now => { loop(now); requestAnimationFrame(r); }; requestAnimationFrame(r); }
addEventListener("resize", () => { if (field && reduced) field.renderOnce(); });

/* ------------------------------------------------------------ language switch with a thermal wipe */
function rebuild() {
  const y = lenis ? lenis.scroll : scrollY;
  if (ctx) ctx.revert();
  ctx = null; circuitTween = null; revealOK = false;
  buildAll();
  $$(".h-name .split-chars, #hero .reveal-up").forEach(el => el.classList.add("is-in"));
  $$("#hero .reveal-up").forEach(el => el.classList.add("is-in"));
  $(".h-name").classList.add("is-in");
  setupMotion();
  ScrollTrigger.refresh();
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y);
  if (REC && lenis) lenis.stop();
}
function switchLang(l) {
  if (l === LANG) return;
  const go = () => { LANG = l; try { localStorage.setItem("flow-lang", l); } catch (e) {} if (hasGsap) rebuild(); else { buildAll(); } applyRecState(); };
  if (!hasGsap || reduced) { go(); return; }
  const w = $("#wipe");
  gsap.timeline()
    .fromTo(w, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.55, ease: "expo.in" })
    .add(go)
    .to(w, { clipPath: "inset(0 0 0 100%)", duration: 0.7, ease: "expo.out", delay: 0.05 });
}
$$(".lang button").forEach(b => b.addEventListener("click", () => switchLang(b.dataset.lang)));

let rT = 0, lastW = innerWidth;
addEventListener("resize", () => {
  clearTimeout(rT);
  rT = setTimeout(() => {
    if (wantHorizontal() !== isH || (Math.abs(innerWidth - lastW) > 120 && isMobile() !== (lastW < 760))) { lastW = innerWidth; if (hasGsap) rebuild(); }
    lastW = innerWidth;
  }, 250);
});

/* ------------------------------------------------------------ boot: loader then hero */
buildAll();
const loader = $("#loader"), ldNum = $("#ld-num"), ldFill = $("#ld-fill"), ldTemp = $(".ld-temp");
const startT = performance.now();
let loaded = false;
const minTime = (reduced || REC) ? 200 : 1500;
const ready = Promise.race([
  Promise.all([
    /* the font CSS loads without blocking paint; wait for it + the hero face so the
       loader hides the swap (no layout shift after the reveal) */
    new Promise(r => {
      const l = document.querySelector('link[rel="stylesheet"][href*="fonts.googleapis.com"]');
      if (!l || l.media === "all" || l.sheet && l.media !== "print") r();
      else { l.addEventListener("load", r); l.addEventListener("error", r); }
    }).then(() => document.fonts ? Promise.all([document.fonts.load('900 1em "Big Shoulders Display"'), document.fonts.ready]).catch(() => {}) : null),
    new Promise(r => { const im = $(".hp-img img"); if (!im || im.complete) r(); else { im.onload = im.onerror = r; } })
  ]),
  new Promise(r => setTimeout(r, 3500))
]).then(() => { loaded = true; });

const ldTimer = setInterval(() => {
  const el = performance.now() - startT;
  let p = Math.min(1, el / minTime);
  if (!loaded) p = Math.min(p, 0.9);
  p = 1 - Math.pow(1 - p, 2);
  ldNum.textContent = Math.round(20 + 75 * p);
  ldFill.style.transform = "scaleX(" + p.toFixed(3) + ")";
  ldTemp.style.setProperty("--c", thermal(p, LOADER_STOPS));
  if (loaded && el >= minTime) { clearInterval(ldTimer); finishLoad(); }
}, 30);

function finishLoad() {
  ldNum.textContent = "95";
  root.classList.add("loaded");
  document.body.classList.remove("is-loading");
  const burst = () => {
    if (!field || reduced) return;
    /* opening burst of heat from below */
    const m = isMobile();
    for (let i = 0; i < 7; i++) field.splat(0.1 + i * 0.13, 0.02, (Math.random() - 0.5) * 300, (m ? 500 : 900) + Math.random() * 500, m ? 0.45 : 0.7, m ? 0.0012 : 0.004);
  };
  const revealHero = () => {
    $(".h-name").classList.add("is-in");
    $$("#hero .reveal-up").forEach((el, i) => { el.style.transitionDelay = (0.5 + i * 0.08) + "s"; el.classList.add("is-in"); });
    if (sfx && soundOn) sfx.swell();
  };
  if (reduced || !hasGsap) {
    loader.style.transition = "opacity .3s"; loader.style.opacity = "0";
    setTimeout(() => { loader.style.display = "none"; }, 350);
    revealHero();
  } else {
    /* handoff: the reading lifts away, the bar floods into a hot sheet,
       the sheet sweeps up and the heat it carries is poured into the field */
    const sheet = $(".ld-sheet"), bar = $(".ld-bar");
    const br = bar.getBoundingClientRect();
    gsap.timeline({ onComplete: () => { loader.style.display = "none"; } })
      .to(".ld-top, .ld-scale", { opacity: 0, duration: 0.3, ease: "power2.out" }, 0)
      .to(".ld-temp", { yPercent: -18, opacity: 0, filter: "blur(10px)", duration: 0.55, ease: "expo.in" }, 0)
      .set(bar, { opacity: 0 }, 0.3)
      .fromTo(sheet, { clipPath: "inset(" + br.top + "px " + (innerWidth - br.right) + "px " + (innerHeight - br.bottom) + "px " + br.left + "px round 3px)" },
        { clipPath: "inset(0px 0px 0px 0px round 0px)", duration: 0.6, ease: "expo.inOut" }, 0.28)
      .set(loader, { backgroundColor: "transparent" }, 0.88)
      .add(burst, 0.9)
      .to(sheet, { clipPath: "inset(0px 0px 100% 0px round 0px)", duration: 0.95, ease: "expo.inOut" }, 0.9)
      .add(revealHero, 1.05);
  }
  setupMotion();
  if (field) setTimeout(() => probe.begin(), reduced ? 0 : 1200);
  if (lenis && !REC) lenis.start();
  if (hasGsap) ScrollTrigger.refresh();
  if (!REC && location.hash && $(location.hash)) setTimeout(() => scrollToTarget(location.hash, true), 100);
}

/* printing: settle every counter and label to its final text first */
addEventListener("beforeprint", () => {
  $$("[data-t]").forEach(el => {
    if (el.classList.contains("split-words") || el.classList.contains("split-chars") || el.closest("#sound")) return;
    const v = t(el.getAttribute("data-t")); if (v != null && el.children.length === 0) el.textContent = v;
  });
  $$("#facts b").forEach(b => { b.textContent = (b.dataset.pre || "") + b.dataset.n; });
  const lab = $("#fc-lab"); if (lab) lab.textContent = t(coolDown > 0.97 ? "coolDone" : "coolDown");
});

/* start in recruiter mode when the URL or the saved choice asks for it */
if (REC) { REC = false; setRec(true, { instant: true, boot: true }); }

/* dev hook */
window.__flow = { get field() { return field; }, lenis, sfx, get quality() { return tier ? TIERS[tier].name : "static"; }, get tier() { return tier; }, stepDown,
  get fxLite() { return root.classList.contains("fx-lite"); }, get lang() { return LANG; }, get horizontal() { return isH; },
  get recruiter() { return REC; }, setRec, get gl() { return !!field; },
  get sound() { return soundOn; }, get cool() { return coolDown; }, get section() { return curSection; }, get skew() { return skewNow; },
  scrollToTarget, switchLang, setSound, thermalJump, openMenu, closeMenu, _skewSet: skewSet, scramble };
})();
