import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { SERVICE_LIBRARY } from "@/lib/engine/service-library";
import InfrastructureMap from "@/components/dashboard/InfrastructureMap";

export default async function VentureTelemetryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the venture
  const { data: venture, error } = await supabase
    .from('community_projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !venture) {
    redirect("/dashboard");
  }

  // Ensure user owns this venture
  if (venture.user_id !== user.id) {
    redirect("/dashboard");
  }

  const config = venture.blueprint_config || {};
  const status = venture.provisioning_status || {};
  const services = config.selectedServices || [];

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '8rem', maxWidth: '1200px', margin: '0 auto', padding: '8rem 2rem 4rem 2rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h1 className="gradient-text" style={{ fontSize: '2.5rem', margin: 0 }}>{venture.title}</h1>
              <span className={`status-badge ${venture.is_hatched ? 'completed' : 'in_progress'}`}>
                {venture.is_hatched ? 'Live' : 'Provisioning'}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{venture.description}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/dashboard" className="btn btn-ghost">← Back to Command Center</Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
          
          {/* Main Content Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Live Preview */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Live Preview</h3>
              <div style={{ background: '#000', borderRadius: '8px', overflow: 'hidden', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-medium)' }}>
                {venture.is_hatched && venture.live_url ? (
                  <iframe src={venture.live_url} style={{ width: '100%', height: '100%', border: 'none' }} title="Venture Preview" />
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>🐣</p>
                    <p>Venture is currently provisioning.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Infrastructure Map */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Infrastructure Map</h3>
              <InfrastructureMap 
                templateSlug={config.templateSlug} 
                selectedServices={services} 
                isHatched={venture.is_hatched} 
              />
            </div>
            
          </div>

          {/* Sidebar Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Status Board */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Provisioning Status</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>GitHub Repository</span>
                  <span style={{ color: status.github === 'complete' ? 'var(--success)' : status.github === 'processing' ? 'var(--warning)' : 'var(--text-muted)' }}>
                    {status.github === 'complete' ? '✓ Provisioned' : status.github === 'processing' ? '⚙️ Creating...' : 'Pending'}
                  </span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Vercel Deployment</span>
                  <span style={{ color: status.vercel === 'complete' ? 'var(--success)' : status.vercel === 'processing' ? 'var(--warning)' : 'var(--text-muted)' }}>
                    {status.vercel === 'complete' ? '✓ Deployed' : status.vercel === 'processing' ? '⚙️ Building...' : 'Pending'}
                  </span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Sovereign Database</span>
                  <span style={{ color: status.supabase === 'complete' ? 'var(--success)' : status.supabase === 'processing' ? 'var(--warning)' : 'var(--text-muted)' }}>
                    {status.supabase === 'complete' ? '✓ Initialized' : status.supabase === 'processing' ? '⚙️ Provisioning...' : 'Pending'}
                  </span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>DNS & Subdomain</span>
                  <span style={{ color: status.dns === 'complete' ? 'var(--success)' : status.dns === 'processing' ? 'var(--warning)' : 'var(--text-muted)' }}>
                    {status.dns === 'complete' ? '✓ Mapped' : status.dns === 'processing' ? '⚙️ Propagating...' : 'Pending'}
                  </span>
                </li>
              </ul>
            </div>

            {/* Webhook Status */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Automation Pipeline</h3>
              {config.webhookUrl ? (
                <div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Webhook configured to fire upon successful hatch:</p>
                  <code style={{ display: 'block', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                    {config.webhookUrl}
                  </code>
                  <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: venture.is_hatched ? 'var(--success)' : 'var(--warning)' }}>
                    Status: {venture.is_hatched ? 'Fired ✅' : 'Waiting for hatch...'}
                  </p>
                </div>
              ) : (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No external webhook configured for this venture.</p>
              )}
            </div>

            {/* Links */}
            {venture.is_hatched && (
              <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a href={venture.github_url} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ justifyContent: 'center' }}>
                  🐙 View Repository
                </a>
                <a href={venture.live_url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                  🌍 Visit Live Site
                </a>
              </div>
            )}

          </div>
        </div>

      </div>
    </>
  );
}
