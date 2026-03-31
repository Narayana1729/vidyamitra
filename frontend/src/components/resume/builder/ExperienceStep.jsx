import { useState } from "react";
import { Plus, X, ArrowRight, ArrowLeft, Briefcase, Sparkles } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ExperienceStep({ form, updateForm, setBuilderStep }) {
  const [improving, setImproving] = useState(null);

  const addExperience = () =>
    updateForm("experience", [
      ...form.experience,
      { title: "", company: "", duration: "", points: [""] },
    ]);

  const updateExp = (idx, key, val) => {
    const arr = [...form.experience];
    arr[idx] = { ...arr[idx], [key]: val };
    updateForm("experience", arr);
  };

  const removeExp = (idx) => {
    updateForm("experience", form.experience.filter((_, i) => i !== idx));
  };

  const updatePoint = (eIdx, pIdx, val) => {
    const arr = [...form.experience];
    arr[eIdx] = { ...arr[eIdx], points: [...arr[eIdx].points] };
    arr[eIdx].points[pIdx] = val;
    updateForm("experience", arr);
  };

  const addPoint = (eIdx) => {
    const arr = [...form.experience];
    arr[eIdx] = { ...arr[eIdx], points: [...arr[eIdx].points, ""] };
    updateForm("experience", arr);
  };

  const removePoint = (eIdx, pIdx) => {
    const arr = [...form.experience];
    arr[eIdx] = { ...arr[eIdx], points: arr[eIdx].points.filter((_, i) => i !== pIdx) };
    updateForm("experience", arr);
  };

  const improvePoint = async (text, eIdx, pIdx) => {
    if (!text.trim()) return;
    setImproving(`${eIdx}-${pIdx}`);
    try {
      const token = localStorage.getItem("vm_token");
      const res = await axios.post(
        `${API}/api/resume/improve`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updatePoint(eIdx, pIdx, res.data.improved);
    } catch {
      console.log("AI improvement failed");
    }
    setImproving(null);
  };

  return (
    <div className="glass-card">
      <h3 className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Briefcase size={18} style={{ color: "var(--amber)" }} /> Work Experience
      </h3>

      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
        Add your work experience. Use the ✨ button to AI-improve bullet points.
      </p>

      {form.experience.length === 0 && (
        <div style={{
          textAlign: "center", padding: 24, background: "var(--bg-glass)",
          borderRadius: "var(--radius-md)", border: "1px dashed var(--border)",
          marginBottom: 16, color: "var(--text-muted)", fontSize: 14,
        }}>
          No experience added yet. Click "Add Experience" below.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {form.experience.map((exp, i) => (
          <div key={i} style={{
            padding: 16, background: "var(--bg-glass)",
            borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
            position: "relative",
          }}>
            {/* Remove button */}
            <button
              className="btn btn-ghost"
              onClick={() => removeExp(i)}
              style={{ position: "absolute", top: 8, right: 8, padding: 4 }}
            >
              <X size={14} style={{ color: "var(--rose)" }} />
            </button>

            <div className="grid-2" style={{ marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3, display: "block" }}>Job Title</label>
                <input className="input" placeholder="Software Engineer"
                  value={exp.title} onChange={(e) => updateExp(i, "title", e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3, display: "block" }}>Company</label>
                <input className="input" placeholder="Google"
                  value={exp.company} onChange={(e) => updateExp(i, "company", e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3, display: "block" }}>Duration</label>
              <input className="input" placeholder="Jan 2023 – Present"
                value={exp.duration} onChange={(e) => updateExp(i, "duration", e.target.value)} />
            </div>

            {/* Bullet points */}
            <label style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3, display: "block" }}>Key Achievements</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {exp.points.map((p, pi) => (
                <div key={pi} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: 12, minWidth: 12 }}>•</span>
                  <input
                    className="input" style={{ flex: 1 }}
                    placeholder="Led development of..."
                    value={p}
                    onChange={(e) => updatePoint(i, pi, e.target.value)}
                  />
                  <button
                    className="btn btn-ghost"
                    onClick={() => improvePoint(p, i, pi)}
                    disabled={improving === `${i}-${pi}`}
                    title="AI Improve"
                    style={{ padding: "6px 8px", flexShrink: 0 }}
                  >
                    {improving === `${i}-${pi}` ? (
                      <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                    ) : (
                      <Sparkles size={14} style={{ color: "var(--accent-tertiary)" }} />
                    )}
                  </button>
                  {exp.points.length > 1 && (
                    <button className="btn btn-ghost" onClick={() => removePoint(i, pi)}
                      style={{ padding: "6px 4px", flexShrink: 0 }}>
                      <X size={12} style={{ color: "var(--text-muted)" }} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              className="btn btn-ghost"
              onClick={() => addPoint(i)}
              style={{ marginTop: 6, fontSize: 12, color: "var(--accent-tertiary)" }}
            >
              <Plus size={12} /> Add bullet point
            </button>
          </div>
        ))}
      </div>

      <button
        className="btn btn-secondary"
        onClick={addExperience}
        style={{ width: "100%", marginTop: 16 }}
      >
        <Plus size={14} /> Add Experience
      </button>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button className="btn btn-secondary" onClick={() => setBuilderStep(2)} style={{ flex: 1 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <button className="btn btn-primary" onClick={() => setBuilderStep(4)} style={{ flex: 2 }}>
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}