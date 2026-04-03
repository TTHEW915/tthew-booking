import { useState } from "react";

const PALETTES = [
  { name: "Ivory & Gold",      bg: "#FAF7F2", surface: "#EDE5D8", primary: "#B8972E", text: "#2C2416", accent: "#D4AF5A", muted: "#8C7A52", card: "#FFFFFF",   tag: "Classic · Timeless" },
  { name: "Midnight & Blush",  bg: "#0E0E14", surface: "#1A1A24", primary: "#E8A0B0", text: "#F5F0F2", accent: "#C96D85", muted: "#8A7A82", card: "#16161E",   tag: "Moody · Romantic" },
  { name: "Sage & Linen",      bg: "#F2F4F0", surface: "#E0E8DC", primary: "#5A7A5E", text: "#1E2820", accent: "#3D5C41", muted: "#7A8C7C", card: "#FFFFFF",   tag: "Natural · Fresh" },
  { name: "Dusty Rose",        bg: "#FDF4F4", surface: "#F2E2E2", primary: "#C4727A", text: "#2E1A1A", accent: "#A85560", muted: "#9E7070", card: "#FFFFFF",   tag: "Soft · Feminine" },
  { name: "Deep Navy",         bg: "#0A0E1A", surface: "#141828", primary: "#5B8FD4", text: "#E8EEF8", accent: "#3A6AB8", muted: "#5A6A8A", card: "#0E1220",   tag: "Bold · Refined" },
  { name: "Terracotta",        bg: "#FBF0E8", surface: "#EDD8C8", primary: "#C4623A", text: "#281408", accent: "#A04A28", muted: "#9A6A50", card: "#FFFFFF",   tag: "Earthy · Warm" },
  { name: "Champagne & Blush", bg: "#FBF6EE", surface: "#EEE4D4", primary: "#C9956A", text: "#2A1E14", accent: "#B07848", muted: "#9A7A5A", card: "#FFFFFF",   tag: "Warm · Luxe" },
  { name: "Lavender Mist",     bg: "#F4F2FA", surface: "#E4DEEE", primary: "#7A6AAC", text: "#1E1830", accent: "#5A4A8C", muted: "#8878A8", card: "#FFFFFF",   tag: "Dreamy · Soft" },
];

const STEPS = ["Event Info", "Coverage", "Style", "Music", "Extras", "Logistics", "Summary"];

const initialForm = {
  eventType: "", eventDate: "", venueName: "", venueCity: "", guestCount: "", ceremonyLength: "",
  packageType: [], videographerCount: "1", locations: "1",
  editingStyle: "", colorGrading: "", socialFormats: [],
  songChoice: "", musicGenre: "",
  extras: [], customNotes: "",
  turnaround: "", deliveryFormat: [], budget: "",
  name: "", email: "", phone: "",
  otherEventType: "", otherEditingStyle: "", otherSong: "", otherExtra: "", otherDelivery: "", otherColorGrading: "",
};

const toggle = (arr, val) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

function darken(hex, amt = 40) {
  const n = parseInt(hex.replace("#", ""), 16);
  return "#" + [n >> 16, (n >> 8) & 255, n & 255].map(c => Math.max(0, c - amt).toString(16).padStart(2, "0")).join("");
}
function lighten(hex, amt = 40) {
  const n = parseInt(hex.replace("#", ""), 16);
  return "#" + [n >> 16, (n >> 8) & 255, n & 255].map(c => Math.min(255, c + amt).toString(16).padStart(2, "0")).join("");
}
function isLight(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) > 128;
}
function buildCustomPalette(bg, primary, text) {
  return {
    name: "Custom", tag: "Your Colors", custom: true, bg, primary, text,
    surface: isLight(bg) ? darken(bg, 15) : lighten(bg, 15),
    accent: darken(primary, 20),
    muted: isLight(text) ? darken(text, 60) : lighten(text, 80),
    card: isLight(bg) ? "#FFFFFF" : lighten(bg, 10),
  };
}

// Predefined swatches for the custom builder quick-pick
const SWATCHES = [
  "#FAF7F2","#FBF6EE","#FDF4F4","#F4F2FA","#F2F4F0","#F4FAF5","#FBF0E8",
  "#0E0E14","#0A0E1A","#1C1F26","#2C2416","#1E2820","#1E1830","#281408",
  "#B8972E","#C4727A","#5A7A5E","#7A6AAC","#C9956A","#5B8FD4","#C4623A",
  "#E8A0B0","#A8B4C8","#D4AF5A","#2E7A4A","#C96D85","#3A6AB8","#A04A28",
  "#FFFFFF","#F0EBE0","#E8EDE4","#D8EAD8","#E4DEEE","#EEE4D4","#EDD8C8",
  "#1A1210","#2E1A1A","#0E2018","#2A1E14","#F5F0F2","#E8EEF8","#E8ECF2",
];

