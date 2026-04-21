import { AI_MODELS, AIModel } from "@/lib/ai/models";

interface ModelSelectorProps {
  selectedModelSlug: string | undefined;
  onSelect: (slug: string) => void;
  userCredits?: number;
}

export default function ModelSelector({ selectedModelSlug, onSelect, userCredits = 0 }: ModelSelectorProps) {
  return (
    <div className="model-selector">
      <div className="model-grid">
        {AI_MODELS.map((model) => {
          const isSelected = selectedModelSlug === model.slug || (!selectedModelSlug && model.creditCost === 0);
          const canAfford = userCredits >= model.creditCost;

          return (
            <div 
              key={model.id} 
              className={`model-card ${isSelected ? 'selected' : ''} ${model.isPremium ? 'premium' : ''} ${!canAfford && model.isPremium ? 'locked' : ''}`}
              onClick={() => onSelect(model.slug)}
            >
              <div className="model-badge">
                {model.isPremium ? (
                  <span className="premium-badge">💎 {model.creditCost} Credits</span>
                ) : (
                  <span className="free-badge">FREE</span>
                )}
              </div>
              
              <div className="model-header">
                <h3>{model.name}</h3>
                <span className="provider">{model.provider}</span>
              </div>
              
              <p className="model-desc">{model.description}</p>
              
              <div className="model-footer">
                <span className="context">Context: {model.contextLimit}</span>
                {!canAfford && model.isPremium && (
                  <span className="insufficient-funds">Insufficient Credits</span>
                )}
              </div>
              
              {isSelected && <div className="selected-glow" />}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .model-selector {
          width: 100%;
        }
        .model-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          margin-top: 20px;
        }
        .model-card {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow: hidden;
        }
        .model-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }
        .model-card.selected {
          border-color: var(--color-primary, #6366f1);
          background: rgba(99, 102, 241, 0.05);
        }
        .model-card.premium {
          border-left: 3px solid #fcd34d;
        }
        .model-card.locked {
          opacity: 0.7;
          filter: grayscale(0.5);
        }
        .model-badge {
          display: flex;
          justify-content: flex-end;
          margin-bottom: -10px;
        }
        .premium-badge {
          background: linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%);
          color: #000;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .free-badge {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .model-header h3 {
          margin: 0;
          font-size: 1rem;
          color: #fff;
        }
        .provider {
          font-size: 0.75rem;
          color: var(--text-muted, #94a3b8);
          font-weight: 500;
        }
        .model-desc {
          font-size: 0.85rem;
          color: var(--text-muted, #94a3b8);
          margin: 0;
          flex-grow: 1;
        }
        .model-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          margin-top: 10px;
        }
        .context {
          color: rgba(255, 255, 255, 0.5);
        }
        .insufficient-funds {
          color: #f87171;
          font-weight: 600;
        }
        .selected-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--color-primary, #6366f1);
          box-shadow: 0 0 15px var(--color-primary, #6366f1);
        }
      `}</style>
    </div>
  );
}
