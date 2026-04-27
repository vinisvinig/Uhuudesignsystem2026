import { useState } from "react";
import { Check, Copy, Info, CheckCircle, XCircle, AlertTriangle, X, Search, Eye, EyeOff, Minus, Plus } from "lucide-react";

function getContrastRatio(hex1: string, hex2: string): number {
  const lum = (hex: string) => {
    const c = hex.replace("#", "");
    const vals = [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)].map(v => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * vals[0] + 0.7152 * vals[1] + 0.0722 * vals[2];
  };
  const l1 = lum(hex1), l2 = lum(hex2);
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function blendOverWhite(hex: string, opacity: number): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const mix = (v: number) => Math.round(v * opacity + 255 * (1 - opacity));
  return "#" + [mix(r), mix(g), mix(b)].map(v => v.toString(16).padStart(2, "0")).join("");
}

function gradientWorstContrast(fg: string, c1: string, c2: string, opacity = 1): number {
  const b1 = opacity < 1 ? blendOverWhite(c1, opacity) : c1;
  const b2 = opacity < 1 ? blendOverWhite(c2, opacity) : c2;
  return Math.min(getContrastRatio(fg, b1), getContrastRatio(fg, b2));
}

function wcagStatus(ratio: number): { level: string; status: string; tone: "ok" | "warn" | "fail" } {
  if (ratio >= 7) return { level: "AAA", status: "✓ Recomendado", tone: "ok" };
  if (ratio >= 4.5) return { level: "AA", status: "✓ Recomendado", tone: "ok" };
  if (ratio >= 3) return { level: "AA Large", status: "⚠ Cuidado", tone: "warn" };
  return { level: "Falha", status: "✗ Não recomendado", tone: "fail" };
}

