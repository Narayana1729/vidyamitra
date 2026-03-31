import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Layout, User, Brain, Briefcase, GraduationCap, FolderGit2, Eye, Check } from "lucide-react";
import ChooseMode from "../components/resume/ChooseMode";
import UploadSection from "../components/resume/analyzer/UploadSection";
import AnalyzeResults from "../components/resume/analyzer/AnalyzeResults";

import TemplateStep from "../components/resume/builder/TemplateStep";
import PersonalStep from "../components/resume/builder/PersonalStep";
import SkillsStep from "../components/resume/builder/SkillsStep";
import ExperienceStep from "../components/resume/builder/ExperienceStep";
import EducationStep from "../components/resume/builder/EducationStep";
import ProjectsStep from "../components/resume/builder/ProjectsStep";
import PreviewStep from "../components/resume/builder/PreviewStep";

import useATSScore from "../hooks/useATSScore";
import ScoreCircle from "../components/ScoreCircle";
import { useAuth } from "../context/AuthContext";

const STEPS = [
  { label: "Template", icon: Layout },
  { label: "Personal", icon: User },
  { label: "Skills", icon: Brain },
  { label: "Experience", icon: Briefcase },
  { label: "Education", icon: GraduationCap },
  { label: "Projects", icon: FolderGit2 },
  { label: "Preview", icon: Eye },
];

