import { User, Mail, Phone, Linkedin, FileText, Target, ArrowRight, ArrowLeft } from "lucide-react";

export default function PersonalStep({ form, updateForm, setBuilderStep }) {
  const isValid = form.full_name && form.email && form.phone;

  return (
    <div className="glass-card">
      <h3 className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <User size={18} style={{ color: "var(--accent-tertiary)" }} /> Personal Information
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Name + Role */}
        <div className="grid-2">
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <User size={12} /> Full Name <span style={{ color: "var(--rose)" }}>*</span>
            </label>
            <input
              className="input"
              placeholder="John Doe"
              value={form.full_name}
              onChange={(e) => updateForm("full_name", e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <Target size={12} /> Target Role
            </label>
            <input
              className="input"
              placeholder="Frontend Developer"
              value={form.target_role}
              onChange={(e) => updateForm("target_role", e.target.value)}
            />
          </div>
        </div>

        {/* Email + Phone */}
        <div className="grid-2">
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <Mail size={12} /> Email <span style={{ color: "var(--rose)" }}>*</span>
            </label>
            <input
              className="input"
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => updateForm("email", e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <Phone size={12} /> Phone <span style={{ color: "var(--rose)" }}>*</span>
            </label>
            <input
              className="input"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => updateForm("phone", e.target.value)}
            />
          </div>
        </div>

        {/* LinkedIn */}
        <div>
          <label style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
            <Linkedin size={12} /> LinkedIn URL
          </label>
          <input
            className="input"
            placeholder="https://linkedin.com/in/johndoe"
            value={form.linkedin}
            onChange={(e) => updateForm("linkedin", e.target.value)}
          />
        </div>

        {/* Summary */}
        <div>
          <label style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
            <FileText size={12} /> Professional Summary
          </label>
          <textarea
            className="interview-textarea"
            placeholder="Passionate software developer with 3+ years of experience building scalable web applications..."
            value={form.summary}
            onChange={(e) => updateForm("summary", e.target.value)}
            style={{ minHeight: 100 }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button className="btn btn-secondary" onClick={() => setBuilderStep(0)} style={{ flex: 1 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <button
          className="btn btn-primary"
          disabled={!isValid}
          onClick={() => setBuilderStep(2)}
          style={{ flex: 2 }}
        >
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}