"use client";

import { useState, useEffect } from "react";

import SegmentCard from "./SegmentCard";
import AuditScorecard from "./AuditScorecard";
import { AuditResult } from "@/lib/engine/types";
import { disconnectRepo } from "@/lib/actions/projects";
import { repairAuditAction } from "@/lib/actions/audit";
import { AuditCheck } from "@/lib/engine/types";
import { AI_MODELS } from "@/lib/ai/models";

interface Repo {
  id: string;
  owner: string;
  repo_name: string;
  framework: string;
  last_synced_at: string;
}

interface Segment {
  id: string;
  name: string;
  type: string;
  landmarkType?: string;
  domain?: string;
  isLogic?: boolean;
  file_path: string;
  description: string;
}

interface RepoBuilderProps {
  initialRepos?: Repo[] | null;
}

export default function RepoBuilder({ initialRepos }: RepoBuilderProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [activeRepo, setActiveRepo] = useState<Repo | null>(initialRepos?.[0] || null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("openai/gpt-4o-mini");
  
  // Load segments for the first repo automatically if available
  useEffect(() => {
    if (activeRepo) {
      fetchSegments(activeRepo.id);
    }
  }, [activeRepo?.id]);

  const fetchSegments = async (repoId: string) => {
    setIsLoading(true);
    setSegments([]);
    setAudit(null);
    try {
      const res = await fetch(`/api/builder/segment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: `https://github.com/${activeRepo?.owner}/${activeRepo?.repo_name}` })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch segments");
      
      setSegments(data.segments || []);
      if (data.audit) setAudit(data.audit);
    } catch (e: any) {
      console.error(e);
      setError(e.message);
      if (e.message.includes("GitHub session expired")) {
        setShowReconnect(true);
      }
    } finally {
      setIsLoading(false);
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<{ code: string; filePath: string } | null>(null);
  const [isPushing, setIsPushing] = useState(false);
  const [showReconnect, setShowReconnect] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const handleReconnect = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        scopes: "repo",
      },
    });
  };

  const handleSync = async () => {
    if (!repoUrl) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/builder/segment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      
      // Refresh repo data (we could also fetch from DB but data has it now)
      setActiveRepo({
        id: data.repoId,
        owner: repoUrl.split('/')[3],
        repo_name: repoUrl.split('/')[4],
        framework: data.framework,
        last_synced_at: new Date().toISOString()
      });
      setSegments(data.segments || []);
      if (data.audit) setAudit(data.audit);
    } catch (err: any) {
      setError(err.message);
      if (err.message === "GitHub session expired") {
        setShowReconnect(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSuccess = (newCode: string, filePath: string) => {
    setPendingChanges({ code: newCode, filePath });
  };

  const handlePush = async () => {
    if (!activeRepo || !pendingChanges) return;
    setIsPushing(true);
    try {
      const res = await fetch("/api/builder/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoId: activeRepo.id,
          filePath: pendingChanges.filePath,
          content: pendingChanges.code,
          commitMessage: `✨ AI built UI change: ${pendingChanges.filePath}`
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert("Successfully pushed to GitHub!");
      setPendingChanges(null);
    } catch (err: any) {
      alert("Push failed: " + err.message);
    } finally {
      setIsPushing(false);
    }
  };

  const handleRepair = async (check: AuditCheck) => {
    if (!activeRepo) return;
    try {
      const res = await repairAuditAction(activeRepo.id, check, activeRepo.framework, selectedModel);
      if (res.success) {
        setPendingChanges({ code: res.newCode, filePath: res.filePath });
        // NOTE: In a future iteration, we will also push the ADR file automatically.
      }
    } catch (err: any) {
      alert("Repair failed: " + err.message);
    }
  };

  return (
    <div className="repo-builder dashboard-card">
      <div className="card-header">
        <h3>Autonomous SaaS Builder</h3>
        {activeRepo && <span className="framework-badge">{activeRepo.framework}</span>}
      </div>

      {!activeRepo ? (
        <div className="sync-interface">
          {initialRepos && initialRepos.length > 0 && (
            <div className="repo-selector" style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>Active Ventures</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {initialRepos.map(repo => (
                  <div 
                    key={repo.id} 
                    className="project-type-card" 
                    style={{ padding: '1rem', cursor: 'pointer', textAlign: 'left' }}
                    onClick={() => setActiveRepo(repo)}
                  >
                    <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>⚡</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {repo.repo_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{repo.framework}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed var(--border-medium)' }}>
            <p>Import a new GitHub repository to start building with AI.</p>
            <div className="input-group" style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="https://github.com/user/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                style={{ flex: 1 }}
              />
              <button 
                className="btn btn-primary" 
                onClick={handleSync}
                disabled={isLoading}
              >
                {isLoading ? "Analyzing..." : "Sync & Analyze"}
              </button>
            </div>
          </div>
          {error && (
            <div className="error-container" style={{ marginTop: '1rem' }}>
              <p className="error-msg" style={{ color: 'var(--accent-rose)', marginBottom: '0.75rem' }}>{error}</p>
              {showReconnect && (
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={handleReconnect}
                  style={{ background: '#24292e', color: 'white' }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                    <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                  Reconnect GitHub
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="builder-view animate-fade-in">
          <div className="repo-status" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="repo-icon-wrapper">
                <span className="dot pulse"></span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select 
                    className="repo-select-minimal"
                    value={activeRepo.id}
                    onChange={(e) => {
                      const repo = initialRepos?.find(r => r.id === e.target.value);
                      if (repo) setActiveRepo(repo);
                    }}
                  >
                    {initialRepos?.map((repo, idx) => (
                      <option key={repo.id || idx} value={repo.id}>{repo.owner}/{repo.repo_name}</option>
                    ))}
                  </select>
                  <button 
                    className={`btn-icon ${isLoading ? 'spinning' : ''}`} 
                    onClick={() => fetchSegments(activeRepo.id)}
                    title="Refresh Analysis"
                    disabled={isLoading}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                  </button>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Last synced {new Date(activeRepo.last_synced_at).toLocaleString()}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {showReconnect && (
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={handleReconnect}
                  style={{ background: '#24292e', color: 'white', border: 'none' }}
                >
                  Reconnect GitHub
                </button>
              )}
              <button 
                className="btn btn-ghost btn-sm" 
                style={{ color: 'var(--accent-rose)', opacity: 0.8 }}
                onClick={() => setShowDisconnectConfirm(true)}
              >
                Disconnect
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setActiveRepo(null)}>+ New</button>
            </div>
          </div>

          {error && (
            <div className="error-banner animate-slide-down">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
              {error.includes("expired") && (
                <button className="btn btn-link btn-sm" onClick={handleReconnect}>Fix Now</button>
              )}
              <button className="close-btn" onClick={() => setError(null)}>×</button>
            </div>
          )}
          
          <div className="builder-controls" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px' }}>
            <div className="model-switcher-dashboard">
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Reasoning Engine</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                  className="model-select-dashboard"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  {AI_MODELS.map(m => (
                    <option key={m.slug} value={m.slug}>{m.name} ({m.creditCost} cr)</option>
                  ))}
                </select>
                <div className="model-price-tag">
                  <span className="price-pill">
                    {AI_MODELS.find(m => m.slug === selectedModel)?.creditCost || 0} Credits
                  </span>
                </div>
              </div>
            </div>
            <div className="sync-status-indicator">
               {/* existing sync info could go here if moved */}
            </div>
          </div>
          
          {audit && <AuditScorecard audit={audit} onRepair={handleRepair} />}

          {/* Grouped Segments View */}
          <div className="domains-container">
            {Object.entries(
              (segments || []).reduce((acc, seg) => {
                const domain = seg.domain || "Core Application";
                if (!acc[domain]) acc[domain] = [];
                acc[domain].push(seg);
                return acc;
              }, {} as Record<string, Segment[]>)
            ).sort().map(([domain, domainSegments]) => (
              <div key={domain} className="domain-section">
                <h4 className="domain-title">{domain}</h4>
                <div className="segments-grid">
                  {domainSegments.map((seg, idx) => (
                    <SegmentCard 
                      key={seg.id || `${seg.file_path}-${seg.name}-${idx}`} 
                      segment={seg} 
                      repoId={activeRepo.id} 
                      onEditSuccess={handleEditSuccess}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Custom Disconnect Modal */}
          {showDisconnectConfirm && (
            <div className="modal-overlay animate-fade-in">
              <div className="modal-content animate-scale-up">
                <h3>Disconnect Repository?</h3>
                <p>This will stop Initra from managing <strong>{activeRepo.repo_name}</strong>. Your code and history on GitHub will remain completely untouched.</p>
                <div className="modal-actions">
                  <button className="btn btn-ghost" onClick={() => setShowDisconnectConfirm(false)}>Cancel</button>
                  <button 
                    className="btn btn-danger" 
                    onClick={async () => {
                      await disconnectRepo(activeRepo.id);
                      setActiveRepo(null);
                      setShowDisconnectConfirm(false);
                    }}
                  >
                    Confirm Disconnect
                  </button>
                </div>
              </div>
            </div>
          )}
          {pendingChanges && (
            <div className="changes-bar animate-slide-up">
              <div className="bar-inner">
                <div className="changes-info">
                  <span className="sparkle">✨</span>
                  <span>AI has generated changes for <strong>{pendingChanges.filePath}</strong></span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setPendingChanges(null)}>Discard</button>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={handlePush}
                    disabled={isPushing}
                  >
                    {isPushing ? "Pushing..." : "Push to GitHub"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .repo-select-minimal {
          background: transparent;
          border: none;
          color: white;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 4px;
          outline: none;
          transition: background 0.2s;
        }
        .repo-select-minimal:hover {
          background: rgba(255,255,255,0.05);
        }
        .repo-select-minimal option {
          background: #1a1a1a;
          color: white;
        }
        .btn-icon {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 50%;
          transition: all 0.2s;
        }
        .btn-icon:hover {
          color: white;
          background: rgba(255,255,255,0.1);
        }
        .btn-icon.spinning svg {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .error-banner {
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.2);
          padding: 0.75rem 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }
        .error-banner p {
          margin: 0;
          font-size: 0.85rem;
          color: var(--accent-rose);
        }
        .close-btn {
          margin-left: auto;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 1.2rem;
        }
        .animate-slide-down {
          animation: slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slide-down {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        .modal-content {
          background: var(--bg-secondary);
          border: 1px solid var(--border-medium);
          padding: 2rem;
          border-radius: 24px;
          max-width: 450px;
          width: 90%;
          text-align: center;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        }
        .modal-content h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: white;
        }
        .modal-content p {
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        .btn-danger {
          background: var(--accent-rose);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .btn-danger:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        .animate-scale-up {
          animation: scale-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes scale-up {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .model-select-dashboard {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-medium);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.9rem;
          outline: none;
          min-width: 240px;
        }
        .model-select-dashboard:focus {
          border-color: var(--accent-primary);
        }
        .price-pill {
          background: rgba(139, 92, 246, 0.1);
          color: var(--accent-primary);
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          border: 1px solid rgba(139, 92, 246, 0.2);
          display: inline-block;
        }
        .repo-builder {
          grid-column: span 2;
          background: rgba(124, 58, 237, 0.05) !important;
          border: 1px solid rgba(139, 92, 246, 0.3) !important;
        }
        .framework-badge {
          background: rgba(255,255,255,0.1);
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .domains-container {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }
        .domain-section {
          background: rgba(255, 255, 255, 0.02);
          padding: 1.5rem;
          border-radius: 16px;
          border-left: 4px solid var(--accent-primary);
        }
        .domain-title {
          font-size: 0.9rem;
          color: var(--accent-primary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 800;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .domain-title::after {
          content: '';
          height: 1px;
          flex: 1;
          background: linear-gradient(to right, rgba(139, 92, 246, 0.3), transparent);
        }
        .segments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
        }
        .dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
        }
        .pulse {
          animation: pulse-green 2s infinite;
        }
        @keyframes pulse-green {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .changes-bar {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          width: 90%;
          max-width: 600px;
        }
        .bar-inner {
          background: var(--bg-secondary);
          border: 1px solid var(--accent-primary);
          padding: 1rem 1.5rem;
          border-radius: 99px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          backdrop-filter: blur(20px);
        }
        .changes-info {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.9rem;
        }
        .sparkle {
          font-size: 1.2rem;
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slide-up {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
