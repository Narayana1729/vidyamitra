import { useMemo } from "react";

const ACTION_VERBS = new Set([
  "led", "developed", "designed", "implemented", "managed", "created",
  "built", "improved", "reduced", "increased", "delivered", "launched",
  "optimized", "automated", "architected", "engineered", "mentored",
  "streamlined", "analyzed", "collaborated", "coordinated", "established",
  "integrated", "migrated", "scaled", "secured", "deployed", "refactored",
]);

/**
 * Client-side ATS score heuristic.
 * Zero network calls — instant feedback as user fills the builder form.
 */
export default function useATSScore(form) {
  return useMemo(() => {
    let score = 0;

    // Contact info (max 15)
    if (form.full_name) score += 5;
    if (form.email) score += 5;
    if (form.phone) score += 3;
    if (form.linkedin) score += 2;

    // Summary (max 12)
    if (form.summary) {
      const words = form.summary.trim().split(/\s+/).length;
      if (words >= 30) score += 12;
      else if (words >= 15) score += 8;
      else score += 4;
    }

    // Skills (max 15)
    const skillCount = (form.skills || []).length;
    if (skillCount >= 8) score += 15;
    else if (skillCount >= 5) score += 12;
    else if (skillCount >= 3) score += 8;
    else if (skillCount >= 1) score += 4;

    // Experience (max 30)
    const exps = (form.experience || []).slice(0, 3);
    for (const exp of exps) {
      if (exp.title) score += 2;
      if (exp.company) score += 2;
      if (exp.duration) score += 1;

      const points = (exp.points || []).filter((p) => p.trim()).slice(0, 4);
      for (const pt of points) {
        const words = pt.toLowerCase().split(/\s+/);
        if (words.length > 0 && ACTION_VERBS.has(words[0])) score += 1;
        if (/\d/.test(pt)) score += 1;
        if (words.length >= 8) score += 0.5;
      }
    }

    // Education (max 10)
    const edus = (form.education || []).slice(0, 2);
    for (const edu of edus) {
      if (edu.degree) score += 3;
      if (edu.institution) score += 1.5;
      if (edu.year) score += 0.5;
    }

    // Projects (max 10)
    const projs = (form.projects || []).slice(0, 3);
    for (const proj of projs) {
      if (proj.name) score += 1.5;
      if (proj.description && proj.description.split(/\s+/).length >= 10) score += 1.5;
      if (proj.tech) score += 0.5;
    }

    // Target role (max 3)
    if (form.target_role) score += 3;

    // Template bonus (max 5)
    score += 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  }, [form]);
}