export default function App() {
  const [palette, setPalette] = useState(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [customColors, setCustomColors] = useState({ bg: "#F5F0EB", primary: "#9B6B4A", text: "#1A1210" });
  const [hexInputs, setHexInputs] = useState({ bg: "#F5F0EB", primary: "#9B6B4A", text: "#1A1210" });
  const [activeColorKey, setActiveColorKey] = useState("bg");
  const [hoveredCard, setHoveredCard] = useState(null);

  // p is the ACTIVE palette — drives ALL theming
  const p = palette ?? PALETTES[0];
  const prev = buildCustomPalette(customColors.bg, customColors.primary, customColors.text);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const toggleArr = (key, val) => setForm(f => ({ ...f, [key]: toggle(f[key], val) }));
  const handleHexInput = (key, val) => {
    setHexInputs(h => ({ ...h, [key]: val }));
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) setCustomColors(c => ({ ...c, [key]: val }));
  };
  const handleColorPick = (key, val) => {
    setCustomColors(c => ({ ...c, [key]: val }));
    setHexInputs(h => ({ ...h, [key]: val }));
  };

  const handleSubmit = async () => {
    setSending(true);
    setSendError(false);
    try {
      // Build message body from all form fields
      const fields = [
        ["Event Type", form.eventType + (form.otherEventType ? ` — ${form.otherEventType}` : "")],
        ["Event Date", form.eventDate],
        ["Venue", [form.venueName, form.venueCity].filter(Boolean).join(", ")],
        ["Guest Count", form.guestCount],
        ["Event Length", form.ceremonyLength],
        ["Coverage", form.packageType.join(", ")],
        ["Videographers", form.videographerCount],
        ["Locations", form.locations],
        ["Editing Style", form.editingStyle + (form.otherEditingStyle ? ` — ${form.otherEditingStyle}` : "")],
        ["Color Grading", form.colorGrading],
        ["Social Formats", form.socialFormats.join(", ")],
        ["Song / Music", [form.songChoice, form.musicGenre === "Other" ? form.otherSong : form.musicGenre].filter(Boolean).join(" · ")],
        ["Extras", [...form.extras.filter(e => e !== "Other"), ...(form.extras.includes("Other") && form.otherExtra ? [`Other: ${form.otherExtra}`] : [])].join(", ")],
        ["Turnaround", form.turnaround],
        ["Delivery", [...form.deliveryFormat.filter(d => d !== "Other"), ...(form.deliveryFormat.includes("Other") && form.otherDelivery ? [`Other: ${form.otherDelivery}`] : [])].join(", ")],
        ["Budget", form.budget],
        ["Palette", p.name],
        ["Custom Notes", form.customNotes],
        ["Name", form.name],
        ["Email", form.email],
        ["Phone", form.phone],
      ].filter(([, v]) => v);

      const messageBody = fields.map(([k, v]) => `${k}: ${v}`).join("\n");

      // Send via EmailJS public API — no backend needed
      const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: "service_tthew",
          template_id: "template_tthew",
          user_id: "EMAILJS_PUBLIC_KEY",
          template_params: {
            to_email: "mattwicz915@gmail.com",
            from_name: form.name || "New Inquiry",
            from_email: form.email || "no-reply@tthew.com",
            reply_to: form.email || "no-reply@tthew.com",
            subject: `New ${form.eventType || "Event"} Inquiry — ${form.name || "Client"}`,
            message: messageBody,
          }
        })
      });

      if (res.ok || res.status === 200) {
        setSubmitted(true);
      } else {
        setSendError(true);
      }
    } catch (e) {
      setSendError(true);
    } finally {
      setSending(false);
    }
  };

  // Derived styles from active palette p
  const S = {
    app: { minHeight: "100vh", background: p.bg, color: p.text, fontFamily: "'Cormorant Garamond','Georgia',serif", transition: "background 0.6s, color 0.6s" },
    header: { padding: "clamp(1.25rem, 4vw, 2.5rem) 1.25rem 1.25rem", borderBottom: `1px solid ${p.surface}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", transition: "border-color 0.6s" },
    logo: { fontSize: "1rem", letterSpacing: "0.3em", textTransform: "uppercase", color: p.muted, fontFamily: "'Montserrat',sans-serif", fontWeight: 500 },
    title: { fontSize: "clamp(1.8rem,5vw,3rem)", fontWeight: 700, color: p.text, margin: 0, letterSpacing: "-0.02em" },
    subtitle: { fontSize: "1rem", color: p.muted, margin: 0, fontFamily: "'Montserrat',sans-serif", fontWeight: 400 },
    container: { maxWidth: 760, margin: "0 auto", padding: "1.5rem 1rem 4rem" },
    card: { background: p.card, border: `1px solid ${p.surface}`, borderRadius: 16, padding: "clamp(1.25rem, 4vw, 2rem)", marginBottom: "1.5rem", boxShadow: `0 4px 24px ${p.text}08`, transition: "background 0.6s, border-color 0.6s" },
    sectionTitle: { fontSize: "1.5rem", fontWeight: 700, color: p.text, marginBottom: "0.25rem" },
    sectionSub: { fontSize: "0.85rem", color: p.muted, fontFamily: "'Montserrat',sans-serif", marginBottom: "1.75rem" },
    label: { display: "block", fontSize: "0.8rem", letterSpacing: "0.12em", textTransform: "uppercase", color: p.muted, fontFamily: "'Montserrat',sans-serif", marginBottom: "0.5rem", fontWeight: 600 },
    input: { width: "100%", padding: "0.75rem 1rem", background: p.bg, border: `1px solid ${p.surface}`, borderRadius: 8, color: p.text, fontSize: "1rem", fontFamily: "'Cormorant Garamond',serif", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" },
    select: { width: "100%", padding: "0.75rem 1rem", background: p.bg, border: `1px solid ${p.surface}`, borderRadius: 8, color: p.text, fontSize: "1rem", fontFamily: "'Cormorant Garamond',serif", outline: "none", boxSizing: "border-box" },
    grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" },
    fieldGroup: { marginBottom: "1.25rem" },
    chip: (active) => ({ display: "inline-block", maxWidth: "100%", padding: "0.5rem 1rem", borderRadius: 100, border: `1.5px solid ${active ? p.primary : p.surface}`, background: active ? p.primary + "22" : "transparent", color: active ? p.primary : p.muted, cursor: "pointer", fontSize: "0.88rem", fontFamily: "'Montserrat',sans-serif", fontWeight: 500, margin: "0.25rem", transition: "all 0.2s", userSelect: "none" }),
    optionCard: (active) => ({ padding: "1rem 1.25rem", borderRadius: 12, border: `1.5px solid ${active ? p.primary : p.surface}`, background: active ? p.primary + "12" : p.bg, cursor: "pointer", marginBottom: "0.75rem", transition: "all 0.2s" }),
    optionTitle: (active) => ({ fontWeight: 700, fontSize: "1.05rem", color: active ? p.primary : p.text }),
    optionDesc: { fontSize: "0.82rem", color: p.muted, fontFamily: "'Montserrat',sans-serif", marginTop: "0.2rem" },
    btn: { background: p.primary, color: p.bg, border: "none", borderRadius: 100, padding: "0.85rem 2.5rem", fontSize: "0.9rem", fontFamily: "'Montserrat',sans-serif", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", transition: "opacity 0.2s" },
    btnOutline: { background: "transparent", color: p.primary, border: `1.5px solid ${p.primary}`, borderRadius: 100, padding: "0.85rem 2rem", fontSize: "0.9rem", fontFamily: "'Montserrat',sans-serif", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", marginRight: "1rem" },
    progressBar: { height: 3, background: p.surface, borderRadius: 10, margin: "1.5rem 0" },
    progressFill: { height: "100%", background: p.primary, borderRadius: 10, width: `${(step / (STEPS.length - 1)) * 100}%`, transition: "width 0.4s ease, background 0.6s" },
    stepLabel: { fontSize: "0.75rem", fontFamily: "'Montserrat',sans-serif", color: p.muted, textAlign: "center", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" },
    summaryRow: { display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: `1px solid ${p.surface}`, fontSize: "0.95rem" },
    summaryKey: { color: p.muted, fontFamily: "'Montserrat',sans-serif", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em" },
    summaryVal: { fontWeight: 600, color: p.text, textAlign: "right", maxWidth: "60%" },
  };

  // ── PALETTE PICKER (wheel + mobile grid) ──
  if (!palette) {
    const CARD_W = 108; const CARD_H = 124;
    const RADIUS = 240;
    const WHEEL_W = RADIUS * 2 + CARD_W + 40;
    const WHEEL_H = RADIUS * 2 + CARD_H + 40;
    const CX = WHEEL_W / 2; const CY = WHEEL_H / 2;
    const toRad = d => (d * Math.PI) / 180;
    const orbitAngles = PALETTES.map((_, i) => -90 + (360 / PALETTES.length) * i);

    return (
      <div style={{ minHeight: "100vh", background: "#FAF7F2", color: "#2C2416", fontFamily: "'Cormorant Garamond',serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
          @keyframes spinWheel { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          @keyframes counterSpin { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
          * { box-sizing:border-box; }
          .oc { cursor:pointer; transition:transform 0.2s,box-shadow 0.2s; }
          .cc { cursor:pointer; transition:transform 0.2s,box-shadow 0.2s; }
          .cc:hover { transform:translate(-50%,-50%) scale(1.06)!important; }
          .spinning-ring { animation:spinWheel 80s linear infinite; transform-origin:center center; }
          .spinning-ring:hover { animation-play-state:paused; }
          .card-counter { animation:counterSpin 80s linear infinite; transform-origin:center center; }
          .spinning-ring:hover .card-counter { animation-play-state:paused; }
          .desktop-wheel { display:block; }
          .mobile-grid { display:none; }
          @media (max-width:700px) { .desktop-wheel{display:none;} .mobile-grid{display:block;} }
        `}</style>

        <div style={{ padding:"2rem 1.25rem 1.25rem", borderBottom:"1px solid #EDE5D8", display:"flex", flexDirection:"column", alignItems:"center", gap:"0.2rem" }}>
          <span style={{ fontSize:"1rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"#8C7A52", fontFamily:"'Montserrat',sans-serif", fontWeight:500 }}>TTHEW Studios</span>
          <h1 style={{ fontSize:"clamp(1.8rem,5vw,3rem)", fontWeight:700, margin:0 }}>Let's Plan Your Story</h1>
          <p style={{ color:"#8C7A52", fontFamily:"'Montserrat',sans-serif", fontSize:"1rem", margin:0 }}>Wedding & Event Photo + Video Packages</p>
        </div>

        <div style={{ maxWidth:980, margin:"0 auto", padding:"1.5rem 1rem 3rem", animation:"fadeUp 0.5s ease" }}>
          <div style={{ textAlign:"center", marginBottom:"1rem" }}>
            <h2 style={{ fontSize:"1.4rem", fontWeight:700, margin:"0 0 0.3rem" }}>Choose your palette</h2>
            <p style={{ color:"#8C7A52", fontFamily:"'Montserrat',sans-serif", fontSize:"0.82rem", margin:0 }}>Sets the tone for your experience and final deliverables</p>
          </div>

          {/* DESKTOP: spinning wheel */}
          <div className="desktop-wheel">
            <div style={{ position:"relative", width:WHEEL_W, height:WHEEL_H, margin:"0 auto", overflow:"visible" }}>
              <svg style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", pointerEvents:"none" }}
                viewBox={`0 0 ${WHEEL_W} ${WHEEL_H}`} preserveAspectRatio="xMidYMid meet">
                <circle cx={CX} cy={CY} r={RADIUS} fill="none" stroke="#D8CFBF" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 8" />
              </svg>

              {/* Spinning ring */}
              <div className="spinning-ring" style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%" }}>
                {PALETTES.map((pal, i) => {
                  const angle = orbitAngles[i];
                  const x = CX + RADIUS * Math.cos(toRad(angle)) - CARD_W / 2;
                  const y = CY + RADIUS * Math.sin(toRad(angle)) - CARD_H / 2;
                  return (
                    <div key={pal.name} className="oc" onClick={() => setPalette(pal)}
                      onMouseEnter={() => setHoveredCard(pal.name)}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        position:"absolute", left:x, top:y, width:CARD_W,
                        background:pal.card, border:`2px solid ${hoveredCard===pal.name ? pal.primary : pal.surface}`,
                        borderRadius:14, padding:"0.9rem 0.65rem", textAlign:"center",
                        boxShadow: hoveredCard===pal.name ? `0 20px 56px rgba(0,0,0,0.28),0 0 0 3px ${pal.primary}40` : hoveredCard!==null ? "none" : `0 4px 16px ${pal.text}10`,
                        zIndex: hoveredCard===pal.name ? 20 : 5,
                        transform: hoveredCard===pal.name ? "scale(1.22)" : hoveredCard!==null ? "scale(0.88)" : "scale(1)",
                        opacity: hoveredCard!==null && hoveredCard!==pal.name ? 0.6 : 1,
                        transition:"transform 0.28s cubic-bezier(.34,1.56,.64,1),box-shadow 0.25s,opacity 0.25s,border-color 0.2s",
                      }}>
                      <div className="card-counter">
                        <div style={{ display:"flex", justifyContent:"center", gap:4, marginBottom:"0.4rem" }}>
                          {[pal.bg, pal.primary, pal.accent].map((c,j) => (
                            <div key={j} style={{ width:14, height:14, borderRadius:"50%", background:c, border:`1px solid ${pal.surface}` }} />
                          ))}
                        </div>
                        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"0.78rem", color:pal.text, lineHeight:1.2, marginBottom:"0.1rem" }}>{pal.name}</div>
                        <div style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.48rem", color:pal.muted, letterSpacing:"0.07em", marginBottom:"0.45rem" }}>{pal.tag}</div>
                        <div style={{ padding:"0.22rem 0.55rem", background:pal.primary, color:pal.bg, borderRadius:100, display:"inline-block", fontSize:"0.48rem", fontFamily:"'Montserrat',sans-serif", fontWeight:700 }}>SELECT</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Center custom — fixed */}
              <div className="cc" onClick={() => setShowCustomBuilder(b => !b)}
                style={{
                  position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)",
                  width:152, height:152, borderRadius:"50%",
                  background: showCustomBuilder ? prev.card : "#FFFDF9",
                  border: showCustomBuilder ? `3px solid ${prev.primary}` : "2.5px dashed #A89880",
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                  zIndex:10, gap:"0.35rem", padding:"1rem",
                  boxShadow: showCustomBuilder ? `0 0 0 8px ${prev.primary}18,0 8px 30px ${prev.primary}30` : "0 4px 20px rgba(0,0,0,0.10)",
                }}>
                <div style={{ display:"flex", gap:5 }}>
                  {[customColors.bg, customColors.primary, customColors.text].map((c,i) => (
                    <div key={i} style={{ width:17, height:17, borderRadius:"50%", background:c, border:"1.5px solid #E0D8CE", transition:"background 0.3s" }} />
                  ))}
                </div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"1.05rem", color:"#2C2416", lineHeight:1 }}>Custom</div>
                <div style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.58rem", color:"#8C7A52", letterSpacing:"0.12em", fontWeight:600 }}>
                  {showCustomBuilder ? "✕ CLOSE" : "✏ BUILD"}
                </div>
              </div>
            </div>
            <p style={{ textAlign:"center", fontFamily:"'Montserrat',sans-serif", fontSize:"0.76rem", color:"#A09282", marginTop:"0.5rem", marginBottom:"2rem" }}>
              Hover to pause · click to select · center to build your own
            </p>
          </div>

          {/* MOBILE: 2-column grid */}
          <div className="mobile-grid">
            <div style={{ display:"flex", justifyContent:"center", marginBottom:"1.5rem" }}>
              <div onClick={() => setShowCustomBuilder(b => !b)}
                style={{ width:110, height:110, borderRadius:"50%", background: showCustomBuilder ? prev.card : "#FFFDF9", border: showCustomBuilder ? `3px solid ${prev.primary}` : "2.5px dashed #A89880", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"0.3rem", cursor:"pointer", boxShadow: showCustomBuilder ? `0 0 0 6px ${prev.primary}18` : "0 4px 16px rgba(0,0,0,0.08)" }}>
                <div style={{ display:"flex", gap:4 }}>
                  {[customColors.bg, customColors.primary, customColors.text].map((c,i) => (
                    <div key={i} style={{ width:13, height:13, borderRadius:"50%", background:c, border:"1.5px solid #E0D8CE" }} />
                  ))}
                </div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"0.9rem", color:"#2C2416" }}>Custom</div>
                <div style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.52rem", color:"#8C7A52", letterSpacing:"0.1em", fontWeight:600 }}>{showCustomBuilder ? "✕ CLOSE" : "✏ BUILD"}</div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem", padding:"0 0.25rem" }}>
              {PALETTES.map(pal => (
                <div key={pal.name} onClick={() => setPalette(pal)}
                  style={{ background:pal.card, border:`2px solid ${pal.surface}`, borderRadius:14, padding:"1rem 0.75rem", textAlign:"center", boxShadow:`0 4px 16px ${pal.text}10`, cursor:"pointer" }}>
                  <div style={{ display:"flex", justifyContent:"center", gap:5, marginBottom:"0.5rem" }}>
                    {[pal.bg, pal.primary, pal.accent].map((c,j) => (
                      <div key={j} style={{ width:16, height:16, borderRadius:"50%", background:c, border:`1px solid ${pal.surface}` }} />
                    ))}
                  </div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"0.85rem", color:pal.text, lineHeight:1.2, marginBottom:"0.1rem" }}>{pal.name}</div>
                  <div style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.52rem", color:pal.muted, letterSpacing:"0.07em", marginBottom:"0.5rem" }}>{pal.tag}</div>
                  <div style={{ padding:"0.25rem 0.65rem", background:pal.primary, color:pal.bg, borderRadius:100, display:"inline-block", fontSize:"0.52rem", fontFamily:"'Montserrat',sans-serif", fontWeight:700 }}>SELECT</div>
                </div>
              ))}
            </div>
            <p style={{ textAlign:"center", fontFamily:"'Montserrat',sans-serif", fontSize:"0.72rem", color:"#A09282", marginTop:"1rem" }}>
              Tap to select · or tap the circle to build your own
            </p>
          </div>

          {/* Custom builder panel */}
          {showCustomBuilder && (
            <div style={{ maxWidth:700, margin:"0 auto", background:prev.card, border:`1.5px solid ${prev.primary}50`, borderRadius:20, padding:"1.75rem", boxShadow:`0 8px 40px ${prev.primary}22`, animation:"fadeUp 0.3s ease" }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"1.4rem", color:prev.text, marginBottom:"0.2rem" }}>Build Your Palette</div>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.8rem", color:prev.muted, marginBottom:"1.5rem", marginTop:0 }}>Select a color slot, then use the picker or type a hex value.</p>
              <div style={{ display:"flex", gap:"0.75rem", marginBottom:"1.25rem", flexWrap:"wrap" }}>
                {[{key:"bg",label:"Background"},{key:"primary",label:"Accent / Brand"},{key:"text",label:"Text Color"}].map(({key,label}) => (
                  <div key={key} onClick={() => setActiveColorKey(key)}
                    style={{ display:"flex", alignItems:"center", gap:"0.5rem", padding:"0.5rem 1rem", borderRadius:100, border:`1.5px solid ${activeColorKey===key ? prev.primary : prev.surface}`, background: activeColorKey===key ? prev.primary+"15" : "transparent", cursor:"pointer", fontFamily:"'Montserrat',sans-serif", fontSize:"0.78rem", fontWeight:600, color: activeColorKey===key ? prev.primary : prev.muted, transition:"all 0.2s" }}>
                    <div style={{ width:14, height:14, borderRadius:"50%", background:customColors[key], border:`1.5px solid ${prev.surface}` }} />
                    {label}
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1.25rem" }}>
                <div style={{ position:"relative", width:56, height:56, borderRadius:14, overflow:"hidden", border:`2px solid ${prev.surface}`, flexShrink:0 }}>
                  <input type="color" value={customColors[activeColorKey]} onChange={e => handleColorPick(activeColorKey, e.target.value)}
                    style={{ position:"absolute", top:-8, left:-8, width:72, height:72, border:"none", padding:0, cursor:"pointer" }} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.72rem", fontWeight:600, color:prev.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.3rem" }}>
                    {activeColorKey==="bg" ? "Background" : activeColorKey==="primary" ? "Accent / Brand" : "Text"} — Hex
                  </div>
                  <input type="text" value={hexInputs[activeColorKey]} onChange={e => handleHexInput(activeColorKey, e.target.value)} maxLength={7} placeholder="#000000"
                    style={{ width:"100%", padding:"0.6rem 0.9rem", background:prev.bg, border:`1.5px solid ${/^#[0-9A-Fa-f]{6}$/.test(hexInputs[activeColorKey]) ? prev.primary : prev.surface}`, borderRadius:8, color:prev.text, fontSize:"1rem", fontFamily:"monospace", outline:"none", boxSizing:"border-box", letterSpacing:"0.06em" }} />
                  <div style={{ fontSize:"0.66rem", color:/^#[0-9A-Fa-f]{6}$/.test(hexInputs[activeColorKey]) ? prev.primary : prev.muted, fontFamily:"'Montserrat',sans-serif", marginTop:"0.2rem" }}>
                    {/^#[0-9A-Fa-f]{6}$/.test(hexInputs[activeColorKey]) ? "✓ Valid hex" : "e.g. #C4727A"}
                  </div>
                </div>
              </div>
              <div style={{ marginBottom:"1.5rem" }}>
                <div style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.7rem", fontWeight:600, color:prev.muted, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"0.6rem" }}>Quick Swatches</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                  {SWATCHES.map((swatch,i) => {
                    const isActive = customColors[activeColorKey]===swatch;
                    return (
                      <div key={i} onClick={() => handleColorPick(activeColorKey, swatch)}
                        style={{ width:30, height:30, borderRadius:"50%", background:swatch, border: isActive ? `3px solid ${prev.primary}` : "2px solid rgba(0,0,0,0.08)", cursor:"pointer", transition:"transform 0.15s,border 0.15s", transform: isActive ? "scale(1.25)" : "scale(1)", boxShadow: isActive ? `0 0 0 2px ${prev.card},0 0 0 4px ${prev.primary}` : "none" }} />
                    );
                  })}
                </div>
              </div>
              <div style={{ background:prev.bg, border:`1px solid ${prev.surface}`, borderRadius:12, padding:"1rem 1.25rem", marginBottom:"1.25rem" }}>
                <div style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.68rem", color:prev.muted, textTransform:"uppercase", letterSpacing:"0.15em", marginBottom:"0.6rem" }}>Live Preview</div>
                <div style={{ display:"flex", alignItems:"center", gap:"0.9rem", flexWrap:"wrap" }}>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"1.1rem", color:prev.text }}>Your Wedding Story</div>
                  <div style={{ padding:"0.35rem 1rem", background:prev.primary, color:prev.bg, borderRadius:100, fontSize:"0.7rem", fontFamily:"'Montserrat',sans-serif", fontWeight:600 }}>Button</div>
                  <div style={{ display:"flex", gap:5 }}>
                    {[prev.bg,prev.primary,prev.accent,prev.text,prev.muted].map((c,i) => (
                      <div key={i} style={{ width:18, height:18, borderRadius:"50%", background:c, border:`1px solid ${prev.surface}` }} />
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => { setPalette(buildCustomPalette(customColors.bg,customColors.primary,customColors.text)); setShowCustomBuilder(false); }}
                style={{ background:prev.primary, color:prev.bg, border:"none", borderRadius:100, padding:"0.8rem 2.25rem", fontSize:"0.85rem", fontFamily:"'Montserrat',sans-serif", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", cursor:"pointer" }}>
                Use This Palette →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── SUBMITTED ──
  if (submitted) {
    return (
      <div style={{ ...S.app, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem" }}>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet" />
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✦</div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: p.primary, marginBottom: "0.5rem" }}>You're All Set</h1>
        <p style={{ color: p.muted, fontFamily: "'Montserrat',sans-serif", maxWidth: 440 }}>
          Thanks, <strong>{form.name}</strong>. We'll review your details and reach out within 24–48 hours.
        </p>
        <div style={{ marginTop: "2rem", padding: "1rem 2rem", background: p.surface, borderRadius: 12, fontFamily: "'Montserrat',sans-serif", fontSize: "0.85rem", color: p.muted }}>
          📧 Confirmation to <strong>{form.email}</strong>
        </div>
        <button style={{ ...S.btn, marginTop: "2rem" }} onClick={() => { setSubmitted(false); setStep(0); setForm(initialForm); setPalette(null); }}>
          Start New Inquiry
        </button>
      </div>
    );
  }

  // ── STEP CONTENT ──
  const renderStep = () => {
    switch (step) {
      case 0: return (
        <>
          <h2 style={S.sectionTitle}>Tell us about your event</h2>
          <p style={S.sectionSub}>The basics to get us started.</p>
          <div style={S.fieldGroup}>
            <label style={S.label}>Event Type</label>
            <div>{["Wedding","Engagement","Corporate Event","Birthday / Milestone","Concert / Performance","Other"].map(t => (
              <span key={t} style={S.chip(form.eventType===t)} onClick={()=>set("eventType",t)}>{t}</span>
            ))}</div>
            {form.eventType === "Other" && (
              <div style={{ marginTop: "0.75rem" }}>
                <input style={S.input} placeholder="Describe your event..." value={form.otherEventType} onChange={e=>set("otherEventType",e.target.value)} autoFocus />
              </div>
            )}
          </div>
          <div style={S.grid2}>
            <div style={S.fieldGroup}>
              <label style={S.label}>Event Date</label>
              <input type="date" style={S.input} value={form.eventDate} onChange={e=>set("eventDate",e.target.value)} />
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Guest Count</label>
              <select style={S.select} value={form.guestCount} onChange={e=>set("guestCount",e.target.value)}>
                <option value="">Select...</option>
                {["Under 50","50–100","100–200","200–300","300+"].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Venue Name</label>
            <input style={S.input} placeholder="e.g. The Grand Ballroom" value={form.venueName} onChange={e=>set("venueName",e.target.value)} />
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Venue City & State</label>
            <input style={S.input} placeholder="e.g. Cleveland, OH" value={form.venueCity} onChange={e=>set("venueCity",e.target.value)} />
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Event Length</label>
            <select style={S.select} value={form.ceremonyLength} onChange={e=>set("ceremonyLength",e.target.value)}>
              <option value="">Select...</option>
              {["Under 1 hour","1–2 hours","2–4 hours","4–6 hours","Full Day (6–10 hours)","Multi-Day"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        </>
      );
      case 1: return (
        <>
          <h2 style={S.sectionTitle}>What coverage do you need?</h2>
          <p style={S.sectionSub}>Select everything that applies.</p>
          <div style={S.fieldGroup}>
            <label style={S.label}>Coverage Type</label>
            {[["Photography Only","High-res edited photos delivered digitally"],["Videography Only","Professional video coverage and editing"],["Photo + Video Bundle","Full coverage — best value"],["Highlight Reel","3–5 min cinematic recap"],["Full Ceremony Film","Uncut or lightly edited full ceremony"],["Reception Coverage","Speeches, dances, reception moments"],["Same-Day Edit","Quick-turn reel delivered same night"],["Social Media Clips","Short vertical clips ready to post"]].map(([t,d])=>(
              <div key={t} style={S.optionCard(form.packageType.includes(t))} onClick={()=>toggleArr("packageType",t)}>
                <div style={S.optionTitle(form.packageType.includes(t))}>{t}</div>
                <div style={S.optionDesc}>{d}</div>
              </div>
            ))}
          </div>
          <div style={S.grid2}>
            <div style={S.fieldGroup}>
              <label style={S.label}>Videographers</label>
              <select style={S.select} value={form.videographerCount} onChange={e=>set("videographerCount",e.target.value)}>
                {["1","2","3+"].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={S.fieldGroup}>
              <label style={S.label}>Locations</label>
              <select style={S.select} value={form.locations} onChange={e=>set("locations",e.target.value)}>
                {["1","2","3","4+"].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </>
      );
      case 2: return (
        <>
          <h2 style={S.sectionTitle}>Your editing style</h2>
          <p style={S.sectionSub}>Help us match the look to your vision.</p>
          <div style={S.fieldGroup}>
            <label style={S.label}>Editing Style</label>
            {[["Cinematic","Film-like, dramatic, story-driven"],["Documentary","Natural, candid, real moments"],["Editorial","Clean, modern, fashion-forward"],["Romantic & Soft","Warm tones, emotional, classic"],["Energetic & Fun","Fast cuts, music-driven, vibrant"],["Other / Not Sure","Tell us in your own words"]].map(([t,d])=>(
              <div key={t} style={S.optionCard(form.editingStyle===t)} onClick={()=>set("editingStyle",t)}>
                <div style={S.optionTitle(form.editingStyle===t)}>{t}</div>
                <div style={S.optionDesc}>{d}</div>
              </div>
            ))}
            {form.editingStyle === "Other / Not Sure" && (
              <input style={{...S.input, marginTop:"0.5rem"}} placeholder="Describe the style you're going for..." value={form.otherEditingStyle} onChange={e=>set("otherEditingStyle",e.target.value)} autoFocus />
            )}
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Color Grading</label>
            <div>{["Warm & Golden","Cool & Moody","Natural / True-to-Life","Bright & Airy","Dark & Dramatic","Black & White","No Preference","Other"].map(t=>(
              <span key={t} style={S.chip(form.colorGrading===t)} onClick={()=>set("colorGrading",t)}>{t}</span>
            ))}</div>
            {form.colorGrading === "Other" && (
              <input style={{...S.input, marginTop:"0.75rem"}} placeholder="Describe the color grading style or paste a reference link here..." value={form.otherColorGrading||""} onChange={e=>set("otherColorGrading",e.target.value)} autoFocus />
            )}
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Social Media Format</label>
            <div>{["Vertical (9:16)","Horizontal (16:9)","Both"].map(t=>(
              <span key={t} style={S.chip(form.socialFormats.includes(t))} onClick={()=>toggleArr("socialFormats",t)}>{t}</span>
            ))}</div>
          </div>
        </>
      );
      case 3: return (
        <>
          <h2 style={S.sectionTitle}>Music & sound</h2>
          <p style={S.sectionSub}>Music sets the whole tone of your film.</p>
          <div style={S.fieldGroup}>
            <label style={S.label}>Specific song in mind?</label>
            <input style={S.input} placeholder="Song title & artist, or Spotify/Apple Music link" value={form.songChoice} onChange={e=>set("songChoice",e.target.value)} />
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Music Genre / Vibe</label>
            <div>{["Pop / Top 40","R&B / Soul","Hip-Hop","Country","Classical / Orchestral","Indie / Alternative","Jazz","Dance / Electronic","No Preference","Other"].map(t=>(
              <span key={t} style={S.chip(form.musicGenre===t)} onClick={()=>set("musicGenre",t)}>{t}</span>
            ))}</div>
            {form.musicGenre === "Other" && (
              <div style={{ marginTop: "0.75rem" }}>
                <input style={S.input} placeholder="Describe the vibe or name a specific artist..." value={form.otherSong} onChange={e=>set("otherSong",e.target.value)} autoFocus />
              </div>
            )}
          </div>
        </>
      );
      case 4: return (
        <>
          <h2 style={S.sectionTitle}>Add-ons & extras</h2>
          <p style={S.sectionSub}>Anything to take it to the next level.</p>
          <div style={S.fieldGroup}>
            <label style={S.label}>Select any extras</label>
            {[["Drone / Aerial Footage","FAA-compliant drone shots"],["Slow Motion Footage","120fps+ for dramatic slow-mo"],["Custom Intro / Logo Animation","Branded opener for your video"],["Photo Slideshow Video","Animated slideshow set to music"],["Raw Footage Delivery","Unedited footage on a hard drive"],["Behind-the-Scenes Content","Candid BTS clips for social media"],["Livestream Setup","Live broadcast for remote guests"],["Photo Booth Setup","Instant-print booth with custom template"],["Thank You Video","Short edited video for post-event sharing"],["Rush Delivery","Expedited turnaround — fees may apply"],
                ["Other","Something not listed above — describe it below"]].map(([t,d])=>(
              <div key={t} style={S.optionCard(form.extras.includes(t))} onClick={()=>toggleArr("extras",t)}>
                <div style={S.optionTitle(form.extras.includes(t))}>{t}</div>
                <div style={S.optionDesc}>{d}</div>
              </div>
            ))}
            {form.extras.includes("Other") && (
              <input style={{...S.input, marginTop:"0.25rem", marginBottom:"0.75rem"}} placeholder="Describe your additional request..." value={form.otherExtra} onChange={e=>set("otherExtra",e.target.value)} />
            )}
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Anything else?</label>
            <textarea style={{...S.input,minHeight:100,resize:"vertical"}} placeholder="Custom requests, special notes..." value={form.customNotes} onChange={e=>set("customNotes",e.target.value)} />
          </div>
        </>
      );
      case 5: return (
        <>
          <h2 style={S.sectionTitle}>Logistics & contact</h2>
          <p style={S.sectionSub}>Almost done — just a few final details.</p>
          <div style={S.fieldGroup}>
            <label style={S.label}>Turnaround Time</label>
            <div>{["1 Week","2 Weeks","3–4 Weeks","6–8 Weeks","No Rush","Rush (extra fee)"].map(t=>(
              <span key={t} style={S.chip(form.turnaround===t)} onClick={()=>set("turnaround",t)}>{t}</span>
            ))}</div>
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Delivery Format</label>
            <div>{["Online Gallery / Download Link","USB Drive","Hard Drive","Cloud Storage (Google Drive / Dropbox)","DVD","Other"].map(t=>(
              <span key={t} style={S.chip(form.deliveryFormat.includes(t))} onClick={()=>toggleArr("deliveryFormat",t)}>{t}</span>
            ))}</div>
            {form.deliveryFormat.includes("Other") && (
              <div style={{ marginTop: "0.75rem" }}>
                <input style={S.input} placeholder="Describe your preferred delivery method..." value={form.otherDelivery} onChange={e=>set("otherDelivery",e.target.value)} autoFocus />
              </div>
            )}
          </div>
          <div style={S.fieldGroup}>
            <label style={S.label}>Approximate Budget</label>
            <select style={S.select} value={form.budget} onChange={e=>set("budget",e.target.value)}>
              <option value="">Select a range...</option>
              {["Under $500","$500–$1,000","$1,000–$2,000","$2,000–$3,500","$3,500–$5,000","$5,000–$7,500","$7,500–$10,000","$10,000–$15,000","$15,000–$20,000","$20,000+","Flexible / Let's talk"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={{marginTop:"1.5rem",paddingTop:"1.5rem",borderTop:`1px solid ${p.surface}`}}>
            <h3 style={{fontWeight:700,marginBottom:"1rem",fontSize:"1.2rem"}}>Your contact info</h3>
            <div style={S.fieldGroup}>
              <label style={S.label}>Full Name</label>
              <input style={S.input} placeholder="Your full name" value={form.name} onChange={e=>set("name",e.target.value)} />
            </div>
            <div style={S.grid2}>
              <div style={S.fieldGroup}>
                <label style={S.label}>Email</label>
                <input type="email" style={S.input} placeholder="you@email.com" value={form.email} onChange={e=>set("email",e.target.value)} />
              </div>
              <div style={S.fieldGroup}>
                <label style={S.label}>Phone</label>
                <input type="tel" style={S.input} placeholder="(555) 000-0000" value={form.phone} onChange={e=>set("phone",e.target.value)} />
              </div>
            </div>
          </div>
        </>
      );
      case 6: {
        const rows = [
          ["Event Type",form.eventType],["Event Date",form.eventDate],
          ["Venue",[form.venueName,form.venueCity].filter(Boolean).join(", ")],
          ["Guest Count",form.guestCount],["Event Length",form.ceremonyLength],
          ["Coverage",form.packageType.join(", ")],["Videographers",form.videographerCount],
          ["Locations",form.locations],["Editing Style",form.editingStyle],
          ["Color Grading",form.colorGrading],["Social Formats",form.socialFormats.join(", ")],
          ["Song / Music",form.songChoice||form.musicGenre],
          ["Color Grading (other)",form.otherColorGrading],["Extras",form.extras.join(", ")],
          ["Turnaround",form.turnaround],["Delivery",form.deliveryFormat.join(", ")],
          ["Budget",form.budget],["Palette",p.name],
          ["Name",form.name],["Email",form.email],["Phone",form.phone],["Notes",form.customNotes],
        ].filter(([,v])=>v);
        return (
          <>
            <h2 style={S.sectionTitle}>Review your inquiry</h2>
            <p style={S.sectionSub}>Everything look good? Hit submit and we'll be in touch.</p>
            {rows.map(([k,v])=>(
              <div key={k} style={S.summaryRow}>
                <span style={S.summaryKey}>{k}</span>
                <span style={S.summaryVal}>{v}</span>
              </div>
            ))}
            <div style={{marginTop:"2rem",padding:"1rem",background:p.primary+"14",borderRadius:12,fontFamily:"'Montserrat',sans-serif",fontSize:"0.85rem",color:p.primary,borderLeft:`3px solid ${p.primary}`}}>
              ✦ Your palette — <strong>{p.name}</strong> — will be reflected in your final deliverables.
            </div>
          </>
        );
      }
      default: return null;
    }
  };

  // ── MAIN FORM ──
  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={S.header}>
        <span style={S.logo}>TTHEW Studios</span>
        <h1 style={S.title}>Build Your Package</h1>
        <p style={S.subtitle}>Wedding & Event Photo + Video</p>
      </div>
      <div style={S.container}>
        <div style={S.stepLabel}>{STEPS[step]} — Step {step+1} of {STEPS.length}</div>
        <div style={S.progressBar}><div style={S.progressFill} /></div>
        <div style={S.card}>{renderStep()}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"0.75rem"}}>
          <div>
            {step === 0
              ? <button style={S.btnOutline} onClick={()=>setPalette(null)}>← Palette</button>
              : <button style={S.btnOutline} onClick={()=>setStep(s=>s-1)}>← Back</button>
            }
          </div>
          {step<STEPS.length-1
            ? <button style={S.btn} onClick={()=>setStep(s=>s+1)}>Continue →</button>
            : (
            <div style={{textAlign:"right"}}>
              {sendError && (
                <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:"0.78rem",color:"#C45A5A",marginBottom:"0.5rem"}}>
                  ⚠ Couldn't send — check your EmailJS setup or try again.
                </div>
              )}
              <button style={{...S.btn, opacity: sending ? 0.6 : 1}} onClick={handleSubmit} disabled={sending}>
                {sending ? "Sending..." : "Submit Inquiry ✦"}
              </button>
            </div>
          )
          }
        </div>
      </div>
    </div>
  );
}
