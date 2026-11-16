import React, { useState, useEffect, useRef, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { PDFDocument } from "pdf-lib";
import {
  LuTarget, LuAtom, LuCompass, LuRocket, LuLayers, LuBriefcase, LuGraduationCap, LuPuzzle, LuHeartHandshake, LuShieldCheck,
  LuGlobe, LuBrain, LuLightbulb, LuMessagesSquare, LuHandshake, LuChartColumn, LuCpu, LuBookOpen, LuFlaskConical, LuTelescope,
  LuBot, LuGamepad2, LuCircleHelp, LuClipboardCheck, LuSearch, LuNotebookPen, LuFileText, LuPresentation, LuWrench, LuFolderKanban,
  LuMonitorPlay, LuLibrary, LuHand, LuUsers, LuEye, LuMapPinned, LuChevronDown, LuChevronLeft, LuChevronRight, LuCheck, LuX,
  LuRotateCcw, LuCopy, LuArrowRight, LuSparkles, LuFlag, LuOrbit, LuWandSparkles, LuAward, LuInfo, LuZap, LuNetwork,
} from "react-icons/lu";
import {
  META, MENGENAI, PRINSIP, REKA_BENTUK, KOMPONEN, BIDANG, KLUSTER, DOMAIN, PENYAMPAIAN, PENTAKSIRAN, SOALAN_LAZIM, GLOSARI,
  SINGKATAN, RUJUKAN, PENGHARGAAN, SEKALUNG_BUDI, KUIZ,
} from "./data.js";

const IKON = {
  target: LuTarget, atom: LuAtom, compass: LuCompass, rocket: LuRocket, layers: LuLayers, briefcase: LuBriefcase, cap: LuGraduationCap,
  puzzle: LuPuzzle, heart: LuHeartHandshake, shield: LuShieldCheck, globe: LuGlobe, brain: LuBrain, bulb: LuLightbulb, chat: LuMessagesSquare,
  handshake: LuHandshake, chart: LuChartColumn, cpu: LuCpu, book: LuBookOpen, flask: LuFlaskConical, telescope: LuTelescope, bot: LuBot,
  gamepad: LuGamepad2, help: LuCircleHelp, clipcheck: LuClipboardCheck, search: LuSearch, notebook: LuNotebookPen, file: LuFileText,
  present: LuPresentation, wrench: LuWrench, kanban: LuFolderKanban, monitor: LuMonitorPlay, library: LuLibrary, hand: LuHand, users: LuUsers,
  eye: LuEye, map: LuMapPinned, orbit: LuOrbit, wand: LuWandSparkles, award: LuAward, sparkles: LuSparkles,
};
const Ikon = ({ n, size = 20 }) => { const C = IKON[n] || LuSparkles; return <C size={size} aria-hidden="true" />; };

const NEON = "var(--color-neon)", HIJAU = "var(--color-kluster)", BIRU = "#6ea2ff";
const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const SEMUA_ELEMEN = DOMAIN.flatMap((d, di) => d.elemen.map((e, ei) => ({ ...e, domain: d, di, ei })));
const JUMLAH_FOKUS = KLUSTER.reduce((n, k) => n + k.fokus.length, 0);

/* ---------- pages + routing (one view per hash name) ---------- */
// [id, label menu, tajuk kad, huraian, ikon, warna]
const LAMAN = [
  ["utama", "Utama", "Utama", "", "sparkles", NEON],
  ["mengenai", "Mengenai", "Mengenai KKL", "Pengenalan, tujuan, matlamat, objektif dan kesimpulan.", "book", BIRU],
  ["kerangka", "Kerangka", "Reka Bentuk Kerangka", "Rajah separa bulatan interaktif dan lima lapisan struktur.", "orbit", NEON],
  ["domain", "Domain", "Domain dan Elemen", "3 domain dan 8 elemen pembelajaran secara terperinci.", "layers", "var(--color-hidup)"],
  ["kluster", "Kluster", "Kluster Latihan", "4 kluster latihan dan 30 bidang fokus.", "briefcase", HIJAU],
  ["kaedah", "Kaedah", "Kaedah Penyampaian dan Pentaksiran", "20 kaedah penyampaian dan 14 kaedah pentaksiran.", "present", "var(--color-belajar)"],
  ["perancang", "Perancang", "Simulasi Perancang Latihan", "Susun modul latihan mengikut KKL dan jana kad ringkasan PDF.", "wand", "var(--color-belajar)"],
  ["kuiz", "Kuiz", "Kuiz Pemahaman dan eSijil", "20 soalan. Jawab 15 dengan betul untuk mendapat eSijil PDF.", "award", HIJAU],
  ["soalan-lazim", "Soalan Lazim", "Soalan Lazim dan Glosari", "11 soalan lazim, glosari boleh dicari dan singkatan.", "help", NEON],
  ["lampiran", "Lampiran", "Lampiran", "Rujukan, penghargaan dan sekalung budi.", "library", BIRU],
];
const bacaLaman = () => { let h = ""; try { h = decodeURIComponent(location.hash.replace(/^#/, "")); } catch (e) {} return LAMAN.some((l) => l[0] === h) ? h : "utama"; };
let setLamanLuar = null;
const keAtas = () => { try { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); } catch (e) { window.scrollTo(0, 0); } };
function pergi(id) {
  if (setLamanLuar) setLamanLuar(id);
  try { if (location.hash !== "#" + id) location.hash = id; } catch (e) {}
  keAtas();
}
function Pautan({ ke, className = "", children, ...rest }) {
  return <a href={"#" + ke} className={className} onClick={(e) => { e.preventDefault(); pergi(ke); }} {...rest}>{children}</a>;
}
// State that must survive moving between pages (quiz progress, planner choices).
const STOR = {};
function useKekal(kunci, awal) {
  const [v, setV] = useState(() => (kunci in STOR ? STOR[kunci] : awal));
  const set = (x) => setV((lama) => { const baru = typeof x === "function" ? x(lama) : x; STOR[kunci] = baru; return baru; });
  return [v, set];
}

/* ---------- helpers ---------- */
function Reveal({ children, className = "", delay = 0, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || !("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.95) return; // already on screen: stay at rest
    el.classList.add("rv-wait");
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { el.style.transitionDelay = delay + "ms"; el.classList.remove("rv-wait"); io.disconnect(); }
    }, { threshold: 0.06 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={"rv " + className} {...rest}>{children}</div>;
}

function Tilt({ children, className = "", max = 5, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || matchMedia("(hover: none)").matches) return;
    const mv = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateY(-3px)`;
      el.style.setProperty("--mx", (x + 0.5) * 100 + "%"); el.style.setProperty("--my", (y + 0.5) * 100 + "%");
    };
    const lv = () => { el.style.transform = ""; };
    el.addEventListener("pointermove", mv); el.addEventListener("pointerleave", lv);
    return () => { el.removeEventListener("pointermove", mv); el.removeEventListener("pointerleave", lv); };
  }, []);
  return <div ref={ref} className={"tilt " + className} {...rest}>{children}</div>;
}

function Counter({ to }) {
  const [n, setN] = useState(to);
  const ref = useRef(null);
  useEffect(() => {
    if (reduced() || !("IntersectionObserver" in window)) return;
    let raf;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t) => { const p = Math.min(1, (t - t0) / 1200); setN(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    });
    io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref} className="tabular-nums">{n}</span>;
}

function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext("2d");
    let w = 0, h = 0, raf = 0, pts = [];
    const still = reduced();
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.max(24, Math.min(70, Math.round((w * h) / 26000)));
      pts = Array.from({ length: n }, (_, i) => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22, r: Math.random() * 1.5 + 0.6, c: i % 5 === 0 ? "255,159,28" : i % 3 === 0 ? "110,162,255" : "0,240,255" }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (!still) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fillStyle = `rgba(${p.c},0.75)`; ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy;
          if (d2 < 19600) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.strokeStyle = `rgba(110,162,255,${(0.16 * (1 - d2 / 19600)).toFixed(3)})`; ctx.lineWidth = 1; ctx.stroke(); }
        }
      }
      if (!still && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const vis = () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(draw); };
    const rs = () => { size(); cancelAnimationFrame(raf); draw(); };
    size(); draw();
    window.addEventListener("resize", rs); document.addEventListener("visibilitychange", vis);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", rs); document.removeEventListener("visibilitychange", vis); };
  }, []);
  return <canvas ref={ref} className="particles" aria-hidden="true" />;
}

function Section({ id, eyebrow, title, lead, color = NEON, children }) {
  return (
    <section id={id} className="relative mx-auto max-w-[1180px] px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14" style={{ "--c": color }}>
      <Reveal className="mb-8 sm:mb-10">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="h2 mt-3">{title}</h1>
        {lead && <p className="lead mt-3">{lead}</p>}
      </Reveal>
      {children}
    </section>
  );
}

/* ---------- Nav ---------- */
function Nav({ laman }) {
  const ref = useRef(null);
  useEffect(() => {
    const box = ref.current, el = box && box.querySelector(".on");
    if (el) box.scrollLeft = el.offsetLeft - box.clientWidth / 2 + el.clientWidth / 2;
  }, [laman]);
  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-space/75 backdrop-blur-xl" aria-label="Navigasi utama">
      <div className="mx-auto flex max-w-[1180px] items-center gap-3 px-4 py-2.5 sm:px-6">
        <Pautan ke="utama" className="flex flex-none items-center gap-2.5" aria-label="KKL PPP KPM, ke laman utama">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-neon/50 bg-neon/10 font-display text-sm font-bold text-neon shadow-[0_0_22px_-6px_var(--color-neon)]">KKL</span>
          <span className="hidden font-display text-sm font-semibold tracking-wide text-ink xl:block">PPP <span className="text-dim">·</span> KPM</span>
        </Pautan>
        <div ref={ref} className="noscroll relative -mr-4 flex flex-1 items-center gap-0.5 overflow-x-auto pr-4 sm:mr-0 sm:pr-0 lg:justify-end">
          {LAMAN.map(([id, label]) => <Pautan key={id} ke={id} className={"nav-link" + (laman === id ? " on" : "")} aria-current={laman === id ? "page" : undefined}>{label}</Pautan>)}
        </div>
      </div>
    </nav>
  );
}
function NavLaman({ laman }) {
  const i = LAMAN.findIndex((l) => l[0] === laman), sblm = LAMAN[i - 1], slps = LAMAN[i + 1];
  return (
    <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 pb-14 sm:px-6">
      {sblm ? <Pautan ke={sblm[0]} className="btn" style={{ "--c": "var(--color-dim)" }}><LuChevronLeft size={17} aria-hidden="true" />{sblm[2]}</Pautan> : <span />}
      {slps && <Pautan ke={slps[0]} className="btn btn-solid" style={{ "--c": NEON }}>Seterusnya: {slps[2]}<LuArrowRight size={17} aria-hidden="true" /></Pautan>}
    </div>
  );
}
function Jelajah() {
  return (
    <section className="mx-auto max-w-[1180px] px-4 pb-12 pt-4 sm:px-6" aria-labelledby="jelajah-tajuk">
      <Reveal><div className="eyebrow" style={{ "--c": NEON }}>Sembilan laman</div><h2 id="jelajah-tajuk" className="mt-3 font-display text-[1.7rem] font-bold">Terokai laman web KKL</h2></Reveal>
      <Reveal className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LAMAN.slice(1).map(([id, , tajuk, huraian, ik, c], i) => (
          <Pautan key={id} ke={id} className="glass glow block p-5" style={{ "--c": c }}>
            <div className="flex items-center gap-3"><span className="a-icon"><Ikon n={ik} /></span>
              <div className="min-w-0 flex-1"><span className="font-display text-xs font-semibold text-dim tabular-nums">0{i + 1}</span><h3 className="font-display text-lg font-semibold leading-tight">{tajuk}</h3></div>
              <LuArrowRight size={18} className="flex-none a-text" aria-hidden="true" /></div>
            <p className="mt-3 text-sm text-mist">{huraian}</p>
          </Pautan>
        ))}
      </Reveal>
    </section>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  const [p, setP] = useState(0);
  const angka = [[KOMPONEN.length, "Komponen Latihan"], [BIDANG.length, "Bidang Latihan"], [KLUSTER.length, "Kluster Latihan"], [JUMLAH_FOKUS, "Bidang Fokus"], [DOMAIN.length, "Domain Pembelajaran"], [SEMUA_ELEMEN.length, "Elemen Pembelajaran"]];
  return (
    <header id="utama" className="relative mx-auto max-w-[1180px] px-4 pb-10 pt-10 sm:px-6 sm:pt-16">
      <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.9fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-neon/40 bg-neon/10 px-3.5 py-1.5 text-[0.8rem] font-semibold text-neon">
            <span className="a-dot pulse-dot" />{META.lencana}
          </div>
          <h1 className="mt-5 font-display text-[clamp(2.1rem,5.4vw,4rem)] font-bold leading-[1.04]">
            <span className="bg-gradient-to-r from-white via-[#bfe9ff] to-neon bg-clip-text text-transparent">Kerangka Kurikulum Latihan</span>
            <span className="mt-2 block text-[0.52em] font-semibold leading-tight text-mist">(KKL) Pegawai Perkhidmatan Pendidikan</span>
          </h1>
          <p className="mt-5 max-w-[60ch] text-[1.02rem] text-mist">{META.subtajuk}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Pautan ke="kerangka" className="btn btn-solid" style={{ "--c": NEON }}><LuOrbit size={18} aria-hidden="true" />Terokai kerangka</Pautan>
            <Pautan ke="perancang" className="btn" style={{ "--c": "var(--color-belajar)" }}><LuWandSparkles size={18} aria-hidden="true" />Rancang latihan</Pautan>
            <Pautan ke="kuiz" className="btn" style={{ "--c": HIJAU }}><LuAward size={18} aria-hidden="true" />Kuiz dan eSijil</Pautan>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="float">
            <Tilt className="glass glow p-5 sm:p-6" style={{ "--c": NEON }}>
              <div className="flex items-center gap-3"><span className="a-icon"><LuEye size={20} aria-hidden="true" /></span><h2 className="font-display text-lg font-semibold tracking-[0.18em] text-neon">VISI</h2></div>
              <p className="mt-3 font-display text-[1.18rem] font-semibold leading-snug">{META.visi}</p>
            </Tilt>
          </div>
          <div className="float-2 lg:ml-8">
            <Tilt className="glass glow p-5 sm:p-6" style={{ "--c": "var(--color-belajar)" }}>
              <div className="flex items-center gap-3"><span className="a-icon"><LuFlag size={20} aria-hidden="true" /></span><h2 className="font-display text-lg font-semibold tracking-[0.18em] a-text">MISI</h2></div>
              <p className="mt-3 text-[1.02rem] leading-relaxed text-ink">{META.misi}</p>
            </Tilt>
          </div>
        </div>
      </div>

      <div className="glass mt-10 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h2 className="font-display text-base font-semibold tracking-wide">Lima Prinsip Kurikulum Latihan</h2>
          <span className="text-sm text-dim">Tuding atau ketik untuk huraian</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {PRINSIP.map((x, i) => (
            <button key={x.nama} type="button" className={"chip" + (p === i ? " on" : "")} aria-pressed={p === i}
              onMouseEnter={() => setP(i)} onFocus={() => setP(i)} onClick={() => setP(i)} title={x.huraian}>
              <Ikon n={x.ikon} size={16} />{x.nama}
            </button>
          ))}
        </div>
        <p key={p} className="swap mt-4 border-l-2 border-neon pl-4 text-mist" aria-live="polite">
          <strong className="text-ink">{PRINSIP[p].nama}.</strong> {PRINSIP[p].huraian}
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {angka.map(([n, label]) => (
          <div key={label} className="glass px-4 py-4 text-center">
            <dd className="font-display text-4xl font-bold text-neon [text-shadow:0_0_22px_rgba(0,240,255,.55)]"><Counter to={n} /></dd>
            <dt className="mt-1 text-[0.82rem] font-medium text-mist">{label}</dt>
          </div>
        ))}
      </dl>
    </header>
  );
}

/* ---------- Mengenai ---------- */
function Mengenai() {
  const [t, setT] = useState(0);
  const tab = ["Pengenalan", "Tujuan", "Matlamat dan Objektif", "Kesimpulan"];
  return (
    <Section id="mengenai" eyebrow="Mengenai KKL" title="Asas pembangunan profesionalisme PPP" color={BIRU}>
      <Reveal className="glass p-5 sm:p-8">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Mengenai KKL">
          {tab.map((x, i) => <button key={x} type="button" role="tab" aria-selected={t === i} className={"chip" + (t === i ? " on" : "")} onClick={() => setT(i)}>{x}</button>)}
        </div>
        <div key={t} className="swap mt-6 max-w-[72ch] space-y-4 text-[1.02rem] text-mist" role="tabpanel">
          {t === 0 && <p>{MENGENAI.pengenalan}</p>}
          {t === 1 && MENGENAI.tujuan.map((x, i) => <p key={i}>{x}</p>)}
          {t === 2 && (<>
            <p className="font-display text-xl font-semibold leading-snug text-ink">{MENGENAI.matlamat}</p>
            <ul className="grid gap-3 pt-2 sm:grid-cols-2">
              {MENGENAI.objektif.map((x, i) => (
                <li key={i} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-ink">
                  <span className="font-display text-lg font-bold a-text">0{i + 1}</span><span>{x}</span>
                </li>
              ))}
            </ul>
          </>)}
          {t === 3 && MENGENAI.kesimpulan.map((x, i) => <p key={i}>{x}</p>)}
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------- Radial visualizer ---------- */
const CX = 500, CY = 520;
const RING = { komponen: [80, 138], bidang: [148, 188], kluster: [196, 300], domain: [308, 372], elemen: [380, 480] };
const rad = (a) => (a * Math.PI) / 180;
const pt = (r, a) => [(CX + r * Math.cos(rad(a))).toFixed(2), (CY - r * Math.sin(rad(a))).toFixed(2)];
function sector([r0, r1], a0, a1) {
  const [x1, y1] = pt(r1, a0), [x2, y2] = pt(r1, a1), [x3, y3] = pt(r0, a1), [x4, y4] = pt(r0, a0);
  return `M${x1},${y1}A${r1},${r1} 0 0 1 ${x2},${y2}L${x3},${y3}A${r0},${r0} 0 0 0 ${x4},${y4}Z`;
}
function arc(r, a0, a1) { const [x1, y1] = pt(r, a0), [x2, y2] = pt(r, a1); return `M${x1},${y1}A${r},${r} 0 0 ${a0 > a1 ? 1 : 0} ${x2},${y2}`; }

const SEGS = (() => {
  const out = [];
  const ka = [[150, 30], [30, -90], [-90, -210]];
  KOMPONEN.forEach((k, i) => out.push({ t: "komponen", id: k.id, nama: k.nama, a0: ka[i][0], a1: ka[i][1], c: NEON, a: "30%", lines: [k.nama.toUpperCase()], fs: 14.5 }));
  BIDANG.forEach((b, i) => out.push({ t: "bidang", id: b.id, nama: b.nama, a0: 180 - 90 * i, a1: 90 - 90 * i, c: BIRU, a: "42%", lines: [b.nama.toUpperCase()], fs: 16 }));
  KLUSTER.forEach((k, i) => out.push({ t: "kluster", id: k.id, nama: k.nama, a0: 180 - 45 * i, a1: 135 - 45 * i, c: HIJAU, a: "34%", lines: k.label, fs: 14.5 }));
  let a = 180;
  DOMAIN.forEach((d) => {
    const span = 22.5 * d.elemen.length;
    out.push({ t: "domain", id: d.id, nama: d.nama, a0: a, a1: a - span, c: d.warna, a: "48%", lines: d.label, fs: 16 });
    d.elemen.forEach((e, j) => out.push({ t: "elemen", id: e.id, nama: e.nama, a0: a - 22.5 * j, a1: a - 22.5 * (j + 1), c: d.warna, a: "26%", lines: e.label, fs: 15 }));
    a -= span;
  });
  return out;
})();
const LAPISAN = [
  { id: "komponen", nama: "Komponen Latihan", c: NEON, senarai: KOMPONEN },
  { id: "bidang", nama: "Bidang Latihan", c: BIRU, senarai: BIDANG },
  { id: "kluster", nama: "Kluster Latihan", c: HIJAU, senarai: KLUSTER },
  { id: "domain", nama: "Domain Pembelajaran", c: "var(--color-hidup)", senarai: DOMAIN },
  { id: "elemen", nama: "Elemen Pembelajaran", c: "var(--color-mmt)", senarai: SEMUA_ELEMEN },
];

function SegLabel({ s }) {
  const mid = (s.a0 + s.a1) / 2, upper = Math.sin(rad(mid)) > -0.01;
  const [r0, r1] = RING[s.t], rm = (r0 + r1) / 2, lh = s.fs * 1.3, n = s.lines.length;
  return s.lines.map((ln, i) => {
    const off = ((n - 1) / 2 - i) * lh;
    const rr = upper ? rm + off - s.fs * 0.35 : rm - off + s.fs * 0.35;
    const id = `lbl-${s.t}-${s.id}-${i}`;
    return (
      <g key={i}>
        <path id={id} d={upper ? arc(rr, s.a0, s.a1) : arc(rr, s.a1, s.a0)} fill="none" />
        <text fontSize={s.fs}><textPath href={"#" + id} startOffset="50%" textAnchor="middle">{ln}</textPath></text>
      </g>
    );
  });
}

function Kerangka({ bukaDomain }) {
  const [sel, setSel] = useState({ t: "teras" });
  const pilih = (t, id) => setSel({ t, id });
  const kunci = (fn) => (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } };

  const info = useMemo(() => {
    const Senarai = ({ t, items, c }) => (
      <div className="mt-4 flex flex-wrap gap-2" style={{ "--c": c }}>
        {items.map((x) => <button key={x.id} type="button" className="chip" onClick={() => pilih(t, x.id)}>{x.nama}<LuChevronRight size={14} aria-hidden="true" /></button>)}
      </div>
    );
    if (sel.t === "teras") return { c: NEON, jenis: "Teras kerangka", tajuk: "Kualiti Kurikulum Latihan", isi: (<>
      <p>{REKA_BENTUK}</p>
      <p className="mt-3 text-sm text-dim">Teras dikelilingi tiga komponen latihan:</p>
      <Senarai t="komponen" items={KOMPONEN} c={NEON} />
    </>) };
    if (sel.t === "lapisan") {
      const L = LAPISAN.find((x) => x.id === sel.id);
      return { c: L.c, jenis: "Lapisan struktur", tajuk: `${L.nama} (${L.senarai.length})`, isi: (<>
        <p>Pilih satu butiran untuk melihat huraiannya.</p><Senarai t={L.id} items={L.senarai} c={L.c} />
      </>) };
    }
    if (sel.t === "komponen") { const k = KOMPONEN.find((x) => x.id === sel.id); return { c: NEON, jenis: "Komponen Latihan", tajuk: k.nama, isi: <p>{k.huraian}</p> }; }
    if (sel.t === "bidang") { const b = BIDANG.find((x) => x.id === sel.id); return { c: BIRU, jenis: "Bidang Latihan", tajuk: b.nama, isi: <ul className="space-y-3">{b.butiran.map((x, i) => <li key={i} className="flex gap-3"><span className="a-dot mt-2" />{x}</li>)}</ul> }; }
    if (sel.t === "kluster") {
      const k = KLUSTER.find((x) => x.id === sel.id);
      return { c: HIJAU, jenis: "Kluster Latihan", tajuk: k.nama, isi: (<>
        <p className="text-sm text-dim">{k.fokus.length} bidang fokus</p>
        <ol className="mt-2 grid gap-x-5 gap-y-1.5 sm:grid-cols-2">{k.fokus.map((f, i) => <li key={f} className="flex gap-2.5 text-[0.95rem]"><span className="font-display font-semibold a-text tabular-nums">{String(i + 1).padStart(2, "0")}</span>{f}</li>)}</ol>
      </>) };
    }
    if (sel.t === "domain") {
      const di = DOMAIN.findIndex((x) => x.id === sel.id), d = DOMAIN[di];
      return { c: d.warna, jenis: "Domain Pembelajaran", tajuk: d.nama, isi: (<>
        <p>{d.huraian}</p><p className="mt-3 text-sm text-dim">{d.elemen.length} elemen pembelajaran:</p><Senarai t="elemen" items={d.elemen} c={d.warna} />
        <button type="button" className="btn mt-5" onClick={() => bukaDomain(di, 0)}>Buka dalam Peneroka Domain<LuArrowRight size={16} aria-hidden="true" /></button>
      </>) };
    }
    const e = SEMUA_ELEMEN.find((x) => x.id === sel.id);
    return { c: e.domain.warna, jenis: `Elemen Pembelajaran · ${e.domain.nama}`, tajuk: e.nama, isi: (<>
      <p>{e.huraian}</p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">{e.sub.map((s) => <li key={s.nama} className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[0.93rem] text-ink"><span className="a-dot" />{s.nama}</li>)}</ul>
      <button type="button" className="btn mt-5" onClick={() => bukaDomain(e.di, e.ei)}>Lihat perincian elemen<LuArrowRight size={16} aria-hidden="true" /></button>
    </>) };
  }, [sel]);

  return (
    <Section id="kerangka" eyebrow="Teras interaktif" title="Reka Bentuk Kerangka Kurikulum Latihan"
      lead="Klik mana-mana segmen rajah untuk melihat huraiannya. Lingkaran penuh di tengah ialah teras kualiti; separa bulatan memaparkan bidang, kluster, domain dan elemen pembelajaran.">
      <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Reveal className="glass p-3 sm:p-5">
          <svg className="kkl-svg" viewBox="0 0 1000 672" role="group" aria-label="Rajah separa bulatan Kerangka Kurikulum Latihan">
            <defs>
              <radialGradient id="g-core" cx="50%" cy="38%" r="70%"><stop offset="0%" stopColor="#3f7bff" /><stop offset="60%" stopColor="#1736b8" /><stop offset="100%" stopColor="#0a1650" /></radialGradient>
              <linearGradient id="g-base" x1="0" x2="1"><stop offset="0%" stopColor="#00f0ff" stopOpacity="0" /><stop offset="18%" stopColor="#00f0ff" /><stop offset="82%" stopColor="#2b5bff" /><stop offset="100%" stopColor="#2b5bff" stopOpacity="0" /></linearGradient>
            </defs>
            <line x1="6" y1={CY} x2="994" y2={CY} stroke="url(#g-base)" strokeWidth="5" strokeLinecap="round" />
            {SEGS.filter((s) => s.t !== "komponen").map((s) => {
              const on = sel.t === s.t && sel.id === s.id, ring = sel.t === "lapisan" && sel.id === s.t;
              return (
                <g key={s.t + s.id} className={"seg" + (on ? " on" : "") + (ring ? " ring" : "")} style={{ "--c": s.c, "--a": s.a }} role="button" tabIndex={0}
                  aria-label={`${s.nama} (${LAPISAN.find((l) => l.id === s.t).nama})`} aria-pressed={on} onClick={() => pilih(s.t, s.id)} onKeyDown={kunci(() => pilih(s.t, s.id))}>
                  <path className="shape" d={sector(RING[s.t], s.a0, s.a1)} /><SegLabel s={s} />
                </g>
              );
            })}
            {Array.from({ length: 9 }, (_, i) => { const [x, y] = pt(480, i * 22.5); return <circle key={i} className="node" cx={x} cy={y} r="4.5" fill="#fff" style={{ animationDelay: i * 0.22 + "s", filter: "drop-shadow(0 0 6px #00f0ff)" }} />; })}
            <circle cx={CX} cy={CY} r="142" fill="var(--color-space)" />
            <circle className="halo" cx={CX} cy={CY} r="138" fill="none" stroke="#00f0ff" strokeWidth="2" />
            {SEGS.filter((s) => s.t === "komponen").map((s) => {
              const on = sel.t === s.t && sel.id === s.id, ring = sel.t === "lapisan" && sel.id === s.t;
              return (
                <g key={s.id} className={"seg" + (on ? " on" : "") + (ring ? " ring" : "")} style={{ "--c": s.c, "--a": s.a }} role="button" tabIndex={0}
                  aria-label={`${s.nama} (Komponen Latihan)`} aria-pressed={on} onClick={() => pilih(s.t, s.id)} onKeyDown={kunci(() => pilih(s.t, s.id))}>
                  <path className="shape" d={sector(RING.komponen, s.a0, s.a1)} /><SegLabel s={s} />
                </g>
              );
            })}
            <circle className="orbit" cx={CX} cy={CY} r="143" fill="none" stroke="#00f0ff" strokeOpacity="0.75" strokeWidth="1.6" strokeDasharray="3 13" />
            <circle className="orbit rev" cx={CX} cy={CY} r="75" fill="none" stroke="#9fd8ff" strokeOpacity="0.8" strokeWidth="1.4" strokeDasharray="14 8" />
            <g className={"core-disc" + (sel.t === "teras" ? " on" : "")} role="button" tabIndex={0} aria-label="Kualiti Kurikulum Latihan (teras kerangka)" aria-pressed={sel.t === "teras"}
              onClick={() => setSel({ t: "teras" })} onKeyDown={kunci(() => setSel({ t: "teras" }))}>
              <circle className="body" cx={CX} cy={CY} r="68" fill="url(#g-core)" stroke="#00f0ff" strokeWidth="2" />
              <text textAnchor="middle" fill="#fff" fontWeight="700" fontSize="17" letterSpacing="1.5"><tspan x={CX} y={CY - 14}>KUALITI</tspan><tspan x={CX} y={CY + 6} fontSize="13.5">KURIKULUM</tspan><tspan x={CX} y={CY + 24} fontSize="13.5">LATIHAN</tspan></text>
            </g>
          </svg>
          <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-white/10 px-1 pt-4">
            <span className="mr-1 text-sm font-semibold text-dim">Lapisan:</span>
            {LAPISAN.map((l) => <button key={l.id} type="button" style={{ "--c": l.c }} className={"chip" + (sel.t === "lapisan" && sel.id === l.id ? " on" : "")} onClick={() => setSel({ t: "lapisan", id: l.id })}>{l.nama}</button>)}
          </div>
        </Reveal>

        <Reveal delay={120} className="lg:sticky lg:top-24">
          <div key={sel.t + (sel.id || "")} className="glass swap p-6 sm:p-7" style={{ "--c": info.c, borderColor: `color-mix(in srgb, ${info.c} 45%, transparent)`, boxShadow: `0 0 46px -18px ${info.c}` }} aria-live="polite">
            <div className="eyebrow">{info.jenis}</div>
            <h3 className="mt-3 text-2xl font-bold leading-tight sm:text-[1.7rem]">{info.tajuk}</h3>
            <div className="mt-4 text-[0.98rem] text-mist">{info.isi}</div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------- Domain explorer ---------- */
function Peneroka({ di, ei, setDi, setEi }) {
  const d = DOMAIN[di], e = d.elemen[Math.min(ei, d.elemen.length - 1)];
  return (
    <Section id="domain" eyebrow="Peneroka mendalam" title="3 Domain dan 8 Elemen Pembelajaran" color={d.warna}
      lead="Pilih domain, kemudian elemen, untuk melihat empat bahagian dan dua belas kemahiran di bawahnya.">
      <Reveal className="grid gap-3 md:grid-cols-3" role="tablist" aria-label="Domain pembelajaran">
        {DOMAIN.map((x, i) => (
          <button key={x.id} type="button" role="tab" aria-selected={di === i} onClick={() => { setDi(i); setEi(0); }} style={{ "--c": x.warna }}
            className={"glass glow p-5 text-left" + (di === i ? " on" : "")}>
            <div className="flex items-center justify-between gap-3">
              <span className="font-display text-sm font-semibold tracking-[0.18em] a-text">DOMAIN {i + 1}</span>
              <span className="rounded-full border px-2.5 py-0.5 text-xs font-semibold a-border a-text">{x.elemen.length} elemen</span>
            </div>
            <h3 className="mt-2 text-xl font-bold leading-tight">{x.nama}</h3>
            <p className="mt-2 text-sm text-mist">{x.huraian}</p>
          </button>
        ))}
      </Reveal>

      <Reveal className="glass mt-4 p-5 sm:p-7" style={{ borderColor: `color-mix(in srgb, ${d.warna} 35%, transparent)` }}>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={"Elemen dalam " + d.nama}>
          {d.elemen.map((x, i) => <button key={x.id} type="button" role="tab" aria-selected={x.id === e.id} className={"chip" + (x.id === e.id ? " on" : "")} onClick={() => setEi(i)}><Ikon n={x.ikon} size={16} />{x.nama}</button>)}
        </div>
        <div key={e.id} className="swap" role="tabpanel">
          <div className="mt-6 flex items-start gap-4">
            <span className="a-icon"><Ikon n={e.ikon} size={22} /></span>
            <div><h3 className="text-2xl font-bold">{e.nama}</h3><p className="mt-1 text-mist">{e.huraian}</p></div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {e.sub.map((s, i) => (
              <Tilt key={s.nama} max={3} className="glass glow p-5">
                <div className="flex items-center gap-3"><span className="font-display text-sm font-bold a-text">0{i + 1}</span><h4 className="text-lg font-semibold leading-tight">{s.nama}</h4></div>
                <dl className="mt-3 space-y-3">
                  {s.item.map(([n, h]) => (
                    <div key={n} className="border-l-2 pl-3 a-border"><dt className="text-[0.95rem] font-semibold text-ink">{n}</dt><dd className="text-[0.9rem] text-mist">{h}</dd></div>
                  ))}
                </dl>
              </Tilt>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------- Kluster ---------- */
function Kluster() {
  const [f, setF] = useState("semua");
  const [q, setQ] = useState("");
  const semua = useMemo(() => KLUSTER.flatMap((k) => k.fokus.map((nama, i) => ({ nama, no: i + 1, k }))), []);
  const tapis = semua.filter((x) => (f === "semua" || x.k.id === f) && x.nama.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Section id="kluster" eyebrow="Kluster latihan" title="4 Kluster Latihan dan 30 Bidang Fokus" color={HIJAU}
      lead="Tapis mengikut kluster atau cari bidang fokus. Sumber: Pembangunan Profesionalisme Berterusan (PPB) Berstruktur (2023).">
      <Reveal className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {KLUSTER.map((k) => (
          <button key={k.id} type="button" aria-pressed={f === k.id} onClick={() => setF(f === k.id ? "semua" : k.id)} className={"glass glow flex items-center gap-3 p-4 text-left" + (f === k.id ? " on" : "")}>
            <span className="a-icon"><Ikon n={k.ikon} /></span>
            <span><span className="block font-display font-semibold leading-tight">{k.nama}</span><span className="text-sm text-mist">{k.fokus.length} bidang fokus</span></span>
          </button>
        ))}
      </Reveal>
      <Reveal className="glass mt-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <LuSearch size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dim" aria-hidden="true" />
            <label htmlFor="cari-fokus" className="sr-only">Cari bidang fokus</label>
            <input id="cari-fokus" type="search" className="field" placeholder="Cari bidang fokus, contoh: pentaksiran" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button type="button" className={"chip" + (f === "semua" ? " on" : "")} onClick={() => setF("semua")}>Semua kluster</button>
          <span className="text-sm text-dim tabular-nums" aria-live="polite">{tapis.length} daripada {semua.length} bidang fokus</span>
        </div>
        <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {tapis.map((x) => (
            <li key={x.k.id + x.nama} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3.5 transition hover:border-kluster/60 hover:bg-kluster/10">
              <span className="font-display text-lg font-bold leading-none text-kluster tabular-nums">{String(x.no).padStart(2, "0")}</span>
              <span><span className="block text-[0.97rem] font-semibold leading-snug">{x.nama}</span><span className="text-xs text-dim">{x.k.nama}</span></span>
            </li>
          ))}
        </ul>
        {tapis.length === 0 && <p className="mt-5 text-mist">Tiada bidang fokus sepadan dengan “{q}”. Cuba kata kunci lain atau pilih “Semua kluster”.</p>}
      </Reveal>
    </Section>
  );
}

/* ---------- Kaedah ---------- */
function Kaedah() {
  const [i, setI] = useState(0);
  const n = PENYAMPAIAN.length, k = PENYAMPAIAN[i];
  const jumlah = PENYAMPAIAN.reduce((s, x) => s + x.kaedah.length, 0);
  return (
    <Section id="kaedah" eyebrow="Penyampaian dan pentaksiran" title="Kaedah Penyampaian dan Kaedah Pentaksiran" color="var(--color-belajar)"
      lead={`Tujuh kategori dengan ${jumlah} kaedah penyampaian, dan ${PENTAKSIRAN.length} kaedah pentaksiran.`}>
      <Reveal className="glass p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-bold">7 Kategori Kaedah Penyampaian</h3>
          <div className="flex items-center gap-2">
            <button type="button" className="btn p-2.5!" aria-label="Kategori sebelumnya" onClick={() => setI((i + n - 1) % n)}><LuChevronLeft size={18} aria-hidden="true" /></button>
            <span className="min-w-[3.2rem] text-center font-display font-semibold tabular-nums text-mist">{i + 1} / {n}</span>
            <button type="button" className="btn p-2.5!" aria-label="Kategori seterusnya" onClick={() => setI((i + 1) % n)}><LuChevronRight size={18} aria-hidden="true" /></button>
          </div>
        </div>
        <div className="noscroll -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Kategori kaedah penyampaian">
          {PENYAMPAIAN.map((x, j) => <button key={x.kategori} type="button" role="tab" aria-selected={i === j} className={"chip flex-none" + (i === j ? " on" : "")} onClick={() => setI(j)}><Ikon n={x.ikon} size={16} />{x.kategori}</button>)}
        </div>
        <div key={i} className="swap mt-6" role="tabpanel">
          <div className="flex items-center gap-4">
            <span className="font-display text-5xl font-bold leading-none a-text [text-shadow:0_0_26px_rgba(255,159,28,.55)]">0{i + 1}</span>
            <div><h4 className="text-2xl font-bold leading-tight">{k.kategori}</h4><p className="text-sm text-mist">{k.kaedah.length} kaedah</p></div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {k.kaedah.map(([nama, h]) => (
              <Tilt key={nama} max={3} className="glass glow p-5"><h5 className="font-display text-lg font-semibold">{nama}</h5><p className="mt-1.5 text-[0.95rem] text-mist">{h}</p></Tilt>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-10" style={{ "--c": NEON }}>
        <h3 className="text-xl font-bold">{PENTAKSIRAN.length} Kaedah Pentaksiran</h3>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PENTAKSIRAN.map(([nama, h, ik], j) => (
            <li key={nama} className="glass glow p-4">
              <div className="flex items-center gap-3"><span className="a-icon"><Ikon n={ik} /></span>
                <div><span className="font-display text-xs font-semibold text-dim tabular-nums">{String(j + 1).padStart(2, "0")}</span><h4 className="font-display text-[1.02rem] font-semibold leading-tight">{nama}</h4></div>
              </div>
              <p className="mt-3 text-[0.9rem] text-mist">{h}</p>
            </li>
          ))}
        </ol>
      </Reveal>
    </Section>
  );
}

/* ---------- Kad ringkasan modul (PDF) ---------- */
const WARNA_CETAK = { hidup: "#d93636", belajar: "#d97a06", mmt: "#9a8500" };
function balut(x, teks, maxW) {
  const baris = []; let b = "";
  for (const k of teks.split(" ")) { const u = b ? b + " " + k : k; if (b && x.measureText(u).width > maxW) { baris.push(b); b = k; } else b = u; }
  if (b) baris.push(b);
  return baris;
}
function bucu(x, px, py, w, h, r) {
  x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r); x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath();
}
// Draws the module card on an A4 portrait canvas (1654 x 2339) at scale s; returns where the content ends.
function lukisKad(cv, d, s) {
  const W = 1654, H = 2339, M = 130, f = (n) => Math.round(n * s);
  cv.width = W; cv.height = H;
  const x = cv.getContext("2d");
  const FD = '"Chakra Petch", "Trebuchet MS", "Segoe UI", sans-serif', FB = '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
  x.fillStyle = "#f6f9ff"; x.fillRect(0, 0, W, H);
  x.globalAlpha = 0.16; x.lineWidth = 46;
  [["#ff4d4d", 420], ["#ff9f1c", 350], ["#ffe600", 280], ["#10b981", 210], ["#2b5bff", 140]].forEach(([c, r]) => { x.beginPath(); x.arc(W, 0, r, 0, Math.PI * 2); x.strokeStyle = c; x.stroke(); });
  x.globalAlpha = 1;
  x.lineWidth = 10; x.strokeStyle = "#0b1a4a"; x.strokeRect(44, 44, W - 88, H - 88);
  x.lineWidth = 3; x.strokeStyle = "#00b8d4"; x.strokeRect(66, 66, W - 132, H - 132);
  x.textAlign = "left"; x.textBaseline = "alphabetic";
  let y = 200;
  x.font = `600 30px ${FD}`; x.fillStyle = "#0b1a4a"; x.fillText("KERANGKA KURIKULUM LATIHAN (KKL) PPP KPM", M, y);
  y += 56; x.font = `700 40px ${FD}`; x.fillStyle = "#1d4ed8"; x.fillText("KAD RINGKASAN MODUL LATIHAN", M, y);
  const g = x.createLinearGradient(M, 0, M + 640, 0); g.addColorStop(0, "#00b8d4"); g.addColorStop(1, "rgba(43,91,255,0)");
  y += 26; x.fillStyle = g; x.fillRect(M, y, 640, 5);
  y += f(30);
  x.font = `700 ${f(64)}px ${FD}`; x.fillStyle = "#0b1a4a";
  balut(x, d.tajuk, W - 2 * M - 140).slice(0, 4).forEach((b) => { y += f(78); x.fillText(b, M, y); });
  y += f(14);
  d.maklumat.forEach(([label, nilai]) => {
    y += f(62); x.font = `600 ${f(23)}px ${FB}`; x.fillStyle = "#6b7696"; x.fillText(label.toUpperCase(), M, y);
    x.font = `600 ${f(35)}px ${FB}`; x.fillStyle = "#16224d";
    balut(x, nilai, W - 2 * M).forEach((b) => { y += f(46); x.fillText(b, M, y); });
  });
  const seksyen = (tajuk, sub, warna, item) => {
    y += f(96);
    x.fillStyle = warna; x.fillRect(M, y - f(34), 10, f(44));
    x.font = `700 ${f(36)}px ${FD}`; x.fillStyle = "#0b1a4a"; x.fillText(tajuk, M + 30, y);
    const tw = x.measureText(tajuk).width;
    x.font = `500 ${f(25)}px ${FB}`; x.fillStyle = "#6b7696"; x.fillText(sub, M + 30 + tw + 22, y);
    y += f(28);
    const pad = f(26), jarak = f(16);
    let cx = M, tinggiBaris = 0;
    item.forEach((it) => {
      x.font = `600 ${f(30)}px ${FB}`; let w = x.measureText(it.t).width;
      if (it.s) { x.font = `500 ${f(22)}px ${FB}`; w = Math.max(w, x.measureText(it.s).width); }
      w = Math.min(w + 2 * pad, W - 2 * M);
      const h = it.s ? f(98) : f(66);
      if (cx + w > W - M && cx > M) { cx = M; y += tinggiBaris + jarak; tinggiBaris = 0; }
      const c = it.c || warna;
      bucu(x, cx, y, w, h, f(18)); x.globalAlpha = 0.11; x.fillStyle = c; x.fill(); x.globalAlpha = 1; x.lineWidth = 2.5; x.strokeStyle = c; x.stroke();
      x.font = `600 ${f(30)}px ${FB}`; x.fillStyle = "#0b1a4a"; x.fillText(it.t, cx + pad, y + f(43), w - 2 * pad);
      if (it.s) { x.font = `500 ${f(22)}px ${FB}`; x.fillStyle = "#44517a"; x.fillText(it.s, cx + pad, y + f(76), w - 2 * pad); }
      cx += w + jarak; tinggiBaris = Math.max(tinggiBaris, h);
    });
    y += tinggiBaris;
  };
  seksyen("KANDUNGAN", "Elemen pembelajaran", "#d93636", d.kandungan);
  seksyen("PENYAMPAIAN", "Kaedah penyampaian", "#d97a06", d.penyampaian);
  seksyen("PENTAKSIRAN", "Kaedah pentaksiran", "#0891b2", d.pentaksiran);
  x.font = `600 30px ${FB}`; x.fillStyle = "#0b1a4a"; x.fillText(`Tarikh dijana: ${d.tarikh}`, M, H - 196);
  x.font = `400 23px ${FB}`; x.fillStyle = "#6b7696";
  x.fillText("Dijana dengan Simulasi Perancang Latihan, laman web KKL PPP KPM.", M, H - 152);
  x.fillText("Kad ini alat perancangan awal dan bukan kelulusan rasmi KPM.", M, H - 118);
  return y;
}
async function janaKadPdf(d) {
  if (document.fonts && document.fonts.load) { try { await Promise.all([document.fonts.load('700 64px "Chakra Petch"'), document.fonts.load('600 30px "Plus Jakarta Sans"')]); } catch (e) {} }
  const cv = document.createElement("canvas");
  let s = 1;
  while (lukisKad(cv, d, s) > 2339 - 250 && s > 0.56) s -= 0.06;
  return { bytes: await binaPdf(cv, [595.28, 841.89], "Kad Ringkasan Modul Latihan KKL"), imej: cv.toDataURL("image/jpeg", 0.88) };
}

/* ---------- Perancang ---------- */
const CONTOH = { tajuk: "Bengkel Pentaksiran Bilik Darjah Berasaskan Data", bidang: "fungsional", kluster: "pdp", fokus: "Pentaksiran", elemen: ["numerasi", "kritis"], sampai: ["Pembelajaran Berasaskan Masalah", "Amali"], taksir: ["Projek", "Pembentangan"] };
function Langkah({ no, tajuk, nota, children }) {
  return (
    <div role="group" aria-labelledby={"langkah-" + no} className="border-t border-white/10 pt-5 first:border-0 first:pt-0">
      <h3 id={"langkah-" + no} className="mb-3 flex flex-wrap items-baseline gap-x-3">
        <span className="font-display text-sm font-bold text-belajar">LANGKAH {no}</span><span className="font-display text-lg font-semibold">{tajuk}</span>
        {nota && <span className="font-sans text-sm font-normal text-dim">{nota}</span>}
      </h3>
      {children}
    </div>
  );
}
const KOSONG = { tajuk: "", bidang: "", kluster: "", fokus: "", elemen: [], sampai: [], taksir: [] };
function Perancang() {
  const [m, setM] = useKekal("rancang", CONTOH);
  const [dijana, setDijana] = useKekal("rancang-jana", true);
  const [mesej, setMesej] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [imej, setImej] = useState("");
  const set = (patch) => { setM((x) => ({ ...x, ...patch })); setDijana(false); setMesej(""); setImej(""); };
  const togol = (key, v) => set({ [key]: m[key].includes(v) ? m[key].filter((x) => x !== v) : [...m[key], v] });
  const kl = KLUSTER.find((k) => k.id === m.kluster), bd = BIDANG.find((b) => b.id === m.bidang);
  const el = SEMUA_ELEMEN.filter((e) => m.elemen.includes(e.id));
  const semak = [["Bidang latihan", !!bd], ["Kluster latihan", !!kl], ["Sekurang-kurangnya satu elemen pembelajaran", el.length > 0], ["Kaedah penyampaian", m.sampai.length > 0], ["Kaedah pentaksiran", m.taksir.length > 0]];
  const siap = semak.filter((s) => s[1]).length, lengkap = siap === semak.length;
  const teks = [
    `MODUL LATIHAN: ${m.tajuk || "(tanpa tajuk)"}`,
    `Bidang Latihan: ${bd ? bd.nama : "-"}`,
    `Kluster Latihan: ${kl ? kl.nama : "-"}${m.fokus ? " | Bidang fokus: " + m.fokus : ""}`,
    `KANDUNGAN (elemen pembelajaran): ${el.map((e) => `${e.nama} [${e.domain.nama}]`).join("; ") || "-"}`,
    `PENYAMPAIAN: ${m.sampai.join("; ") || "-"}`,
    `PENTAKSIRAN: ${m.taksir.join("; ") || "-"}`,
    "Dijana dengan Simulasi Perancang Latihan KKL PPP KPM.",
  ].join("\n");
  const salin = () => {
    try { navigator.clipboard.writeText(teks).then(() => setMesej("Ringkasan disalin."), () => setMesej("Tidak dapat menyalin secara automatik. Pilih dan salin teks ringkasan di bawah kad.")); }
    catch (e) { setMesej("Tidak dapat menyalin secara automatik. Pilih dan salin teks ringkasan di bawah kad."); }
  };
  const jana = async () => {
    setDijana(true); setSibuk(true); setImej(""); setMesej("Menyediakan kad PDF…");
    try {
      const tajuk = kemasNama(m.tajuk) || "Modul latihan tanpa tajuk";
      const hasil = await janaKadPdf({
        tajuk, tarikh: tarikhHariIni(),
        maklumat: [["Bidang Latihan", bd.nama], ["Kluster Latihan", kl.nama]].concat(m.fokus ? [["Bidang fokus", m.fokus]] : []),
        kandungan: el.map((e) => ({ t: e.nama, s: e.domain.nama, c: WARNA_CETAK[e.domain.id] })),
        penyampaian: m.sampai.map((t) => ({ t })), pentaksiran: m.taksir.map((t) => ({ t })),
      });
      const slug = tajuk.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "modul";
      const r = await simpanFail(`Kad-Modul-KKL-${slug}.pdf`, hasil.bytes);
      if (r === "tiada") setImej(hasil.imej);
      setMesej({ ok: "Kad PDF dihantar untuk dimuat turun. Semak folder muat turun anda.", batal: MESEJ_SIMPAN.batal, sibuk: MESEJ_SIMPAN.sibuk,
        tiada: "Muat turun PDF tidak tersedia dalam paparan ini. Tekan lama atau klik kanan pada imej kad di bawah untuk menyimpannya." }[r]);
    } catch (e) { setMesej("Kad PDF tidak dapat dijana. Cuba lagi."); }
    setSibuk(false);
  };
  return (
    <Section id="perancang" eyebrow="Alat untuk pembekal latihan" title="Simulasi Perancang Latihan" color="var(--color-belajar)"
      lead="Susun satu modul latihan mengikut KKL: tetapkan bidang, kluster dan elemen pembelajaran, pilih kaedah penyampaian dan pentaksiran, kemudian jana kad ringkasan dalam bentuk PDF. Pilihan awal ialah contoh sahaja.">
      <div className="grid items-start gap-6 lg:grid-cols-[1.25fr_1fr]">
        <Reveal className="glass space-y-5 p-5 sm:p-7">
          <Langkah no="1" tajuk="Tajuk modul" nota="(pilihan)">
            <label htmlFor="tajuk-modul" className="sr-only">Tajuk modul latihan</label>
            <input id="tajuk-modul" type="text" className="field plain" maxLength={90} placeholder="Contoh: Bengkel Kepimpinan Instruksional" value={m.tajuk} onChange={(e) => set({ tajuk: e.target.value })} />
          </Langkah>
          <Langkah no="2" tajuk="Bidang Latihan">
            <div className="grid gap-3 sm:grid-cols-2" style={{ "--c": BIRU }}>
              {BIDANG.map((b) => (
                <button key={b.id} type="button" aria-pressed={m.bidang === b.id} onClick={() => set({ bidang: b.id })} className={"glass glow p-4 text-left" + (m.bidang === b.id ? " on" : "")}>
                  <span className="font-display text-lg font-semibold">{b.nama}</span><span className="mt-1 block text-sm text-mist">{b.butiran[0]}</span>
                </button>
              ))}
            </div>
          </Langkah>
          <Langkah no="3" tajuk="Kluster Latihan dan bidang fokus">
            <div className="flex flex-wrap gap-2" style={{ "--c": HIJAU }}>
              {KLUSTER.map((k) => <button key={k.id} type="button" aria-pressed={m.kluster === k.id} className={"chip" + (m.kluster === k.id ? " on" : "")} onClick={() => set({ kluster: k.id, fokus: "" })}><Ikon n={k.ikon} size={16} />{k.nama}</button>)}
            </div>
            <label htmlFor="bidang-fokus" className="mt-4 block text-sm font-semibold text-mist">Bidang fokus (pilihan)</label>
            <select id="bidang-fokus" className="field plain mt-1.5" value={m.fokus} disabled={!kl} onChange={(e) => set({ fokus: e.target.value })}>
              <option value="">{kl ? "Tiada bidang fokus khusus" : "Pilih kluster dahulu"}</option>
              {kl && kl.fokus.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Langkah>
          <Langkah no="4" tajuk="Elemen Pembelajaran" nota="(sekurang-kurangnya satu)">
            <div className="space-y-3">
              {DOMAIN.map((d) => (
                <div key={d.id} style={{ "--c": d.warna }}>
                  <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-mist"><span className="a-dot" />{d.nama}</div>
                  <div className="flex flex-wrap gap-2">
                    {d.elemen.map((e) => <button key={e.id} type="button" aria-pressed={m.elemen.includes(e.id)} className={"chip" + (m.elemen.includes(e.id) ? " on" : "")} onClick={() => togol("elemen", e.id)}><Ikon n={e.ikon} size={16} />{e.nama}</button>)}
                  </div>
                </div>
              ))}
            </div>
          </Langkah>
          <Langkah no="5" tajuk="Kaedah Penyampaian" nota="(sekurang-kurangnya satu)">
            <div className="space-y-3" style={{ "--c": "var(--color-belajar)" }}>
              {PENYAMPAIAN.map((p) => (
                <div key={p.kategori}>
                  <div className="mb-1.5 text-sm font-semibold text-mist">{p.kategori}</div>
                  <div className="flex flex-wrap gap-2">{p.kaedah.map(([nm]) => <button key={nm} type="button" aria-pressed={m.sampai.includes(nm)} className={"chip" + (m.sampai.includes(nm) ? " on" : "")} onClick={() => togol("sampai", nm)}>{nm}</button>)}</div>
                </div>
              ))}
            </div>
          </Langkah>
          <Langkah no="6" tajuk="Kaedah Pentaksiran" nota="(sekurang-kurangnya satu)">
            <div className="flex flex-wrap gap-2" style={{ "--c": NEON }}>
              {PENTAKSIRAN.map(([nm]) => <button key={nm} type="button" aria-pressed={m.taksir.includes(nm)} className={"chip" + (m.taksir.includes(nm) ? " on" : "")} onClick={() => togol("taksir", nm)}>{nm}</button>)}
            </div>
          </Langkah>
        </Reveal>

        <Reveal delay={120} className="lg:sticky lg:top-24">
          <div className={"glass overflow-hidden" + (dijana ? " shine" : "")} key={dijana ? "jana" : "draf"} style={{ "--c": lengkap ? "var(--color-kluster)" : "var(--color-belajar)", borderColor: "color-mix(in srgb, var(--c) 50%, transparent)" }}>
            <div className="border-b border-white/10 bg-gradient-to-r from-royal/30 via-transparent to-neon/10 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="eyebrow">Kad ringkasan modul</span>
                <span className="rounded-full border px-2.5 py-0.5 text-xs font-bold a-border a-text">{dijana ? (m === CONTOH ? "Contoh" : "Dijana") : "Draf"}</span>
              </div>
              <h3 className="mt-3 break-words text-2xl font-bold leading-tight">{m.tajuk || "Modul latihan tanpa tajuk"}</h3>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <span className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1" style={{ color: BIRU }}>{bd ? "Bidang " + bd.nama : "Bidang belum dipilih"}</span>
                <span className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-kluster">{kl ? kl.nama : "Kluster belum dipilih"}</span>
                {m.fokus && <span className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-mist">Fokus: {m.fokus}</span>}
              </div>
            </div>
            <div className="space-y-5 p-5 sm:p-6">
              <Blok warna="var(--color-hidup)" ikon={<LuLayers size={18} aria-hidden="true" />} tajuk="Kandungan" kosong="Pilih elemen pembelajaran" senarai={el.map((e) => ({ t: e.nama, s: e.domain.nama, c: e.domain.warna }))} />
              <Blok warna="var(--color-belajar)" ikon={<LuPresentation size={18} aria-hidden="true" />} tajuk="Penyampaian" kosong="Pilih kaedah penyampaian" senarai={m.sampai.map((t) => ({ t }))} />
              <Blok warna={NEON} ikon={<LuClipboardCheck size={18} aria-hidden="true" />} tajuk="Pentaksiran" kosong="Pilih kaedah pentaksiran" senarai={m.taksir.map((t) => ({ t }))} />
              <div>
                <div className="flex items-center justify-between text-sm"><span className="font-semibold text-mist">Kelengkapan</span><span className="font-display font-semibold tabular-nums">{siap} / {semak.length}</span></div>
                <div className="bar mt-2"><i style={{ width: (siap / semak.length) * 100 + "%" }} /></div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {semak.map(([label, ok]) => <li key={label} className={"flex items-center gap-2 " + (ok ? "text-ink" : "text-dim")}>{ok ? <LuCheck size={16} className="text-kluster" aria-hidden="true" /> : <LuX size={16} className="text-hidup" aria-hidden="true" />}{label}<span className="sr-only">{ok ? " (lengkap)" : " (belum lengkap)"}</span></li>)}
                </ul>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <button type="button" className="btn btn-solid" disabled={!lengkap || sibuk} onClick={jana}><LuZap size={17} aria-hidden="true" />Jana kad (PDF)</button>
                <button type="button" className="btn" style={{ "--c": NEON }} onClick={salin}><LuCopy size={17} aria-hidden="true" />Salin ringkasan</button>
                <button type="button" className="btn" style={{ "--c": "var(--color-dim)" }} onClick={() => { setM(KOSONG); setDijana(false); setMesej(""); setImej(""); }}><LuRotateCcw size={17} aria-hidden="true" />Kosongkan</button>
                <button type="button" className="btn" style={{ "--c": "var(--color-dim)" }} onClick={() => { setM(CONTOH); setDijana(true); setMesej(""); setImej(""); }}>Muat contoh</button>
              </div>
              {!lengkap && <p className="text-sm text-belajar">Lengkapkan butiran bertanda di atas untuk menjana kad PDF.</p>}
              {mesej && <p className="text-sm text-neon" role="status">{mesej}</p>}
              {imej && <img src={imej} width="1654" height="2339" className="block h-auto w-full rounded-xl border border-white/15" alt={"Kad ringkasan modul: " + (m.tajuk || "Modul latihan tanpa tajuk")} />}
              {mesej.startsWith("Tidak") && <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-mist">{teks}</pre>}
              <p className="flex gap-2 text-xs text-dim"><LuInfo size={15} className="mt-0.5 flex-none" aria-hidden="true" />Alat simulasi untuk perancangan awal. Pilihan tidak disimpan dan bukan kelulusan rasmi KPM.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
function Blok({ warna, ikon, tajuk, senarai, kosong }) {
  return (
    <div style={{ "--c": warna }}>
      <div className="flex items-center gap-2 font-display text-sm font-semibold tracking-[0.14em] a-text">{ikon}{tajuk.toUpperCase()}</div>
      {senarai.length === 0 ? <p className="mt-2 text-sm text-dim">{kosong}</p> : (
        <ul className="mt-2 flex flex-wrap gap-2">
          {senarai.map((x) => <li key={x.t} className="rounded-xl border px-3 py-1.5 text-sm font-semibold a-border a-bg" style={x.c ? { "--c": x.c } : undefined}>{x.t}{x.s && <span className="block text-xs font-medium text-mist">{x.s}</span>}</li>)}
        </ul>
      )}
    </div>
  );
}

/* ---------- Kuiz + eSijil ---------- */
const LULUS = 15;
const BULAN = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
const tarikhHariIni = () => { const d = new Date(); return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`; };
const kemasNama = (s) => s.replace(/\s+/g, " ").trim();

// Draws the certificate (A4 landscape, 2000 x 1414) on a canvas; the same canvas is the on-screen preview and the PDF page.
function lukisSijil(cv, { nama, markah, jumlah, tarikh }) {
  const W = 2000, H = 1414;
  cv.width = W; cv.height = H;
  const x = cv.getContext("2d");
  const FD = '"Chakra Petch", "Trebuchet MS", "Segoe UI", sans-serif', FB = '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
  x.fillStyle = "#f6f9ff"; x.fillRect(0, 0, W, H);
  const gelang = [["#ff4d4d", 560], ["#ff9f1c", 470], ["#ffe600", 380], ["#10b981", 290], ["#2b5bff", 200]];
  x.globalAlpha = 0.17; x.lineWidth = 62;
  [[0, 0], [W, H]].forEach(([cx, cy]) => gelang.forEach(([c, r]) => { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.strokeStyle = c; x.stroke(); }));
  x.globalAlpha = 1;
  x.lineWidth = 12; x.strokeStyle = "#0b1a4a"; x.strokeRect(46, 46, W - 92, H - 92);
  x.lineWidth = 3; x.strokeStyle = "#00b8d4"; x.strokeRect(72, 72, W - 144, H - 144);
  x.textAlign = "center"; x.textBaseline = "alphabetic";
  const t = (s, y, font, warna) => { x.font = font; x.fillStyle = warna; x.fillText(s, W / 2, y); };
  t("KERANGKA KURIKULUM LATIHAN", 250, `600 46px ${FD}`, "#0b1a4a");
  t("Pegawai Perkhidmatan Pendidikan  ·  Kementerian Pendidikan", 306, `500 30px ${FB}`, "#44517a");
  t("eSIJIL", 480, `700 156px ${FD}`, "#0b1a4a");
  t("KUIZ PEMAHAMAN KKL", 556, `600 48px ${FD}`, "#1d4ed8");
  t("Dianugerahkan kepada", 668, `500 34px ${FB}`, "#44517a");
  const nm = (nama || "Nama Peserta").toUpperCase();
  let fs = 100;
  do { fs -= 4; x.font = `700 ${fs}px ${FD}`; } while (x.measureText(nm).width > 1560 && fs > 36);
  x.fillStyle = nama ? "#0b1a4a" : "#9aa5c4"; x.fillText(nm, W / 2, 795, 1640);
  const g = x.createLinearGradient(420, 0, 1580, 0);
  g.addColorStop(0, "rgba(0,184,212,0)"); g.addColorStop(0.2, "#00b8d4"); g.addColorStop(0.8, "#2b5bff"); g.addColorStop(1, "rgba(43,91,255,0)");
  x.fillStyle = g; x.fillRect(420, 832, 1160, 5);
  t("kerana berjaya melepasi Kuiz Pemahaman Kerangka Kurikulum Latihan", 912, `500 34px ${FB}`, "#24304f");
  t("Pegawai Perkhidmatan Pendidikan dengan markah", 962, `500 34px ${FB}`, "#24304f");
  const pw = 380, ph = 116, px = (W - pw) / 2, py = 1008, r = 58;
  x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + pw, py, px + pw, py + ph, r); x.arcTo(px + pw, py + ph, px, py + ph, r); x.arcTo(px, py + ph, px, py, r); x.arcTo(px, py, px + pw, py, r); x.closePath();
  x.fillStyle = "#0b1a4a"; x.fill();
  t(`${markah} / ${jumlah}`, py + 83, `700 72px ${FD}`, "#ffffff");
  t(`Tarikh: ${tarikh}`, 1218, `600 32px ${FB}`, "#0b1a4a");
  t("eSijil ini dijana secara automatik oleh laman web KKL PPP KPM.", 1290, `400 24px ${FB}`, "#6b7696");
}

async function binaPdf(cv, saiz = [841.89, 595.28], tajuk = "eSijil Kuiz Pemahaman KKL") {
  const blob = await new Promise((ok, gagal) => cv.toBlob((b) => (b ? ok(b) : gagal(new Error("toBlob"))), "image/jpeg", 0.93));
  const pdf = await PDFDocument.create();
  pdf.setTitle(tajuk); pdf.setSubject("Kerangka Kurikulum Latihan Pegawai Perkhidmatan Pendidikan");
  const img = await pdf.embedJpg(new Uint8Array(await blob.arrayBuffer()));
  pdf.addPage(saiz).drawImage(img, { x: 0, y: 0, width: saiz[0], height: saiz[1] });
  return pdf.save();
}

// Saves through the host's download capability when the page runs inside Claude; plain browser download elsewhere.
async function simpanFail(filename, bytes) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  if (window.claude && typeof window.claude.use === "function") {
    let d = null;
    try { d = await window.claude.use("downloads"); } catch (e) {}
    if (!d) return "tiada";
    try { await d.save({ filename, data: blob }); return "ok"; }
    catch (e) { return e && e.code === "declined" ? "batal" : e && e.code === "rate_limited" ? "sibuk" : "tiada"; }
  }
  const url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return "ok";
}
const MESEJ_SIMPAN = {
  ok: "eSijil dihantar untuk dimuat turun. Semak folder muat turun anda.",
  batal: "Muat turun dibatalkan. Tekan butang sekali lagi untuk mencuba semula.",
  sibuk: "Satu muat turun sedang menunggu pengesahan. Tunggu sebentar dan cuba lagi.",
  tiada: "Muat turun PDF tidak tersedia dalam paparan ini. Tekan lama atau klik kanan pada pratonton eSijil untuk menyimpannya sebagai imej.",
};

function Sijil({ markah, jumlah }) {
  const [nama, setNama] = useKekal("sijil-nama", "");
  const [status, setStatus] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [src, setSrc] = useState("");
  const cv = useRef(null);
  if (!cv.current) cv.current = document.createElement("canvas");
  const bersih = kemasNama(nama), sah = bersih.length >= 3;
  const tarikh = useMemo(tarikhHariIni, []);
  useEffect(() => {
    let batal = false;
    const lukis = () => {
      if (batal) return;
      lukisSijil(cv.current, { nama: bersih, markah, jumlah, tarikh });
      try { setSrc(cv.current.toDataURL("image/jpeg", 0.9)); } catch (e) {}
    };
    lukis();
    if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('700 96px "Chakra Petch"'), document.fonts.load('500 34px "Plus Jakarta Sans"')]).then(lukis, () => {});
    return () => { batal = true; };
  }, [bersih, markah, jumlah, tarikh]);
  const muat = async () => {
    setSibuk(true); setStatus("Menyediakan PDF…");
    try {
      const bytes = await binaPdf(cv.current);
      const slug = bersih.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "peserta";
      setStatus(MESEJ_SIMPAN[await simpanFail(`eSijil-Kuiz-KKL-${slug}.pdf`, bytes)]);
    } catch (e) { setStatus("PDF tidak dapat dijana. Cuba lagi."); }
    setSibuk(false);
  };
  return (
    <div className="mt-8 rounded-2xl border border-kluster/45 bg-kluster/[0.07] p-5 sm:p-6">
      <h4 className="flex items-center gap-2.5 font-display text-xl font-bold text-kluster"><LuAward size={24} aria-hidden="true" />Tahniah! Anda layak menerima eSijil</h4>
      <p className="mt-1.5 text-[0.95rem] text-mist">Masukkan nama penuh seperti yang mahu dipaparkan pada eSijil, kemudian muat turun dalam bentuk PDF.</p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] flex-1">
          <label htmlFor="nama-sijil" className="block text-sm font-semibold text-ink">Nama penuh</label>
          <input id="nama-sijil" type="text" className="field plain mt-1.5" maxLength={80} autoComplete="name" placeholder="Contoh: Nur Aisyah binti Rahman" value={nama} onChange={(e) => { setNama(e.target.value); setStatus(""); }} />
        </div>
        <button type="button" className="btn btn-solid" style={{ "--c": HIJAU }} disabled={!sah || sibuk} onClick={muat}><LuFileText size={18} aria-hidden="true" />Muat turun eSijil (PDF)</button>
      </div>
      {!sah && <p className="mt-2 text-sm text-belajar">Masukkan sekurang-kurangnya 3 aksara nama untuk mengaktifkan muat turun.</p>}
      {status && <p className="mt-2 text-sm text-neon" role="status">{status}</p>}
      <p className="mt-5 text-sm font-semibold text-mist">Pratonton eSijil</p>
      {src && <img src={src} width="2000" height="1414" className="mt-2 block h-auto w-full rounded-xl border border-white/15 shadow-[0_18px_50px_-24px_rgba(0,0,0,.9)]" alt={`Pratonton eSijil Kuiz Pemahaman KKL untuk ${bersih || "nama peserta"}, markah ${markah} daripada ${jumlah}, bertarikh ${tarikh}`} />}
    </div>
  );
}

function Kuiz() {
  const [i, setI] = useKekal("kuiz-i", 0);
  const [jwb, setJwb] = useKekal("kuiz-jwb", []);
  const [tamat, setTamat] = useKekal("kuiz-tamat", false);
  const n = KUIZ.length, [soalan, pilihan, betul, ms] = KUIZ[i], pilih = jwb[i];
  const dijawab = pilih !== undefined;
  const markah = jwb.reduce((s, a, j) => s + (a === KUIZ[j][2] ? 1 : 0), 0);
  const lulus = markah >= LULUS;
  const semula = () => { setI(0); setJwb([]); setTamat(false); };
  return (
    <Section id="kuiz" eyebrow="Kuiz pemahaman" title="Uji kefahaman anda tentang KKL" color={HIJAU}
      lead={`${n} soalan aneka pilihan dengan maklum balas dan rujukan halaman buku selepas setiap jawapan. Jawab sekurang-kurangnya ${LULUS} soalan dengan betul untuk mendapat eSijil yang boleh dimuat turun dalam bentuk PDF.`}>
      <Reveal className="glass mx-auto max-w-[900px] p-5 sm:p-8">
        {!tamat ? (<>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
            <span className="font-display font-semibold tabular-nums text-mist">Soalan {i + 1} / {n}</span>
            <span className="font-display font-semibold tabular-nums text-kluster">Markah: {markah} <span className="font-normal text-dim">· lulus eSijil {LULUS} / {n}</span></span>
          </div>
          <div className="bar mt-3" role="progressbar" aria-valuemin={0} aria-valuemax={n} aria-valuenow={i + (dijawab ? 1 : 0)} aria-label="Kemajuan kuiz"><i style={{ width: ((i + (dijawab ? 1 : 0)) / n) * 100 + "%" }} /></div>
          <div key={i} className="swap">
            <h2 className="mt-6 text-xl font-semibold leading-snug sm:text-2xl">{soalan}</h2>
            <div className="mt-5 grid gap-2.5">
              {pilihan.map((p, j) => {
                const cls = !dijawab ? "" : j === betul ? " ok" : j === pilih ? " no" : "";
                return (
                  <button key={j} type="button" className={"opt" + cls} disabled={dijawab} onClick={() => setJwb((a) => { const b = a.slice(); b[i] = j; return b; })}>
                    <span className="key">{"ABCD"[j]}</span><span className="flex-1 text-[0.98rem]">{p}</span>
                    {dijawab && j === betul && <LuCheck size={20} className="flex-none text-kluster" aria-label="Jawapan betul" />}
                    {dijawab && j === pilih && j !== betul && <LuX size={20} className="flex-none text-hidup" aria-label="Jawapan anda, salah" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex min-h-[3.2rem] flex-wrap items-center justify-between gap-3" aria-live="polite">
              {dijawab ? (<>
                <p className={"text-[0.95rem] font-semibold " + (pilih === betul ? "text-kluster" : "text-hidup")}>
                  {pilih === betul ? "Betul." : `Salah. Jawapan betul ialah ${"ABCD"[betul]}.`} <span className="font-normal text-mist">Rujukan: m/s {ms} buku KKL.</span>
                </p>
                <button type="button" className="btn btn-solid" onClick={() => (i + 1 < n ? setI(i + 1) : setTamat(true))}>{i + 1 < n ? "Soalan seterusnya" : "Lihat keputusan"}<LuArrowRight size={17} aria-hidden="true" /></button>
              </>) : <p className="text-sm text-dim">Pilih satu jawapan untuk meneruskan.</p>}
            </div>
          </div>
        </>) : (
          <div className="swap" style={{ "--c": lulus ? HIJAU : "var(--color-belajar)" }}>
            <div className="flex flex-wrap items-center gap-6">
              <div className="grid h-32 w-32 flex-none place-items-center rounded-full border-2 a-border a-bg shadow-[0_0_46px_-10px_var(--c)]">
                <div className="text-center"><div className="font-display text-5xl font-bold leading-none a-text tabular-nums">{markah}</div><div className="text-sm text-mist">daripada {n}</div></div>
              </div>
              <div className="min-w-[220px] flex-1">
                <h2 className="text-2xl font-bold">{lulus ? "Lulus" : "Belum lulus"}</h2>
                <p className="mt-1 text-mist">{lulus
                  ? `Anda menjawab ${markah} daripada ${n} soalan dengan betul dan melepasi markah lulus ${LULUS}.`
                  : `Anda menjawab ${markah} daripada ${n} soalan dengan betul. eSijil memerlukan sekurang-kurangnya ${LULUS} jawapan betul. Semak jawapan di bawah dan cuba semula.`}</p>
                <button type="button" className={"btn mt-4" + (lulus ? "" : " btn-solid")} onClick={semula}><LuRotateCcw size={17} aria-hidden="true" />Cuba semula</button>
              </div>
            </div>
            {lulus && <Sijil markah={markah} jumlah={n} />}
            <h3 className="mt-8 font-display text-lg font-semibold">Semakan jawapan</h3>
            <ol className="mt-3 space-y-2">
              {KUIZ.map(([s, p, b, hal], j) => (
                <li key={j} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3 text-[0.93rem]">
                  {jwb[j] === b ? <LuCheck size={18} className="mt-0.5 flex-none text-kluster" aria-label="Betul" /> : <LuX size={18} className="mt-0.5 flex-none text-hidup" aria-label="Salah" />}
                  <div><p className="font-semibold">{j + 1}. {s}</p>
                    <p className="text-mist">Jawapan betul: {"ABCD"[b]}. {p[b]} <span className="text-dim">(m/s {hal})</span></p>
                    {jwb[j] !== b && <p className="text-hidup">Jawapan anda: {"ABCD"[jwb[j]]}. {p[jwb[j]]}</p>}</div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </Reveal>
    </Section>
  );
}

/* ---------- Soalan Lazim + Glosari ---------- */
function SoalanLazim() {
  const [buka, setBuka] = useState(0);
  const [q, setQ] = useState("");
  const g = GLOSARI.filter(([a, b]) => (a + " " + b).toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Section id="soalan-lazim" eyebrow="Soalan lazim dan glosari" title="Soalan Lazim dan Glosari Pintar" color={NEON}>
      <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
        <Reveal className="space-y-2.5">
          {SOALAN_LAZIM.map(([s, j], i) => (
            <div key={i} className={"glass glow" + (buka === i ? " on" : "")}>
              <h3><button type="button" className="flex w-full items-center gap-3 p-4 text-left sm:p-5" aria-expanded={buka === i} aria-controls={"sl-" + i} onClick={() => setBuka(buka === i ? -1 : i)}>
                <span className="font-display text-sm font-bold text-neon tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 font-display text-[1.02rem] font-semibold leading-snug">{s}</span>
                <LuChevronDown size={20} className={"flex-none text-neon transition-transform duration-300" + (buka === i ? " rotate-180" : "")} aria-hidden="true" />
              </button></h3>
              <div id={"sl-" + i} className={"acc-body" + (buka === i ? " open" : "")}><div><p className="px-4 pb-5 pl-[3.1rem] text-[0.97rem] text-mist sm:px-5 sm:pl-[3.4rem]">{j}</p></div></div>
            </div>
          ))}
        </Reveal>
        <Reveal delay={120} className="glass p-5 sm:p-6 lg:sticky lg:top-24">
          <h3 className="flex items-center gap-2.5 text-xl font-bold"><LuBookOpen size={22} className="text-neon" aria-hidden="true" />Glosari</h3>
          <div className="relative mt-4">
            <LuSearch size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dim" aria-hidden="true" />
            <label htmlFor="cari-glosari" className="sr-only">Cari istilah glosari</label>
            <input id="cari-glosari" type="search" className="field" placeholder="Cari istilah, contoh: pentaksiran formatif" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <p className="mt-2 text-sm text-dim tabular-nums" aria-live="polite">{g.length} daripada {GLOSARI.length} istilah</p>
          <dl className="mt-3 max-h-[440px] space-y-2.5 overflow-y-auto pr-1">
            {g.map(([a, b]) => <div key={a} className="rounded-xl border border-white/10 bg-white/[0.035] p-3.5"><dt className="font-display font-semibold text-neon">{a}</dt><dd className="mt-0.5 text-[0.92rem] text-mist">{b}</dd></div>)}
            {g.length === 0 && <p className="text-mist">Tiada istilah sepadan dengan “{q}”.</p>}
          </dl>
          <h4 className="mt-6 font-display text-base font-semibold">Singkatan</h4>
          <dl className="mt-2 grid grid-cols-2 gap-2">
            {SINGKATAN.map(([a, b]) => <div key={a} className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2"><dt className="font-display font-bold text-neon">{a}</dt><dd className="text-xs text-mist">{b}</dd></div>)}
          </dl>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------- Lampiran ---------- */
function Lampiran() {
  const [t, setT] = useState(0);
  const tab = ["Rujukan", "Penghargaan", "Sekalung Budi"];
  return (
    <Section id="lampiran" eyebrow="Lampiran" title="Rujukan dan Penghargaan" color={BIRU}>
      <Reveal className="glass p-5 sm:p-8">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Lampiran">
          {tab.map((x, i) => <button key={x} type="button" role="tab" aria-selected={t === i} className={"chip" + (t === i ? " on" : "")} onClick={() => setT(i)}>{x}</button>)}
        </div>
        <div key={t} className="swap mt-6" role="tabpanel">
          {t === 0 && (
            <ol className="space-y-3 text-[0.94rem] text-mist">
              {RUJUKAN.map(([a, tajuk, b, url, ok], i) => (
                <li key={i} className="flex gap-3"><span className="font-display font-semibold a-text tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 break-words">{a} <em className="text-ink">{tajuk}</em> {b} {url && (ok ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-neon underline decoration-neon/40 underline-offset-2 hover:decoration-neon">{url}</a> : <span className="text-dim">{url}</span>)}</span></li>
              ))}
            </ol>
          )}
          {t === 1 && (
            <div className="space-y-7">
              {PENGHARGAAN.map((p) => (
                <div key={p.peranan}>
                  <h3 className="flex items-center gap-3 font-display text-lg font-semibold a-text">{p.peranan}<span className="text-sm font-medium text-dim">{p.senarai.length} orang</span></h3>
                  <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {p.senarai.map(([nama, org]) => <li key={nama} className="rounded-xl border border-white/10 bg-white/[0.035] p-3"><span className="block text-[0.95rem] font-semibold leading-snug">{nama}</span><span className="text-[0.82rem] text-mist">{org}</span></li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {t === 2 && (<>
            <ul className="flex flex-wrap gap-2">{SEKALUNG_BUDI.map((x) => <li key={x} className="rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-[0.9rem] text-ink">{x}</li>)}</ul>
            <p className="mt-5 max-w-[70ch] text-mist">dan semua yang terlibat secara langsung dan tidak langsung dalam penghasilan Kerangka Kurikulum Latihan Pegawai Perkhidmatan Pendidikan Kementerian Pendidikan.</p>
          </>)}
        </div>
      </Reveal>
    </Section>
  );
}

/* ---------- App ---------- */
function App() {
  const [laman, setLaman] = useState(bacaLaman);
  const [di, setDi] = useKekal("di", 0);
  const [ei, setEi] = useKekal("ei", 0);
  setLamanLuar = setLaman;
  useEffect(() => {
    const f = () => { setLaman(bacaLaman()); keAtas(); };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  const bukaDomain = (d, e) => { setDi(d); setEi(e); pergi("domain"); };
  return (
    <>
      <div className="mesh" aria-hidden="true" /><Particles />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Nav laman={laman} />
        <main key={laman} className="swap flex-1">
          {laman === "utama" && <><Hero /><Jelajah /></>}
          {laman === "mengenai" && <Mengenai />}
          {laman === "kerangka" && <Kerangka bukaDomain={bukaDomain} />}
          {laman === "domain" && <Peneroka di={di} ei={ei} setDi={setDi} setEi={setEi} />}
          {laman === "kluster" && <Kluster />}
          {laman === "kaedah" && <Kaedah />}
          {laman === "perancang" && <Perancang />}
          {laman === "kuiz" && <Kuiz />}
          {laman === "soalan-lazim" && <SoalanLazim />}
          {laman === "lampiran" && <Lampiran />}
          {laman !== "utama" && <NavLaman laman={laman} />}
        </main>
        <footer className="border-t border-white/10 bg-black/30">
          <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-mist sm:px-6">
            <div><p className="font-display text-base font-semibold text-ink">Kerangka Kurikulum Latihan Pegawai Perkhidmatan Pendidikan</p>
              <p>Kementerian Pendidikan · Cetakan Pertama 2025 · eISBN {META.eisbn}</p><p className="text-dim">Hak Cipta Terpelihara © Bahagian Profesionalisme Guru, Kementerian Pendidikan</p></div>
            <Pautan ke="utama" className="btn" style={{ "--c": NEON }}><LuNetwork size={17} aria-hidden="true" />Laman utama</Pautan>
          </div>
        </footer>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
