"use client";

import { useMemo } from "react";
import { GeneratedFile } from "@/lib/engine/types";

interface DeploymentCenterProps {
  projectName: string;
  generatedFiles: GeneratedFile[];
  onOpenGitHubSync: () => void;
  syncResult: { url: string; repoFullName: string } | null;
  isPushing: boolean;
  hatchStatus?: {
    provisioningStatus: Record<string, string>;
    vercelStatus: string;
    liveUrl: string;
    isHatched: boolean;
  };
}

export default function DeploymentCenter({
  projectName,
  generatedFiles,
  onOpenGitHubSync,
  syncResult,
  isPushing,
  hatchStatus
}: DeploymentCenterProps) {

  const pillars = [
    { id: 'github',   label: 'Code Repository',   icon: '🐙', key: 'github' },
    { id: 'vercel',   label: 'Cloud Infrastructure', icon: '▲', key: 'vercel' },
    { id: 'supabase', label: 'Sovereign Database',   icon: '⚡', key: 'supabase' },
    { id: 'dns',      label: 'Domain Mapping',     icon: '🌐', key: 'dns' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return '#10B981';
      case 'processing': return '#7C3AED';
      case 'failed': return '#EF4444';
      default: return 'rgba(255,255,255,0.1)';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'complete': return 'Ready';
      case 'processing': return 'In Progress...';
      case 'failed': return 'Error';
      default: return 'Pending';
    }
  };

  return (
    <div className="provisioning-dashboard">
      <div className="dashboard-header">
        <div className="status-indicator">
          <span className={`pulse-dot ${isPushing ? 'active' : ''}`}></span>
          {isPushing ? "Orchestrating Venture Birth..." : hatchStatus?.isHatched ? "Venture Fully Hatched" : "System Ready"}
        </div>
        <h3>Infrastructure Status</h3>
      </div>

      <div className="pillars-grid">
        {pillars.map((pillar) => {
          const status = hatchStatus?.provisioningStatus[pillar.key] || 'pending';
          return (
            <div key={pillar.id} className={`pillar-card ${status}`}>
              <div className="pillar-header">
                <span className="pillar-icon">{pillar.icon}</span>
                <div className="pillar-info">
                  <span className="label">{pillar.label}</span>
                  <span className="status">{getStatusLabel(status)}</span>
                </div>
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: status === 'complete' ? '100%' : status === 'processing' ? '60%' : '0%',
                    backgroundColor: getStatusColor(status)
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {!syncResult && !isPushing && (
        <button className="hatch-trigger-btn" onClick={onOpenGitHubSync}>
          🚀 Hatch Sovereign Venture
        </button>
      )}

      {syncResult && (
        <div className="hatch-success-actions">
           <a href={syncResult.url} target="_blank" rel="noreferrer" className="action-link github">View Source</a>
           {hatchStatus?.liveUrl && <a href={hatchStatus.liveUrl} target="_blank" rel="noreferrer" className="action-link live">Visit Site</a>}
        </div>
      )}

      <style jsx>{`
        .provisioning-dashboard {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          background: rgba(255,255,255,0.05);
          padding: 4px 12px;
          border-radius: 20px;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #555;
        }
        .pulse-dot.active {
          background: var(--primary);
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(124, 58, 237, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(124, 58, 237, 0); }
        }

        h3 {
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin: 0;
        }

        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .pillar-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 1rem;
        }

        .pillar-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .pillar-icon {
          font-size: 1.5rem;
        }

        .pillar-info {
          display: flex;
          flex-direction: column;
        }

        .pillar-info .label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .pillar-info .status {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .progress-track {
          height: 4px;
          background: rgba(255,255,255,0.05);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.5s ease-in-out;
        }

        .hatch-trigger-btn {
          width: 100%;
          padding: 1rem;
          background: var(--primary);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 20px -5px rgba(124, 58, 237, 0.4);
          transition: transform 0.2s;
        }
        .hatch-trigger-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }

        .hatch-success-actions {
           display: flex;
           gap: 1rem;
        }

        .action-link {
           flex: 1;
           text-align: center;
           padding: 0.75rem;
           border-radius: 8px;
           font-size: 0.85rem;
           font-weight: 600;
           text-decoration: none;
        }
        .action-link.github {
           background: #24292e;
           color: white;
        }
        .action-link.live {
           background: var(--success);
           color: white;
        }
      `}</style>
    </div>
  );
}
