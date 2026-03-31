import { useState } from "react";
import { Plus, X, ArrowRight, ArrowLeft, CheckCircle, Brain } from "lucide-react";

const SUGGESTED = [
  "Python", "JavaScript", "React", "Node.js",
  "SQL", "Git", "Docker", "AWS",
  "TypeScript", "Java", "C++", "HTML/CSS",
  "MongoDB", "REST APIs", "Linux", "Kubernetes",
];

export default function SkillsStep({ form, updateForm, setBuilderStep }) {
  const [input, setInput] = useState("");

  const addSkill = () => {
    const s = input.trim();
    if (s && !form.skills.includes(s)) {
      updateForm("skills", [...form.skills, s]);
      setInput("");
    }
  };

  const removeSkill = (skill) => {
    updateForm("skills", form.skills.filter((s) => s !== skill));
  };

  const toggleSuggested = (skill) => {
    if (form.skills.includes(skill)) {
      removeSkill(skill);
    } else {
      updateForm("skills", [...form.skills, skill]);
    }
  };

  return (
    <div className="glass-card">
      <h3 className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Brain size={18} style={{ color: "var(--cyan)" }} /> Skills
      </h3>

      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
        Add your technical and soft skills. Click suggestions to toggle them.
      </p>

      {/* Tag input */}
      <div className="tag-input-container" style={{ marginBottom: 14 }}>
        {form.skills.map((s) => (
          <span key={s} className="tag">
            {s}
            <button onClick={() => removeSkill(s)}>
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          className="tag-input"
          placeholder="Type skill + Enter"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
        />
      </div>

      {/* Suggestions */}
      <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        Popular Skills
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
        {SUGGESTED.map((s) => {
          const active = form.skills.includes(s);
          return (
            <button
              key={s}
              className={`badge ${active ? "badge-emerald" : "badge-purple"}`}
              onClick={() => toggleSuggested(s)}
              style={{
                cursor: "pointer", border: "none",
                transition: "all 0.2s ease",
                opacity: active ? 1 : 0.7,
              }}
            >
              {active ? <CheckCircle size={10} /> : <Plus size={10} />} {s}
            </button>
          );
        })}
      </div>

      {form.skills.length > 0 && (
        <p style={{ fontSize: 12, color: "var(--emerald)", marginTop: 8, fontWeight: 500 }}>
          ✓ {form.skills.length} skill{form.skills.length > 1 ? "s" : ""} added
        </p>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button className="btn btn-secondary" onClick={() => setBuilderStep(1)} style={{ flex: 1 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <button
          className="btn btn-primary"
          onClick={() => setBuilderStep(3)}
          style={{ flex: 2 }}
        >
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}