"use client";

import { AuditCheck, AuditResult } from "@/lib/engine/types";

interface AuditScorecardProps {
  audit: AuditResult;
  onRepair?: (check: AuditCheck) => Promise<void>;
}

export default function AuditScorecard({ audit, onRepair }: AuditScorecardProps) {
  const [repairingId, setRepairingId] = useState<string | null>(null);

  const getStatusColor = (status: AuditCheck['status']) => {
    switch (status) {
      case 'pass': return '#10b981'; // Green
      case 'warning': return '#f59e0b'; // Amber
      case 'fail': return '#ef4444'; // Red
      default: return 'var(--text-secondary)';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const handleRepair = async (check: AuditCheck) => {
    if (!onRepair) return;
    setRepairingId(check.id);
    try {
      await onRepair(check);
    } finally {
      setRepairingId(null);
    }
  };

  // Group checks by category
  const categories = audit.checks.reduce((acc, check) => {
    if (!acc[check.category]) acc[check.category] = [];
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, AuditCheck[]>);

  return (
    <div className="audit-scorecard animate-fade-in">
      <div className="score-header">
        <div className="score-gauge">
          <svg viewBox="0 0 36 36" className="circular-chart">
            <path className="circle-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path className="circle"
              strokeDasharray={`${audit.score}, 100`}
              stroke={getScoreColor(audit.score)}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="20.35" className="percentage">{audit.score}</text>
          </svg>
        </div>
        <div className="score-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Sovereign Audit</h3>
            <span className="badge-soft" style={{ fontSize: '0.65rem' }}>PRO Scorecard</span>
          </div>
          <p style={{ maxWidth: '600px' }}>
            Sovereign quality scan complete. Your health score is <strong style={{ color: getScoreColor(audit.score) }}>{audit.score}%</strong>.
            Click <strong>Fix with AI</strong> to autonomously resolve architectural issues.
          </p>
        </div>
      </div>

      <div className="categories-grid">
        {Object.entries(categories).map(([category, checks]) => (
          <div key={category} className="category-group">
            <h4 className="category-label">{category}</h4>
            <div className="checks-list">
              {checks.map(check => (
                <div key={check.id} className="audit-check">
                  <div className="check-status" style={{ background: getStatusColor(check.status) }}></div>
                  <div className="check-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="check-title">{check.title}</span>
                        <span className="check-message">{check.message}</span>
                      </div>
                      {(check.status !== 'pass' && check.actionable_repair) && (
                        <button 
                          className="btn btn-sm btn-ghost repair-btn"
                          onClick={() => handleRepair(check)}
                          disabled={repairingId !== null}
                        >
                          {repairingId === check.id ? "⚙️ Repairing..." : "✨ Fix with AI"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .audit-scorecard {
          margin-bottom: 2.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }
        .score-header {
          display: flex;
          align-items: center;
          gap: 2.5rem;
          margin-bottom: 2.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 2rem;
        }
        .score-gauge {
          width: 90px;
          height: 90px;
        }
        .circular-chart {
          display: block;
          max-width: 100%;
        }
        .circle-bg {
          fill: none;
          stroke: rgba(255,255,255,0.1);
          stroke-width: 3.8;
        }
        .circle {
          fill: none;
          stroke-width: 2.8;
          stroke-linecap: round;
          transition: stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .percentage {
          fill: white;
          font-family: inherit;
          font-size: 0.5rem;
          font-weight: 800;
          text-anchor: middle;
        }
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }
        .category-label {
          font-size: 0.7rem;
          color: var(--accent-violet);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 1.25rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .category-label::after {
          content: '';
          height: 1px;
          flex: 1;
          background: rgba(139, 92, 246, 0.1);
        }
        .checks-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .audit-check {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          padding: 8px;
          border-radius: 12px;
          transition: background 0.2s;
        }
        .audit-check:hover {
          background: rgba(255,255,255,0.02);
        }
        .check-status {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 6px;
          flex-shrink: 0;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
        .check-content {
          flex: 1;
        }
        .check-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .check-message {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-top: 2px;
        }
        .repair-btn {
          font-size: 0.7rem !important;
          padding: 4px 10px !important;
          background: rgba(139, 92, 246, 0.1) !important;
          border: 1px solid rgba(139, 92, 246, 0.2) !important;
          color: var(--accent-violet) !important;
          border-radius: 20px !important;
        }
        .repair-btn:hover {
          background: var(--accent-violet) !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
}
      `}</style>
    </div>
  );
}
