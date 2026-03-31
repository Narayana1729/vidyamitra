import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Sparkles, AlertCircle, File } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function UploadSection({ file, setFile, setResult }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback((accepted, rejected) => {
    setError(null);
    if (rejected.length) {
      const err = rejected[0].errors?.[0];
      if (err?.code === "file-too-large") {
        setError("File is too large. Maximum size is 5MB.");
      } else if (err?.code === "file-invalid-type") {
        setError("Invalid file type. Please upload a PDF or DOCX file.");
      } else {
        setError("Invalid file. Please try again.");
      }
      return;
    }
    if (accepted.length) {
      setFile(accepted[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
  });

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("vm_token");
      const res = await axios.post(`${API}/api/resume/analyze`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(res.data);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Analysis failed. Please check your connection and try again.";
      setError(msg);
    }

    setLoading(false);
  };

  const fileExt = file?.name?.split(".").pop()?.toUpperCase();

  return (
    <div className="glass-card" style={{ maxWidth: 700, margin: "0 auto" }}>
      <div className="page-header" style={{ textAlign: "center", marginBottom: 20 }}>
        <h1>📄 Analyze Resume</h1>
        <p>Upload your resume and get an instant ATS score with detailed feedback</p>
      </div>

      <div {...getRootProps()} className={`dropzone ${isDragActive ? "dropzone-active" : ""}`}>
        <input {...getInputProps()} />

        <div className="dropzone-icon">
          <Upload size={28} />
        </div>

        {file ? (
          <div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
              <FileText size={20} style={{ color: "var(--accent-tertiary)" }} />
              <span style={{ fontWeight: 600 }}>{file.name}</span>
              {fileExt && (
                <span className="badge badge-cyan" style={{ fontSize: 10 }}>
                  {fileExt}
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
              {(file.size / 1024).toFixed(1)} KB — Click or drop to replace
            </p>
          </div>
        ) : (
          <div>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>
              {isDragActive ? "Drop your resume here..." : "Drag & drop your resume"}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Supports PDF and DOCX • Max 5MB
            </p>
          </div>
        )}
      </div>

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

      <button
        className="btn btn-primary"
        onClick={analyze}
        disabled={!file || loading}
        style={{ width: "100%", marginTop: 16 }}
      >
        {loading ? (
          <>
            <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            Analyzing your resume...
          </>
        ) : (
          <>
            <Sparkles size={16} /> Analyze Resume
          </>
        )}
      </button>
    </div>
  );
}