"use client";

import { useState } from "react";
import { AI_MODELS } from "@/lib/ai/models";

interface StrategistSuggestion {
  id: string;
  category: 'feature' | 'performance' | 'monetization' | 'security' | 'architecture';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'hard';
  estimatedCredits: number;
  studioPrompt: string;
}

interface StrategistRoadmapStep {
  title: string;
  status: 'todo' | 'done' | 'in-progress';
  description: string;
}

interface StrategistResponse {
  summary: string;
  alignmentScore: number;
  suggestions: StrategistSuggestion[];
  roadmap: StrategistRoadmapStep[];
}

interface StrategistViewProps {
  repoId: string;
  selectedModel: string;
  onActOnSuggestion: (prompt: string) => void;
}

export default function StrategistView({ repoId, selectedModel, onActOnSuggestion }: StrategistViewProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [strategy, setStrategy] = useState<StrategistResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/builder/strategize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId, modelSlug: selectedModel })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Strategic analysis failed");
      
      setStrategy(data.strategy);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'feature': return '🚀';
      case 'performance': return '⚡';
      case 'monetization': return '💰';
      case 'security': return '🛡️';
      case 'architecture': return '🏗️';
      default: return '💡';
    }
  };

  return (
    <div className="strategist-view animate-fade-in">
      {!strategy && !isAnalyzing ? (
        <div className="strategist-welcome">
          <div className="welcome-content">
            <div className="brain-icon-large">🧠</div>
            <h2>Venture Strategist</h2>
            <p>Deploy a high-fidelity AI model to analyze your codebase architecture, market alignment, and technical debt. Get a custom roadmap to scale your venture.</p>
            
            <div className="strategist-perks">
              <div className="perk-item">
                <span className="perk-icon">🗺️</span>
                <div>
                  <strong>Dynamic Roadmap</strong>
                  <span>Step-by-step evolution of your SaaS infrastructure.</span>
                </div>
              </div>
              <div className="perk-item">
                <span className="perk-icon">💎</span>
                <div>
                  <strong>Blueprint Alignment</strong>
                  <span>Compare against elite venture blueprints.</span>
                </div>
              </div>
              <div className="perk-item">
                <span className="perk-icon">⚡</span>
                <div>
                  <strong>Actable Insights</strong>
                  <span>Instantly trigger Studio refinements from suggestions.</span>
                </div>
              </div>
            </div>

            <button 
              className="btn btn-primary btn-lg" 
              onClick={handleAnalyze}
              style={{ padding: '16px 48px', fontSize: '1.1rem', borderRadius: '16px', boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)' }}
            >
              🚀 Analyze Venture Strategy
            </button>
            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Cost: <strong>{AI_MODELS.find(m => m.slug === selectedModel)?.creditCost || 0} Credits</strong> (via {AI_MODELS.find(m => m.slug === selectedModel)?.name})
            </p>
          </div>
        </div>
      ) : isAnalyzing ? (
        <div className="strategist-loading">
          <div className="loading-spinner-large"></div>
          <h3>Consulting Reasoning Engine...</h3>
          <p>Analyzing segments, telemetry, and quality audits to determine the best way forward.</p>
          <div className="loading-steps">
            <div className="loading-step active">Scanning repository landscape...</div>
            <div className="loading-step">Mapping feature domains...</div>
            <div className="loading-step">Identifying infrastructure gaps...</div>
            <div className="loading-step">Synthesizing strategic roadmap...</div>
          </div>
        </div>
      ) : (
        <div className="strategy-dashboard">
          <div className="strategy-summary-card animate-slide-down">
             <div className="summary-header">
                <div className="score-ring">
                  <svg viewBox="0 0 36 36" className="circular-chart">
                    <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="circle" strokeDasharray={`${strategy.alignmentScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <text x="18" y="20.35" className="percentage">{strategy.alignmentScore}%</text>
                  </svg>
                </div>
                <div className="summary-text">
                  <h3>Venture Alignment Score</h3>
                  <p>{strategy.summary}</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={handleAnalyze}>Refresh Analysis</button>
             </div>
          </div>

          <div className="strategy-grid">
            <div className="suggestions-column">
              <h4 className="section-title">✨ Strategic Suggestions</h4>
              <div className="suggestions-stack">
                {strategy.suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="suggestion-card animate-scale-up">
                    <div className="suggestion-header">
                      <span className="suggestion-category">
                        {getCategoryIcon(suggestion.category)} {suggestion.category}
                      </span>
                      <div className="suggestion-badges">
                        <span className={`badge impact-${suggestion.impact}`}>Impact: {suggestion.impact}</span>
                        <span className={`badge effort-${suggestion.effort}`}>Effort: {suggestion.effort}</span>
                      </div>
                    </div>
                    <h5>{suggestion.title}</h5>
                    <p>{suggestion.description}</p>
                    <div className="suggestion-footer">
                      <span className="cost-estimate">Est. {suggestion.estimatedCredits} Credits</span>
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => onActOnSuggestion(suggestion.studioPrompt)}
                      >
                        ⚡ Act Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="roadmap-column">
              <h4 className="section-title">🗺️ Venture Roadmap</h4>
              <div className="roadmap-stack">
                {strategy.roadmap.map((step, idx) => (
                  <div key={idx} className={`roadmap-step ${step.status}`}>
                    <div className="step-indicator">
                      {step.status === 'done' ? '✓' : step.status === 'in-progress' ? '●' : idx + 1}
                    </div>
                    <div className="step-content">
                      <h6>{step.title}</h6>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-banner" style={{ marginTop: '2rem' }}>
          <p>{error}</p>
          <button className="btn btn-sm btn-ghost" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <style jsx>{`
        .strategist-view {
          padding: 2rem;
          min-height: 600px;
        }
        .strategist-welcome {
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 4rem 0;
        }
        .welcome-content {
          max-width: 600px;
        }
        .brain-icon-large {
          font-size: 5rem;
          margin-bottom: 2rem;
          filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.4));
        }
        .welcome-content h2 {
          font-size: 2.5rem;
          font-weight: 900;
          margin-bottom: 1rem;
          background: linear-gradient(to right, #fff, var(--text-muted));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .welcome-content p {
          color: var(--text-secondary);
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 3rem;
        }
        .strategist-perks {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          text-align: left;
          margin-bottom: 3rem;
        }
        .perk-item {
          display: flex;
          gap: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: transform 0.2s;
        }
        .perk-item:hover {
          transform: translateX(10px);
          border-color: var(--accent-primary);
        }
        .perk-icon {
          font-size: 2rem;
        }
        .perk-item strong {
          display: block;
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
        }
        .perk-item span {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .strategist-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 6rem 0;
          text-align: center;
        }
        .loading-spinner-large {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(139, 92, 246, 0.1);
          border-top: 4px solid var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 2rem;
        }
        .loading-steps {
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          max-width: 300px;
        }
        .loading-step {
          font-size: 0.85rem;
          color: var(--text-muted);
          opacity: 0.5;
        }
        .loading-step.active {
          opacity: 1;
          color: white;
          font-weight: 600;
        }

        .strategy-dashboard {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .strategy-summary-card {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(16, 185, 129, 0.05));
          padding: 2rem;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .summary-header {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .score-ring {
          width: 100px;
          height: 100px;
        }
        .circular-chart {
          display: block;
          margin: 10px auto;
          max-width: 100%;
          max-height: 250px;
        }
        .circle-bg {
          fill: none;
          stroke: rgba(255, 255, 255, 0.05);
          stroke-width: 2.8;
        }
        .circle {
          fill: none;
          stroke: var(--accent-primary);
          stroke-width: 2.8;
          stroke-linecap: round;
          transition: stroke-dasharray 1s ease-in-out;
        }
        .percentage {
          fill: white;
          font-family: inherit;
          font-size: 0.5rem;
          font-weight: 800;
          text-anchor: middle;
        }
        .summary-text {
          flex: 1;
        }
        .summary-text h3 {
          margin-bottom: 0.5rem;
          font-size: 1.5rem;
        }
        .summary-text p {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .strategy-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 2rem;
        }
        @media (max-width: 1024px) {
          .strategy-grid {
            grid-template-columns: 1fr;
          }
        }
        .section-title {
          font-size: 1.1rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }
        .suggestions-stack {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .suggestion-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1.5rem;
          border-radius: 16px;
          transition: all 0.2s;
        }
        .suggestion-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--accent-primary);
          transform: translateY(-2px);
        }
        .suggestion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .suggestion-category {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--accent-primary);
          background: rgba(139, 92, 246, 0.1);
          padding: 4px 10px;
          border-radius: 6px;
        }
        .suggestion-badges {
          display: flex;
          gap: 8px;
        }
        .badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .impact-high { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .effort-easy { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .suggestion-card h5 {
          font-size: 1.1rem;
          margin-bottom: 0.75rem;
        }
        .suggestion-card p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }
        .suggestion-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .cost-estimate {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .roadmap-stack {
          background: rgba(255, 255, 255, 0.01);
          padding: 2rem;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.03);
          position: relative;
        }
        .roadmap-step {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
          position: relative;
        }
        .roadmap-step:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 15px;
          top: 35px;
          bottom: -15px;
          width: 2px;
          background: rgba(255, 255, 255, 0.05);
        }
        .step-indicator {
          width: 32px;
          height: 32px;
          background: #1a1a1a;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          z-index: 1;
        }
        .roadmap-step.done .step-indicator {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: white;
        }
        .roadmap-step.in-progress .step-indicator {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
        }
        .step-content h6 {
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }
        .step-content p {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
