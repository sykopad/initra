"use client";

import { useState, useEffect } from "react";
import { checkVentureHealth, HealthReport } from "@/lib/actions/telemetry";

interface VentureTelemetryProps {
  repoId: string;
  repoName: string;
  owner: string;
}

export default function VentureTelemetry({ repoId, repoName, owner }: VentureTelemetryProps) {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshHealth = async () => {
    setIsRefreshing(true);
    try {
      const data = await checkVentureHealth(repoId, repoName, owner);
      setReport(data);
    } catch (err) {
      console.error("Telemetry Refresh Failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshHealth();
    // Auto-refresh every 60 seconds
    const interval = setInterval(refreshHealth, 60000);
    return () => clearInterval(interval);
  }, [repoId]);

  if (!report) return null;

  return (
    <div className="telemetry-panel glass-panel animate-fade-in">
      <div className="telemetry-header">
        <div className="telemetry-title">
          <span className={`status-dot ${report.status}`}></span>
          <h4>Venture Telemetry</h4>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!report.vercel && (
            <span className="badge-soft" style={{ fontSize: '0.6rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>
              ⚠️ Vercel Config Missing
            </span>
          )}
          <button 
            className={`refresh-btn ${isRefreshing ? 'spinning' : ''}`} 
            onClick={refreshHealth}
            disabled={isRefreshing}
          >
            🔄
          </button>
        </div>
      </div>

      <div className="telemetry-stats">
        <div className="stat-item">
          <label>Status</label>
          <span className={`stat-value ${report.status}`}>
            {report.statusCode} {report.status.toUpperCase()}
          </span>
        </div>
        <div className="stat-item">
          <label>Latency</label>
          <span className="stat-value">{report.responseTime}ms</span>
        </div>
        <div className="stat-item">
          <label>SSL</label>
          <span className="stat-value">{report.ssl ? "🔐 SECURE" : "🔓 INSECURE"}</span>
        </div>
        {report.vercel && (
          <div className="stat-item" style={{ gridColumn: 'span 3', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', marginTop: '5px' }}>
            <label>Vercel Deployment</label>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={`stat-value ${report.vercel.status.toLowerCase() === 'ready' ? 'healthy' : 'unhealthy'}`}>
                🚀 {report.vercel.status} ({report.vercel.target})
              </span>
              <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                {report.vercel.deploymentId?.slice(0, 12)}...
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="telemetry-footer">
        Last checked: {new Date(report.lastChecked).toLocaleTimeString()}
      </div>

      <style jsx>{`
        .telemetry-panel {
          padding: 1.25rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          min-width: 280px;
        }
        .telemetry-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .telemetry-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .telemetry-title h4 {
          margin: 0;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          box-shadow: 0 0 10px currentColor;
        }
        .status-dot.healthy { background: #10b981; color: #10b981; }
        .status-dot.unhealthy { background: #f43f5e; color: #f43f5e; }
        .status-dot.unknown { background: #94a3b8; color: #94a3b8; }

        .telemetry-stats {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
        }
        .stat-item label {
          display: block;
          font-size: 0.65rem;
          color: var(--text-muted);
          margin-bottom: 4px;
        }
        .stat-value {
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
        }
        .stat-value.healthy { color: #10b981; }
        .stat-value.unhealthy { color: #f43f5e; }

        .telemetry-footer {
          margin-top: 1rem;
          font-size: 0.65rem;
          color: var(--text-muted);
          text-align: right;
        }

        .refresh-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s;
        }
        .refresh-btn:hover { background: rgba(255,255,255,0.05); }
        .refresh-btn.spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
