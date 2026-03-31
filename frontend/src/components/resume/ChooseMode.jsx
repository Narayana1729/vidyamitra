import { motion } from "framer-motion";
import { Search, PenTool, ArrowRight, FileText, Sparkles } from "lucide-react";

export default function ChooseMode({ setMode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="page-header" style={{ textAlign: "center" }}>
        <h1>📄 Resume Studio</h1>
        <p>Analyze your existing resume or build a professional one from scratch</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 700, margin: "0 auto" }}>

        {/* ANALYZE */}
        <motion.button
          whileHover={{ y: -6 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setMode("analyze")}
          className="glass-card"
          style={{
            cursor: "pointer", textAlign: "center",
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 14, padding: 32, border: "1px solid var(--border)",
          }}
        >
          <div style={{
            width: 56, height: 56, borderRadius: "var(--radius-md)",
            background: "color-mix(in srgb, var(--cyan) 12%, transparent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Search size={26} style={{ color: "var(--cyan)" }} />
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
            Analyze Resume
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Upload your resume and get ATS score, feedback & improvement tips
          </p>
          <span className="badge badge-cyan" style={{ fontSize: 11 }}>
            <FileText size={10} /> PDF / DOCX
          </span>
        </motion.button>

        {/* BUILD */}
        <motion.button
          whileHover={{ y: -6 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setMode("build")}
          className="glass-card"
          style={{
            cursor: "pointer", textAlign: "center",
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 14, padding: 32, border: "1px solid var(--border)",
          }}
        >
          <div style={{
            width: 56, height: 56, borderRadius: "var(--radius-md)",
            background: "color-mix(in srgb, var(--accent-primary) 12%, transparent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <PenTool size={26} style={{ color: "var(--accent-tertiary)" }} />
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
            Build Resume
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Create a professional ATS-friendly resume step-by-step with AI
          </p>
          <span className="badge badge-purple" style={{ fontSize: 11 }}>
            <Sparkles size={10} /> AI-Powered
          </span>
        </motion.button>

      </div>
    </motion.div>
  );
}