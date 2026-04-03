import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Sparkles, Building2, FileText, ArrowRight,
  Download, CheckCircle, AlertCircle, Loader2,
  LayoutTemplate, List, Type, Tag, ChevronRight,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getDomainData } from "../../utils/domainData";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function TailorResumeModal({
  isOpen,
  onClose,
  resumeData,        // the student's current resume form data
  currentTemplate,   // e.g. "classic"
  originalHtml: _originalHtml,      // the already-generated original HTML (optional)
}) {
  const { user } = useAuth();
  const domainData = getDomainData(user?.domain);

  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // TailorResponse from backend
  const [activeTab, setActiveTab] = useState("tailored"); // "original" | "tailored"

  const handleTailor = async () => {
    if (!companyName.trim()) {
      setError("Please enter a company name");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("vm_token");
      const res = await fetch(`${API}/api/resume/tailor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...resumeData,
          template: currentTemplate,
          company_name: companyName.trim(),
          job_title: jobTitle.trim(),
          job_description: jobDescription.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Error ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      setActiveTab("tailored");
    } catch (e) {
      setError(e.message || "Failed to tailor resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadTailored = () => {
    if (!result?.tailored_html) return;
    const blob = new Blob([result.tailored_html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${companyName.replace(/\s+/g, "-").toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printTailored = () => {
    if (!result?.tailored_html) return;
    const w = window.open("", "_blank");
    w.document.write(result.tailored_html);
    w.document.close();
    w.focus();
    w.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          style={{
            width: "100%", maxWidth: result ? 1200 : 560,
            maxHeight: "90vh", overflow: "auto",
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
            transition: "max-width 0.4s ease",
          }}
        >
          {/* ── Header ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 24px", borderBottom: "1px solid var(--border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, var(--accent-primary), var(--cyan))",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Sparkles size={20} color="#fff" />
              </div>
              <div>
                <h3 style={{
                  fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700,
                  color: "var(--text-primary)", margin: 0,
                }}>
                  Tailor for Company
                </h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                  AI adjusts format & presentation — your content stays identical
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-muted)", padding: 4,
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: 24 }}>
            {!result ? (
              /* ── INPUT FORM ── */
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Company Name */}
                <div>
                  <label style={{
                    display: "flex", alignItems: "center", gap: 6,
                    fontSize: 13, fontWeight: 600, color: "var(--text-secondary)",
                    marginBottom: 6, fontFamily: "var(--font-display)",
                  }}>
                    <Building2 size={14} style={{ color: "var(--accent-tertiary)" }} />
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Google, Microsoft, Deloitte..."
                    className="form-input"
                    style={{
                      width: "100%", padding: "10px 14px", fontSize: 14,
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border)",
                      background: "var(--bg-glass)",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Job Title */}
                <div>
                  <label style={{
                    display: "flex", alignItems: "center", gap: 6,
                    fontSize: 13, fontWeight: 600, color: "var(--text-secondary)",
                    marginBottom: 6, fontFamily: "var(--font-display)",
                  }}>
                    <FileText size={14} style={{ color: "var(--cyan)" }} />
                    Job Title (optional)
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder={`e.g., ${domainData.targetRoles[0]?.name}, ${domainData.targetRoles[1]?.name}...`}
                    style={{
                      width: "100%", padding: "10px 14px", fontSize: 14,
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border)",
                      background: "var(--bg-glass)",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Job Description */}
                <div>
                  <label style={{
                    display: "flex", alignItems: "center", gap: 6,
                    fontSize: 13, fontWeight: 600, color: "var(--text-secondary)",
                    marginBottom: 6, fontFamily: "var(--font-display)",
                  }}>
                    <List size={14} style={{ color: "var(--emerald)" }} />
                    Job Description (optional, improves accuracy)
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here for better tailoring..."
                    rows={5}
                    style={{
                      width: "100%", padding: "10px 14px", fontSize: 13,
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border)",
                      background: "var(--bg-glass)",
                      color: "var(--text-primary)",
                      outline: "none", resize: "vertical",
                      lineHeight: 1.5, fontFamily: "inherit",
                    }}
                  />
                </div>

                {/* Info Banner */}
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "12px 14px", borderRadius: "var(--radius-sm)",
                  background: "color-mix(in srgb, var(--accent-primary) 8%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--accent-primary) 20%, transparent)",
                }}>
                  <Sparkles size={16} style={{ color: "var(--accent-tertiary)", flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                    AI will recommend the best <strong>template style</strong>, <strong>section ordering</strong>,
                    and <strong>summary tone</strong> for this company — without changing your actual skills,
                    experience, or achievements.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 14px", borderRadius: "var(--radius-sm)",
                    background: "color-mix(in srgb, var(--rose) 10%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--rose) 25%, transparent)",
                  }}>
                    <AlertCircle size={14} style={{ color: "var(--rose)" }} />
                    <span style={{ fontSize: 13, color: "var(--rose)" }}>{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  className="btn btn-primary"
                  onClick={handleTailor}
                  disabled={loading || !companyName.trim()}
                  style={{
                    width: "100%", padding: "12px 20px",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    fontSize: 15, fontWeight: 600,
                    opacity: loading || !companyName.trim() ? 0.6 : 1,
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                      Analyzing company & tailoring...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Tailor My Resume <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* ── RESULTS VIEW ── */
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Changes Summary Bar */}
                <div className="glass-card" style={{
                  padding: 16, display: "flex", flexDirection: "column", gap: 12,
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700,
                    color: "var(--text-primary)",
                  }}>
                    <CheckCircle size={16} style={{ color: "var(--emerald)" }} />
                    Changes for {companyName}
                  </div>

                  <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 10,
                  }}>
                    {/* Template Change */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 12px", borderRadius: "var(--radius-sm)",
                      background: "var(--bg-glass)", border: "1px solid var(--border)",
                    }}>
                      <LayoutTemplate size={14} style={{ color: "var(--accent-tertiary)" }} />
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Template</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                          {result.changes?.template_changed ? (
                            <span>
                              {result.changes.original_template}
                              <ChevronRight size={12} style={{ display: "inline", margin: "0 2px" }} />
                              <span style={{ color: "var(--emerald)" }}>{result.changes.new_template}</span>
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-secondary)" }}>No change needed</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Section Order */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 12px", borderRadius: "var(--radius-sm)",
                      background: "var(--bg-glass)", border: "1px solid var(--border)",
                    }}>
                      <List size={14} style={{ color: "var(--cyan)" }} />
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Section Order</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                          {result.section_order?.join(" → ")}
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 12px", borderRadius: "var(--radius-sm)",
                      background: "var(--bg-glass)", border: "1px solid var(--border)",
                    }}>
                      <Type size={14} style={{ color: "var(--amber)" }} />
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Summary</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                          {result.changes?.summary_adjusted ? (
                            <span style={{ color: "var(--emerald)" }}>Tone adjusted ✓</span>
                          ) : (
                            <span style={{ color: "var(--text-secondary)" }}>Kept as-is</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Keywords */}
                    {result.keyword_highlights?.length > 0 && (
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 12px", borderRadius: "var(--radius-sm)",
                        background: "var(--bg-glass)", border: "1px solid var(--border)",
                      }}>
                        <Tag size={14} style={{ color: "var(--emerald)" }} />
                        <div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Key Skills</div>
                          <div style={{ fontSize: 12, color: "var(--text-primary)" }}>
                            {result.keyword_highlights.slice(0, 4).join(", ")}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Explanation */}
                  {result.changes?.explanation && (
                    <p style={{
                      fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5,
                      margin: 0, fontStyle: "italic",
                      padding: "8px 12px", borderRadius: "var(--radius-sm)",
                      background: "color-mix(in srgb, var(--emerald) 6%, transparent)",
                      borderLeft: "3px solid var(--emerald)",
                    }}>
                      💡 {result.changes.explanation}
                    </p>
                  )}
                </div>

                {/* Tab Switcher */}
                <div style={{
                  display: "flex", gap: 4, padding: 4,
                  background: "var(--bg-glass)", borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                }}>
                  {[
                    { id: "tailored", label: "✨ Tailored Version" },
                    { id: "original", label: "📄 Original" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        flex: 1, padding: "8px 16px", border: "none",
                        borderRadius: "var(--radius-xs)",
                        cursor: "pointer", fontSize: 13, fontWeight: 600,
                        fontFamily: "var(--font-display)",
                        background: activeTab === tab.id
                          ? "var(--accent-primary)"
                          : "transparent",
                        color: activeTab === tab.id
                          ? "#fff"
                          : "var(--text-secondary)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Resume Preview */}
                <div style={{
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                  background: "#fff",
                }}>
                  <iframe
                    srcDoc={activeTab === "tailored" ? result.tailored_html : result.original_html}
                    style={{
                      width: "100%", height: 600, border: "none",
                      background: "#fff",
                    }}
                    title={activeTab === "tailored" ? "Tailored Resume" : "Original Resume"}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="btn btn-primary"
                    onClick={printTailored}
                    style={{ flex: 1, minWidth: 160 }}
                  >
                    <FileText size={14} /> Print / Save as PDF
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={downloadTailored}
                    style={{ flex: 1, minWidth: 160 }}
                  >
                    <Download size={14} /> Download Tailored
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setResult(null);
                      setCompanyName("");
                      setJobTitle("");
                      setJobDescription("");
                    }}
                    style={{ flex: 1, minWidth: 140 }}
                  >
                    Try Another Company
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Spinner keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AnimatePresence>
  );
}
