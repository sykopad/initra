"use client";

import { WizardConfig } from "@/lib/engine/types";

interface SovereignInfrastructureSelectorProps {
  config: Partial<WizardConfig>;
  onChange: (field: keyof WizardConfig, value: boolean) => void;
}

const FEATURE_GROUPS = [
  {
    title: "Performance & Scale",
    features: [
      { id: "isScalabilityEnabled", label: "Autonomous Scalability", description: "Demand-aware infrastructure scaling policies.", icon: "🚀" },
      { id: "isShardingEnabledV3", label: "Dynamic Sharding 3.0", description: "Cross-shard rebalancing and automated migration.", icon: "💎" },
      { id: "isEdgeV2Enabled", label: "Sovereign Edge 2.0", description: "Multi-cloud sync and geo-proximity steering.", icon: "🌐" },
    ]
  },
  {
    title: "Security & Resilience",
    features: [
      { id: "isSecurityHardenedV2", label: "Security Guardrails 2.0", description: "Continuous vulnerability auditing and patching.", icon: "🛡️" },
      { id: "isChaosEnabledV2", label: "Chaos Engineering 2.0", description: "Self-healing recovery playbooks and stress testing.", icon: "🧪" },
      { id: "isResilienceEnabledV2", label: "Chaos Orchestration", description: "Predictive failure detection and autonomous healing.", icon: "♻️" },
      { id: "isAiGatewayEnabled", label: "AI Gateway", description: "Privacy-preserving LLM orchestration and caching.", icon: "🧠" },
    ]
  },
  {
    title: "Compliance & Governance",
    features: [
      { id: "isComplianceEnabledV3", label: "Compliance Engine 3.0", description: "Autonomous regulatory patching and enforcement.", icon: "⚖️" },
      { id: "isObservabilityEnabledV2", label: "Observability 2.0", description: "Distributed tracing and AI performance insights.", icon: "📊" },
      { id: "isGovernanceEnabled", label: "Sovereign Governance", description: "DAO-based infrastructure management and SPARC enforcement.", icon: "🏛️" },
    ]
  },
  {
    title: "Ecosystem & Evolution",
    features: [
      { id: "isSwarmEnabledV2", label: "AI Swarm 2.0", description: "Autonomous venture evolution and self-improving code.", icon: "🐝" },
      { id: "isMarketplaceEnabled", label: "Venture Marketplace", description: "Peer-to-peer sharing of AI skills and patterns.", icon: "🏪" },
    ]
  }
];

export default function SovereignInfrastructureSelector({ config, onChange }: SovereignInfrastructureSelectorProps) {
  return (
    <div className="sovereign-selector">
      {FEATURE_GROUPS.map((group) => (
        <div key={group.title} style={{ marginBottom: "2rem" }}>
          <h4 style={{ 
            fontSize: "0.85rem", 
            textTransform: "uppercase", 
            letterSpacing: "0.05em", 
            color: "var(--text-muted)", 
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <span style={{ width: "20px", height: "1px", background: "var(--border-subtle)" }}></span>
            {group.title}
          </h4>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {group.features.map((feature) => {
              const isEnabled = !!(config as any)[feature.id];
              
              return (
                <div 
                  key={feature.id}
                  className={`project-type-card \${isEnabled ? 'selected' : ''}`}
                  onClick={() => onChange(feature.id as keyof WizardConfig, !isEnabled)}
                  style={{ 
                    textAlign: "left", 
                    padding: "1rem", 
                    display: "flex", 
                    gap: "1rem", 
                    alignItems: "center",
                    minHeight: "auto"
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>{feature.icon}</span>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ fontSize: "0.9rem", margin: 0 }}>{feature.label}</h5>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>{feature.description}</p>
                  </div>
                  <div style={{ 
                    width: "20px", 
                    height: "20px", 
                    borderRadius: "4px", 
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isEnabled ? "var(--primary)" : "transparent",
                    color: "white",
                    fontSize: "0.8rem"
                  }}>
                    {isEnabled && "✓"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
