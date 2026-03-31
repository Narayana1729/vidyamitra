import { useState } from "react";
import { Download, RefreshCw, ArrowLeft, CheckCircle, FileText, Lightbulb, Sparkles } from "lucide-react";
import ScoreCircle from "../../ScoreCircle";
import TailorResumeModal from "../TailorResumeModal";

export default function PreviewStep({
  generatedResume,
  resetAll,
  setBuilderStep,
  liveScore,
  form,
  selectedTemplate,
}) {
  const [showTailorModal, setShowTailorModal] = useState(false);

  const downloadHTML = () => {
    const blob = new Blob([generatedResume.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const printResume = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(generatedResume.html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const score = liveScore ?? generatedResume.ats_score_estimate;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>

        {/* ── LEFT SIDEBAR: ATS Score + Tips + Actions ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ATS Score */}
          <div className="glass-card" style={{ textAlign: "center", padding: 20 }}>
            <h4 style={{
              fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600,
              color: "var(--text-secondary)", marginBottom: 12,
            }}>
              ATS Score
            </h4>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <ScoreCircle score={score} size={110} label="Score" />
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>
              {score >= 80 ? "Excellent! Your resume is highly ATS-compatible." :
               score >= 60 ? "Good score. A few improvements can push it higher." :
               "Needs work. Follow the tips below to improve."}
            </p>
          </div>

          {/* 🎯 Tailor for Company — the new feature */}
          <button
            className="glass-card"
            onClick={() => setShowTailorModal(true)}
            style={{
              cursor: "pointer", padding: 16, border: "1px solid var(--border)",
              background: "linear-gradient(135deg, color-mix(in srgb, var(--accent-primary) 8%, transparent), color-mix(in srgb, var(--cyan) 8%, transparent))",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              textAlign: "center", transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-primary)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(99, 102, 241, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent-primary), var(--cyan))",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <div>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700,
                color: "var(--text-primary)",
              }}>
                🎯 Tailor for a Company
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.3 }}>
                Auto-adjust format for a specific company — content stays the same
              </div>
            </div>
          </button>

          {/* ATS Tips */}
          <div className="glass-card" style={{ padding: 16 }}>
            <h4 style={{
              fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600,
              color: "var(--text-secondary)", marginBottom: 10,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <Lightbulb size={14} style={{ color: "var(--amber)" }} /> ATS Tips
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {generatedResume.ats_tips?.map((t, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 6,
                  fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4,
                }}>
                  <CheckCircle size={12} style={{ color: "var(--emerald)", marginTop: 2, flexShrink: 0 }} />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button className="btn btn-primary" onClick={printResume} style={{ width: "100%" }}>
              <FileText size={14} /> Print / Save as PDF
            </button>
            <button className="btn btn-secondary" onClick={downloadHTML} style={{ width: "100%" }}>
              <Download size={14} /> Download HTML
            </button>
            <button className="btn btn-secondary" onClick={() => setBuilderStep(5)} style={{ width: "100%" }}>
              <ArrowLeft size={14} /> Edit Resume
            </button>
            <button className="btn btn-ghost" onClick={resetAll} style={{ width: "100%", fontSize: 13 }}>
              <ArrowLeft size={14} style={{ marginRight: 6 }} /> Back
            </button>
          </div>
        </div>

        {/* ── RIGHT: Resume Preview ── */}
        <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
          <iframe
            srcDoc={generatedResume.html}
            style={{
              width: "100%", height: 700, border: "none",
              borderRadius: "var(--radius-lg)",
              background: "#fff",
            }}
            title="Resume Preview"
          />
        </div>
      </div>

      {/* ── Tailor Resume Modal ── */}
      <TailorResumeModal
        isOpen={showTailorModal}
        onClose={() => setShowTailorModal(false)}
        resumeData={form}
        currentTemplate={selectedTemplate}
        originalHtml={generatedResume?.html}
      />
    </div>
  );
}