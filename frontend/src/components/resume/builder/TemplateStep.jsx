import { motion } from "framer-motion";
import { ArrowRight, Check, Layout, Palette, MinusSquare, Code2 } from "lucide-react";

const templates = [
  {
    id: "classic",
    name: "Classic Professional",
    description: "Traditional single-column layout trusted by Fortune 500 recruiters",
    accent: "#2563eb",
    icon: Layout,
    features: ["ATS Optimized", "Single Column", "Serif Headings"],
  },
  {
    id: "modern",
    name: "Modern Clean",
    description: "Contemporary design with subtle color accents and clear hierarchy",
    accent: "#7c3aed",
    icon: Palette,
    features: ["Bold Accents", "Clean Layout", "Professional"],
  },
  {
    id: "minimal",
    name: "Minimal Elegant",
    description: "Whitespace-focused design that lets your content shine",
    accent: "#0f172a",
    icon: MinusSquare,
    features: ["Whitespace Rich", "Centered Header", "Understated"],
  },
  {
    id: "technical",
    name: "Technical Pro",
    description: "Skills-forward layout optimized for tech and engineering roles",
    accent: "#059669",
    icon: Code2,
    features: ["Skills First", "Tech Focused", "Two-Tone"],
  },
];

export default function TemplateStep({
  selectedTemplate,
  setSelectedTemplate,
  setBuilderStep,
}) {
  return (
    <div>
      <h3 className="section-title" style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 20,
      }}>
        <Layout size={18} style={{ color: "var(--accent-tertiary)" }} />
        Choose a Template
      </h3>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
        gap: 16, marginBottom: 24,
      }}>
        {templates.map((t) => {
          const isActive = selectedTemplate === t.id;
          const Icon = t.icon;
          return (
            <motion.div
              key={t.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTemplate(t.id)}
              className="glass-card"
              style={{
                cursor: "pointer", position: "relative", overflow: "hidden",
                border: isActive
                  ? `2px solid ${t.accent}`
                  : "1px solid var(--border)",
                boxShadow: isActive ? `0 0 20px ${t.accent}33` : undefined,
                padding: 20,
              }}
            >
              {/* Selected checkmark */}
              {isActive && (
                <div style={{
                  position: "absolute", top: 12, right: 12,
                  width: 24, height: 24, borderRadius: "50%",
                  background: t.accent, display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Check size={14} color="#fff" />
                </div>
              )}

              {/* Mini resume preview bar */}
              <div style={{
                height: 100, borderRadius: "var(--radius-sm)",
                background: "var(--bg-glass)", border: "1px solid var(--border)",
                marginBottom: 14, padding: 12, overflow: "hidden",
              }}>
                {/* Simulated resume lines */}
                <div style={{
                  height: 10, width: "60%", borderRadius: 3,
                  background: t.accent, marginBottom: 8,
                  margin: t.id === "classic" || t.id === "minimal" ? "0 auto 8px" : "0 0 8px 0",
                }} />
                <div style={{ height: 5, width: "40%", borderRadius: 2, background: "var(--bg-tertiary)", marginBottom: 6,
                  margin: t.id === "classic" || t.id === "minimal" ? "0 auto 6px" : undefined,
                }} />
                <div style={{ height: 3, width: "80%", borderRadius: 2, background: "var(--bg-tertiary)", marginBottom: 4 }} />
                <div style={{ height: 3, width: "65%", borderRadius: 2, background: "var(--bg-tertiary)", marginBottom: 4 }} />
                <div style={{ height: 3, width: "75%", borderRadius: 2, background: "var(--bg-tertiary)", marginBottom: 8 }} />
                <div style={{ height: 6, width: "30%", borderRadius: 2, background: t.accent + "44", marginBottom: 4 }} />
                <div style={{ height: 3, width: "90%", borderRadius: 2, background: "var(--bg-tertiary)" }} />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Icon size={16} style={{ color: t.accent }} />
                <h4 style={{
                  fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700,
                  color: "var(--text-primary)",
                }}>
                  {t.name}
                </h4>
              </div>

              <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10, lineHeight: 1.4 }}>
                {t.description}
              </p>

              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {t.features.map((f) => (
                  <span key={f} className="badge" style={{
                    fontSize: 10, background: `${t.accent}18`, color: t.accent,
                  }}>
                    {f}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      <button
        className="btn btn-primary"
        onClick={() => setBuilderStep(1)}
        style={{ width: "100%" }}
      >
        Continue with {templates.find(t => t.id === selectedTemplate)?.name} <ArrowRight size={16} />
      </button>
    </div>
  );
}