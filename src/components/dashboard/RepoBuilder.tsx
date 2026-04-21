"use client";

import { useState, useEffect } from "react";

import SegmentCard from "./SegmentCard";
import AuditScorecard from "./AuditScorecard";
import { AuditResult } from "@/lib/engine/types";

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
  
  // Load segments for the first repo automatically if available
  useEffect(() => {
    if (activeRepo) {
      fetchSegments(activeRepo.id);
    }
  }, [activeRepo?.id]);

  const fetchSegments = async (repoId: string) => {
    setIsLoading(true);
    try {
      // We can create a dedicated GET route or just use the sync route if it's idempotent
      // For now, let's assume we need to trigger an analysis if segments are empty
      const res = await fetch(`/api/builder/segment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: `https://github.com/${activeRepo?.owner}/${activeRepo?.repo_name}` })
      });
      const data = await res.json();
      setSegments(data.segments);
      if (data.audit) setAudit(data.audit);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<{ code: string; filePath: string } | null>(null);
  const [isPushing, setIsPushing] = useState(false);

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
      setSegments(data.segments);
      if (data.audit) setAudit(data.audit);
    } catch (err: any) {
      setError(err.message);
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

  return (
    <div className="repo-builder dashboard-card">
      <div className="card-header">
        <h3>Autonomous SaaS Builder</h3>
        {activeRepo && <span className="framework-badge">{activeRepo.framework}</span>}
      </div>

      {!activeRepo ? (
        <div className="sync-interface">
          <p>Import your GitHub repository to start building with AI.</p>
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
          {error && <p className="error-msg" style={{ marginTop: '10px', color: 'var(--accent-rose)' }}>{error}</p>}
        </div>
      ) : (
        <div className="builder-view animate-fade-in">
          <div className="repo-status" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="dot pulse"></span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{activeRepo.owner}/{activeRepo.repo_name}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setActiveRepo(null)}>Change Repo</button>
          </div>
          
          {audit && <AuditScorecard audit={audit} />}

          {/* Grouped Segments View */}
          <div className="domains-container">
            {Object.entries(
              segments.reduce((acc, seg) => {
                const domain = seg.domain || "Core Application";
                if (!acc[domain]) acc[domain] = [];
                acc[domain].push(seg);
                return acc;
              }, {} as Record<string, Segment[]>)
            ).sort().map(([domain, domainSegments]) => (
              <div key={domain} className="domain-section">
                <h4 className="domain-title">{domain}</h4>
                <div className="segments-grid">
                  {domainSegments.map(seg => (
                    <SegmentCard 
                      key={seg.id || seg.file_path} 
                      segment={seg} 
                      repoId={activeRepo.id} 
                      onEditSuccess={handleEditSuccess}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

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
          border-left: 4px solid var(--accent-violet);
        }
        .domain-title {
          font-size: 0.9rem;
          color: var(--accent-violet);
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
          border: 1px solid var(--accent-violet);
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
