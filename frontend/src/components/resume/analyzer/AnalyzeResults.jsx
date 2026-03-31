import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Lightbulb, ArrowLeft, ArrowRight } from "lucide-react";
import ScoreCircle from "../../ScoreCircle";

function formatSectionKey(key) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AnalyzeResults({ result, resetAll }) {
  const getColor = (score) => {
    if (score >= 80) return "var(--emerald)";
    if (score >= 60) return "var(--amber)";
    return "var(--rose)";
  };

  const sections = result.sections || {};
  const strengths = result.strengths || [];
  const weaknesses = result.weaknesses || [];
  const suggestions = result.suggestions || [];

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ textAlign: "center" }}>
        <h1>📊 Analysis Results</h1>
        <p>Here's how your resume scores across key metrics</p>
      </div>

      {/* Top Scores */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="glass-card" style={{ textAlign: "center", padding: 20 }}>
          <ScoreCircle score={result.overall_score ?? 0} label="Overall" />
        </div>
        <div className="glass-card" style={{ textAlign: "center", padding: 20 }}>
          <ScoreCircle score={result.ats_score ?? 0} label="ATS" />
        </div>
        <div className="glass-card" style={{ textAlign: "center", padding: 20 }}>
          <ScoreCircle score={result.keyword_match ?? 0} label="Keywords" />
        </div>
      </div>

      {/* Section Breakdown */}
      <div className="glass-card" style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 15,
            fontWeight: 700,
            marginBottom: 16,
            color: "var(--text-primary)",
          }}
        >
          Section Breakdown
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {Object.entries(sections).map(([key, val]) => {
            const score = val?.score ?? 0;
            const barColor = getColor(score);
            return (
              <div key={key}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {formatSectionKey(key)}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: barColor }}>
                    {score}/100
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    background: "var(--bg-tertiary)",
                    marginBottom: 4,
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{
                      height: "100%",
                      borderRadius: 3,
                      background: barColor,
                    }}
                  />
                </div>

                <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>
                  {val?.feedback || ""}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths & Weaknesses side-by-side */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Strengths */}
        <div className="glass-card">
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 12,
              color: "var(--emerald)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <CheckCircle size={16} /> Strengths
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {strengths.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-start",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.4,
                }}
              >
                <CheckCircle
                  size={14}
                  style={{
                    color: "var(--emerald)",
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                />
                {s}
              </div>
            ))}
            {strengths.length === 0 && (
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                No strengths identified yet.
              </p>
            )}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="glass-card">
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 12,
              color: "var(--rose)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <AlertTriangle size={16} /> Weaknesses
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {weaknesses.map((w, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-start",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.4,
                }}
              >
                <AlertTriangle
                  size={14}
                  style={{
                    color: "var(--rose)",
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                />
                {w}
              </div>
            ))}
            {weaknesses.length === 0 && (
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                No weaknesses identified.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Suggestions — NEW section */}
      {suggestions.length > 0 && (
        <div className="glass-card" style={{ marginBottom: 16 }}>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 12,
              color: "var(--accent-tertiary)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Lightbulb size={16} /> Suggestions to Improve
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {suggestions.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-start",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                  padding: "8px 12px",
                  background: "var(--bg-glass)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                }}
              >
                <ArrowRight
                  size={14}
                  style={{
                    color: "var(--accent-tertiary)",
                    marginTop: 2,
                    flexShrink: 0,
                  }}
                />
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          className="btn btn-primary"
          onClick={resetAll}
          style={{ flex: 1 }}
        >
          <ArrowLeft size={16} style={{ marginRight: 6 }} /> Back
        </button>
      </div>
    </div>
  );
}