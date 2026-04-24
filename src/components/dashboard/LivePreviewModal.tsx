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

function DiffView({ original, modified, filename }: { original: string, modified: string, filename: string }) {
  const originalLines = original.split('\n');
  const modifiedLines = modified.split('\n');
  
  return (
    <div className="diff-view">
      <div className="diff-header">
        <code>{filename}</code>
      </div>
      <div className="diff-grid">
        <div className="diff-side original">
          {originalLines.map((line, i) => (
            <div key={i} className="diff-line">
              <span className="line-num">{i + 1}</span>
              <pre>{line || ' '}</pre>
            </div>
          ))}
        </div>
        <div className="diff-side modified">
          {modifiedLines.map((line, i) => {
            const isNew = !originalLines.includes(line);
            return (
              <div key={i} className={`diff-line ${isNew ? 'line-added' : ''}`}>
                <span className="line-num">{i + 1}</span>
                <pre>{line || ' '}</pre>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function LivePreviewModal({ isOpen, onClose, segment, repoId, initialPrompt = "", onFinalize }: LivePreviewModalProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [status, setStatus] = useState<"idle" | "generating" | "deploying" | "ready" | "error">("idle");
  const [fileUpdates, setFileUpdates] = useState<FileUpdate[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [branchName, setBranchName] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"live" | "diff">("live");
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt) return;
    setStatus("generating");
    setError(null);

    try {
      const editRes = await fetch("/api/builder/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId, segmentId: segment.id, userPrompt: prompt })
      });
      const editData = await editRes.json();
      if (!editRes.ok) throw new Error(editData.error || "Generation failed");

      setFileUpdates(editData.fileUpdates);
      setViewMode("diff"); 
      
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
      } catch (e) {}
    }, 5000);
  };

  return (
    <div className="preview-overlay">
      <div className="preview-modal glass-panel animate-slide-up">
        <div className="preview-sidebar">
          <div className="sidebar-header">
            <div>
               <h3 style={{ margin: 0, fontSize: '1rem' }}>Studio Preview v2</h3>
               <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{segment.name}</p>
            </div>
            <button className="btn-icon" onClick={onClose}>✕</button>
          </div>

          <div className="sidebar-content">
            <div className="prompt-box">
              <label>Describe Evolution</label>
              <textarea 
                placeholder="e.g. 'Add dark mode' or 'Optimize layout'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={status !== "idle" && status !== "ready" && status !== "error"}
              />
              <button 
                className="btn btn-primary" 
                onClick={handleGenerate}
                disabled={!prompt || (status !== "idle" && status !== "ready" && status !== "error")}
              >
                {status === "generating" ? "AI Orchestrating..." : status === "deploying" ? "Hatching Preview..." : "Generate Evolution"}
              </button>
            </div>

            {error && <div className="error-alert">{error}</div>}

            {fileUpdates.length > 0 && (
              <div className="file-evolution-list">
                <label>Modifications</label>
                {fileUpdates.map((f, idx) => (
                  <button 
                    key={f.path} 
                    className={`file-evolve-btn ${selectedFileIndex === idx ? 'active' : ''}`}
                    onClick={() => { setSelectedFileIndex(idx); setViewMode("diff"); }}
                  >
                    <div className="file-info">
                      <code>{f.path.split('/').pop()}</code>
                    </div>
                    <p>{f.explanation}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="sidebar-footer">
            <div className="status-tracker-mini">
               <div className={`status-dot ${status === 'generating' ? 'loading' : (status !== 'idle' ? 'done' : '')}`}></div>
               <div className={`status-dot ${status === 'deploying' ? 'loading' : (['ready', 'error'].includes(status) ? 'done' : '')}`}></div>
               <div className={`status-dot ${status === 'ready' ? 'done' : ''}`}></div>
            </div>
            <button 
              className="btn btn-success" 
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={status !== 'ready'}
              onClick={() => onFinalize(fileUpdates, branchName || 'main')}
            >
              🚀 Merge Evolution
            </button>
          </div>
        </div>

        <div className="preview-viewer">
          <div className="viewer-header">
             <div className="mode-toggle">
                <button className={`mode-btn ${viewMode === 'live' ? 'active' : ''}`} onClick={() => setViewMode('live')}>🖥️ Live Preview</button>
                <button className={`mode-btn ${viewMode === 'diff' ? 'active' : ''}`} onClick={() => setViewMode('diff')}>🔍 Code Review</button>
             </div>
          </div>

          <div className="viewer-content">
            {viewMode === 'live' ? (
              status === 'ready' && previewUrl ? (
                <iframe src={previewUrl} title="Live Preview" />
              ) : (
                <div className="viewer-placeholder">
                  {status === 'deploying' ? (
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <p>Vercel is provisioning preview infrastructure...</p>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>Start evolution to see live preview.</p>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="diff-container animate-fade-in">
                {fileUpdates[selectedFileIndex] ? (
                   <DiffView 
                     original={(fileUpdates[selectedFileIndex] as any).originalContent || ""} 
                     modified={fileUpdates[selectedFileIndex].content} 
                     filename={fileUpdates[selectedFileIndex].path}
                   />
                ) : (
                   <div className="empty-state"><p>Select file to review.</p></div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .preview-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(12px);
        }
        .preview-modal {
          width: 98%; height: 94%;
          display: flex; overflow: hidden;
          background: #050505;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
          border-radius: 20px;
        }
        .preview-sidebar {
          width: 420px; border-right: 1px solid rgba(255, 255, 255, 0.08);
          display: flex; flex-direction: column; background: rgba(10, 10, 10, 0.5);
        }
        .sidebar-header {
          padding: 24px; display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .sidebar-content { flex: 1; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 24px; }
        .prompt-box textarea {
          width: 100%; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px; color: white; padding: 16px; min-height: 140px; resize: none;
          font-size: 0.9rem; margin-bottom: 12px; transition: border-color 0.2s;
        }
        .prompt-box textarea:focus { border-color: var(--accent-primary); }
        .file-evolution-list { display: flex; flex-direction: column; gap: 12px; }
        .file-evolve-btn {
          background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 12px; border-radius: 12px; text-align: left; cursor: pointer; transition: all 0.2s;
        }
        .file-evolve-btn:hover { background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.1); }
        .file-evolve-btn.active { background: rgba(139, 92, 246, 0.05); border-color: var(--accent-primary); }
        .file-info code { color: #fbbf24; font-size: 0.75rem; }
        .file-evolve-btn p { margin: 0; font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4; }
        .status-tracker-mini { display: flex; gap: 8px; justify-content: center; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); }
        .status-dot.loading { background: var(--accent-primary); animation: pulse 1.5s infinite; }
        .status-dot.done { background: var(--accent-success); }
        .preview-viewer { flex: 1; display: flex; flex-direction: column; background: #000; }
        .viewer-header {
          padding: 12px 24px; background: #0a0a0a; border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex; justify-content: space-between; align-items: center;
        }
        .mode-toggle { display: flex; background: rgba(255, 255, 255, 0.03); padding: 4px; border-radius: 8px; }
        .mode-btn { padding: 6px 16px; border-radius: 6px; border: none; background: transparent; color: var(--text-muted); font-size: 0.75rem; font-weight: 600; cursor: pointer; }
        .mode-btn.active { background: rgba(255, 255, 255, 0.08); color: white; }
        .viewer-content { flex: 1; position: relative; overflow: hidden; }
        iframe { width: 100%; height: 100%; border: none; background: white; }
        .diff-container { height: 100%; background: #0d1117; overflow-y: auto; font-family: var(--font-mono); }
        .diff-view { display: flex; flex-direction: column; height: 100%; }
        .diff-header { padding: 8px 16px; background: rgba(0, 0, 0, 0.3); border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: var(--text-muted); font-size: 0.7rem; }
        .diff-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(255, 255, 255, 0.05); flex: 1; }
        .diff-side { background: #0d1117; overflow-x: auto; }
        .diff-line { display: flex; font-size: 0.75rem; line-height: 1.6; white-space: pre; }
        .line-num {
          width: 40px; text-align: right; padding-right: 12px; color: rgba(255, 255, 255, 0.2);
          user-select: none; border-right: 1px solid rgba(255, 255, 255, 0.05); margin-right: 8px;
        }
        .line-added { background: rgba(46, 160, 67, 0.15); }
        .line-added pre { color: #7ee787; }
        pre { margin: 0; font-family: inherit; }
        .loading-state { display: flex; flex-direction: column; align-items: center; gap: 16px; margin-top: 100px; }
        .spinner { width: 40px; height: 40px; border: 3px solid rgba(255, 255, 255, 0.1); border-top-color: var(--accent-primary); border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0% { opacity: 0.4; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0.4; transform: scale(0.9); } }
        .error-alert { background: rgba(244, 63, 94, 0.1); color: var(--accent-rose); padding: 12px; border-radius: 8px; font-size: 0.85rem; border: 1px solid rgba(244, 63, 94, 0.2); }
      `}</style>
    </div>
  );
}
