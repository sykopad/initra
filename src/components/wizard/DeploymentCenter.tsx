"use client";

import { useMemo } from "react";
import { GeneratedFile } from "@/lib/engine/types";

interface DeploymentCenterProps {
  projectName: string;
  generatedFiles: GeneratedFile[];
  onOpenGitHubSync: () => void;
  syncResult: { url: string; repoFullName: string } | null;
  isPushing: boolean;
}

export default function DeploymentCenter({
  projectName,
  generatedFiles,
  onOpenGitHubSync,
  syncResult,
  isPushing
}: DeploymentCenterProps) {

  const vercelDeployUrl = useMemo(() => {
    if (!syncResult) return null;
    return `https://vercel.com/new/import?s=${encodeURIComponent(syncResult.url)}&project-name=${encodeURIComponent(projectName.toLowerCase().replace(/\s+/g, '-'))}`;
  }, [syncResult, projectName]);

  const supabaseBranchUrl = useMemo(() => {
    if (!syncResult) return null;
    // Contextual link to Supabase branching (generic placeholder link as branching usually requires a specific project ref)
    return `https://supabase.com/dashboard/projects`;
  }, [syncResult]);

  return (
    <div className="deployment-center">
      <div className="center-header">
        <div className="status-badge">
          {syncResult ? "✅ Connected" : "🔌 Pending Integration"}
        </div>
        <h3>Sync & Deployment Hub</h3>
        <p>Integrate your agent boilerplate directly into your developer ecosystem.</p>
      </div>

      <div className="options-grid">
        {/* GitHub Integration */}
        <div 
          className={`deploy-card ${syncResult ? 'success' : ''} ${isPushing ? 'processing' : ''}`}
          onClick={!syncResult && !isPushing ? onOpenGitHubSync : undefined}
        >
          <div className="card-top">
            <span className="platform-icon">🐙</span>
            <div className="card-info">
              <h4>GitHub Sync</h4>
              <p>{syncResult ? `Pushed to ${syncResult.repoFullName}` : "Create repo & push rules"}</p>
            </div>
          </div>
          {syncResult ? (
            <a href={syncResult.url} target="_blank" rel="noopener noreferrer" className="card-action success">
              View Repository →
            </a>
          ) : (
            <button className="card-action" disabled={isPushing}>
              {isPushing ? "Creating..." : "Initialize Repo →"}
            </button>
          )}
        </div>

        {/* Vercel Deployment */}
        <div className={`deploy-card ${!syncResult ? 'disabled' : ''}`}>
          <div className="card-top">
            <span className="platform-icon">▲</span>
            <div className="card-info">
              <h4>Vercel Hosting</h4>
              <p>One-click frontend deployment</p>
            </div>
          </div>
          {syncResult ? (
            <a href={vercelDeployUrl!} target="_blank" rel="noopener noreferrer" className="card-action vercel">
              Deploy to Vercel →
            </a>
          ) : (
            <button className="card-action" disabled>Push to GitHub first</button>
          )}
        </div>

        {/* Supabase Branching */}
        <div className={`deploy-card ${!syncResult ? 'disabled' : ''}`}>
          <div className="card-top">
            <span className="platform-icon">⚡</span>
            <div className="card-info">
              <h4>Supabase Branching</h4>
              <p>Prepare database dev-branch</p>
            </div>
          </div>
          {syncResult ? (
            <a href={supabaseBranchUrl!} target="_blank" rel="noopener noreferrer" className="card-action supabase">
              Branch Database →
            </a>
          ) : (
            <button className="card-action" disabled>Push to GitHub first</button>
          )}
        </div>
      </div>

      <style jsx>{`
        .deployment-center {
          margin-top: 1rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }

        .center-header {
          margin-bottom: 2rem;
        }

        .status-badge {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 4px 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 100px;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        h3 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        p {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .deploy-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          cursor: pointer;
        }

        .deploy-card:hover:not(.disabled):not(.success) {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--primary);
          box-shadow: 0 20px 40px -15px rgba(0,0,0,0.4);
        }

        .deploy-card.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(1);
        }

        .deploy-card.success {
          border-color: var(--success);
          background: rgba(16, 185, 129, 0.05);
          cursor: default;
        }

        .card-top {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .platform-icon {
          font-size: 2rem;
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.1);
        }

        .card-info h4 {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .card-info p {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .card-action {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          text-align: center;
          transition: all 0.2s;
          cursor: pointer;
          text-decoration: none;
        }

        .deploy-card:hover .card-action:not([disabled]) {
          background: var(--primary);
          border-color: var(--primary);
        }

        .card-action.success {
          background: var(--success);
          border-color: var(--success);
        }

        .card-action.vercel {
          background: #000;
          border-color: #333;
        }
        .card-action.vercel:hover {
          border-color: #fff;
        }

        .card-action.supabase {
          background: #1c1c1c;
          border-color: var(--success);
          color: var(--success);
        }
        .card-action.supabase:hover {
          background: var(--success);
          color: #000;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }

        .processing {
          animation: pulse 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
