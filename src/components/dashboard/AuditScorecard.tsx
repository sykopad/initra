"use client";

import { AuditCheck, AuditResult } from "@/lib/engine/types";

interface AuditScorecardProps {
  audit: AuditResult;
}

export default function AuditScorecard({ audit }: AuditScorecardProps) {
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

  // Group checks by category
  const categories = audit.checks.reduce((acc, check) => {
    if (!acc[check.category]) acc[check.category] = [];
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, AuditCheck[]>);

  return (
    <div className="audit-scorecard">
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
          <h3>Health Score</h3>
          <p>Repository analysis complete. Your sovereign infrastructure has a health rating of <strong>{audit.score}%</strong>.</p>
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
                    <span className="check-title">{check.title}</span>
                    <span className="check-message">{check.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .audit-scorecard {
          margin-bottom: 2rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }
        .score-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 1.5rem;
        }
        .score-gauge {
          width: 80px;
          height: 80px;
        }
        .score-info h3 {
          margin: 0;
          font-size: 1.2rem;
          color: var(--text-primary);
        }
        .score-info p {
          margin: 5px 0 0 0;
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .circular-chart {
          display: block;
          max-width: 100%;
          max-height: 250px;
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
          transition: stroke-dasharray 0.6s ease;
        }
        .percentage {
          fill: white;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.5rem;
          font-weight: 800;
          text-anchor: middle;
        }
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }
        .category-label {
          font-size: 0.75rem;
          color: var(--accent-violet);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 1rem;
          font-weight: 700;
        }
        .checks-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .audit-check {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .check-status {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 6px;
          flex-shrink: 0;
        }
        .check-content {
          display: flex;
          flex-direction: column;
        }
        .check-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .check-message {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.3;
        }
      `}</style>
    </div>
  );
}
