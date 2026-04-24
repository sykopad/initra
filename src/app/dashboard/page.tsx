import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreditPurchase from "@/components/wizard/CreditPurchase";
import RepoBuilder from "@/components/dashboard/RepoBuilder";
import ProjectItem from "@/components/dashboard/ProjectItem";
import Navbar from "@/components/Navbar";
import { SERVICE_LIBRARY } from "@/lib/engine/service-library";
import "./dashboard.css";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch Synced Repositories
  const { data: syncedRepos } = await supabase
    .from('synced_repositories')
    .select('*')
    .eq('user_id', user.id);

  // Fetch Profile (Credits)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch Project History (Wizard Sessions)
  const { data: sessions } = await supabase
    .from('wizard_sessions')
    .select(`
      id, 
      project_name, 
      created_at, 
      template_id,
      share_slug,
      generated_config,
      project_templates (name, slug, icon_emoji)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch Hatched Ventures
  const { data: hatchedVentures } = await supabase
    .from('community_projects')
    .select('id, title, created_at, status, is_hatched, live_url, blueprint_config')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch Transactions
  const { data: transactions } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <>
      <Navbar />
      <div className="dashboard-container" style={{ paddingTop: '8rem' }}>
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <h1 className="gradient-text" style={{ fontSize: 'var(--text-4xl)', marginBottom: '0.5rem' }}>Command Center</h1>
            <p className="subtitle" style={{ fontSize: 'var(--text-lg)', opacity: 0.8 }}>Manage your sovereign infrastructure and active ventures.</p>
          </div>
          <Link href="/wizard" className="btn btn-primary">
            🚀 Hatch New Venture
          </Link>
        </div>

        <div className="dashboard-grid">
        <RepoBuilder initialRepos={syncedRepos} />

        {/* Hatched Ventures */}
        <section className="dashboard-card projects-card">
          <div className="card-header">
            <h3>Hatched Ventures</h3>
            <span className="count-badge">{hatchedVentures?.length || 0} Ventures</span>
          </div>
          <div className="project-list">
            {hatchedVentures && hatchedVentures.length > 0 ? (
              hatchedVentures.map(venture => (
                <div key={venture.id} className="project-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="project-info">
                    <span className="icon">🐣</span>
                    <div>
                      <h4>{venture.title}</h4>
                      <span className="template">
                        {new Date(venture.created_at).toLocaleDateString()} • {venture.is_hatched ? 'Live' : 'Provisioning'}
                      </span>
                      <div className="infra-mini-icons">
                        <span className="infra-mini-icon" title={((venture.blueprint_config as any)?.templateSlug === 'nextjs' ? 'Next.js' : 'Nuxt')}>
                          {(venture.blueprint_config as any)?.templateSlug === 'nextjs' ? '▲' : '💚'}
                        </span>
                        {((venture.blueprint_config as any)?.selectedServices || []).map((slug: string) => {
                          const svc = SERVICE_LIBRARY.find(s => s.slug === slug);
                          if (!svc) return null;
                          return <span key={slug} className="infra-mini-icon" title={svc.name}>{svc.icon}</span>;
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="project-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link href={`/dashboard/venture/${venture.id}`} className="btn-link" style={{ background: 'var(--primary-dark)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', color: 'white' }}>
                      📡 Telemetry
                    </Link>
                    {venture.live_url && (
                      <a href={venture.live_url} target="_blank" rel="noreferrer" className="btn-link" style={{ padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem' }}>
                        Visit Site
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No ventures hatched yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Project History */}
        <section className="dashboard-card projects-card">
          <div className="card-header">
            <h3>Export History</h3>
            <span className="count-badge">{sessions?.length || 0} Projects</span>
          </div>
          <div className="project-list">
            {sessions && sessions.length > 0 ? (
              sessions.map(session => (
                <ProjectItem key={session.id} session={session} />
              ))
            ) : (
              <div className="empty-state">
                <p>No projects exported yet. Start the wizard to build something!</p>
                <Link href="/wizard" className="btn btn-primary">Start Wizard</Link>
              </div>
            )}
          </div>
        </section>

        </section>
      </div>


      </div>
    </>
  );
}
