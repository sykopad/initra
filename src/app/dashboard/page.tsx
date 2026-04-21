import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreditPurchase from "@/components/wizard/CreditPurchase";
import RepoBuilder from "@/components/dashboard/RepoBuilder";

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
                    <span className="icon">{session.project_templates?.icon_emoji || '📁'}</span>
                    <div>
                      <h4>{session.project_name || 'Untitled Project'}</h4>
                      <span className="template">{session.project_templates?.name} • {new Date(session.created_at).toLocaleDateString()}</span>
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

      <style jsx>{`
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 20px;
          color: white;
        }
        .dashboard-header {
          margin-bottom: 40px;
        }
        h1 {
          font-family: var(--font-primary);
          font-size: 2.5rem;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #fff 0%, #aaa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle {
          color: var(--text-muted);
          font-size: 1.1rem;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 24px;
        }
        .dashboard-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          backdrop-filter: blur(10px);
          transition: transform 0.2s;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        h3 {
          font-size: 1.2rem;
          margin: 0;
        }
        .balance-badge, .count-badge {
          background: var(--accent-gradient);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .tier-pill {
          display: inline-block;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #fbbf24;
          font-weight: 800;
          margin-top: 4px;
        }
        .promo-text, .refill-text {
          font-size: 0.85rem;
          color: var(--text-muted);
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          border-left: 3px solid #6366f1;
        }
        .promo-text strong { color: #fcd34d; }
        .purchase-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 20px;
        }
        .project-list, .transaction-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .project-item, .transaction-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .project-info {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .icon {
          font-size: 1.5rem;
        }
        h4 {
          margin: 0;
          font-size: 1rem;
        }
        .template {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .btn-link {
          color: var(--color-primary);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .tx-desc {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .tx-type {
          font-size: 0.7rem;
          text-transform: uppercase;
          font-weight: bold;
          letter-spacing: 0.05em;
        }
        .tx-type.usage { color: #ff9d9d; }
        .tx-type.purchase { color: #9dff9d; }
        .tx-desc p {
          margin: 0;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .tx-amount {
          font-weight: 600;
        }
        .tx-amount.pos { color: #4ade80; }
        .tx-amount.neg { color: #f87171; }
        .empty-state {
          text-align: center;
          padding: 40px 0;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
