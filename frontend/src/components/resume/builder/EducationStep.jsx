import { Plus, X, ArrowRight, ArrowLeft, GraduationCap } from "lucide-react";

export default function EducationStep({ form, updateForm, setBuilderStep }) {

  const addEducation = () => {
    updateForm("education", [
      ...form.education,
      { degree: "", institution: "", year: "" }
    ]);
  };

  const updateEdu = (idx, key, val) => {
    const arr = [...form.education];
    arr[idx] = { ...arr[idx], [key]: val };
    updateForm("education", arr);
  };

  const removeEdu = (idx) => {
    updateForm("education", form.education.filter((_, i) => i !== idx));
  };

  return (
    <div className="glass-card">
      <h3 className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <GraduationCap size={18} style={{ color: "var(--cyan)" }} /> Education
      </h3>

      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
        Add your educational background in reverse chronological order.
      </p>

      {form.education.length === 0 && (
        <div style={{
          textAlign: "center", padding: 24, background: "var(--bg-glass)",
          borderRadius: "var(--radius-md)", border: "1px dashed var(--border)",
          marginBottom: 16, color: "var(--text-muted)", fontSize: 14,
        }}>
          No education added yet. Click "Add Education" below.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {form.education.map((edu, i) => (
          <div key={i} style={{
            padding: 16, background: "var(--bg-glass)",
            borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
            position: "relative",
          }}>
            <button
              className="btn btn-ghost"
              onClick={() => removeEdu(i)}
              style={{ position: "absolute", top: 8, right: 8, padding: 4 }}
            >
              <X size={14} style={{ color: "var(--rose)" }} />
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3, display: "block" }}>Degree / Certificate</label>
                <input className="input" placeholder="B.Tech Computer Science"
                  value={edu.degree} onChange={(e) => updateEdu(i, "degree", e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3, display: "block" }}>Year</label>
                <input className="input" placeholder="2024"
                  value={edu.year} onChange={(e) => updateEdu(i, "year", e.target.value)} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3, display: "block" }}>Institution</label>
              <input className="input" placeholder="MIT / IIT / Stanford"
                value={edu.institution} onChange={(e) => updateEdu(i, "institution", e.target.value)} />
            </div>
          </div>
        ))}
      </div>

      <button
        className="btn btn-secondary"
        onClick={addEducation}
        style={{ width: "100%", marginTop: 16 }}
      >
        <Plus size={14} /> Add Education
      </button>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button className="btn btn-secondary" onClick={() => setBuilderStep(3)} style={{ flex: 1 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <button className="btn btn-primary" onClick={() => setBuilderStep(5)} style={{ flex: 2 }}>
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}