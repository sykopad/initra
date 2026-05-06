import React from 'react';
import { AuditResult } from '@/lib/engine/types';

interface QualityAuditProps {
  audit: AuditResult | null;
}

export const QualityAudit: React.FC<QualityAuditProps> = ({ audit }) => {
  if (!audit) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return '✅';
      case 'warning': return '⚠️';
      case 'fail': return '❌';
      default: return '●';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'var(--success)';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="quality-audit-container glass-panel animate-in">
      <div className="audit-header">
        <div className="score-circle" style={{ borderColor: getScoreColor(audit.score) }}>
          <span className="score-value">{audit.score}</span>
          <span className="score-label">Score</span>
        </div>
        <div className="audit-meta">
          <h3>Autonomous Quality Audit</h3>
          <p>Verified against Initra Gold Standard Heuristics</p>
        </div>
      </div>

      <div className="audit-checks-list">
        {audit.checks.map((check, idx) => (
          <div key={check.id || idx} className={`audit-check-item ${check.status}`}>
            <div className="check-main">
              <span className="check-icon">{getStatusIcon(check.status)}</span>
              <div className="check-info">
                <div className="check-top">
                  <span className="check-title">{check.title}</span>
                  <span className="check-category">{check.category}</span>
                </div>
                <p className="check-message">{check.message}</p>
                {check.status !== 'pass' && check.actionable_repair && (
                  <div className="repair-tip">
                    <strong>Fix:</strong> {check.actionable_repair}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .quality-audit-container {
          padding: 1.5rem;
          margin-top: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .audit-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .score-circle {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          border: 4px solid;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.2);
        }

        .score-value {
          font-size: 1.5rem;
          font-weight: 800;
          line-height: 1;
        }

        .score-label {
          font-size: 0.6rem;
          text-transform: uppercase;
          opacity: 0.6;
          letter-spacing: 0.05em;
        }

        .audit-meta h3 {
          margin: 0;
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .audit-meta p {
          margin: 0.25rem 0 0 0;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .audit-checks-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .audit-check-item {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          transition: all 0.2s;
        }

        .audit-check-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .check-main {
          display: flex;
          gap: 1rem;
        }

        .check-icon {
          font-size: 1.1rem;
          margin-top: 0.1rem;
        }

        .check-info {
          flex: 1;
        }

        .check-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }

        .check-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .check-category {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .check-message {
          margin: 0;
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .repair-tip {
          margin-top: 0.75rem;
          font-size: 0.8rem;
          color: var(--primary-light);
          background: rgba(124, 58, 237, 0.05);
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          border-left: 3px solid var(--primary);
        }

        .animate-in {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
