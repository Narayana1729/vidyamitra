import { Plus, X, Sparkles, ArrowLeft, FolderGit2, AlertCircle } from "lucide-react";
import axios from "axios";
import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ProjectsStep({
  form,
  updateForm,
  setBuilderStep,
  setGeneratedResume,
  selectedTemplate
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addProject = () => {
    updateForm("projects", [
      ...form.projects,
      { name: "", description: "", tech: "" }
    ]);
  };

  const updateProj = (idx, key, val) => {
    const arr = [...form.projects];
    arr[idx] = { ...arr[idx], [key]: val };
    updateForm("projects", arr);
  };

  const removeProj = (idx) => {
    updateForm("projects", form.projects.filter((_, i) => i !== idx));
  };

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("vm_token");
      const res = await axios.post(`${API}/api/resume/build`, {
        ...form,
        template: selectedTemplate,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGeneratedResume(res.data);
      setBuilderStep(6);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Failed to generate resume. Please check your connection and try again.";
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <div className="glass-card">
      <h3 className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <FolderGit2 size={18} style={{ color: "var(--emerald)" }} /> Projects
      </h3>

      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
        Showcase your best projects with tech stack and descriptions.
      </p>

      {form.projects.length === 0 && (
        <div style={{
          textAlign: "center", padding: 24, background: "var(--bg-glass)",
          borderRadius: "var(--radius-md)", border: "1px dashed var(--border)",
          marginBottom: 16, color: "var(--text-muted)", fontSize: 14,
        }}>
          No projects added yet. Click "Add Project" below.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {form.projects.map((p, i) => (
          <div key={i} style={{
            padding: 16, background: "var(--bg-glass)",
            borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
            position: "relative",
          }}>
            <button
              className="btn btn-ghost"
              onClick={() => removeProj(i)}
              style={{ position: "absolute", top: 8, right: 8, padding: 4 }}
            >
              <X size={14} style={{ color: "var(--rose)" }} />
            </button>

            <div className="grid-2" style={{ marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3, display: "block" }}>Project Name</label>
                <input className="input" placeholder="E-commerce Platform"
                  value={p.name} onChange={(e) => updateProj(i, "name", e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3, display: "block" }}>Tech Stack</label>
                <input className="input" placeholder="React, Node.js, MongoDB"
                  value={p.tech} onChange={(e) => updateProj(i, "tech", e.target.value)} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3, display: "block" }}>Description</label>
              <textarea
                className="interview-textarea"
                placeholder="Built a full-stack e-commerce platform with user auth, cart system, and Stripe payment integration..."
                value={p.description}
                onChange={(e) => updateProj(i, "description", e.target.value)}
                style={{ minHeight: 70 }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        className="btn btn-secondary"
        onClick={addProject}
        style={{ width: "100%", marginTop: 16 }}
      >
        <Plus size={14} /> Add Project
      </button>

      {/* Error Message */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            marginTop: 12,
            background: "color-mix(in srgb, var(--rose) 10%, transparent)",
            borderRadius: "var(--radius-md)",
            border: "1px solid color-mix(in srgb, var(--rose) 30%, transparent)",
            color: "var(--rose)",
            fontSize: 13,
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button className="btn btn-secondary" onClick={() => setBuilderStep(4)} style={{ flex: 1 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <button
          className="btn btn-primary"
          onClick={generate}
          disabled={loading}
          style={{ flex: 2 }}
        >
          {loading ? (
            <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Generating...</>
          ) : (
            <><Sparkles size={16} /> Generate Resume</>
          )}
        </button>
      </div>
    </div>
  );
}