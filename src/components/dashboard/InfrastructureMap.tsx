import React from 'react';
import { SERVICE_LIBRARY } from '@/lib/engine/service-library';

interface InfrastructureMapProps {
  templateSlug: string;
  selectedServices: string[];
  isHatched: boolean;
}

export default function InfrastructureMap({ templateSlug, selectedServices, isHatched }: InfrastructureMapProps) {
  const sovereignCore = [
    { name: 'GitHub', icon: '🐙', category: 'Infrastructure', description: 'Version control & automation host.' },
    { name: 'Vercel', icon: '▲', category: 'Deployment', description: 'Global edge network & serverless host.' },
    { name: 'Supabase', icon: '⚡', category: 'Database', description: 'Sovereign Postgres & Auth gateway.' },
    { name: templateSlug === 'nextjs' ? 'Next.js' : 'Nuxt', icon: templateSlug === 'nextjs' ? '▲' : '💚', category: 'Framework', description: 'High-performance application core.' },
  ];

  const externalServices = selectedServices.map(slug => {
    const svc = SERVICE_LIBRARY.find(s => s.slug === slug);
    return svc || null;
  }).filter(Boolean);

  return (
    <div className="infra-map">
      <div className="infra-section">
        <h4>Sovereign Core</h4>
        <div className="infra-grid">
          {sovereignCore.map(item => (
            <div key={item.name} className="infra-card">
              <div className="infra-card-header">
                <div className="infra-card-icon">{item.icon}</div>
                <div className="infra-card-status">Connected</div>
              </div>
              <div className="infra-card-content">
                <h5>{item.name}</h5>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {externalServices.length > 0 && (
        <div className="infra-section">
          <h4>Enterprise Integrations</h4>
          <div className="infra-grid">
            {externalServices.map(svc => (
              <div key={svc!.slug} className="infra-card">
                <div className="infra-card-header">
                  <div className="infra-card-icon">{svc!.icon}</div>
                  <div className="infra-card-status" style={{ 
                    background: isHatched ? 'rgba(16, 185, 129, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                    color: isHatched ? '#10b981' : '#fbbf24',
                    border: isHatched ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(251, 191, 36, 0.2)'
                  }}>
                    {isHatched ? 'Hooked Up' : 'Provisioning'}
                  </div>
                </div>
                <div className="infra-card-content">
                  <h5>{svc!.name}</h5>
                  <p>{svc!.description}</p>
                </div>
                <div className="infra-card-footer">
                  <a href={svc!.registrationUrl} target="_blank" rel="noreferrer" className="infra-link">
                    Portal ↗
                  </a>
                  {svc!.documentationUrl && (
                    <a href={svc!.documentationUrl} target="_blank" rel="noreferrer" className="infra-link">
                      Docs ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
