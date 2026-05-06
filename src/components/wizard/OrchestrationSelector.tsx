import React from 'react';

interface OrchestrationSelectorProps {
  mode: 'single-agent' | 'multi-agent' | undefined;
  topology: 'mesh' | 'hierarchical' | 'adaptive' | undefined;
  methodology: 'standard' | 'sparc' | undefined;
  onUpdate: (updates: {
    orchestrationMode?: 'single-agent' | 'multi-agent';
    swarmTopology?: 'mesh' | 'hierarchical' | 'adaptive';
    developmentMethodology?: 'standard' | 'sparc';
  }) => void;
}

export default function OrchestrationSelector({
  mode = 'single-agent',
  topology = 'hierarchical',
  methodology = 'standard',
  onUpdate
}: OrchestrationSelectorProps) {
  return (
    <div className="orchestration-selector">
      <div className="selector-section">
        <label className="section-label">Orchestration Mode</label>
        <div className="option-grid">
          <div 
            className={`option-card ${mode === 'single-agent' ? 'active' : ''}`}
            onClick={() => onUpdate({ orchestrationMode: 'single-agent' })}
          >
            <div className="card-header">
              <span className="icon">👤</span>
              <h4>Single Agent</h4>
            </div>
            <p>A single expert agent handles the entire lifecycle. Best for small projects or rapid prototyping.</p>
          </div>

          <div 
            className={`option-card ${mode === 'multi-agent' ? 'active' : ''}`}
            onClick={() => onUpdate({ orchestrationMode: 'multi-agent' })}
          >
            <div className="card-header">
              <span className="icon">🐝</span>
              <h4>Agent Team</h4>
            </div>
            <p>Orchestrate a specialized swarm (Architect, Coder, Tester). Best for production-grade ventures.</p>
          </div>
        </div>
      </div>

      {mode === 'multi-agent' && (
        <div className="selector-section fade-in">
          <label className="section-label">Swarm Topology</label>
          <div className="topology-list">
            {[
              { id: 'mesh', name: 'Mesh', desc: 'Decentralized P2P coordination.', icon: '🕸️' },
              { id: 'hierarchical', name: 'Hierarchical', desc: 'Centralized Queen-Worker logic.', icon: '👑' },
              { id: 'adaptive', name: 'Adaptive', desc: 'Dynamic topology switching.', icon: '🧬' }
            ].map((top) => (
              <div 
                key={top.id}
                className={`topology-item ${topology === top.id ? 'active' : ''}`}
                onClick={() => onUpdate({ swarmTopology: top.id as any })}
              >
                <span className="item-icon">{top.icon}</span>
                <div className="item-content">
                  <h5>{top.name}</h5>
                  <p>{top.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="selector-section">
        <label className="section-label">Development Methodology</label>
        <div className="methodology-switch">
          <div 
            className={`method-option ${methodology === 'standard' ? 'active' : ''}`}
            onClick={() => onUpdate({ developmentMethodology: 'standard' })}
          >
            Standard
          </div>
          <div 
            className={`method-option ${methodology === 'sparc' ? 'active' : ''}`}
            onClick={() => onUpdate({ developmentMethodology: 'sparc' })}
          >
            SPARC Protocol
            <span className="premium-pill">Pro</span>
          </div>
        </div>
        <p className="method-hint">
          {methodology === 'sparc' 
            ? "Enforces Specification, Pseudocode, Architecture, Refinement, and Completion cycles."
            : "Standard agile-like iterative development without mandatory pre-planning phases."
          }
        </p>
      </div>

      <style jsx>{`
        .orchestration-selector {
          display: flex;
          flex-direction: column;
          gap: 32px;
          animation: slideUp 0.4s ease-out;
        }

        .selector-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.4);
        }

        .option-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .option-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .option-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .option-card.active {
          background: rgba(var(--primary-rgb, 99, 102, 241), 0.1);
          border-color: rgba(var(--primary-rgb, 99, 102, 241), 0.5);
          box-shadow: 0 0 20px rgba(var(--primary-rgb, 99, 102, 241), 0.1);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .icon {
          font-size: 1.25rem;
        }

        h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
        }

        p {
          margin: 0;
          font-size: 0.85rem;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.5);
        }

        .topology-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .topology-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .topology-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .topology-item.active {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .item-icon {
          font-size: 1.2rem;
        }

        .item-content h5 {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 600;
          color: #fff;
        }

        .item-content p {
          font-size: 0.75rem;
        }

        .methodology-switch {
          display: flex;
          background: rgba(0, 0, 0, 0.2);
          padding: 4px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          width: fit-content;
        }

        .method-option {
          padding: 8px 20px;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: rgba(255, 255, 255, 0.5);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .method-option.active {
          background: #fff;
          color: #000;
        }

        .premium-pill {
          font-size: 0.6rem;
          background: linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%);
          color: #000;
          padding: 1px 6px;
          border-radius: 4px;
          font-weight: 800;
        }

        .method-hint {
          font-size: 0.75rem;
          font-style: italic;
          margin-top: 4px;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fade-in {
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
