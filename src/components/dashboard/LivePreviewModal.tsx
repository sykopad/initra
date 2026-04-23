"use client";

import { useState, useEffect } from "react";

interface FileUpdate {
  path: string;
  content: string;
  explanation: string;
}

interface LivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  segment: any;
  repoId: string;
  initialPrompt?: string;
  onFinalize: (files: FileUpdate[], branch: string) => void;
}

export default function LivePreviewModal({ isOpen, onClose, segment, repoId, initialPrompt = "", onFinalize }: LivePreviewModalProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [status, setStatus] = useState<"idle" | "generating" | "deploying" | "ready" | "error">("idle");
  const [fileUpdates, setFileUpdates] = useState<FileUpdate[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [branchName, setBranchName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt) return;
    setStatus("generating");
    setError(null);

    try {
      // 1. Generate multi-file edit
      const editRes = await fetch("/api/builder/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId, segmentId: segment.id, userPrompt: prompt })
      });
      const editData = await editRes.json();
      if (!editRes.ok) throw new Error(editData.error || "Generation failed");

      setFileUpdates(editData.fileUpdates);
      
      // 2. Push to preview branch
      setStatus("deploying");
      const previewBranch = `initra-preview-${Math.random().toString(36).substring(7)}`;
      setBranchName(previewBranch);

      const pushRes = await fetch("/api/builder/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          repoId, 
          files: editData.fileUpdates, 
          targetBranch: previewBranch,
          commitMessage: `🔍 Preview: ${prompt}`
        })
      });
      if (!pushRes.ok) throw new Error("Branch creation failed");

      // 3. Poll Vercel for status
      pollVercelStatus(repoId, previewBranch);

    } catch (err: any) {
      setError(err.message);
      setStatus("error");
    }
  };

  const pollVercelStatus = async (projectId: string, branch: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/builder/status?projectId=${projectId}&branch=${branch}`);
        const data = await res.json();

        if (data.status === 'READY') {
          setPreviewUrl(data.url);
          setStatus("ready");
          clearInterval(interval);
        } else if (data.status === 'ERROR') {
          setError("Vercel build failed.");
          setStatus("error");
          clearInterval(interval);
        }
      } catch (e) {
        // Continue polling
      }
    }, 5000); // Poll every 5s
  };

  return (
    <div className="preview-overlay">
      <div className="preview-modal glass-panel animate-slide-up">
        <div className="preview-sidebar">
          <div className="sidebar-header">
            <h3>Customizing {segment.name}</h3>
            <button className="btn-icon" onClick={onClose}>✕</button>
          </div>

          <div className="sidebar-content">
            <div className="prompt-box">
              <label>AI Prompt</label>
              <textarea 
                placeholder="What change should I make?"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={status !== "idle" && status !== "ready" && status !== "error"}
              />
              <button 
                className="btn btn-primary" 
                onClick={handleGenerate}
                disabled={!prompt || (status !== "idle" && status !== "ready" && status !== "error")}
              >
                {status === "generating" ? "AI is working..." : status === "deploying" ? "Deploying..." : "Generate Preview"}
              </button>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <div className="status-tracker">
              <div className={`status-step ${['generating', 'deploying', 'ready'].includes(status) ? 'active' : ''}`}>
                <span className="dot"></span> Generating Changes...
              </div>
              <div className={`status-step ${['deploying', 'ready'].includes(status) ? 'active' : ''}`}>
                <span className="dot"></span> Deploying to Vercel Preview...
              </div>
              <div className={`status-step ${status === 'ready' ? 'active' : ''}`}>
                <span className="dot"></span> Live Preview Ready
              </div>
            </div>

            {fileUpdates.length > 0 && (
              <div className="file-list">
                <label>Modified Files</label>
                {fileUpdates.map(f => (
                  <div key={f.path} className="file-item">
                    <code>{f.path}</code>
                    <p>{f.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="sidebar-footer">
            <button 
              className="btn btn-success" 
              style={{ width: '100%' }}
              disabled={status !== 'ready'}
              onClick={() => onFinalize(fileUpdates, branchName || 'main')}
            >
              Merge & Finish
            </button>
          </div>
        </div>

        <div className="preview-viewer">
          {status === 'ready' && previewUrl ? (
            <iframe src={previewUrl} title="Live Preview" />
          ) : (
            <div className="viewer-placeholder">
              {status === 'deploying' ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Vercel is building your preview...</p>
                  <span className="hint">This usually takes 45-90 seconds.</span>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No preview generated yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .preview-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(8px);
        }
        .preview-modal {
          width: 95%;
          height: 90%;
          display: flex;
          overflow: hidden;
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        }
        .preview-sidebar {
          width: 400px;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.02);
        }
        .sidebar-header {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .sidebar-header h3 { margin: 0; font-size: 1.1rem; }
        .sidebar-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .prompt-box {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .prompt-box label { font-size: 0.8rem; color: var(--text-muted); }
        .prompt-box textarea {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          padding: 12px;
          min-height: 120px;
          resize: none;
        }
        .status-tracker {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .status-step {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.4);
          transition: color 0.3s;
        }
        .status-step.active {
          color: white;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
        }
        .status-step.active .dot {
          background: var(--color-primary);
          box-shadow: 0 0 10px var(--color-primary);
        }
        .file-list label { display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px; }
        .file-item {
          background: rgba(255, 255, 255, 0.03);
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 8px;
        }
        .file-item code { font-size: 0.7rem; color: #fbbf24; }
        .file-item p { font-size: 0.75rem; margin: 4px 0 0 0; color: var(--text-secondary); }
        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .preview-viewer {
          flex: 1;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        iframe {
          width: 100%;
          height: 100%;
          border: none;
          background: white;
        }
        .viewer-placeholder {
          text-align: center;
        }
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .hint { font-size: 0.75rem; color: var(--text-muted); }
      `}</style>
    </div>
  );
}