function StepIndicator({ currentStep }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 0, marginBottom: 28, flexWrap: "wrap",
    }}>
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isDone = i < currentStep;
        const isActive = i === currentStep;

        return (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              minWidth: 60,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isDone
                  ? "var(--emerald)"
                  : isActive
                    ? "var(--accent-primary)"
                    : "var(--bg-tertiary)",
                color: isDone || isActive ? "#fff" : "var(--text-muted)",
                transition: "all 0.3s ease",
                boxShadow: isActive ? "0 0 16px var(--accent-glow)" : "none",
              }}>
                {isDone ? <Check size={14} /> : <Icon size={14} />}
              </div>
              <span style={{
                fontSize: 10, fontWeight: isActive ? 700 : 500,
                color: isActive ? "var(--accent-tertiary)" : isDone ? "var(--emerald)" : "var(--text-muted)",
                fontFamily: "var(--font-display)",
              }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                width: 28, height: 2, marginTop: -14,
                background: isDone ? "var(--emerald)" : "var(--bg-tertiary)",
                borderRadius: 1, transition: "background 0.3s ease",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ResumeAnalyzer() {
  const { user } = useAuth();
  const uid = user?.id || 'anon';
  const cacheKey = (k) => `${k}_${uid}`;

  const [mode, setMode] = useState(() => localStorage.getItem(cacheKey("resume_mode")) || "choose");
  const [file, setFile] = useState(null);
  
  const [result, setResult] = useState(() => {
    const saved = localStorage.getItem(cacheKey("resume_result"));
    return saved ? JSON.parse(saved) : null;
  });

  const [builderStep, setBuilderStep] = useState(() => {
    return Number(localStorage.getItem(cacheKey("resume_builder_step"))) || 0;
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    return localStorage.getItem(cacheKey("resume_template")) || "classic";
  });

  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem(cacheKey("resume_form"));
    return saved ? JSON.parse(saved) : {
      full_name: "",
      email: "",
      phone: "",
      linkedin: "",
      summary: "",
      target_role: "",
      skills: [],
      experience: [],
      education: [],
      projects: [],
    };
  });

  const [generatedResume, setGeneratedResume] = useState(() => {
    const saved = localStorage.getItem(cacheKey("resume_generated"));
    return saved ? JSON.parse(saved) : null;
  });

  // ── LocalStorage Sync Hooks (user-scoped) ──
  useEffect(() => { localStorage.setItem(cacheKey("resume_mode"), mode); }, [mode, uid]);
  
  useEffect(() => {
    if (result) localStorage.setItem(cacheKey("resume_result"), JSON.stringify(result));
    else localStorage.removeItem(cacheKey("resume_result"));
  }, [result, uid]);
  
  useEffect(() => { localStorage.setItem(cacheKey("resume_builder_step"), builderStep); }, [builderStep, uid]);
  
  useEffect(() => { localStorage.setItem(cacheKey("resume_template"), selectedTemplate); }, [selectedTemplate, uid]);
  
  useEffect(() => { localStorage.setItem(cacheKey("resume_form"), JSON.stringify(form)); }, [form, uid]);
  
  useEffect(() => {
    if (generatedResume) localStorage.setItem(cacheKey("resume_generated"), JSON.stringify(generatedResume));
    else localStorage.removeItem(cacheKey("resume_generated"));
  }, [generatedResume, uid]);

  // ── Supabase Hydration (cross-device persistence) ──
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("vm_token");
    if (!token) return;
    const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
    axios.get(`${BASE}/api/user-data/latest`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const data = res.data;
      // Hydrate latest resume analysis result (if no local result exists)
      if (!result && data.resume_analysis) {
        setResult(data.resume_analysis.raw_result || data.resume_analysis);
        setMode("analyze");
      }
      // Hydrate latest resume build (if no local form exists)
      if (data.resume_build && !localStorage.getItem(cacheKey("resume_form"))) {
        const rd = data.resume_build.resume_data || {};
        setForm({
          full_name: rd.personalInfo?.fullName || data.resume_build.full_name || "",
          email: rd.personalInfo?.email || data.resume_build.email || "",
          phone: rd.personalInfo?.phone || "",
          linkedin: rd.personalInfo?.linkedin || "",
          summary: rd.summary || "",
          target_role: data.resume_build.target_role || "",
          skills: rd.skills || [],
          experience: rd.experience || [],
          education: rd.education || [],
          projects: rd.projects || [],
        });
        setSelectedTemplate(data.resume_build.template || "classic");
      }
    })
    .catch(() => {}); // Silently fail — localStorage is the fallback
  }, [uid]);

  const liveScore = useATSScore(form);

  const updateForm = (key, val) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const resetAll = () => {
    setMode("choose");
    setFile(null);
    setResult(null);
    setBuilderStep(0);
    setSelectedTemplate("classic");
    setGeneratedResume(null);
    setForm({
      full_name: "",
      email: "",
      phone: "",
      linkedin: "",
      summary: "",
      target_role: "",
      skills: [],
      experience: [],
      education: [],
      projects: [],
    });
  };

  return (
    <div>
      {/* Page header for builder mode */}
      {mode === "build" && (
        <div className="page-header">
          <h1>📄 Resume Builder</h1>
          <p>Create a professional ATS-friendly resume step-by-step</p>
        </div>
      )}

      {/* Live ATS Score — floating indicator */}
      {mode === "build" && liveScore !== null && builderStep > 0 && builderStep < 6 && (
        <div className="glass-card" style={{
          display: "flex", alignItems: "center", gap: 16,
          padding: "12px 20px", marginBottom: 20,
        }}>
          <ScoreCircle score={liveScore} size={48} label="" />
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>
              Live ATS Score: {liveScore}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {liveScore >= 80 ? "Excellent! Keep it up." :
               liveScore >= 60 ? "Good — add more details to improve." :
               "Add more content to boost your score."}
            </div>
          </div>
        </div>
      )}

      {/* Step Progress Indicator */}
      {mode === "build" && (
        <StepIndicator currentStep={builderStep} />
      )}

      {/* MODE SWITCH */}
      <AnimatePresence mode="wait">
        {mode === "choose" && (
          <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ChooseMode setMode={setMode} />
          </motion.div>
        )}

        {/* ANALYZER */}
        {mode === "analyze" && !result && (
          <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <UploadSection file={file} setFile={setFile} setResult={setResult} />
          </motion.div>
        )}

        {mode === "analyze" && result && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <AnalyzeResults result={result} resetAll={resetAll} />
          </motion.div>
        )}

        {/* BUILDER STEPS */}
        {mode === "build" && (
          <motion.div key={`step-${builderStep}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {builderStep === 0 && (
              <TemplateStep
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                setBuilderStep={setBuilderStep}
              />
            )}
            {builderStep === 1 && (
              <PersonalStep
                form={form} updateForm={updateForm} setBuilderStep={setBuilderStep}
              />
            )}
            {builderStep === 2 && (
              <SkillsStep
                form={form} updateForm={updateForm} setBuilderStep={setBuilderStep}
              />
            )}
            {builderStep === 3 && (
              <ExperienceStep
                form={form} updateForm={updateForm} setBuilderStep={setBuilderStep}
              />
            )}
            {builderStep === 4 && (
              <EducationStep
                form={form} updateForm={updateForm} setBuilderStep={setBuilderStep}
              />
            )}
            {builderStep === 5 && (
              <ProjectsStep
                form={form} updateForm={updateForm} setBuilderStep={setBuilderStep}
                setGeneratedResume={setGeneratedResume} selectedTemplate={selectedTemplate}
              />
            )}
            {builderStep === 6 && (
              <PreviewStep
                generatedResume={generatedResume} resetAll={resetAll}
                setBuilderStep={setBuilderStep} liveScore={liveScore}
                form={form} selectedTemplate={selectedTemplate}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}