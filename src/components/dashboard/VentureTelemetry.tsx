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
      <div className="telemetry-row primary-row">
        <div className="telemetry-header-group">
          <div className="telemetry-title">
            <span className={`status-dot ${report.status}`}></span>
            <h4>Venture Telemetry</h4>
          </div>
          <div className="telemetry-timestamp">
            {new Date(report.lastChecked).toLocaleTimeString()}
          </div>
          <button 
            className={`refresh-btn ${isRefreshing ? 'spinning' : ''}`} 
            onClick={refreshHealth}
            disabled={isRefreshing}
          >
            🔄
          </button>
        </div>

        <div className="telemetry-metrics">
          <div className="metric-item">
            <span className="metric-label">Status</span>
            <span className={`metric-value ${report.status}`}>
              {report.statusCode > 0 ? `${report.statusCode} ` : ''}{report.status.toUpperCase()}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Latency</span>
            <span className="metric-value">{report.responseTime > 0 ? `${report.responseTime}ms` : '—'}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">SSL Security</span>
            <span className="metric-value">
              {report.statusCode === 0 ? "N/A" : (report.ssl ? "🔐 SECURE" : "🔓 INSECURE")}
            </span>
          </div>
        </div>
      </div>

      {report.vercel ? (
        <div className="telemetry-row secondary-row animate-slide-down">
          <div className="vercel-group">
            <span className="metric-label">Vercel Infrastructure</span>
            <div className="vercel-details">
              <span className={`metric-value ${report.vercel.status.toLowerCase() === 'ready' ? 'healthy' : 'unhealthy'}`}>
                🚀 {report.vercel.status} ({report.vercel.target})
              </span>
              <span className="deployment-id">
                {report.vercel.deploymentId}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="telemetry-row secondary-row">
          <span className="metric-label" style={{ color: '#f59e0b' }}>⚠️ Vercel Configuration Missing — Connect to enable deep telemetry</span>
        </div>
      )}

      <style jsx>{`
        .telemetry-panel {
          padding: 0.75rem 1.25rem;
          background: transparent;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .telemetry-row {
          display: flex;
          align-items: center;
          width: 100%;
        }
        .primary-row {
          justify-content: space-between;
          gap: 2rem;
        }
        .secondary-row {
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .telemetry-header-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .telemetry-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .telemetry-title h4 {
          margin: 0;
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          box-shadow: 0 0 8px currentColor;
        }
        .status-dot.healthy { background: #10b981; color: #10b981; }
        .status-dot.unhealthy { background: #f43f5e; color: #f43f5e; }
        .status-dot.unknown { background: #94a3b8; color: #94a3b8; }

        .telemetry-metrics {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .metric-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .metric-label {
          font-size: 0.6rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .metric-value {
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
          white-space: nowrap;
        }
        .metric-value.healthy { color: #10b981; }
        .metric-value.unhealthy { color: #f43f5e; }

        .vercel-group {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }
        .vercel-details {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }
        .deployment-id {
          font-size: 0.65rem;
          font-family: var(--font-mono);
          color: var(--text-muted);
          opacity: 0.6;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .telemetry-timestamp {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
          opacity: 0.5;
        }

        .refresh-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 0.85rem;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s;
          opacity: 0.6;
        }
        .refresh-btn:hover { background: rgba(255,255,255,0.05); opacity: 1; }
        .refresh-btn.spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1100px) {
          .primary-row { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
          .telemetry-metrics { width: 100%; justify-content: space-between; }
          .vercel-group { flex-direction: column; align-items: flex-start; gap: 4px; }
        }
      `}</style>
    </div>
  );
}
