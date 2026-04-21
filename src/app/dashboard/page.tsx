import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreditPurchase from "@/components/wizard/CreditPurchase";
import RepoBuilder from "@/components/dashboard/RepoBuilder";
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
      project_templates (name, slug, icon_emoji)
    `)
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
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>User Dashboard</h1>
        <p className="subtitle">Manage your credits and review past exports.</p>
      </div>

      <div className="dashboard-grid">
        <RepoBuilder initialRepos={syncedRepos} />

        {/* Credits & Subscription Section */}
        <section className="dashboard-card credit-card">
          <div className="card-header">
            <div>
              <h3>Credit Balance</h3>
              <div className="tier-pill">{profile?.tier || 'Community'} Member</div>
            </div>
            <span className="balance-badge">{profile?.credits || 0} Credits</span>
          </div>
          
          <div className="subscription-info">
            {profile?.tier === 'community' ? (
              <p className="promo-text">Upgrade to <strong>Pro</strong> for monthly credit refills and automatic <strong>Sovereign DB</strong> provisioning.</p>
            ) : (
              <p className="refill-text">Next refill: <strong>{new Date(profile?.next_refill_at).toLocaleDateString()}</strong></p>
            )}
          </div>
          
          <div className="purchase-section" style={{ marginTop: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Top up Credits</h4>
            <CreditPurchase userId={user.id} />
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
                <div key={session.id} className="project-item">
                  <div className="project-info">
                    <span className="icon">
                      {(Array.isArray(session.project_templates) ? session.project_templates[0] : session.project_templates)?.icon_emoji || '📁'}
                    </span>
                    <div>
                      <h4>{session.project_name || 'Untitled Project'}</h4>
                      <span className="template">
                        {(Array.isArray(session.project_templates) ? session.project_templates[0] : session.project_templates)?.name} • {new Date(session.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="project-actions">
                    <Link href={`/shared/${session.share_slug}`} className="btn-link">View Files</Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No projects exported yet. Start the wizard to build something!</p>
                <Link href="/wizard" className="btn btn-primary">Start Wizard</Link>
              </div>
            )}
          </div>
        </section>

        {/* Transaction History */}
        <section className="dashboard-card transactions-card">
           <div className="card-header">
            <h3>Recent Activity</h3>
          </div>
          <div className="transaction-list">
            {transactions && transactions.length > 0 ? (
              transactions.map(tx => (
                <div key={tx.id} className="transaction-item">
                  <div className="tx-desc">
                    <span className={`tx-type ${tx.type}`}>{tx.type}</span>
                    <p>{tx.description}</p>
                  </div>
                  <span className={`tx-amount ${tx.amount > 0 ? 'pos' : 'neg'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </span>
                </div>
              ))
            ) : (
              <p className="empty-msg">No transactions yet.</p>
            )}
          </div>
        </section>
      </div>


    </div>
  );
}