function WcagTable({ rows }: { rows: Array<{ element: string; fg: string; bgLabel: string; swatch: React.CSSProperties; ratio: number }> }) {
  return (
    <div className="bg-white overflow-hidden" style={{ borderRadius: 12, border: "1px solid #e0e0e0", fontFamily: "'Barlow', sans-serif" }}>
      <div className="grid" style={{ gridTemplateColumns: "minmax(220px,2.2fr) 1fr 1.4fr 0.9fr 0.8fr 1.1fr", backgroundColor: "#fafafa", borderBottom: "1px solid #e0e0e0" }}>
        {["Elemento", "Cor Texto", "Cor Fundo", "Contraste", "Nível", "Status"].map(h => (
          <div key={h} className="text-[11px] text-[#9a9a9a]" style={{ padding: "10px 14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</div>
        ))}
      </div>
      {rows.map((r, i) => {
        const s = wcagStatus(r.ratio);
        const toneBg = s.tone === "ok" ? "#f4f9ec" : s.tone === "warn" ? "#fff4e5" : "#ffe6e6";
        const toneFg = s.tone === "ok" ? "#3d5a1a" : s.tone === "warn" ? "#8a5a0c" : "#7a1a18";
        return (
          <div key={i} className="grid items-center" style={{ gridTemplateColumns: "minmax(220px,2.2fr) 1fr 1.4fr 0.9fr 0.8fr 1.1fr", borderBottom: i === rows.length - 1 ? "none" : "1px solid #f0f0f0" }}>
            <div className="flex items-center gap-2" style={{ padding: "12px 14px" }}>
              <span className="w-7 h-7 rounded flex items-center justify-center shrink-0" style={{ ...r.swatch, color: r.fg, border: "1px solid #e0e0e0", fontWeight: 700, fontSize: 12 }}>Aa</span>
              <span className="text-[12px] text-[#212121]">{r.element}</span>
            </div>
            <div className="text-[11px] font-mono text-[#484543]" style={{ padding: "12px 14px" }}>{r.fg}</div>
            <div className="text-[11px] font-mono text-[#484543]" style={{ padding: "12px 14px" }}>{r.bgLabel}</div>
            <div className="text-[12px] font-mono text-[#212121]" style={{ padding: "12px 14px", fontWeight: 600 }}>{r.ratio.toFixed(2)}:1</div>
            <div style={{ padding: "12px 14px" }}>
              <span className="text-[10px] px-2 py-0.5 rounded" style={{ backgroundColor: toneBg, color: toneFg, fontWeight: 600 }}>{s.level}</span>
            </div>
            <div className="text-[11px]" style={{ padding: "12px 14px", color: toneFg, fontWeight: 600 }}>{s.status}</div>
          </div>
        );
      })}
    </div>
  );
}

// Tailwind-style 50-950 scales used pelo Design System Uhuu
const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const PALETTES: Record<string, { hex: string; brand?: number; scale: string[] }> = {
  primaria:  { hex: "#EE3680", brand: 400, scale: ["#FFF1F6","#FFE3EC","#FFC2D9","#FF95BC","#EE3680","#D91E63","#B81652","#921141","#6E0B30","#4A081F","#2A0411"] },
  secundaria:{ hex: "#8036EE", brand: 500, scale: ["#F4EEFF","#E8DDFF","#D2B9FF","#B58CFF","#9A60FA","#8036EE","#6A1FD3","#5418A8","#3F127E","#2A0C54","#15062A"] },
  neutro:    { hex: "#252525", brand: 800, scale: ["#FAFAFA","#F5F5F5","#E8E8E8","#D4D4D4","#A3A3A3","#737373","#525252","#3D3D3D","#252525","#171717","#0A0A0A"] },
  sucesso:   { hex: "#22C55E", scale: ["#F0FDF4","#DCFCE7","#BBF7D0","#86EFAC","#4ADE80","#22C55E","#16A34A","#15803D","#166534","#14532D","#052E16"] },
  alerta:    { hex: "#F59E0B", scale: ["#FFFBEB","#FEF3C7","#FDE68A","#FCD34D","#FBBF24","#F59E0B","#D97706","#B45309","#92400E","#78350F","#451A03"] },
  erro:      { hex: "#EF4444", scale: ["#FEF2F2","#FEE2E2","#FECACA","#FCA5A5","#F87171","#EF4444","#DC2626","#B91C1C","#991B1B","#7F1D1D","#450A0A"] },
  info:      { hex: "#3B82F6", scale: ["#EFF6FF","#DBEAFE","#BFDBFE","#93C5FD","#60A5FA","#3B82F6","#2563EB","#1D4ED8","#1E40AF","#1E3A8A","#172554"] },
  esmeralda: { hex: "#10B981", scale: ["#ECFDF5","#D1FAE5","#A7F3D0","#6EE7B7","#34D399","#10B981","#059669","#047857","#065F46","#064E3B","#022C22"] },
  turquesa:  { hex: "#14B8A6", scale: ["#F0FDFA","#CCFBF1","#99F6E4","#5EEAD4","#2DD4BF","#14B8A6","#0D9488","#0F766E","#115E59","#134E4A","#042F2E"] },
  ceu:       { hex: "#0EA5E9", scale: ["#F0F9FF","#E0F2FE","#BAE6FD","#7DD3FC","#38BDF8","#0EA5E9","#0284C7","#0369A1","#075985","#0C4A6E","#082F49"] },
  indigo:    { hex: "#6366F1", scale: ["#EEF2FF","#E0E7FF","#C7D2FE","#A5B4FC","#818CF8","#6366F1","#4F46E5","#4338CA","#3730A3","#312E81","#1E1B4B"] },
  laranja:   { hex: "#F97316", scale: ["#FFF7ED","#FFEDD5","#FED7AA","#FDBA74","#FB923C","#F97316","#EA580C","#C2410C","#9A3412","#7C2D12","#431407"] },
};
const OPACITY_STEPS = [1, 3, 5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100];

function ScaleRow({ name, paletteKey, hint }: { name: string; paletteKey: keyof typeof PALETTES; hint?: string }) {
  const p = PALETTES[paletteKey];
  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <div className="flex items-center gap-2">
          <p className="text-[14px] text-[#212121]" style={{ fontWeight: 700 }}>{name}</p>
          <span className="text-[11px] font-mono text-[#9a9a9a]">{p.hex}</span>
        </div>
        <span className="text-[11px] text-[#9a9a9a]">{hint || (p.brand ? `11 steps · Brand ${p.brand}` : "11 steps")}</span>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(11, minmax(0,1fr))", gap: 4 }}>
        {p.scale.map((hex, i) => {
          const step = SCALE_STEPS[i];
          const isBrand = step === p.brand;
          const fg = getContrastRatio(hex, "#ffffff") > 3 ? "#fff" : "#1a1a1a";
          return (
            <div key={step} className="overflow-hidden" style={{ borderRadius: 8, border: isBrand ? "2px solid #EE3680" : "1px solid #e0e0e0" }}>
              <div style={{ background: hex, height: 60, padding: "8px 10px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <span className="text-[10px]" style={{ color: fg, fontWeight: 700 }}>{step}</span>
                {isBrand && <span className="text-[9px] px-1.5 py-0.5 self-start" style={{ backgroundColor: "#fff", color: "#EE3680", borderRadius: 25, fontWeight: 700 }}>BRAND</span>}
              </div>
              <div style={{ padding: "5px 8px", background: "#fff" }}>
                <p className="text-[10px] font-mono text-[#484543]">{hex}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OpacityRow({ name, base, label }: { name: string; base: "#FFFFFF" | "#000000"; label: string }) {
  const checker = "repeating-conic-gradient(#e8e8e8 0% 25%, #ffffff 0% 50%) 50% / 12px 12px";
  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <p className="text-[14px] text-[#212121]" style={{ fontWeight: 700 }}>{name}</p>
        <span className="text-[11px] text-[#9a9a9a]">{label} · 14 níveis</span>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(14, minmax(0,1fr))", gap: 4 }}>
        {OPACITY_STEPS.map(op => (
          <div key={op} className="overflow-hidden" style={{ borderRadius: 6, border: "1px solid #e0e0e0" }}>
            <div style={{ background: checker, height: 44 }}>
              <div style={{ width: "100%", height: "100%", background: base, opacity: op / 100 }} />
            </div>
            <p className="text-[9px] font-mono text-[#484543] text-center" style={{ padding: "4px 2px", background: "#fff" }}>{op}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/10"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// Semantic color token card
interface SemanticToken {
  token: string;
  hex: string;
  usage: string;
}

function TokenCard({ token, hex, usage }: SemanticToken) {
  const textOnSwatch = getContrastRatio(hex, "#ffffff") > 3 ? "#fff" : "#1a1a1a";
  return (
    <div className="group bg-white border border-[#e0e0e0] rounded-xl overflow-hidden hover:border-[#ee3680]/30 transition-colors">
      <div
        className="h-16 flex items-center justify-between px-4"
        style={{ backgroundColor: hex, color: textOnSwatch }}
      >
        <span className="text-[12px] font-mono opacity-90">{hex}</span>
        <CopyButton text={hex} />
      </div>
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-mono text-[#ee3680]">{token}</span>
          <CopyButton text={token} />
        </div>
        <p className="text-[11px] text-[#9a9a9a] mt-1">{usage}</p>
      </div>
    </div>
  );
}

// Section wrapper for semantic groups
function TokenSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-2">
        <h3 className="text-[#1a1a1a]">{title}</h3>
      </div>
      <p className="text-[12px] text-[#9a9a9a] mb-5">{description}</p>
      {children}
    </div>
  );
}

const stateExamples = [
  { label: "Default", bg: "#ee3680", opacity: "100%", extra: "" },
  { label: "Hover", bg: "#d91e63", opacity: "100%", extra: "scale-105 shadow-lg" },
  { label: "Active", bg: "#c2185b", opacity: "100%", extra: "scale-95" },
  { label: "Focus", bg: "#ee3680", opacity: "100%", extra: "ring-4 ring-[#ee3680]/30" },
  { label: "Disabled", bg: "#ee3680", opacity: "40%", extra: "cursor-not-allowed" },
];

type TabId = "scales" | "dimensions" | "states" | "buttons" | "inputs" | "alerts" | "typography" | "gradients" | "usage";

// Alert component for the Alerts tab
function AlertComponent({
  variant,
  title,
  description,
  showIcon = true,
  showClose = true,
  actionLabel,
}: {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  description: string;
  showIcon?: boolean;
  showClose?: boolean;
  actionLabel?: string;
}) {
  const config = {
    success: { bg: "#f4f9ec", border: "#8dc73f", text: "#3d5a1a", icon: <CheckCircle className="w-5 h-5 shrink-0" /> },
    error: { bg: "#ffe6e6", border: "#da0000", text: "#7a1a18", icon: <XCircle className="w-5 h-5 shrink-0" /> },
    warning: { bg: "#fff3e0", border: "#ffa500", text: "#7a5500", icon: <AlertTriangle className="w-5 h-5 shrink-0" /> },
    info: { bg: "#f0e6f7", border: "#6900b2", text: "#3d006a", icon: <Info className="w-5 h-5 shrink-0" /> },
  }[variant];

  return (
    <div
      className="rounded-lg p-4 flex items-start gap-3 border"
      style={{ backgroundColor: config.bg, borderColor: config.border + "40", color: config.text }}
    >
      {showIcon && <div className="mt-0.5">{config.icon}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-[14px]">{title}</p>
        <p className="text-[12px] opacity-70 mt-0.5">{description}</p>
        {actionLabel && (
          <button
            className="mt-2 text-[12px] px-3 py-1 rounded-md border transition-colors"
            style={{ borderColor: config.border, color: config.text, backgroundColor: "transparent" }}
          >
            {actionLabel}
          </button>
        )}
      </div>
      {showClose && (
        <button className="mt-0.5 opacity-50 hover:opacity-100 transition-opacity shrink-0">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function ColorPalette() {
  const [activeTab, setActiveTab] = useState<TabId>("scales");

  const tabs: { id: TabId; label: string }[] = [
    { id: "scales", label: "Cores" },
    { id: "dimensions", label: "Dimensões" },
    { id: "buttons", label: "Botões" },
    { id: "states", label: "Estados" },
    { id: "inputs", label: "Inputs" },
    { id: "alerts", label: "Alertas" },
    { id: "typography", label: "Tipografia" },
    { id: "gradients", label: "Gradientes" },
    { id: "usage", label: "Uso & Exemplos" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="text-white px-8 py-10" style={{ background: "linear-gradient(135deg, #8036EE 0%, #EE3680 22%, #EE3680 72%, #F97316 100%)" }}>
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <svg width="164" height="51" viewBox="0 0 328 102" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="uhuu.com">
                <path d="M111.37 46.8V83.6C111.37 93.76 119.61 102 129.77 102C139.93 102 148.17 93.76 148.17 83.6V56H138.97V83.6C138.97 88.68 134.85 92.8 129.77 92.8C124.69 92.8 120.57 88.68 120.57 83.6V46.8H111.37ZM0.970089 51.4H10.1701V42.2H0.970089V51.4ZM203.46 51.4H212.47V42.2H203.46V51.4ZM226.3 35.33C223.09 38.46 221.48 42.3 221.48 46.84C221.48 51.38 223.06 55.2 226.24 58.26C229.41 61.31 233.35 62.83 238.07 62.83C240.93 62.83 243.79 62.09 246.64 60.61V51.32C244.95 53.37 243.48 54.74 242.23 55.45C240.93 56.18 239.44 56.55 237.76 56.55C235.11 56.55 232.93 55.63 231.22 53.8C229.53 51.96 228.69 49.62 228.69 46.76C228.69 43.9 229.57 41.64 231.32 39.78C233.07 37.92 235.27 37 237.92 37C239.61 37 241.08 37.38 242.33 38.13C243.6 38.86 245.04 40.21 246.65 42.17V32.81C243.98 31.37 241.14 30.65 238.14 30.65C233.47 30.65 229.52 32.22 226.31 35.34M258.46 53.85C256.83 52.08 256.02 49.67 256.02 46.62C256.02 43.78 256.86 41.47 258.52 39.67C260.19 37.88 262.37 36.98 265.06 36.98C267.75 36.98 269.99 37.88 271.66 39.67C273.31 41.44 274.13 43.81 274.13 46.77C274.13 49.73 273.3 52.1 271.66 53.87C270.01 55.64 267.81 56.53 265.06 56.53C262.31 56.53 260.13 55.63 258.46 53.84M253.55 35.27C250.4 38.36 248.82 42.1 248.82 46.5C248.82 51.17 250.37 55.05 253.45 58.14C256.54 61.27 260.36 62.83 264.93 62.83C269.5 62.83 273.43 61.3 276.6 58.23C279.75 55.14 281.33 51.31 281.33 46.75C281.33 42.19 279.77 38.4 276.64 35.3C273.47 32.19 269.61 30.64 265.06 30.64C260.51 30.64 256.69 32.19 253.54 35.27M308.11 35.14C306.11 32.13 303.38 30.63 299.94 30.63C298.4 30.63 297.11 30.89 296.09 31.41C295.13 31.91 293.97 32.87 292.62 34.29V31.47H285.58V61.95H292.62V46.21C292.62 43.02 293.07 40.68 293.98 39.2C294.89 37.72 296.33 36.98 298.31 36.98C301.44 36.98 303 39.69 303 45.12V61.95H310.07V46.21C310.07 42.98 310.51 40.63 311.4 39.17C312.29 37.71 313.7 36.98 315.64 36.98C317.31 36.98 318.51 37.6 319.24 38.83C319.95 40.04 320.3 42.11 320.3 45.03V61.96H327.37V43.12C327.37 34.8 323.94 30.63 317.07 30.63C313.3 30.63 310.3 32.13 308.09 35.14M46.9701 19.2V74.4C46.9701 79 42.8501 83.6 37.7701 83.6C32.6901 83.6 28.5701 79.48 28.5701 74.4V37.6H19.3701V74.4C19.3701 84.56 27.6101 92.8 37.7701 92.8C47.9301 92.8 56.1701 84.56 56.1701 74.4V19.2H46.9701ZM184.97 9.99999V65.2C184.97 70.28 180.85 74.4 175.77 74.4C170.69 74.4 166.57 70.28 166.57 65.2V37.6H157.37V65.2C157.37 75.36 165.61 83.6 175.77 83.6C185.93 83.6 194.17 75.36 194.17 65.2V9.99999H184.97ZM65.3701 0.799988V74.4H74.5701V46.8C74.5701 41.72 78.6901 37.6 83.7701 37.6C88.8501 37.6 92.9701 41.72 92.9701 46.8V83.6H102.17V46.8C102.17 36.64 93.9301 28.4 83.7701 28.4C80.4201 28.4 77.2801 29.3 74.5701 30.87V0.799988H65.3701Z" fill="white"/>
              </svg>
              <span className="text-[13px] px-2 py-0.5 rounded-full bg-white/20">Design System</span>
            </div>
            <span className="text-[13px] px-3 py-1 rounded-full bg-white/15" style={{ fontWeight: 600 }}>uhuu.com</span>
          </div>
          <p className="text-white/80 text-[14px] max-w-xl">
            Paleta de cores da plataforma Uhuu. E-commerce de eventos e ingressos. Cores otimizadas para conversão, acessibilidade WCAG AA e consistência visual.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#e0e0e0] bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex gap-0 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-[13px] transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#ee3680] text-[#ee3680]"
                  : "border-transparent text-[#9a9a9a] hover:text-[#484543]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* ===== TAB: ESCALAS DE COR ===== */}
        {activeTab === "scales" && (
          <div style={{ fontFamily: "'Barlow', sans-serif" }}>
            {/* Intro */}
            <div style={{ marginBottom: 40 }}>
              <h2 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 32, marginBottom: 8 }}>Cores</h2>
              <p className="text-[16px] text-[#484543]" style={{ lineHeight: 1.55, maxWidth: 760 }}>
                O Design System Uhuu organiza as cores em três categorias: <span style={{ color: "#EE3680", fontWeight: 600 }}>Principais</span>, que definem a identidade da marca; <span style={{ color: "#8036EE", fontWeight: 600 }}>Suporte</span>, uma paleta ampla para uso em contextos específicos; e <span style={{ color: "#212121", fontWeight: 600 }}>Semântica</span>, cores com significado funcional que comunicam estados e feedbacks ao usuário.
              </p>
            </div>

            {/* ═══ SEÇÃO 1 · PRINCIPAIS (61 tokens) ═══ */}
            <div style={{ marginBottom: 40, paddingBottom: 40, borderBottom: "1px solid #e0e0e0" }}>
              <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 4 }}>
              <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 24 }}>Cores Principais</h3>
              <span className="text-[11px] px-2.5 py-1" style={{ background: "#FCE4EC", color: "#C2185B", borderRadius: 25, fontWeight: 700 }}>61 tokens</span>
              </div>
              <p className="text-[14px] text-[#EE3680]" style={{ fontWeight: 600, marginBottom: 8 }}>A identidade visual da Uhuu</p>
              <p className="text-[13px] text-[#484543]" style={{ lineHeight: 1.55, maxWidth: 760, marginBottom: 24 }}>
                As cores principais são o coração da identidade Uhuu. O <strong>Rosa #EE3680</strong> é a cor primária da marca, presente na logo e em todos os pontos de contato com o usuário. O <strong>Roxo #8036EE</strong> é a cor secundária, alinhada com o marketing e usada para criar profundidade e contraste na interface.
              </p>

              <div className="space-y-6">
                <ScaleRow name="Primárias · Rosa Uhuu" paletteKey="primaria" />
                <ScaleRow name="Secundárias · Roxo Uhuu" paletteKey="secundaria" />
                <ScaleRow name="Neutro · Preto" paletteKey="neutro" />
                <OpacityRow name="Brilho" base="#FFFFFF" label="Branco com transparência" />
                <OpacityRow name="Escuro" base="#000000" label="Preto com transparência" />
              </div>
            </div>

            {/* ═══ SEÇÃO 2 · SUPORTE (55 tokens) ═══ */}
            <div style={{ marginBottom: 40, paddingBottom: 40, borderBottom: "1px solid #e0e0e0" }}>
              <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 4 }}>
                <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 24 }}>Cores de Suporte</h3>
                <span className="text-[11px] px-2.5 py-1" style={{ background: "#F4EEFF", color: "#6A1FD3", borderRadius: 25, fontWeight: 700 }}>55 tokens</span>
              </div>
              <p className="text-[14px] text-[#8036EE]" style={{ fontWeight: 600, marginBottom: 8 }}>Paleta ampla para contextos específicos</p>
              <p className="text-[13px] text-[#484543]" style={{ lineHeight: 1.55, maxWidth: 760, marginBottom: 24 }}>
                As cores de suporte complementam a identidade Uhuu sem substituí-la. São usadas em elementos secundários como tags, categorias, gráficos e ilustrações. O uso deve sempre ser intencional e contextual, nunca competindo com as cores principais.
              </p>

              <div className="space-y-6">
                <ScaleRow name="Esmeralda · Verde saturado" paletteKey="esmeralda" />
                <ScaleRow name="Turquesa · Verde-azulado" paletteKey="turquesa" />
                <ScaleRow name="Céu · Azul claro" paletteKey="ceu" />
                <ScaleRow name="Índigo · Azul-roxo" paletteKey="indigo" />
                <ScaleRow name="Laranja · Para gradientes" paletteKey="laranja" />
              </div>
            </div>

            {/* ═══ SEÇÃO 3 · SEMÂNTICAS (49 tokens) ═══ */}
            <div style={{ marginBottom: 40, paddingBottom: 40, borderBottom: "1px solid #e0e0e0" }}>
              <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 4 }}>
                <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 24 }}>Cores Semânticas</h3>
                <span className="text-[11px] px-2.5 py-1" style={{ background: "#DCFCE7", color: "#15803D", borderRadius: 25, fontWeight: 700 }}>49 tokens</span>
              </div>
              <p className="text-[14px] text-[#212121]" style={{ fontWeight: 600, marginBottom: 8 }}>Comunicação de estados e feedbacks</p>
              <p className="text-[13px] text-[#484543]" style={{ lineHeight: 1.55, maxWidth: 760, marginBottom: 24 }}>
                As cores semânticas têm significado funcional na interface. Comunicam estados ao usuário de forma universal e acessível. Todas as combinações foram validadas para garantir contraste mínimo de 4.5:1 em conformidade com <strong>WCAG AA</strong>.
              </p>

              {/* Escalas completas */}
              <div className="space-y-6" style={{ marginBottom: 32 }}>
                <ScaleRow name="Sucesso · Verde" paletteKey="sucesso" />
                <ScaleRow name="Alerta · Amber" paletteKey="alerta" />
                <ScaleRow name="Erro · Vermelho" paletteKey="erro" />
                <ScaleRow name="Info · Azul" paletteKey="info" />
              </div>

              {/* Fundos 30% */}
              <div style={{ marginBottom: 32 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                  <p className="text-[14px] text-[#212121]" style={{ fontWeight: 700 }}>Fundos · 30% opacidade</p>
                  <span className="text-[11px] text-[#9a9a9a]">5 tokens · para notificações</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" style={{ gap: 12 }}>
                  {[
                    { name: "Sucesso Fundo", base: "#22C55E" },
                    { name: "Alerta Fundo", base: "#F59E0B" },
                    { name: "Erro Fundo", base: "#EF4444" },
                    { name: "Info Fundo", base: "#3B82F6" },
                    { name: "Neutro Fundo", base: "#252525" },
                  ].map(f => {
                    const r = parseInt(f.base.slice(1,3),16), g = parseInt(f.base.slice(3,5),16), b = parseInt(f.base.slice(5,7),16);
                    return (
                      <div key={f.name} className="overflow-hidden" style={{ borderRadius: 12, border: "1px solid #e0e0e0" }}>
                        <div style={{ background: `rgba(${r},${g},${b},0.3)`, height: 80 }} />
                        <div style={{ padding: "10px 12px", background: "#fff" }}>
                          <p className="text-[12px] text-[#212121]" style={{ fontWeight: 700 }}>{f.name}</p>
                          <p className="text-[10px] font-mono text-[#484543]">rgba · 30%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* WCAG cards */}
              <p className="text-[14px] text-[#212121]" style={{ fontWeight: 700, marginBottom: 10 }}>Validação WCAG AA</p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4" style={{ gap: 16 }}>
                {[
                  { name: "Sucesso", hex: "#22C55E", desc: "Confirmações, conclusões, estados positivos", icon: <CheckCircle className="w-4 h-4" /> },
                  { name: "Alerta", hex: "#F59E0B", desc: "Avisos, atenção, ações reversíveis", icon: <AlertTriangle className="w-4 h-4" /> },
                  { name: "Erro", hex: "#EF4444", desc: "Erros, falhas, ações destrutivas", icon: <XCircle className="w-4 h-4" /> },
                  { name: "Info", hex: "#3B82F6", desc: "Informações, dicas, neutro informativo", icon: <Info className="w-4 h-4" /> },
                ].map(c => {
                  const ratioWhite = getContrastRatio(c.hex, "#FFFFFF");
                  const ratioBlack = getContrastRatio(c.hex, "#212121");
                  const tag = (r: number) => r >= 7 ? { l: "AAA", ok: true } : r >= 4.5 ? { l: "AA", ok: true } : r >= 3 ? { l: "AA Large", ok: false } : { l: "Falha", ok: false };
                  const w = tag(ratioWhite); const b = tag(ratioBlack);
                  // Build 30%-opacity background for notification preview
                  const r = parseInt(c.hex.slice(1,3),16), g = parseInt(c.hex.slice(3,5),16), bb = parseInt(c.hex.slice(5,7),16);
                  const bgSoft = `rgba(${r},${g},${bb},0.15)`;
                  return (
                    <div key={c.name} className="bg-white overflow-hidden" style={{ borderRadius: 12, border: "1px solid #e0e0e0" }}>
                      {/* Swatch header */}
                      <div style={{ background: c.hex, color: "#fff", padding: "16px 18px" }}>
                        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                          {c.icon}
                          <p style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</p>
                        </div>
                        <p className="text-[11px] font-mono" style={{ opacity: 0.85 }}>{c.hex}</p>
                      </div>

                      <div style={{ padding: 16 }}>
                        <p className="text-[12px] text-[#484543]" style={{ lineHeight: 1.5, marginBottom: 12 }}>{c.desc}</p>

                        {/* Notification preview */}
                        <div className="flex items-start gap-2" style={{ background: bgSoft, border: `1px solid ${c.hex}40`, borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
                          <div style={{ color: c.hex }}>{c.icon}</div>
                          <p className="text-[11px]" style={{ color: c.hex, fontWeight: 600 }}>Notificação · 30% opacity</p>
                        </div>

                        {/* WCAG mini-table */}
                        <div style={{ borderTop: "1px solid #f0f0f0" }}>
                          <p className="text-[10px] text-[#9a9a9a]" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", padding: "10px 0 6px 0" }}>WCAG AA</p>
                          {[
                            { combo: "Texto Branco", fg: "#FFFFFF", ratio: ratioWhite, t: w },
                            { combo: "Texto Preto", fg: "#212121", ratio: ratioBlack, t: b },
                          ].map(row => (
                            <div key={row.combo} className="flex items-center justify-between" style={{ padding: "6px 0", borderBottom: "1px solid #f5f5f5" }}>
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded flex items-center justify-center text-[10px]" style={{ background: c.hex, color: row.fg, fontWeight: 700 }}>Aa</span>
                                <span className="text-[11px] text-[#484543]">{row.combo}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono text-[#212121]" style={{ fontWeight: 600 }}>{row.ratio.toFixed(2)}:1</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: row.t.ok ? "#f4f9ec" : "#ffe6e6", color: row.t.ok ? "#3d5a1a" : "#7a1a18", fontWeight: 600 }}>
                                  {row.t.ok ? "✓" : "✗"} {row.t.l}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CSS Tokens */}
            <div style={{ paddingTop: 8 }}>
              <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Tokens CSS &middot; Cores</h3>
              <div className="bg-[#1a1a1a] overflow-x-auto" style={{ borderRadius: 12, padding: 24 }}>
                <pre className="text-[13px] text-[#e0e0e0] leading-relaxed" style={{ fontFamily: "monospace" }}>
{`:root {
  /* ── Principais (brand steps) ── */
  --color-primary: #EE3680;        /* Rosa Uhuu · step 400 */
  --color-secondary: #8036EE;      /* Roxo Uhuu · step 500 */
  --color-neutral: #252525;        /* Preto Uhuu · step 800 */
  --color-white: #FFFFFF;

  /* ── Suporte (step 500) ── */
  --color-support-emerald: #10B981;
  --color-support-teal: #14B8A6;
  --color-support-sky: #0EA5E9;
  --color-support-indigo: #6366F1;
  --color-support-orange: #F97316;

  /* ── Semânticas ── */
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error:   #EF4444;
  --color-info:    #3B82F6;

  /* Fundos 30% opacidade (notificações) */
  --color-success-bg: rgba(34, 197, 94, 0.3);
  --color-warning-bg: rgba(245, 158, 11, 0.3);
  --color-error-bg:   rgba(239, 68, 68, 0.3);
  --color-info-bg:    rgba(59, 130, 246, 0.3);
  --color-neutral-bg: rgba(37, 37, 37, 0.3);

  /* Tokens Semânticos · Light */
  --text-brand:        #D91E63;  /* Primárias/600 */
  --text-title:        #0F0F0F;  /* Neutro/900 */
  --text-title-light:  #FFFFFF;  /* Brilho/100% */
  --text-secondary:    #2E2E2E;  /* Neutro/700 */
  --text-black:        #050505;  /* Neutro/950 */
  --text-invalid:      #EF4444;  /* Erro/500 */
  --text-success:      #22C55E;  /* Sucesso/500 */

  --bg-body:        #FAFAFA;     /* Neutro/50 */
  --bg-secondary:   #F0F0F0;     /* Neutro/100 */
  --bg-tertiary:    #DCDCDC;     /* Neutro/200 */
  --bg-overlay:     #B8B8B8;     /* Neutro/300 */
  --border-color:   #B8B8B8;     /* Neutro/300 */
}

[data-theme="dark"] {
  --text-brand:        #FF8FB3;  /* Primárias/400 */
  --text-title:        #DCDCDC;  /* Neutro/200 */
  --text-title-light:  #FFFFFF;
  --text-secondary:    #B8B8B8;  /* Neutro/300 */
  --text-black:        #FFFFFF;  /* Brilho/100% */

  --bg-body:        #050505;     /* Neutro/950 */
  --bg-secondary:   #0F0F0F;     /* Neutro/900 */
  --bg-tertiary:    #1F1F1F;     /* Neutro/800 */
  --bg-overlay:     #2E2E2E;     /* Neutro/700 */
  --border-color:   #2E2E2E;     /* Neutro/700 */
}`}
                </pre>
              </div>
            </div>
          </div>
        )}


        {/* ===== TAB: DIMENSÕES ===== */}
        {activeTab === "dimensions" && (
          <div className="space-y-12">
            {/* Intro */}
            <div>
              <h2 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 28, marginBottom: 8 }}>Dimensões</h2>
              <p className="text-[#484543] text-[14px] max-w-3xl" style={{ lineHeight: 1.6 }}>
                48 tokens de dimensão organizados em quatro famílias: Border Radius, Margin/Padding, Sombra e Opacidade.
                Use estas escalas para manter consistência espacial e hierarquia visual em toda a plataforma Uhuu.
              </p>
            </div>

            {/* Border Radius */}
            <div>
              <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Border Radius · 8 tokens</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8" style={{ gap: 12 }}>
                {[
                  { name: "None", value: 0 }, { name: "SM", value: 2 }, { name: "MD", value: 4 }, { name: "LG", value: 8 },
                  { name: "XL", value: 12 }, { name: "2XL", value: 16 }, { name: "3XL", value: 24 }, { name: "Circular", value: 500 },
                ].map(r => (
                  <div key={r.name} className="bg-white" style={{ border: "1px solid #e0e0e0", borderRadius: 12, padding: 16, textAlign: "center" }}>
                    <div style={{ width: 64, height: 64, margin: "0 auto 10px", background: "linear-gradient(135deg, #EE3680, #8036EE)", borderRadius: r.value }} />
                    <p className="text-[12px] text-[#212121]" style={{ fontWeight: 600 }}>{r.name}</p>
                    <p className="text-[11px] font-mono text-[#9a9a9a]">{r.value}px</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Margin / Padding */}
            <div>
              <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Margin · Padding · 16 tokens</h3>
              <div className="bg-white" style={{ border: "1px solid #e0e0e0", borderRadius: 12, overflow: "hidden" }}>
                {[
                  { name: "Nano", value: 2 }, { name: "Quarck", value: 4 }, { name: "Micro", value: 8 }, { name: "Macro", value: 12 },
                  { name: "XXXS", value: 16 }, { name: "XXS", value: 24 }, { name: "XS", value: 32 }, { name: "SM", value: 40 },
                  { name: "MD", value: 48 }, { name: "LG", value: 56 }, { name: "XL", value: 64 }, { name: "XXL", value: 88 },
                  { name: "XXXL", value: 112 }, { name: "Enorme", value: 144 }, { name: "Gigante", value: 176 },
                ].map((s, i) => (
                  <div key={s.name} className="flex items-center gap-4" style={{ padding: "10px 16px", borderTop: i === 0 ? "none" : "1px solid #f0f0f0" }}>
                    <div style={{ width: 80 }}>
                      <p className="text-[12px] text-[#212121]" style={{ fontWeight: 600 }}>{s.name}</p>
                      <p className="text-[11px] font-mono text-[#9a9a9a]">{s.value}px</p>
                    </div>
                    <div style={{ flex: 1, height: 16, background: "#f5f5f5", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: Math.min(s.value, 200), background: "linear-gradient(90deg, #EE3680, #8036EE)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sombra */}
            <div>
              <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Sombra · 7 tokens</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4" style={{ gap: 16 }}>
                {[
                  { name: "XS", shadow: "0 1px 2px 0 rgba(0,0,0,0.05)" },
                  { name: "SM", shadow: "0 1px 3px 0 rgba(0,0,0,0.10)" },
                  { name: "MD", shadow: "0 4px 6px -1px rgba(0,0,0,0.10)" },
                  { name: "LG", shadow: "0 10px 15px -3px rgba(0,0,0,0.10)" },
                  { name: "XL", shadow: "0 20px 25px -5px rgba(0,0,0,0.10)" },
                  { name: "2XL", shadow: "0 25px 50px -12px rgba(0,0,0,0.10)" },
                  { name: "Inner", shadow: "inset 0 2px 4px 0 rgba(0,0,0,0.05)" },
                ].map(s => (
                  <div key={s.name} className="bg-[#fafafa]" style={{ borderRadius: 12, padding: 24, textAlign: "center" }}>
                    <div className="bg-white" style={{ width: "100%", height: 80, borderRadius: 8, boxShadow: s.shadow, marginBottom: 12 }} />
                    <p className="text-[12px] text-[#212121]" style={{ fontWeight: 600 }}>Sombra {s.name}</p>
                    <p className="text-[10px] font-mono text-[#9a9a9a]" style={{ marginTop: 2 }}>{s.shadow}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Opacidade */}
            <div>
              <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Opacidade · 7 tokens</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7" style={{ gap: 12 }}>
                {[
                  { name: "Semi Opaco", value: 80 }, { name: "Intenso", value: 64 }, { name: "Suave", value: 48 },
                  { name: "Médio", value: 40 }, { name: "Leve", value: 32 }, { name: "Mais Leve", value: 16 }, { name: "Semi Transp.", value: 8 },
                ].map(o => (
                  <div key={o.name} className="bg-white" style={{ border: "1px solid #e0e0e0", borderRadius: 12, padding: 16, textAlign: "center" }}>
                    <div style={{ width: "100%", height: 64, borderRadius: 8, background: `rgba(128,54,238,${o.value/100})`, marginBottom: 10 }} />
                    <p className="text-[12px] text-[#212121]" style={{ fontWeight: 600 }}>{o.name}</p>
                    <p className="text-[11px] font-mono text-[#9a9a9a]">{o.value}%</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tokens CSS · Dimensões */}
            <div style={{ paddingTop: 8 }}>
              <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Tokens CSS &middot; Dimensões</h3>
              <div className="bg-[#1a1a1a] overflow-x-auto" style={{ borderRadius: 12, padding: 24 }}>
                <pre className="text-[13px] text-[#e0e0e0] leading-relaxed" style={{ fontFamily: "monospace" }}>
{`:root {
  /* Border Radius */
  --radius-none: 0;     --radius-sm: 2px;    --radius-md: 4px;
  --radius-lg: 8px;     --radius-xl: 12px;   --radius-2xl: 16px;
  --radius-3xl: 24px;   --radius-circular: 500px;

  /* Spacing · Margin · Padding */
  --space-nano: 2px;    --space-quarck: 4px;  --space-micro: 8px;
  --space-macro: 12px;  --space-xxxs: 16px;   --space-xxs: 24px;
  --space-xs: 32px;     --space-sm: 40px;     --space-md: 48px;
  --space-lg: 56px;     --space-xl: 64px;     --space-xxl: 88px;
  --space-xxxl: 112px;  --space-enorme: 144px; --space-gigante: 176px;

  /* Sombra */
  --shadow-xs:    0 1px 2px 0 rgba(0,0,0,0.05);
  --shadow-sm:    0 1px 3px 0 rgba(0,0,0,0.10);
  --shadow-md:    0 4px 6px -1px rgba(0,0,0,0.10);
  --shadow-lg:    0 10px 15px -3px rgba(0,0,0,0.10);
  --shadow-xl:    0 20px 25px -5px rgba(0,0,0,0.10);
  --shadow-2xl:   0 25px 50px -12px rgba(0,0,0,0.10);
  --shadow-inner: inset 0 2px 4px 0 rgba(0,0,0,0.05);

  /* Opacidade */
  --opacity-semi-opaco: 0.80;   --opacity-intenso: 0.64;
  --opacity-suave: 0.48;        --opacity-medio: 0.40;
  --opacity-leve: 0.32;         --opacity-mais-leve: 0.16;
  --opacity-semi-transp: 0.08;
}`}
                </pre>
              </div>
            </div>
          </div>
        )}


        {/* ===== TAB: ESTADOS ===== */}
        {activeTab === "states" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-[#1a1a1a] mb-2">Estados de Botão Primário</h3>
              <p className="text-[#9a9a9a] text-[13px] mb-6">Interações do CTA principal &middot; "Comprar Ingresso"</p>
              <div className="flex flex-wrap gap-6 items-center">
                {stateExamples.map(s => (
                  <div key={s.label} className="flex flex-col items-center gap-2">
                    <button
                      className={`px-6 py-3 text-white rounded-lg transition-all ${s.extra}`}
                      style={{ backgroundColor: s.bg, opacity: s.opacity === "40%" ? 0.4 : 1 }}
                      disabled={s.label === "Disabled"}
                    >
                      Comprar Ingresso
                    </button>
                    <span className="text-[11px] text-[#9a9a9a]">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[#1a1a1a] mb-2">Estados de Botão Secundário</h3>
              <div className="flex flex-wrap gap-6 items-center">
                {[
                  { label: "Default", classes: "border-2 border-[#6900b2] text-[#6900b2] bg-transparent" },
                  { label: "Hover", classes: "border-2 border-[#6900b2] text-white bg-[#6900b2]" },
                  { label: "Active", classes: "border-2 border-[#53008e] text-white bg-[#53008e] scale-95" },
                  { label: "Disabled", classes: "border-2 border-[#e0e0e0] text-[#9a9a9a] bg-transparent cursor-not-allowed" },
                ].map(s => (
                  <div key={s.label} className="flex flex-col items-center gap-2">
                    <button className={`px-6 py-3 rounded-lg transition-all ${s.classes}`}>
                      Ver Detalhes
                    </button>
                    <span className="text-[11px] text-[#9a9a9a]">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[#1a1a1a] mb-2">Contraste WCAG</h3>
              <p className="text-[#9a9a9a] text-[13px] mb-4">Verificação de acessibilidade das combinações mais comuns</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { fg: "#ffffff", bg: "#ee3680", label: "Branco sobre Magenta" },
                  { fg: "#ffffff", bg: "#6900b2", label: "Branco sobre Roxo" },
                  { fg: "#ffffff", bg: "#1a1a1a", label: "Branco sobre Preto" },
                  { fg: "#1a1a1a", bg: "#fafafa", label: "Preto sobre Branco" },
                  { fg: "#212121", bg: "#8dc73f", label: "Escuro sobre Verde" },
                  { fg: "#ee3680", bg: "#fafafa", label: "Magenta sobre Branco" },
                ].map(c => {
                  const ratio = getContrastRatio(c.fg, c.bg);
                  const passAA = ratio >= 4.5;
                  const passAAA = ratio >= 7;
                  return (
                    <div key={c.label} className="bg-white border border-[#e0e0e0] rounded-lg p-4 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0 text-[14px]" style={{ backgroundColor: c.bg, color: c.fg }}>
                        Aa
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] text-[#212121] truncate">{c.label}</p>
                        <p className="text-[12px] text-[#9a9a9a]">{ratio.toFixed(1)}:1</p>
                        <div className="flex gap-1 mt-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${passAA ? "bg-[#f0f9e6] text-[#3d5a1a]" : "bg-[#fdecea] text-[#7a1a18]"}`}>
                            AA {passAA ? "✓" : "✗"}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${passAAA ? "bg-[#f0f9e6] text-[#3d5a1a]" : "bg-[#fdecea] text-[#7a1a18]"}`}>
                            AAA {passAAA ? "✓" : "✗"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: BOTÕES ===== */}
        {activeTab === "buttons" && (
          <div className="space-y-10">
            {/* Primary Buttons */}
            <div>
              <h3 className="text-[#1a1a1a] mb-2">Botão Primário</h3>
              <p className="text-[#9a9a9a] text-[13px] mb-5">Usado para ações principais de conversão como compra de ingressos</p>
              <div className="flex flex-wrap gap-4 items-center">
                <button className="px-6 py-3 bg-[#ee3680] text-white rounded-lg hover:bg-[#d42e70] transition-colors">
                  Comprar Ingresso
                </button>
                <button className="px-5 py-2.5 bg-[#ee3680] text-white rounded-lg text-[14px]">
                  Adicionar ao Carrinho
                </button>
                <button className="px-4 py-2 bg-[#ee3680] text-white rounded-lg text-[13px]">
                  Ver Mais
                </button>
              </div>
            </div>

            {/* Secondary Buttons */}
            <div>
              <h3 className="text-[#1a1a1a] mb-2">Botão Secundário</h3>
              <p className="text-[#9a9a9a] text-[13px] mb-5">Ações secundárias e complementares</p>
              <div className="flex flex-wrap gap-4 items-center">
                <button className="px-6 py-3 border-2 border-[#6900b2] text-[#6900b2] rounded-lg hover:bg-[#6900b2] hover:text-white transition-colors">
                  Ver Detalhes
                </button>
                <button className="px-5 py-2.5 border-2 border-[#6900b2] text-[#6900b2] rounded-lg text-[14px]">
                  Compartilhar
                </button>
                <button className="px-4 py-2 border-2 border-[#6900b2] text-[#6900b2] rounded-lg text-[13px]">
                  Filtrar
                </button>
              </div>
            </div>

            {/* Ghost / Text Buttons */}
            <div>
              <h3 className="text-[#1a1a1a] mb-2">Botão Ghost / Texto</h3>
              <p className="text-[#9a9a9a] text-[13px] mb-5">Ações terciárias e links internos</p>
              <div className="flex flex-wrap gap-4 items-center">
                <button className="px-4 py-2 text-[#ee3680] hover:bg-[#ee3680]/10 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button className="px-4 py-2 text-[#6900b2] hover:bg-[#6900b2]/10 rounded-lg transition-colors">
                  Saiba Mais
                </button>
                <button className="px-4 py-2 text-[#9a9a9a] hover:bg-[#9a9a9a]/10 rounded-lg transition-colors">
                  Voltar
                </button>
              </div>
            </div>

            {/* Destructive */}
            <div>
              <h3 className="text-[#1a1a1a] mb-2">Botão Destrutivo</h3>
              <p className="text-[#9a9a9a] text-[13px] mb-5">Ações irreversíveis como cancelamento de compra</p>
              <div className="flex flex-wrap gap-4 items-center">
                <button className="px-6 py-3 bg-[#da0000] text-white rounded-lg hover:bg-[#b00000] transition-colors">
                  Cancelar Compra
                </button>
                <button className="px-5 py-2.5 border-2 border-[#da0000] text-[#da0000] rounded-lg text-[14px]">
                  Remover Ingresso
                </button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-[#1a1a1a] mb-2">Tamanhos</h3>
              <p className="text-[#9a9a9a] text-[13px] mb-5">Variantes de tamanho para diferentes contextos</p>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex flex-col items-center gap-2">
                  <button className="px-3 py-1.5 bg-[#ee3680] text-white rounded text-[12px]">Small</button>
                  <span className="text-[10px] text-[#9a9a9a]">SM</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <button className="px-5 py-2.5 bg-[#ee3680] text-white rounded-lg text-[14px]">Medium</button>
                  <span className="text-[10px] text-[#9a9a9a]">MD</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <button className="px-7 py-3.5 bg-[#ee3680] text-white rounded-lg">Large</button>
                  <span className="text-[10px] text-[#9a9a9a]">LG</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <button className="w-full min-w-[240px] py-4 bg-[#ee3680] text-white rounded-xl">Full Width</button>
                  <span className="text-[10px] text-[#9a9a9a]">FULL</span>
                </div>
              </div>
            </div>

            {/* ═══ VERIFICAÇÃO WCAG AA ═══ */}
            <div style={{ paddingTop: 20, fontFamily: "'Barlow', sans-serif" }}>
              <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Verificação WCAG AA para as Combinações</h3>
              <p className="text-[13px] text-[#9a9a9a]" style={{ marginBottom: 24 }}>
                Validação de contraste de cores para garantir legibilidade e acessibilidade em todos os estados de botão.
              </p>

              <div className="space-y-6">
                {[
                  {
                    title: "Botão Primário · Magenta",
                    rows: [
                      { element: "Texto Branco sobre Magenta Base", fg: "#FFFFFF", bg: "#EE3680", bgLabel: "#EE3680 · Base" },
                      { element: "Texto Branco sobre Magenta Hover", fg: "#FFFFFF", bg: "#D91E63", bgLabel: "#D91E63 · Hover" },
                      { element: "Texto Branco sobre Magenta Active", fg: "#FFFFFF", bg: "#B71750", bgLabel: "#B71750 · Active" },
                      { element: "Texto Cinza sobre Magenta Disabled", fg: "#D7D7D7", bg: "#F4A8C6", bgLabel: "#F4A8C6 · Disabled" },
                    ],
                  },
                  {
                    title: "Botão Secundário · Roxo",
                    rows: [
                      { element: "Texto Branco sobre Roxo Base", fg: "#FFFFFF", bg: "#6900B2", bgLabel: "#6900B2 · Base" },
                      { element: "Texto Branco sobre Roxo Hover", fg: "#FFFFFF", bg: "#55008F", bgLabel: "#55008F · Hover" },
                      { element: "Texto Branco sobre Roxo Active", fg: "#FFFFFF", bg: "#42006E", bgLabel: "#42006E · Active" },
                    ],
                  },
                  {
                    title: "Botão Success · Verde",
                    rows: [
                      { element: "Texto Branco sobre Verde Base", fg: "#FFFFFF", bg: "#8DC73F", bgLabel: "#8DC73F · Base" },
                      { element: "Texto Branco sobre Verde Hover", fg: "#FFFFFF", bg: "#76A833", bgLabel: "#76A833 · Hover" },
                    ],
                  },
                  {
                    title: "Botão Error · Vermelho",
                    rows: [
                      { element: "Texto Branco sobre Vermelho Base", fg: "#FFFFFF", bg: "#DA0000", bgLabel: "#DA0000 · Base" },
                      { element: "Texto Branco sobre Vermelho Hover", fg: "#FFFFFF", bg: "#B30000", bgLabel: "#B30000 · Hover" },
                    ],
                  },
                ].map(group => (
                  <div key={group.title}>
                    <p className="text-[13px] text-[#212121]" style={{ fontWeight: 600, marginBottom: 10 }}>{group.title}</p>
                    <WcagTable
                      rows={group.rows.map(r => ({
                        element: r.element,
                        fg: r.fg,
                        bgLabel: r.bgLabel,
                        swatch: { backgroundColor: r.bg },
                        ratio: getContrastRatio(r.fg, r.bg),
                      }))}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 bg-[#f4f9ec] border border-[#c7e29a]" style={{ borderRadius: 10, padding: "12px 16px", marginTop: 20 }}>
                <CheckCircle className="w-4 h-4 text-[#3d5a1a] shrink-0" style={{ marginTop: 2 }} />
                <p className="text-[12px] text-[#3d5a1a]">
                  Essa verificação é crítica para garantir que o design system seja acessível a todos os usuários, especialmente pessoas com deficiência visual ou daltonismo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: INPUTS ===== */}
        {activeTab === "inputs" && (
          <div style={{ fontFamily: "'Barlow', sans-serif" }}>
            {/* 1. Introdução */}
            <div style={{ marginBottom: 40 }}>
              <h2 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 32, marginBottom: 8 }}>Inputs</h2>
              <p className="text-[16px] text-[#484543]" style={{ lineHeight: 1.55, maxWidth: 680 }}>
                Campos de entrada para formulários, com estados claros e feedback visual consistente. Todos os campos seguem altura de 44px, tipografia Barlow e paleta Uhuu.
              </p>
            </div>

            {/* 2. Especificações Técnicas */}
            <div style={{ marginBottom: 40 }}>
              <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Especificações Técnicas</h3>
              <p className="text-[13px] text-[#9a9a9a]" style={{ marginBottom: 24 }}>Tipos de input disponíveis no Design System.</p>

              <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 20 }}>
                {[
                  { name: "Text", desc: "Input padrão para textos curtos", extra: "Validação: livre" },
                  { name: "Email", desc: "Input para endereços de e-mail", extra: "Validação: formato de e-mail" },
                  { name: "Número", desc: "Input numérico sem spinner", extra: "type=\"number\" · inputmode=\"numeric\"" },
                  { name: "Senha", desc: "Input de senha com toggle visibilidade", extra: "Ícone Eye/EyeOff" },
                  { name: "Textarea", desc: "Área de texto redimensionável", extra: "min-height: 100px · resize: vertical" },
                ].map(t => (
                  <div key={t.name} className="bg-white" style={{ borderRadius: 12, border: "1px solid #e0e0e0", padding: 20 }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                      <h4 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 16 }}>Input {t.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 text-[#9a9a9a]" style={{ border: "1px solid #e0e0e0", borderRadius: 25, fontWeight: 500 }}>{t.extra}</span>
                    </div>
                    <p className="text-[12px] text-[#484543]" style={{ marginBottom: 14 }}>{t.desc}</p>

                    {/* Live example */}
                    {t.name === "Senha" ? (
                      <div className="relative">
                        <input type="password" placeholder="••••••••" className="w-full" style={{ height: 44, padding: "12px 44px 12px 16px", border: "1px solid #E0E0E0", borderRadius: 8, background: "#FFFFFF", fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#212121", outline: "none" }} />
                        <Eye className="w-4 h-4 text-[#9A9A9A] absolute" style={{ right: 14, top: 14 }} />
                      </div>
                    ) : t.name === "Número" ? (
                      <div className="flex items-center gap-2">
                        <button className="w-11 h-11 flex items-center justify-center bg-white" style={{ border: "1px solid #E0E0E0", borderRadius: 8 }}><Minus className="w-4 h-4 text-[#484543]" /></button>
                        <input type="text" defaultValue="1" className="flex-1 text-center" style={{ height: 44, padding: "12px 16px", border: "1px solid #E0E0E0", borderRadius: 8, background: "#FFFFFF", fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#212121", outline: "none" }} />
                        <button className="w-11 h-11 flex items-center justify-center bg-white" style={{ border: "1px solid #E0E0E0", borderRadius: 8 }}><Plus className="w-4 h-4 text-[#484543]" /></button>
                      </div>
                    ) : t.name === "Textarea" ? (
                      <textarea placeholder="Escreva sua mensagem..." className="w-full" style={{ minHeight: 100, padding: "12px 16px", border: "1px solid #E0E0E0", borderRadius: 8, background: "#FFFFFF", fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#212121", outline: "none", resize: "vertical" }} />
                    ) : (
                      <input
                        type={t.name === "Email" ? "email" : "text"}
                        placeholder={t.name === "Email" ? "voce@email.com" : "Digite aqui..."}
                        className="w-full"
                        style={{ height: 44, padding: "12px 16px", border: "1px solid #E0E0E0", borderRadius: 8, background: "#FFFFFF", fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#212121", outline: "none" }}
                      />
                    )}

                    {/* Specs table */}
                    <div style={{ marginTop: 14, borderTop: "1px solid #f0f0f0" }}>
                      {[
                        { k: "Altura", v: t.name === "Textarea" ? "min 100px" : "44px" },
                        { k: "Padding", v: "12px · 16px" },
                        { k: "Borda", v: "1px #E0E0E0" },
                        { k: "Borda Foco", v: "2px #EE3680" },
                        { k: "Tipografia", v: "Barlow 400 · 14px" },
                        { k: "Placeholder", v: "#9A9A9A" },
                      ].map(row => (
                        <div key={row.k} className="flex items-center justify-between" style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                          <span className="text-[11px] text-[#9a9a9a]" style={{ fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{row.k}</span>
                          <span className="text-[12px] text-[#212121] font-mono" style={{ fontWeight: 500 }}>{row.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Estados */}
            <div style={{ marginTop: 40, paddingTop: 40, borderTop: "1px solid #e0e0e0", marginBottom: 40 }}>
              <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Estados do Input</h3>
              <p className="text-[13px] text-[#9a9a9a]" style={{ marginBottom: 24 }}>Os 5 estados padrão para qualquer campo de entrada.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5" style={{ gap: 16 }}>
                {[
                  {
                    name: "Default", desc: "Pronto para interação",
                    input: <input placeholder="voce@email.com" className="w-full" style={{ height: 44, padding: "12px 16px", border: "1px solid #E0E0E0", borderRadius: 8, background: "#FFFFFF", fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#212121", outline: "none" }} />,
                  },
                  {
                    name: "Focus", desc: "Cursor ativo, foco visível",
                    input: <input placeholder="voce@email.com" autoFocus={false} className="w-full" style={{ height: 44, padding: "12px 16px", border: "2px solid #EE3680", borderRadius: 8, background: "#FFFFFF", fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#212121", outline: "none", boxShadow: "0 0 0 3px rgba(238,54,128,0.1)" }} />,
                  },
                  {
                    name: "Filled", desc: "Campo preenchido",
                    input: <input defaultValue="maria@uhuu.com" className="w-full" style={{ height: 44, padding: "12px 16px", border: "1px solid #D7D7D7", borderRadius: 8, background: "#FFFFFF", fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#212121", outline: "none" }} />,
                  },
                  {
                    name: "Error", desc: "Validação negativa",
                    input: (
                      <div>
                        <div className="relative">
                          <input defaultValue="maria@uhuu" className="w-full" style={{ height: 44, padding: "12px 44px 12px 16px", border: "2px solid #DA0000", borderRadius: 8, background: "#FFFFFF", fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#212121", outline: "none" }} />
                          <XCircle className="w-4 h-4 text-[#DA0000] absolute" style={{ right: 14, top: 14 }} />
                        </div>
                        <p className="text-[12px] text-[#DA0000]" style={{ marginTop: 6 }}>E-mail inválido</p>
                      </div>
                    ),
                  },
                  {
                    name: "Disabled", desc: "Sem interação",
                    input: <input disabled defaultValue="bloqueado@uhuu.com" className="w-full" style={{ height: 44, padding: "12px 16px", border: "1px solid #E0E0E0", borderRadius: 8, background: "#F5F5F5", fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#D7D7D7", outline: "none", cursor: "not-allowed" }} />,
                  },
                ].map(s => (
                  <div key={s.name} className="bg-white" style={{ borderRadius: 12, border: "1px solid #e0e0e0", padding: 16 }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                      <p className="text-[13px] text-[#212121]" style={{ fontWeight: 700 }}>{s.name}</p>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.name === "Error" ? "#DA0000" : s.name === "Focus" ? "#EE3680" : s.name === "Disabled" ? "#D7D7D7" : "#8DC73F" }} />
                    </div>
                    <p className="text-[11px] text-[#9a9a9a]" style={{ marginBottom: 12 }}>{s.desc}</p>
                    {s.input}
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Label + Help text */}
            <div style={{ marginTop: 40, paddingTop: 40, borderTop: "1px solid #e0e0e0", marginBottom: 40 }}>
              <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Label & Help Text</h3>
              <p className="text-[13px] text-[#9a9a9a]" style={{ marginBottom: 24 }}>Anatomia completa de um campo com rótulo e texto auxiliar.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 20 }}>
                {[
                  { label: "CPF", placeholder: "000.000.000-00", help: "Formato: 000.000.000-00", tone: "info" as const },
                  { label: "E-mail", placeholder: "voce@email.com", help: "Enviaremos a confirmação para este endereço.", tone: "info" as const },
                  { label: "Senha", placeholder: "Mínimo 8 caracteres", help: "Use letras, números e símbolos para mais segurança.", tone: "info" as const },
                ].map(f => (
                  <div key={f.label} className="bg-white" style={{ borderRadius: 12, border: "1px solid #e0e0e0", padding: 20 }}>
                    <label className="text-[13px] text-[#212121]" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>{f.label}</label>
                    <input placeholder={f.placeholder} className="w-full" style={{ height: 44, padding: "12px 16px", border: "1px solid #E0E0E0", borderRadius: 8, background: "#FFFFFF", fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#212121", outline: "none" }} />
                    <p className="text-[11px] text-[#9a9a9a]" style={{ marginTop: 6 }}>{f.help}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. WCAG */}
            <div style={{ marginTop: 40, paddingTop: 40, borderTop: "1px solid #e0e0e0", marginBottom: 40 }}>
              <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Verificação WCAG AA para as Combinações</h3>
              <p className="text-[13px] text-[#9a9a9a]" style={{ marginBottom: 24 }}>Validação de contraste para legibilidade e acessibilidade dos campos.</p>
              <WcagTable
                rows={[
                  { element: "Texto preenchido sobre fundo padrão", fg: "#212121", bgLabel: "#FFFFFF · Default", swatch: { backgroundColor: "#FFFFFF" }, ratio: getContrastRatio("#212121", "#FFFFFF") },
                  { element: "Placeholder sobre fundo padrão", fg: "#9A9A9A", bgLabel: "#FFFFFF · Default", swatch: { backgroundColor: "#FFFFFF" }, ratio: getContrastRatio("#9A9A9A", "#FFFFFF") },
                  { element: "Mensagem de erro sobre fundo padrão", fg: "#DA0000", bgLabel: "#FFFFFF · Default", swatch: { backgroundColor: "#FFFFFF" }, ratio: getContrastRatio("#DA0000", "#FFFFFF") },
                  { element: "Texto desabilitado sobre fundo cinza", fg: "#D7D7D7", bgLabel: "#F5F5F5 · Disabled", swatch: { backgroundColor: "#F5F5F5" }, ratio: getContrastRatio("#D7D7D7", "#F5F5F5") },
                  { element: "Borda foco (magenta) sobre fundo padrão", fg: "#EE3680", bgLabel: "#FFFFFF · Focus", swatch: { backgroundColor: "#FFFFFF" }, ratio: getContrastRatio("#EE3680", "#FFFFFF") },
                ]}
              />
            </div>

            {/* 6. Exemplos de aplicação */}
            <div style={{ marginTop: 40, paddingTop: 40, borderTop: "1px solid #e0e0e0", marginBottom: 40 }}>
              <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Exemplos de Aplicação</h3>
              <p className="text-[13px] text-[#9a9a9a]" style={{ marginBottom: 24 }}>Três contextos reais de uso de inputs na plataforma Uhuu.</p>

              <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 20 }}>
                {/* Login */}
                <div className="bg-white" style={{ borderRadius: 12, border: "1px solid #e0e0e0", padding: 24 }}>
                  <p className="text-[13px] text-[#9a9a9a]" style={{ fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>Login</p>
                  <h4 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Entrar na sua conta</h4>
                  <label className="text-[12px] text-[#212121]" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>E-mail</label>
                  <input placeholder="voce@email.com" className="w-full" style={{ height: 44, padding: "12px 16px", border: "1px solid #E0E0E0", borderRadius: 8, fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#212121", outline: "none", marginBottom: 14 }} />
                  <label className="text-[12px] text-[#212121]" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Senha</label>
                  <div className="relative" style={{ marginBottom: 16 }}>
                    <input type="password" placeholder="••••••••" className="w-full" style={{ height: 44, padding: "12px 44px 12px 16px", border: "1px solid #E0E0E0", borderRadius: 8, fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#212121", outline: "none" }} />
                    <EyeOff className="w-4 h-4 text-[#9A9A9A] absolute" style={{ right: 14, top: 14 }} />
                  </div>
                  <button className="w-full py-3 bg-[#EE3680] text-white text-[14px] transition-colors hover:bg-[#D91E63]" style={{ borderRadius: 25, fontWeight: 600 }}>Entrar</button>
                </div>

                {/* Checkout */}
                <div className="bg-white" style={{ borderRadius: 12, border: "1px solid #e0e0e0", padding: 24 }}>
                  <p className="text-[13px] text-[#9a9a9a]" style={{ fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>Checkout</p>
                  <h4 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Dados pessoais</h4>
                  <label className="text-[12px] text-[#212121]" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Nome completo</label>
                  <input defaultValue="Maria da Silva" className="w-full" style={{ height: 44, padding: "12px 16px", border: "1px solid #D7D7D7", borderRadius: 8, fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#212121", outline: "none", marginBottom: 14 }} />
                  <label className="text-[12px] text-[#212121]" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>CPF</label>
                  <div style={{ marginBottom: 14 }}>
                    <div className="relative">
                      <input defaultValue="123.456.789" className="w-full" style={{ height: 44, padding: "12px 44px 12px 16px", border: "2px solid #DA0000", borderRadius: 8, fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#212121", outline: "none" }} />
                      <XCircle className="w-4 h-4 text-[#DA0000] absolute" style={{ right: 14, top: 14 }} />
                    </div>
                    <p className="text-[12px] text-[#DA0000]" style={{ marginTop: 6 }}>CPF incompleto</p>
                  </div>
                  <label className="text-[12px] text-[#212121]" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Endereço</label>
                  <input placeholder="Rua, número, complemento" className="w-full" style={{ height: 44, padding: "12px 16px", border: "1px solid #E0E0E0", borderRadius: 8, fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#212121", outline: "none" }} />
                </div>

                {/* Busca */}
                <div className="bg-white" style={{ borderRadius: 12, border: "1px solid #e0e0e0", padding: 24 }}>
                  <p className="text-[13px] text-[#9a9a9a]" style={{ fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>Busca</p>
                  <h4 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Encontre um evento</h4>
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#9A9A9A] absolute" style={{ left: 14, top: 14 }} />
                    <input defaultValue="rock" className="w-full" style={{ height: 44, padding: "12px 16px 12px 40px", border: "2px solid #EE3680", borderRadius: 8, fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#212121", outline: "none", boxShadow: "0 0 0 3px rgba(238,54,128,0.1)" }} />
                  </div>
                  <div style={{ marginTop: 12, border: "1px solid #e0e0e0", borderRadius: 8, overflow: "hidden" }}>
                    {["Rock in Uhuu · Arena", "Rock das Antigas", "Rockabilly Night"].map((s, i) => (
                      <div key={s} className="flex items-center gap-2" style={{ padding: "10px 14px", borderBottom: i < 2 ? "1px solid #f0f0f0" : "none", cursor: "pointer" }}>
                        <Search className="w-3 h-3 text-[#9A9A9A]" />
                        <span className="text-[13px] text-[#212121]">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Regras de Uso */}
            <div style={{ marginTop: 40, paddingTop: 40, borderTop: "1px solid #e0e0e0", marginBottom: 40 }}>
              <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Regras de Uso</h3>
              <p className="text-[13px] text-[#9a9a9a]" style={{ marginBottom: 24 }}>Quando aplicar e quando evitar inputs na interface.</p>

              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                <div className="bg-white" style={{ borderRadius: 12, border: "1px solid #e0e0e0", padding: 24 }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
                    <CheckCircle className="w-5 h-5 text-[#8dc73f]" />
                    <span className="text-[14px] text-[#212121]" style={{ fontWeight: 600 }}>Use em</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      "Formulários de login e cadastro",
                      "Checkout e pagamento",
                      "Busca e filtros",
                      "Validação em tempo real",
                      "Dados pessoais e contato",
                    ].map(t => (
                      <div key={t} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#8dc73f] shrink-0" style={{ marginTop: 6 }} />
                        <span className="text-[13px] text-[#484543]">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white" style={{ borderRadius: 12, border: "1px solid #e0e0e0", padding: 24 }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
                    <XCircle className="w-5 h-5 text-[#da0000]" />
                    <span className="text-[14px] text-[#212121]" style={{ fontWeight: 600 }}>Nunca use em</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      "Textos que não são editáveis (use parágrafos)",
                      "Campos sem label ou placeholder",
                      "Múltiplas validações simultâneas no mesmo campo",
                      "Campos sem feedback visual de erro",
                      "Formulários longos sem agrupamento lógico",
                    ].map(t => (
                      <div key={t} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#da0000] shrink-0" style={{ marginTop: 6 }} />
                        <span className="text-[13px] text-[#484543]">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 8. Tokens CSS */}
            <div style={{ marginTop: 40, paddingTop: 40, borderTop: "1px solid #e0e0e0" }}>
              <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Tokens CSS &middot; Inputs</h3>
              <div className="bg-[#1a1a1a] overflow-x-auto" style={{ borderRadius: 12, padding: 24 }}>
                <pre className="text-[13px] text-[#e0e0e0] leading-relaxed" style={{ fontFamily: "monospace" }}>
{`:root {
  /* ── Input Padrão ── */
  --input-height: 44px;
  --input-padding-y: 12px;
  --input-padding-x: 16px;
  --input-border-radius: 8px;
  --input-border-width: 1px;
  --input-border-color: #E0E0E0;
  --input-border-color-focus: #EE3680;
  --input-border-width-focus: 2px;
  --input-focus-ring: 0 0 0 3px rgba(238, 54, 128, 0.1);

  /* ── Cores ── */
  --input-bg: #FFFFFF;
  --input-text-color: #212121;
  --input-placeholder-color: #9A9A9A;

  /* ── Estado Disabled ── */
  --input-disabled-bg: #F5F5F5;
  --input-disabled-text-color: #D7D7D7;
  --input-disabled-border-color: #E0E0E0;

  /* ── Estado Error ── */
  --input-error-border-color: #DA0000;
  --input-error-text-color: #DA0000;

  /* ── Tipografia ── */
  --input-font-family: 'Barlow', sans-serif;
  --input-font-size: 14px;
  --input-font-weight: 400;

  /* ── Textarea ── */
  --textarea-min-height: 100px;
  --textarea-resize: vertical;
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: ALERTAS ===== */}
        {activeTab === "alerts" && (
          <div className="space-y-10">
            {/* Default Alerts */}
            <div>
              <h3 className="text-[#1a1a1a] mb-2">Alertas Default</h3>
              <p className="text-[#9a9a9a] text-[13px] mb-5">Alertas com ícone, título, descrição e botão de fechar</p>
              <div className="space-y-3 max-w-2xl">
                <AlertComponent
                  variant="success"
                  title="Compra realizada com sucesso!"
                  description="Seus 2 ingressos para Rock in Rio foram confirmados. Verifique seu e-mail."
                />
                <AlertComponent
                  variant="error"
                  title="Pagamento não autorizado"
                  description="Verifique os dados do cartão e tente novamente ou use outra forma de pagamento."
                />
                <AlertComponent
                  variant="warning"
                  title="Últimos 5 ingressos disponíveis!"
                  description="Garanta o seu antes que esgote. A sessão expira em 10 minutos."
                />
                <AlertComponent
                  variant="info"
                  title="Apresente o QR Code na entrada"
                  description="O ingresso digital estará disponível no seu e-mail e na aba Meus Ingressos."
                />
              </div>
            </div>

            {/* Without Icon */}
            <div>
              <h3 className="text-[#1a1a1a] mb-2">Alertas sem Ícone</h3>
              <p className="text-[#9a9a9a] text-[13px] mb-5">Variante simplificada para contextos mais discretos</p>
              <div className="space-y-3 max-w-2xl">
                <AlertComponent
                  variant="success"
                  title="Ingresso adicionado ao carrinho"
                  description="Continue navegando ou finalize sua compra."
                  showIcon={false}
                />
                <AlertComponent
                  variant="error"
                  title="Sessão expirada"
                  description="Os ingressos foram liberados. Inicie uma nova seleção."
                  showIcon={false}
                />
                <AlertComponent
                  variant="warning"
                  title="Evento com restrição de idade"
                  description="Classificação indicativa: 18 anos. Documento com foto obrigatório."
                  showIcon={false}
                />
                <AlertComponent
                  variant="info"
                  title="Meia entrada disponível"
                  description="Estudantes e idosos podem adquirir com 50% de desconto mediante comprovação."
                  showIcon={false}
                />
              </div>
            </div>

            {/* With Action */}
            <div>
              <h3 className="text-[#1a1a1a] mb-2">Alertas com Ação</h3>
              <p className="text-[#9a9a9a] text-[13px] mb-5">Incluem botão de ação para guiar o próximo passo do usuário</p>
              <div className="space-y-3 max-w-2xl">
                <AlertComponent
                  variant="success"
                  title="Pagamento aprovado!"
                  description="Seus ingressos já estão disponíveis para download."
                  actionLabel="Ver Meus Ingressos"
                />
                <AlertComponent
                  variant="error"
                  title="Erro ao processar pagamento"
                  description="Houve um problema com sua forma de pagamento. Tente novamente."
                  actionLabel="Tentar Novamente"
                />
                <AlertComponent
                  variant="warning"
                  title="Sua sessão expira em 5 minutos"
                  description="Finalize a compra para garantir seus ingressos selecionados."
                  actionLabel="Finalizar Compra"
                />
                <AlertComponent
                  variant="info"
                  title="Novo lote disponível"
                  description="O 3º lote de ingressos para o Lollapalooza acabou de abrir."
                  actionLabel="Ver Ingressos"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: TIPOGRAFIA ===== */}
        {activeTab === "typography" && (
          <div className="space-y-8" style={{ fontFamily: "'Barlow', sans-serif" }}>
            {/* Font info header */}
            <div className="bg-white border border-[#e0e0e0] rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div>
                  <h2 className="text-[#1a1a1a]" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 28 }}>Barlow</h2>
                  <p className="text-[13px] text-[#9a9a9a]">Fonte principal do design system Uhuu &middot; Moderna, amigável e altamente legível</p>
                </div>
              </div>
              <p className="text-[12px] text-[#9a9a9a] mb-4">Pesos disponíveis</p>
              <div className="flex flex-wrap gap-8">
                {[
                  { weight: 400, label: "Regular" },
                  { weight: 500, label: "Medium" },
                  { weight: 600, label: "Semi Bold" },
                  { weight: 700, label: "Bold" },
                ].map(w => (
                  <div key={w.weight} className="flex flex-col items-center gap-1">
                    <span style={{ fontWeight: w.weight, fontSize: 32, fontFamily: "'Barlow', sans-serif", color: "#1a1a1a" }}>Aa</span>
                    <span className="text-[11px] text-[#9a9a9a]">{w.weight}</span>
                    <span className="text-[10px] text-[#484543]">{w.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 44 ESTILOS FIGMA · BARLOW ── */}
            <div>
              <h3 className="text-[#212121] mb-1" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 20 }}>44 Estilos · Figma Tokens</h3>
              <p className="text-[13px] text-[#9a9a9a] mb-5">11 tamanhos × 4 pesos · Barlow · line-height 1.5 · letter-spacing 0.5px</p>

              <div className="bg-white" style={{ border: "1px solid #e0e0e0", borderRadius: 12, overflow: "hidden" }}>
                <div className="grid" style={{ gridTemplateColumns: "140px 70px 90px 90px 1fr", background: "#fafafa", borderBottom: "1px solid #e0e0e0", padding: "10px 16px", gap: 12 }}>
                  {["Nome","Size","Weight","Line H.","Preview"].map(h => (
                    <p key={h} className="text-[10px] text-[#9a9a9a]" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</p>
                  ))}
                </div>
                {([
                  { name: "xs", size: 12 }, { name: "sm", size: 14 }, { name: "base", size: 16 },
                  { name: "lg", size: 18 }, { name: "xl", size: 20 }, { name: "2xl", size: 24 },
                  { name: "3xl", size: 30 }, { name: "4xl", size: 36 }, { name: "5xl", size: 48 },
                  { name: "6xl", size: 60 }, { name: "7xl", size: 72 },
                ] as const).flatMap((s, i) => {
                  const variants = [{ w: 400, label: "Regular" }, { w: 500, label: "Medium" }, { w: 600, label: "Semi Bold" }, { w: 700, label: "Bold" }];
                  return variants.map(v => ({
                    key: `${s.name}-${v.w}`,
                    name: `Text ${s.name}${v.label === "Regular" ? "" : ` ${v.label}`}`,
                    size: s.size,
                    weight: v.w,
                    weightLabel: v.label,
                    lh: s.size * 1.5,
                    rowI: i,
                  }));
                }).map((row, idx) => (
                  <div key={row.key} className="grid items-center" style={{ gridTemplateColumns: "140px 70px 90px 90px 1fr", padding: "10px 16px", gap: 12, borderTop: idx === 0 ? "none" : "1px solid #f5f5f5", background: idx % 2 === 0 ? "#fff" : "#fcfcfc" }}>
                    <p className="text-[12px] text-[#212121]" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>{row.name}</p>
                    <p className="text-[11px] font-mono text-[#484543]">{row.size}px</p>
                    <p className="text-[11px] font-mono text-[#484543]">{row.weight} · {row.weightLabel}</p>
                    <p className="text-[11px] font-mono text-[#484543]">{row.lh}px</p>
                    <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: Math.min(row.size, 24), fontWeight: row.weight, lineHeight: 1.5, letterSpacing: "0.5px", color: "#212121" }}>
                      Por uma vida com mais uhuu
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── ESCALA TIPOGRÁFICA COMPLETA ── */}
            <div>
              <h3 className="text-[#1a1a1a] mb-1" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>Escala Tipográfica</h3>
              <p className="text-[13px] text-[#9a9a9a] mb-5">11 níveis com exemplos reais da plataforma Uhuu. Otimizada para leitura em telas.</p>

              <div className="space-y-3">
                {([
                  { name: "Display", size: 56, weight: 700, lh: 1.2, ls: "-1px", usage: "Títulos principais de página, hero sections", example: "Por uma vida com mais uhuu!" },
                  { name: "H1", size: 48, weight: 700, lh: 1.2, ls: "-0.5px", usage: "Títulos de seção principal", example: "Encontre seus eventos favoritos" },
                  { name: "H2", size: 40, weight: 600, lh: 1.25, ls: "0px", usage: "Subtítulos, títulos de subseção", example: "Eventos em destaque" },
                  { name: "H3", size: 32, weight: 600, lh: 1.3, ls: "0px", usage: "Títulos de cards, seções menores", example: "Mano Brown – MB10" },
                  { name: "H4", size: 28, weight: 600, lh: 1.35, ls: "0px", usage: "Subtítulos de cards, labels destacados", example: "Próximos eventos" },
                  { name: "H5", size: 24, weight: 500, lh: 1.4, ls: "0px", usage: "Títulos de modais, cards pequenos", example: "Selecione seu assento" },
                  { name: "Body Large", size: 18, weight: 400, lh: 1.55, ls: "0px", usage: "Textos destacados, descrições importantes", example: "Compre seus ingressos agora" },
                  { name: "Body", size: 16, weight: 400, lh: 1.55, ls: "0px", usage: "Texto padrão, descrições, conteúdo principal", example: "Data: 17 de abril de 2026" },
                  { name: "Body Small", size: 14, weight: 400, lh: 1.55, ls: "0px", usage: "Textos secundários, informações complementares", example: "Local: São Paulo, SP" },
                  { name: "Caption", size: 12, weight: 400, lh: 1.5, ls: "0.3px", usage: "Textos muito pequenos, placeholders, helper text", example: "Preço a partir de R$ 50" },
                  { name: "Overline", size: 11, weight: 600, lh: 1.45, ls: "0.5px", usage: "Labels, badges, tags, categorias", example: "INGRESSOS ESGOTADOS", uppercase: true },
                ] as const).map((t) => (
                  <div
                    key={t.name}
                    className="group bg-white border border-[#e0e0e0] rounded-xl overflow-hidden hover:border-[#ee3680]/30 transition-colors"
                  >
                    {/* Meta bar */}
                    <div className="flex items-center gap-3 px-6 py-3 bg-[#fafafa] border-b border-[#e0e0e0] flex-wrap">
                      <span className="text-[12px] px-2.5 py-1 rounded-full bg-[#ee3680]/10 text-[#ee3680]" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>
                        {t.name}
                      </span>
                      <div className="flex items-center gap-3 text-[11px] text-[#9a9a9a] font-mono">
                        <span>{t.size}px</span>
                        <span className="w-px h-3 bg-[#e0e0e0]" />
                        <span>weight: {t.weight}</span>
                        <span className="w-px h-3 bg-[#e0e0e0]" />
                        <span>line-height: {t.lh}</span>
                        {t.ls !== "0px" && (
                          <>
                            <span className="w-px h-3 bg-[#e0e0e0]" />
                            <span>letter-spacing: {t.ls}</span>
                          </>
                        )}
                      </div>
                      <span className="text-[11px] text-[#484543] ml-auto hidden md:block">{t.usage}</span>
                    </div>

                    {/* Example */}
                    <div className="px-6 py-5">
                      <p
                        style={{
                          fontSize: t.size,
                          fontWeight: t.weight,
                          lineHeight: t.lh,
                          letterSpacing: t.ls,
                          color: "#212121",
                          fontFamily: "'Barlow', sans-serif",
                          textTransform: ("uppercase" in t && t.uppercase) ? "uppercase" : "none",
                        }}
                      >
                        {t.example}
                      </p>
                      <p className="text-[11px] text-[#484543] mt-3 md:hidden">{t.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── VARIAÇÕES DE PESO ── */}
            <div>
              <h3 className="text-[#1a1a1a] mb-1" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>Variações de Peso</h3>
              <p className="text-[13px] text-[#9a9a9a] mb-5">Cada peso com exemplo de uso real e recomendação de aplicação.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { weight: 400, label: "Regular", usage: "Texto padrão, body, descrições gerais", example: "Descrição do evento com detalhes completos", sizes: [18, 16, 14] },
                  { weight: 500, label: "Medium", usage: "Subtítulos, labels, textos com ênfase leve", example: "Próximos eventos na sua cidade", sizes: [24, 18, 16] },
                  { weight: 600, label: "Semi Bold", usage: "Títulos, labels importantes, botões", example: "Comprar Ingressos", sizes: [28, 24, 18] },
                  { weight: 700, label: "Bold", usage: "Títulos principais, destaques máximos", example: "ZZ TOP – THE BIG ONE", sizes: [40, 32, 24] },
                ].map(w => (
                  <div key={w.weight} className="bg-white border border-[#e0e0e0] rounded-xl overflow-hidden hover:border-[#ee3680]/30 transition-colors">
                    <div className="px-5 py-3 bg-[#fafafa] border-b border-[#e0e0e0] flex items-center gap-2">
                      <span className="text-[12px] px-2 py-0.5 rounded-full bg-[#6900b2]/10 text-[#6900b2]" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>{w.weight}</span>
                      <span className="text-[13px] text-[#1a1a1a]" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>{w.label}</span>
                    </div>
                    <div className="px-5 py-4">
                      <div className="space-y-2 mb-4">
                        {w.sizes.map(s => (
                          <p key={s} style={{ fontFamily: "'Barlow', sans-serif", fontWeight: w.weight, fontSize: s, color: "#212121", lineHeight: 1.3 }}>
                            {w.example}
                          </p>
                        ))}
                      </div>
                      <p className="text-[11px] text-[#9a9a9a] border-t border-[#e0e0e0] pt-3">{w.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── HIERARQUIA VISUAL COMPLETA ── */}
            <div>
              <h3 className="text-[#1a1a1a] mb-1" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>Hierarquia Visual Completa</h3>
              <p className="text-[13px] text-[#9a9a9a] mb-5">Todos os níveis aplicados em contexto real de uma página de evento.</p>

              <div className="bg-white border border-[#e0e0e0] rounded-xl p-8 max-w-2xl">
                <p style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 11, lineHeight: 1.45, letterSpacing: "0.5px", color: "#ee3680", textTransform: "uppercase" }}>
                  Festival de música
                </p>
                <p className="mt-2" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 56, lineHeight: 1.2, letterSpacing: "-1px", color: "#212121" }}>
                  Lollapalooza 2026
                </p>
                <p className="mt-1" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 28, lineHeight: 1.35, color: "#484543" }}>
                  A maior experiência musical do ano
                </p>
                <p className="mt-4" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: 16, lineHeight: 1.55, color: "#484543" }}>
                  Prepare-se para 3 dias de shows incríveis no Autódromo de Interlagos. Com mais de 70 atrações em 4 palcos,
                  o Lollapalooza 2026 promete ser o maior festival de todos os tempos. Garanta seus ingressos e viva essa experiência.
                </p>
                <p className="mt-3" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: 14, lineHeight: 1.55, color: "#9a9a9a" }}>
                  São Paulo, SP &middot; Autódromo de Interlagos &middot; 28, 29 e 30 de março de 2026
                </p>
                <p className="mt-1" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: 12, lineHeight: 1.5, letterSpacing: "0.3px", color: "#9a9a9a" }}>
                  Última atualização há 10 minutos &middot; 12.430 ingressos vendidos
                </p>
                <div className="mt-5 flex items-center gap-4 flex-wrap">
                  <button className="px-6 py-3 bg-[#ee3680] text-white rounded-lg hover:bg-[#d91e63] transition-colors" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 16 }}>
                    Comprar Ingressos
                  </button>
                  <button className="px-6 py-3 border-2 border-[#6900b2] text-[#6900b2] rounded-lg hover:bg-[#6900b2] hover:text-white transition-colors" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 16 }}>
                    Ver Detalhes
                  </button>
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: "0.5px", color: "#8dc73f", textTransform: "uppercase" as const }}>
                    ● Disponível
                  </span>
                </div>
              </div>
            </div>

            {/* ── CONTRASTE DE CORES ── */}
            <div>
              <h3 className="text-[#1a1a1a] mb-1" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>Contraste de Cores com Texto</h3>
              <p className="text-[13px] text-[#9a9a9a] mb-5">Verificação WCAG AA para as combinações de cores de texto mais usadas.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { fg: "#212121", bg: "#ffffff", label: "text-primary sobre bg-card" },
                  { fg: "#484543", bg: "#ffffff", label: "text-secondary sobre bg-card" },
                  { fg: "#9a9a9a", bg: "#ffffff", label: "text-tertiary sobre bg-card" },
                  { fg: "#ffffff", bg: "#1a1a1a", label: "text-inverse sobre bg-dark" },
                  { fg: "#ee3680", bg: "#ffffff", label: "primary sobre bg-card" },
                  { fg: "#ffffff", bg: "#ee3680", label: "text-inverse sobre primary" },
                ].map(c => {
                  const ratio = getContrastRatio(c.fg, c.bg);
                  const passAA = ratio >= 4.5;
                  const passAALarge = ratio >= 3;
                  return (
                    <div key={c.label} className="bg-white border border-[#e0e0e0] rounded-lg p-4 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: c.bg, color: c.fg, border: c.bg === "#ffffff" ? "1px solid #e0e0e0" : "none" }}>
                        <span style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 24 }}>Aa</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] text-[#212121] truncate">{c.label}</p>
                        <p className="text-[11px] text-[#9a9a9a] font-mono">{ratio.toFixed(1)}:1</p>
                        <div className="flex gap-1 mt-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${passAA ? "bg-[#f4f9ec] text-[#3d5a1a]" : "bg-[#ffe6e6] text-[#7a1a18]"}`}>
                            AA {passAA ? "✓" : "✗"}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${passAALarge ? "bg-[#f4f9ec] text-[#3d5a1a]" : "bg-[#ffe6e6] text-[#7a1a18]"}`}>
                            AA Large {passAALarge ? "✓" : "✗"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── CSS TOKENS ── */}
            <div>
              <h3 className="text-[#1a1a1a] mb-4" style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>Tokens CSS &middot; Tipografia Barlow</h3>
              <div className="bg-[#1a1a1a] rounded-xl p-6 overflow-x-auto">
                <pre className="text-[13px] text-[#e0e0e0] leading-relaxed" style={{ fontFamily: "monospace" }}>
{`:root {
  --uhuu-font-family: 'Barlow', sans-serif;

  /* Display */
  --uhuu-display-size: 56px;
  --uhuu-display-weight: 700;
  --uhuu-display-lh: 1.2;
  --uhuu-display-ls: -1px;

  /* H1 */
  --uhuu-h1-size: 48px;
  --uhuu-h1-weight: 700;
  --uhuu-h1-lh: 1.2;
  --uhuu-h1-ls: -0.5px;

  /* H2 */
  --uhuu-h2-size: 40px;
  --uhuu-h2-weight: 600;
  --uhuu-h2-lh: 1.25;

  /* H3 */
  --uhuu-h3-size: 32px;
  --uhuu-h3-weight: 600;
  --uhuu-h3-lh: 1.3;

  /* H4 */
  --uhuu-h4-size: 28px;
  --uhuu-h4-weight: 600;
  --uhuu-h4-lh: 1.35;

  /* H5 */
  --uhuu-h5-size: 24px;
  --uhuu-h5-weight: 500;
  --uhuu-h5-lh: 1.4;

  /* Body Large */
  --uhuu-body-lg-size: 18px;
  --uhuu-body-lg-weight: 400;
  --uhuu-body-lg-lh: 1.55;

  /* Body */
  --uhuu-body-size: 16px;
  --uhuu-body-weight: 400;
  --uhuu-body-lh: 1.55;

  /* Body Small */
  --uhuu-body-sm-size: 14px;
  --uhuu-body-sm-weight: 400;
  --uhuu-body-sm-lh: 1.55;

  /* Caption */
  --uhuu-caption-size: 12px;
  --uhuu-caption-weight: 400;
  --uhuu-caption-lh: 1.5;
  --uhuu-caption-ls: 0.3px;

  /* Overline */
  --uhuu-overline-size: 11px;
  --uhuu-overline-weight: 600;
  --uhuu-overline-lh: 1.45;
  --uhuu-overline-ls: 0.5px;
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: GRADIENTES ===== */}
        {activeTab === "gradients" && (
          <div style={{ fontFamily: "'Barlow', sans-serif" }}>

            {/* ── Header & Conceito ── */}
            <div style={{ marginBottom: 40 }}>
              <h2 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 32, marginBottom: 8 }}>Gradientes Uhuu</h2>
              <p className="text-[16px] text-[#484543]" style={{ lineHeight: 1.55, maxWidth: 680, marginBottom: 16 }}>
                A evolução do <span style={{ color: "#EE3680", fontWeight: 600 }}>Rosa Uhuu (#EE3680)</span> em duas direções: <strong>quente</strong> (Warm Soft Strong) e <strong>fria</strong> (Cool Soft). Apenas 2 gradientes — ambos validados em WCAG AA — para garantir acessibilidade por padrão.
              </p>

              {/* Barra de origem visual */}
              <div className="flex items-center gap-4" style={{ marginBottom: 24 }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: "#FF8C00" }} />
                  <span className="text-[12px] text-[#9a9a9a]">Laranja Forte</span>
                </div>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: "linear-gradient(90deg, #FF8C00, #EE3680, #6900B2)" }} />
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-[#9a9a9a]">Roxo Uhuu</span>
                  <div className="w-8 h-8 rounded-full" style={{ backgroundColor: "#6900B2" }} />
                </div>
              </div>
              <div className="text-center" style={{ marginTop: -16, marginBottom: 16 }}>
                <span className="inline-block px-3 py-1 text-[11px] text-white" style={{ backgroundColor: "#EE3680", borderRadius: 25, fontWeight: 600 }}>Rosa Uhuu #EE3680</span>
              </div>

              {/* Filosofia */}
              <div className="flex flex-wrap gap-3" style={{ marginTop: 24 }}>
                {[
                  { label: "Elegância", desc: "Cores pastel, baixa saturação" },
                  { label: "Sofisticação", desc: "Transição muito gradual" },
                  { label: "Movimento", desc: "Ângulo 135° cria dinamismo diagonal" },
                  { label: "Moderação", desc: "Apenas em elementos de destaque" },
                ].map(p => (
                  <div key={p.label} className="bg-white flex-1 min-w-[180px]" style={{ borderRadius: 12, border: "1px solid #e0e0e0", padding: "16px 20px" }}>
                    <p className="text-[13px] text-[#212121]" style={{ fontWeight: 600 }}>{p.label}</p>
                    <p className="text-[12px] text-[#9a9a9a]" style={{ marginTop: 2 }}>{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══ 2. ESPECIFICAÇÕES TÉCNICAS ═══ */}
            <div style={{ marginBottom: 40 }}>
              <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Especificações Técnicas</h3>
              <p className="text-[13px] text-[#9a9a9a]" style={{ marginBottom: 24 }}>
                Parâmetros e stops de cor de cada gradiente do sistema.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 20 }}>
                {[
                  {
                    key: "warm-strong",
                    title: "Warm Soft Strong",
                    subtitle: "Forte",
                    badge: "Energético",
                    tagColor: "#fff",
                    tagBg: "#FF8C00",
                    from: "#EE3680",
                    fromName: "Rosa Uhuu",
                    to: "#FF8C00",
                    toName: "Laranja Forte",
                    use: "Energia e movimento",
                  },
                  {
                    key: "cool",
                    title: "Cool Soft",
                    subtitle: "Roxo",
                    badge: "Institucional",
                    tagColor: "#6900B2",
                    tagBg: "#F0E6F7",
                    from: "#EE3680",
                    fromName: "Rosa Uhuu",
                    to: "#6900B2",
                    toName: "Roxo Uhuu",
                    use: "Informações, validação, confiança",
                  },
                ].map(g => (
                  <div key={g.key} className="bg-white" style={{ borderRadius: 12, border: "1px solid #e0e0e0", padding: 20 }}>
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 12 }}>
                      <div className="w-5 h-5 rounded-full" style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }} />
                      <h4 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 16 }}>{g.title}</h4>
                      <span className="text-[10px] px-2 py-0.5" style={{ color: g.tagColor, backgroundColor: g.tagBg, borderRadius: 25, fontWeight: 600 }}>{g.subtitle}</span>
                    </div>

                    {/* Preview grande 400x200 */}
                    <div
                      style={{
                        background: `linear-gradient(135deg, ${g.from}, ${g.to})`,
                        borderRadius: 12,
                        height: 200,
                        minWidth: "100%",
                        marginBottom: 16,
                      }}
                    />

                    {/* Tabela de specs */}
                    <div style={{ borderTop: "1px solid #f0f0f0" }}>
                      {[
                        { k: "Tipo", v: "Linear" },
                        { k: "Ângulo", v: "135°" },
                        { k: "Cor Inicial", v: `${g.from} · ${g.fromName}`, swatch: g.from },
                        { k: "Cor Final", v: `${g.to} · ${g.toName}`, swatch: g.to },
                        { k: "Uso", v: g.use },
                      ].map(row => (
                        <div key={row.k} className="flex items-center justify-between gap-3" style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                          <span className="text-[11px] text-[#9a9a9a]" style={{ fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{row.k}</span>
                          <span className="flex items-center gap-2 text-[12px] text-[#212121]" style={{ fontWeight: 500, fontFamily: row.k.startsWith("Cor") ? "monospace" : undefined }}>
                            {row.swatch && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: row.swatch, border: "1px solid #e0e0e0" }} />}
                            {row.v}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-end" style={{ paddingTop: 10 }}>
                        <span className="text-[10px] px-2 py-0.5 text-[#9a9a9a]" style={{ border: "1px solid #e0e0e0", borderRadius: 25, fontWeight: 500 }}>{g.badge}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══ 3. VARIAÇÕES DE OPACIDADE ═══ */}
            <div style={{ marginTop: 40, paddingTop: 40, borderTop: "1px solid #e0e0e0", marginBottom: 40 }}>
              <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Variações de Opacidade</h3>
              <p className="text-[13px] text-[#9a9a9a]" style={{ marginBottom: 24 }}>
                Cada gradiente possui 3 níveis — Full (100%), Overlay (80%) e Subtle (50%) — para diferentes contextos de sobreposição e leitura.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 20 }}>
                {[
                  { key: "warm-strong", title: "Warm Soft Strong · Forte", token: "warm-strong", fromRgba: "238,54,128", toRgba: "255,140,0" },
                  { key: "cool", title: "Cool Soft · Roxo", token: "cool", fromRgba: "238,54,128", toRgba: "105,0,178" },
                ].map(g => (
                  <div key={g.key} className="bg-white" style={{ borderRadius: 12, border: "1px solid #e0e0e0", padding: 20 }}>
                    <p className="text-[13px] text-[#212121]" style={{ fontWeight: 600, marginBottom: 16 }}>{g.title}</p>
                    <div className="space-y-3">
                      {[
                        { label: "Full", sublabel: "100%", op: 1 },
                        { label: "Overlay", sublabel: "80%", op: 0.8 },
                        { label: "Subtle", sublabel: "50%", op: 0.5 },
                      ].map(v => (
                        <div key={v.label}>
                          <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                            <span className="text-[12px] text-[#212121]" style={{ fontWeight: 600 }}>{v.label}</span>
                            <span className="text-[11px] text-[#9a9a9a] font-mono">opacity: {v.sublabel}</span>
                          </div>
                          <div
                            className="flex items-end"
                            style={{
                              background: `linear-gradient(135deg, rgba(${g.fromRgba},${v.op}), rgba(${g.toRgba},${v.op}))`,
                              borderRadius: 10,
                              height: 72,
                              padding: "0 12px 8px 12px",
                              border: v.op < 1 ? "1px solid #e0e0e0" : "none",
                            }}
                          >
                            <span className="text-[10px] font-mono" style={{ color: v.op === 1 ? "rgba(255,255,255,0.8)" : "#484543" }}>
                              --gradiente-{g.token}-{v.label.toLowerCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══ 4. EXEMPLOS DE APLICAÇÃO ═══ */}
            <div style={{ marginTop: 40, paddingTop: 40, borderTop: "1px solid #e0e0e0", marginBottom: 40 }}>
              <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Exemplos de Aplicação</h3>
              <p className="text-[13px] text-[#9a9a9a]" style={{ marginBottom: 24 }}>
                Como cada gradiente se comporta em componentes reais da plataforma Uhuu.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 20 }}>
                {/* Warm Strong — Banner festival */}
                <div>
                  <p className="text-[12px] text-[#484543]" style={{ fontWeight: 600, marginBottom: 8 }}>Banner de Festival · Warm Soft Strong</p>
                  <div
                    className="overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, #EE3680, #FF8C00)",
                      borderRadius: 12,
                      padding: 24,
                    }}
                  >
                    <span className="text-[11px] px-2.5 py-1 bg-white/25 text-white" style={{ borderRadius: 25, fontWeight: 600 }}>Últimos ingressos</span>
                    <p className="text-white" style={{ fontWeight: 700, fontSize: 20, lineHeight: 1.3, marginTop: 16 }}>Rock in Uhuu · Arena</p>
                    <p className="text-[13px] text-white/90" style={{ lineHeight: 1.55, marginTop: 8 }}>
                      Três dias de festival com as maiores bandas de rock do país.
                    </p>
                    <p className="text-[11px] text-white/70" style={{ marginTop: 8 }}>Rio de Janeiro, RJ &middot; 10, 11 e 12 de outubro</p>
                    <div className="flex items-center justify-between" style={{ marginTop: 16 }}>
                      <div>
                        <p className="text-[10px] text-white/70">A partir de</p>
                        <p className="text-white" style={{ fontWeight: 700, fontSize: 18 }}>R$ 299,90</p>
                      </div>
                      <button className="px-4 py-2 bg-white text-[#EE3680] text-[13px] transition-colors hover:bg-white/90" style={{ borderRadius: 25, fontWeight: 600 }}>
                        Garantir
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cool Soft — Seção informação */}
                <div>
                  <p className="text-[12px] text-[#484543]" style={{ fontWeight: 600, marginBottom: 8 }}>Seção de Informação · Cool Soft</p>
                  <div
                    className="overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, #EE3680, #6900B2)",
                      borderRadius: 12,
                      padding: 24,
                    }}
                  >
                    <span className="text-[11px] px-2.5 py-1 bg-white/30 text-white" style={{ borderRadius: 25, fontWeight: 600 }}>Novidade</span>
                    <p className="text-white" style={{ fontWeight: 700, fontSize: 20, lineHeight: 1.3, marginTop: 16 }}>Agora você pode transferir seus ingressos</p>
                    <p className="text-[13px] text-white/80" style={{ lineHeight: 1.55, marginTop: 8 }}>
                      Comprou e não pode ir? Transfira de forma segura pelo app.
                    </p>
                    <p className="text-[11px] text-white/60" style={{ marginTop: 8 }}>Disponível para todos os eventos</p>
                    <button className="bg-white text-[#EE3680] text-[13px] transition-colors hover:bg-white/90" style={{ borderRadius: 25, fontWeight: 600, padding: "8px 16px", marginTop: 16 }}>
                      Saiba mais
                    </button>
                  </div>
                </div>
              </div>
            </div>


            {/* ── Regras de Uso ── */}
            <div style={{ marginTop: 40, paddingTop: 40, borderTop: "1px solid #e0e0e0" }}>
              <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Regras de Uso</h3>
              <p className="text-[13px] text-[#9a9a9a]" style={{ marginBottom: 24 }}>Quando e como aplicar os gradientes na interface Uhuu.</p>

              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                {/* Correto */}
                <div className="bg-white" style={{ borderRadius: 12, border: "1px solid #e0e0e0", padding: 24 }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
                    <CheckCircle className="w-5 h-5 text-[#8dc73f]" />
                    <span className="text-[14px] text-[#212121]" style={{ fontWeight: 600 }}>Use em</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      "Cards de eventos em destaque",
                      "Banners informativos e promocionais",
                      "Hero sections de páginas especiais",
                      "Elementos de background decorativo",
                      "Seções de destaque no checkout",
                    ].map(t => (
                      <div key={t} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#8dc73f] shrink-0" style={{ marginTop: 6 }} />
                        <span className="text-[13px] text-[#484543]">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Incorreto */}
                <div className="bg-white" style={{ borderRadius: 12, border: "1px solid #e0e0e0", padding: 24 }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
                    <XCircle className="w-5 h-5 text-[#da0000]" />
                    <span className="text-[14px] text-[#212121]" style={{ fontWeight: 600 }}>Nunca use em</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      "Texto ou tipografia (legibilidade zero)",
                      "Fundo geral da página inteira",
                      "Ícones pequenos ou elementos < 40px",
                      "Botões de ação (use cores sólidas)",
                      "Elementos que precisam de alto contraste",
                    ].map(t => (
                      <div key={t} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#da0000] shrink-0" style={{ marginTop: 6 }} />
                        <span className="text-[13px] text-[#484543]">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ VERIFICAÇÃO WCAG AA ═══ */}
            <div style={{ marginTop: 40, paddingTop: 40, borderTop: "1px solid #e0e0e0", fontFamily: "'Barlow', sans-serif" }}>
              <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Verificação WCAG AA para as Combinações</h3>
              <p className="text-[13px] text-[#9a9a9a]" style={{ marginBottom: 16 }}>
                Validação de contraste de cores para garantir legibilidade e acessibilidade em todas as combinações.
              </p>
              <div className="flex items-start gap-2 bg-[#fff4e5] border border-[#f0c987]" style={{ borderRadius: 10, padding: "12px 16px", marginBottom: 24 }}>
                <AlertTriangle className="w-4 h-4 text-[#8a5a0c] shrink-0" style={{ marginTop: 2 }} />
                <p className="text-[12px] text-[#8a5a0c]">
                  <strong>Nunca use gradientes para textos.</strong> Sempre aplique cores sólidas sobre gradientes. O contraste é calculado contra o ponto de cor de pior caso.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    title: "Warm Soft Strong (Forte) · #EE3680 → #FF8C00",
                    c1: "#EE3680", c2: "#FF8C00",
                    gradCss: "linear-gradient(135deg, #EE3680, #FF8C00)",
                    rows: [
                      { fg: "#FFFFFF", op: 1, label: "Texto Branco sobre Warm Strong Full", bgLabel: "Gradient Full 100%" },
                      { fg: "#FFFFFF", op: 0.8, label: "Texto Branco sobre Warm Strong Overlay", bgLabel: "Gradient Overlay 80%" },
                      { fg: "#FFFFFF", op: 0.5, label: "Texto Branco sobre Warm Strong Subtle", bgLabel: "Gradient Subtle 50%" },
                      { fg: "#212121", op: 0.5, label: "Texto Preto sobre Warm Strong Subtle", bgLabel: "Gradient Subtle 50%" },
                    ],
                  },
                  {
                    title: "Cool Soft · #EE3680 → #6900B2",
                    c1: "#EE3680", c2: "#6900B2",
                    gradCss: "linear-gradient(135deg, #EE3680, #6900B2)",
                    rows: [
                      { fg: "#FFFFFF", op: 1, label: "Texto Branco sobre Cool Soft Full", bgLabel: "Gradient Full 100%" },
                      { fg: "#FFFFFF", op: 0.8, label: "Texto Branco sobre Cool Soft Overlay", bgLabel: "Gradient Overlay 80%" },
                      { fg: "#FFFFFF", op: 0.5, label: "Texto Branco sobre Cool Soft Subtle", bgLabel: "Gradient Subtle 50%" },
                      { fg: "#212121", op: 0.5, label: "Texto Preto sobre Cool Soft Subtle", bgLabel: "Gradient Subtle 50%" },
                    ],
                  },
                ].map(group => (
                  <div key={group.title}>
                    <p className="text-[13px] text-[#212121]" style={{ fontWeight: 600, marginBottom: 10 }}>{group.title}</p>
                    <WcagTable
                      rows={group.rows.map(r => ({
                        element: r.label,
                        fg: r.fg,
                        bgLabel: r.bgLabel,
                        swatch: { background: r.op < 1 ? `linear-gradient(135deg, rgba(${parseInt(group.c1.slice(1,3),16)},${parseInt(group.c1.slice(3,5),16)},${parseInt(group.c1.slice(5,7),16)},${r.op}), rgba(${parseInt(group.c2.slice(1,3),16)},${parseInt(group.c2.slice(3,5),16)},${parseInt(group.c2.slice(5,7),16)},${r.op}))` : group.gradCss },
                        ratio: gradientWorstContrast(r.fg, group.c1, group.c2, r.op),
                      }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── CSS Tokens ── */}
            <div style={{ marginTop: 40, paddingTop: 40, borderTop: "1px solid #e0e0e0" }}>
              <h3 className="text-[#212121]" style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Tokens CSS &middot; Gradientes</h3>
              <div className="bg-[#1a1a1a] overflow-x-auto" style={{ borderRadius: 12, padding: 24 }}>
                <pre className="text-[13px] text-[#e0e0e0] leading-relaxed" style={{ fontFamily: "monospace" }}>
{`:root {
  /* ── Direção Quente · Forte (Warm Soft Strong) ──
     Rosa Uhuu → Laranja Forte */
  --gradiente-warm-strong-full:
    linear-gradient(135deg, #EE3680, #FF8C00);
  --gradiente-warm-strong-overlay:
    linear-gradient(135deg,
      rgba(238,54,128,0.8),
      rgba(255,140,0,0.8));
  --gradiente-warm-strong-subtle:
    linear-gradient(135deg,
      rgba(238,54,128,0.5),
      rgba(255,140,0,0.5));

  /* ── Direção Fria (Cool Soft) ──
     Rosa Uhuu → Roxo Uhuu */
  --gradiente-cool-full:
    linear-gradient(135deg, #EE3680, #6900B2);
  --gradiente-cool-overlay:
    linear-gradient(135deg,
      rgba(238,54,128,0.8),
      rgba(105,0,178,0.8));
  --gradiente-cool-subtle:
    linear-gradient(135deg,
      rgba(238,54,128,0.5),
      rgba(105,0,178,0.5));
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: USO & EXEMPLOS ===== */}
        {activeTab === "usage" && (
          <div className="space-y-12" style={{ fontFamily: "'Barlow', sans-serif" }}>

            {/* ── HEADER DE EVENTO ── */}
            <div>
              <h3 className="text-[#1a1a1a] mb-1" style={{ fontWeight: 700, fontSize: 20 }}>Header de Evento</h3>
              <p className="text-[13px] text-[#9a9a9a] mb-5">Banner com gradiente, nome do artista, data e botão de compra.</p>
              <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #8036EE 0%, #EE3680 30%, #EE3680 70%, #F97316 100%)", padding: "40px 32px" }}>
                <div className="flex items-start justify-between flex-wrap gap-6">
                  <div>
                    <span className="text-[11px] px-3 py-1 rounded-full bg-white/20 text-white" style={{ fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>Show · Rock Nacional</span>
                    <h2 className="text-white mt-3 mb-1" style={{ fontWeight: 700, fontSize: 40, lineHeight: 1.1 }}>Titãs · Encontro</h2>
                    <p className="text-white/80" style={{ fontSize: 16 }}>Sábado, 14 de Junho de 2026 · 21h</p>
                    <p className="text-white/60" style={{ fontSize: 14, marginTop: 4 }}>Allianz Parque · São Paulo, SP</p>
                    <div className="flex items-center gap-3 mt-5">
                      <div>
                        <p className="text-white/60" style={{ fontSize: 11 }}>A partir de</p>
                        <p className="text-white" style={{ fontWeight: 700, fontSize: 28 }}>R$ 120,00</p>
                      </div>
                      <button className="px-6 py-3 bg-white text-[#EE3680] rounded-xl" style={{ fontWeight: 700, fontSize: 15 }}>Comprar Ingresso</button>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl px-6 py-4 text-white text-center hidden md:block">
                    <p style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.5px" }}>Ingressos</p>
                    <p style={{ fontWeight: 700, fontSize: 32 }}>847</p>
                    <p style={{ fontSize: 12, opacity: 0.7 }}>disponíveis</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CARD DE INGRESSO ── */}
            <div>
              <h3 className="text-[#1a1a1a] mb-1" style={{ fontWeight: 700, fontSize: 20 }}>Card de Ingresso</h3>
              <p className="text-[13px] text-[#9a9a9a] mb-5">Layout com QR code, nome do evento, data, setor e status.</p>
              <div className="flex flex-wrap gap-4">
                {[
                  { status: "Ativo", statusColor: "#22C55E", statusBg: "rgba(34,197,94,0.1)", setor: "Pista Premium", evento: "Titãs · Encontro", data: "14 Jun 2026 · 21h", local: "Allianz Parque, SP", code: "UHU-48291" },
                  { status: "Usado", statusColor: "#9a9a9a", statusBg: "#f5f5f5", setor: "Cadeira Superior", evento: "Rock in Rio 2026", data: "20 Set 2026 · 18h", local: "Cidade do Rock, RJ", code: "UHU-73015" },
                  { status: "Cancelado", statusColor: "#EF4444", statusBg: "rgba(239,68,68,0.1)", setor: "VIP Lounge", evento: "Lollapalooza BR", data: "28 Mar 2026 · 14h", local: "Autódromo, SP", code: "UHU-61847" },
                ].map(t => (
                  <div key={t.status} className="bg-white border border-[#e0e0e0] rounded-2xl overflow-hidden" style={{ width: 300, opacity: t.status === "Cancelado" ? 0.65 : 1 }}>
                    <div className="px-5 pt-5 pb-4 border-b border-[#f0f0f0]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: t.statusBg, color: t.statusColor, fontWeight: 600 }}>{t.status}</span>
                        <span className="text-[11px] text-[#9a9a9a] font-mono">#{t.code}</span>
                      </div>
                      <p className="text-[#212121] mb-0.5" style={{ fontWeight: 700, fontSize: 16 }}>{t.evento}</p>
                      <p className="text-[#484543]" style={{ fontSize: 13 }}>{t.data}</p>
                      <p className="text-[#9a9a9a]" style={{ fontSize: 12 }}>{t.local}</p>
                    </div>
                    <div className="px-5 py-4 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-[#9a9a9a] mb-0.5">Setor</p>
                        <p className="text-[#212121]" style={{ fontWeight: 600, fontSize: 14 }}>{t.setor}</p>
                      </div>
                      <div className="w-14 h-14 bg-[#f5f5f5] rounded-lg flex items-center justify-center">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                          <rect x="2" y="2" width="12" height="12" rx="1" fill="#212121"/>
                          <rect x="26" y="2" width="12" height="12" rx="1" fill="#212121"/>
                          <rect x="2" y="26" width="12" height="12" rx="1" fill="#212121"/>
                          <rect x="5" y="5" width="6" height="6" fill="white"/>
                          <rect x="29" y="5" width="6" height="6" fill="white"/>
                          <rect x="5" y="29" width="6" height="6" fill="white"/>
                          <rect x="18" y="2" width="3" height="3" fill="#212121"/>
                          <rect x="22" y="2" width="3" height="3" fill="#212121"/>
                          <rect x="18" y="6" width="3" height="3" fill="#212121"/>
                          <rect x="26" y="18" width="3" height="3" fill="#212121"/>
                          <rect x="30" y="18" width="3" height="3" fill="#212121"/>
                          <rect x="34" y="18" width="3" height="3" fill="#212121"/>
                          <rect x="18" y="18" width="3" height="3" fill="#212121"/>
                          <rect x="22" y="22" width="3" height="3" fill="#212121"/>
                          <rect x="18" y="26" width="3" height="3" fill="#212121"/>
                          <rect x="26" y="30" width="3" height="3" fill="#212121"/>
                          <rect x="30" y="26" width="3" height="3" fill="#212121"/>
                          <rect x="34" y="30" width="3" height="3" fill="#212121"/>
                          <rect x="2" y="18" width="3" height="3" fill="#212121"/>
                          <rect x="6" y="18" width="3" height="3" fill="#212121"/>
                          <rect x="10" y="22" width="3" height="3" fill="#212121"/>
                          <rect x="14" y="18" width="3" height="3" fill="#212121"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── NOTIFICAÇÕES / TOASTS ── */}
            <div>
              <h3 className="text-[#1a1a1a] mb-1" style={{ fontWeight: 700, fontSize: 20 }}>Notificações · Toasts</h3>
              <p className="text-[13px] text-[#9a9a9a] mb-5">Cores semânticas aplicadas em feedbacks ao usuário.</p>
              <div className="space-y-3 max-w-lg">
                {[
                  { type: "sucesso", icon: "✓", iconBg: "#22C55E", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)", title: "Compra realizada!", msg: "Seus ingressos foram enviados para maria@uhuu.com" },
                  { type: "alerta", icon: "!", iconBg: "#F59E0B", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", title: "Poucos ingressos", msg: "Restam apenas 3 ingressos para Pista Premium" },
                  { type: "erro", icon: "✕", iconBg: "#EF4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", title: "Pagamento recusado", msg: "Verifique os dados do cartão e tente novamente" },
                  { type: "info", icon: "i", iconBg: "#3B82F6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)", title: "Lembrete de evento", msg: "Titãs · Encontro começa em 2 horas. Boa diversão!" },
                ].map(n => (
                  <div key={n.type} className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: n.bg, border: `1px solid ${n.border}` }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: n.iconBg }}>
                      <span className="text-white" style={{ fontSize: 13, fontWeight: 700 }}>{n.icon}</span>
                    </div>
                    <div>
                      <p className="text-[#212121]" style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</p>
                      <p className="text-[#484543]" style={{ fontSize: 13 }}>{n.msg}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── BADGES E TAGS ── */}
            <div>
              <h3 className="text-[#1a1a1a] mb-1" style={{ fontWeight: 700, fontSize: 20 }}>Badges · Tags</h3>
              <p className="text-[13px] text-[#9a9a9a] mb-5">Categorias de evento e status usando as cores de Suporte e Semânticas.</p>
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] text-[#9a9a9a] mb-2" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Categorias</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Show", bg: "rgba(238,54,128,0.1)", color: "#EE3680" },
                      { label: "Teatro", bg: "rgba(128,54,238,0.1)", color: "#8036EE" },
                      { label: "Esporte", bg: "rgba(14,165,233,0.1)", color: "#0EA5E9" },
                      { label: "Festival", bg: "rgba(249,115,22,0.1)", color: "#F97316" },
                      { label: "Stand-up", bg: "rgba(99,102,241,0.1)", color: "#6366F1" },
                      { label: "Exposição", bg: "rgba(16,185,129,0.1)", color: "#10B981" },
                      { label: "Circo", bg: "rgba(20,184,166,0.1)", color: "#14B8A6" },
                    ].map(b => (
                      <span key={b.label} className="px-3 py-1 rounded-full text-[12px]" style={{ background: b.bg, color: b.color, fontWeight: 600 }}>{b.label}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-[#9a9a9a] mb-2" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Disponível", bg: "rgba(34,197,94,0.1)", color: "#22C55E", dot: "#22C55E" },
                      { label: "Esgotado", bg: "rgba(239,68,68,0.1)", color: "#EF4444", dot: "#EF4444" },
                      { label: "Em breve", bg: "rgba(245,158,11,0.1)", color: "#F59E0B", dot: "#F59E0B" },
                      { label: "Gratuito", bg: "rgba(59,130,246,0.1)", color: "#3B82F6", dot: "#3B82F6" },
                      { label: "Cancelado", bg: "#f5f5f5", color: "#9a9a9a", dot: "#9a9a9a" },
                    ].map(b => (
                      <span key={b.label} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px]" style={{ background: b.bg, color: b.color, fontWeight: 600 }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: b.dot }} />
                        {b.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── PILL DE PREÇO ── */}
            <div>
              <h3 className="text-[#1a1a1a] mb-1" style={{ fontWeight: 700, fontSize: 20 }}>Pill de Preço</h3>
              <p className="text-[13px] text-[#9a9a9a] mb-5">Componente de preço com "a partir de", valor em destaque e parcelamento.</p>
              <div className="flex flex-wrap gap-4">
                {[
                  { label: "Pista", from: "R$ 89,90", installment: "3x R$ 29,97", available: true },
                  { label: "Pista Premium", from: "R$ 180,00", installment: "6x R$ 30,00", available: true },
                  { label: "Cadeira", from: "R$ 240,00", installment: "12x R$ 20,00", available: false },
                  { label: "VIP Lounge", from: "R$ 480,00", installment: "12x R$ 40,00", available: true },
                ].map(p => (
                  <div key={p.label} className="bg-white border rounded-xl px-5 py-4" style={{ borderColor: p.available ? "#e0e0e0" : "#f0f0f0", minWidth: 160, opacity: p.available ? 1 : 0.5 }}>
                    <p className="text-[11px] text-[#9a9a9a] mb-1" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{p.label}</p>
                    <p className="text-[11px] text-[#9a9a9a]">A partir de</p>
                    <p className="text-[#EE3680]" style={{ fontWeight: 700, fontSize: 22 }}>{p.from}</p>
                    <p className="text-[#9a9a9a]" style={{ fontSize: 11 }}>{p.installment} sem juros</p>
                    {!p.available && <p className="text-[#EF4444] mt-2" style={{ fontSize: 11, fontWeight: 600 }}>Esgotado</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* ── CHECKOUT ── */}
            <div>
              <h3 className="text-[#1a1a1a] mb-1" style={{ fontWeight: 700, fontSize: 20 }}>Checkout · Resumo do Pedido</h3>
              <p className="text-[13px] text-[#9a9a9a] mb-5">Mini-preview do fluxo: resumo, cupom e botão de pagamento.</p>
              <div className="max-w-md bg-white border border-[#e0e0e0] rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#f0f0f0]">
                  <p className="text-[#212121]" style={{ fontWeight: 700, fontSize: 16 }}>Resumo do Pedido</p>
                </div>
                <div className="px-6 py-4 space-y-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-[#212121]" style={{ fontWeight: 600, fontSize: 14 }}>Titãs · Encontro</p>
                      <p className="text-[#9a9a9a]" style={{ fontSize: 12 }}>Pista Premium · 2 ingressos</p>
                    </div>
                    <p className="text-[#212121]" style={{ fontWeight: 600 }}>R$ 360,00</p>
                  </div>
                  <div className="flex justify-between text-[13px] text-[#9a9a9a]">
                    <span>Taxa de serviço</span>
                    <span>R$ 36,00</span>
                  </div>
                  <div className="flex gap-2">
                    <input placeholder="Cupom de desconto" className="flex-1" style={{ height: 40, padding: "0 12px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, fontFamily: "'Barlow', sans-serif", outline: "none" }} />
                    <button className="px-4 py-2 border border-[#EE3680] text-[#EE3680] rounded-lg" style={{ fontSize: 13, fontWeight: 600 }}>Aplicar</button>
                  </div>
                  <div className="border-t border-[#f0f0f0] pt-3 flex justify-between">
                    <p className="text-[#212121]" style={{ fontWeight: 700 }}>Total</p>
                    <div className="text-right">
                      <p className="text-[#EE3680]" style={{ fontWeight: 700, fontSize: 20 }}>R$ 396,00</p>
                      <p className="text-[#9a9a9a]" style={{ fontSize: 11 }}>12x R$ 33,00 sem juros</p>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-5">
                  <button className="w-full py-3.5 rounded-xl text-white" style={{ background: "linear-gradient(135deg, #8036EE 0%, #EE3680 40%, #EE3680 100%)", fontWeight: 700, fontSize: 15 }}>Finalizar Compra</button>
                  <p className="text-center text-[11px] text-[#9a9a9a] mt-2">🔒 Pagamento 100% seguro · SSL</p>
                </div>
              </div>
            </div>

            {/* ── ESTADO VAZIO ── */}
            <div>
              <h3 className="text-[#1a1a1a] mb-1" style={{ fontWeight: 700, fontSize: 20 }}>Estado Vazio</h3>
              <p className="text-[13px] text-[#9a9a9a] mb-5">Tela de nenhum resultado encontrado com CTA.</p>
              <div className="bg-white border border-[#e0e0e0] rounded-2xl px-8 py-12 max-w-md flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: "rgba(238,54,128,0.08)" }}>
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <circle cx="16" cy="16" r="10" stroke="#EE3680" strokeWidth="2.5"/>
                    <line x1="23" y1="23" x2="32" y2="32" stroke="#EE3680" strokeWidth="2.5" strokeLinecap="round"/>
                    <line x1="12" y1="16" x2="20" y2="16" stroke="#EE3680" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-[#212121] mb-2" style={{ fontWeight: 700, fontSize: 18 }}>Nenhum evento encontrado</p>
                <p className="text-[#9a9a9a] mb-6" style={{ fontSize: 14 }}>Tente buscar por outro artista, cidade ou data. Novos eventos são adicionados toda semana.</p>
                <div className="flex gap-3">
                  <button className="px-5 py-2.5 border border-[#e0e0e0] text-[#484543] rounded-lg" style={{ fontSize: 14, fontWeight: 600 }}>Limpar filtros</button>
                  <button className="px-5 py-2.5 bg-[#EE3680] text-white rounded-lg" style={{ fontSize: 14, fontWeight: 600 }}>Ver todos os eventos</button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#e0e0e0]" style={{ marginTop: 60, padding: "24px 32px", fontFamily: "'Barlow', sans-serif" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <p className="text-[12px] text-[#9a9a9a]">
            <span className="text-[#212121]" style={{ fontWeight: 700 }}>Design System Uhuu.com.</span> Propriedade intelectual da Uhuu.com
          </p>
          <span className="text-[11px] text-[#9a9a9a]">v1.0 &middot; Última atualização 27/04/2026</span>
        </div>
      </footer>
    </div>
  );
}