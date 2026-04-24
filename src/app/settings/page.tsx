"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateProfile, getProfile, updateSovereignConfig } from "@/lib/actions/profiles";
import ProSubscription from "@/components/wizard/ProSubscription";
import Navbar from "@/components/Navbar";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [profile, setProfile] = useState({
    id: "",
    display_name: "",
    github_username: "",
    email: "",
    credits: 0,
    vercel_token: "",
    vercel_team_id: "",
    github_personal_token: "",
    is_pro: false
  });

  const [transactions, setTransactions] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const [security, setSecurity] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }

      const prof = await getProfile();
      if (prof) {
        setProfile({
          id: user.id,
          display_name: prof.display_name || "",
          github_username: prof.github_username || "",
          email: user.email || "",
          credits: prof.credits || 0,
          vercel_token: prof.vercel_token || "",
          vercel_team_id: prof.vercel_team_id || "",
          github_personal_token: prof.github_personal_token || "",
          is_pro: prof.tier === 'pro'
        });
      }

      // Fetch Transactions
      const { data: txs } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (txs) setTransactions(txs);

      setLoading(false);
    }
    loadData();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateProfile({
        display_name: profile.display_name,
        github_username: profile.github_username
      });
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: security.newPassword
      });
      if (error) throw error;
      setSuccess("Password updated successfully!");
      setSecurity({ newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSovereignUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateSovereignConfig({
        vercel_token: profile.vercel_token,
        vercel_team_id: profile.vercel_team_id,
        github_personal_token: profile.github_personal_token
      });
      setSuccess("Infrastructure configuration updated!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <Navbar />
      
      <main className="settings-main animate-fade-in">
        <header className="settings-header">
          <h1>Account Settings</h1>
          <p>Manage your profile and security preferences</p>
        </header>

        <div className="settings-stack">
          {/* Billing & Usage Section (Top Priority) */}
          <section className="settings-section glass-panel economy-hero">
            <div className="section-header">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              <h2>Venture Economy</h2>
            </div>

            <div className="billing-grid">
              <div className="balance-box">
                <span className="balance-label">Current Balance</span>
                <div className="balance-amount">
                  {profile.credits || 0}
                </div>
                <span className="balance-subtext">Credits Available</span>
                <div className="balance-actions">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => window.location.href = '/dashboard'}
                  >
                    Top up Credits
                  </button>
                  {!profile.is_pro && (
                    <ProSubscription 
                      userId={profile.id} 
                      onSuccess={() => {
                        setToast("🎉 Subscription active! Refreshing status...");
                        setTimeout(() => window.location.reload(), 2000);
                      }} 
                    />
                  )}
                </div>
              </div>

              <div className="transaction-history">
                <h3 className="history-title">Recent Activity</h3>
                <div className="tx-list">
                  {transactions.length > 0 ? (
                    transactions.map(tx => (
                      <div key={tx.id} className="tx-item">
                        <div className="tx-info">
                          <div className="tx-desc">{tx.description}</div>
                          <div className="tx-date">{new Date(tx.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className={`tx-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-tx">No recent transactions.</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="settings-columns">
            <div className="settings-col-main">
              {/* Profile Section */}
              <section className="settings-section glass-panel">
                <div className="section-header">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <h2>Identity</h2>
                </div>
                
                <form onSubmit={handleProfileUpdate} className="settings-form">
                  <div className="form-group">
                    <label>Email Address (read-only)</label>
                    <input type="text" value={profile.email} readOnly className="form-input read-only" />
                  </div>

                  <div className="form-group">
                    <label>Display Name</label>
                    <input 
                      type="text" 
                      value={profile.display_name} 
                      onChange={(e) => setProfile({...profile, display_name: e.target.value})}
                      className="form-input"
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>GitHub Username</label>
                    <input 
                      type="text" 
                      value={profile.github_username} 
                      onChange={(e) => setProfile({...profile, github_username: e.target.value})}
                      className="form-input"
                      placeholder="e.g. jdoe88"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : "Update Profile"}
                  </button>
                </form>
              </section>

              {/* Security Section */}
              <section className="settings-section glass-panel" style={{ marginTop: '2rem' }}>
                <div className="section-header">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <h2>Security</h2>
                </div>

                <form onSubmit={handlePasswordUpdate} className="settings-form">
                  <div className="form-group">
                    <label>New Password</label>
                    <input 
                      type="password" 
                      value={security.newPassword} 
                      onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                      className="form-input"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input 
                      type="password" 
                      value={security.confirmPassword} 
                      onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
                      className="form-input"
                      placeholder="••••••••"
                    />
                  </div>

                  <button type="submit" className="btn btn-secondary" disabled={saving}>
                    {saving ? "Updating..." : "Change Password"}
                  </button>
                </form>
              </section>
            </div>

            <div className="settings-col-sidebar">
              {/* Sovereign Infrastructure Section */}
              <section className="settings-section glass-panel">
                <div className="section-header">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  <h2>Infrastructure</h2>
                </div>

                <div className="sovereign-guidance">
                  <p>
                    Bring your own infrastructure for 100% ownership. By providing your own tokens, Initra will hatch ventures directly onto <strong>your</strong> accounts.
                  </p>
                  <ul className="guidance-list">
                    <li><a href="https://vercel.com/account/tokens" target="_blank" rel="noreferrer">Vercel Token</a> (Full Access)</li>
                    <li><a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer">GitHub Token</a> (Repo, Workflow)</li>
                  </ul>
                </div>

                <form onSubmit={handleSovereignUpdate} className="settings-form">
                  <div className="form-group">
                    <label>Vercel Access Token</label>
                    <input 
                      type="password" 
                      value={profile.vercel_token} 
                      onChange={(e) => setProfile({...profile, vercel_token: e.target.value})}
                      className="form-input"
                      placeholder="v1_..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Vercel Team ID (Optional)</label>
                    <input 
                      type="text" 
                      value={profile.vercel_team_id} 
                      onChange={(e) => setProfile({...profile, vercel_team_id: e.target.value})}
                      className="form-input"
                      placeholder="team_..."
                    />
                  </div>

                  <div className="form-group">
                    <label>GitHub Personal Access Token (Optional)</label>
                    <input 
                      type="password" 
                      value={profile.github_personal_token} 
                      onChange={(e) => setProfile({...profile, github_personal_token: e.target.value})}
                      className="form-input"
                      placeholder="ghp_..."
                    />
                    <span className="form-hint">Required for bypassing platform-wide GitHub limits.</span>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving Config..." : "Save Config"}
                  </button>
                </form>
              </section>
            </div>
          </div>
        </div>

        {error && <div className="status-message error animate-slide-up">{error}</div>}
        {success && <div className="status-message success animate-slide-up">{success}</div>}
        {toast && <div className="status-message success animate-slide-up">{toast}</div>}
      </main>

      <style jsx>{`
        .settings-container {
          min-height: 100vh;
          background: var(--bg-primary);
          padding-top: 100px;
        }

        .settings-stack {
          display: flex;
          flex-direction: colum        .economy-hero {
          border-top: 4px solid var(--accent-primary);
          padding: 3rem !important;
        }
 
        .billing-grid {
          display: grid;
          grid-template-columns: 1.1fr 1.9fr;
          gap: 3rem;
        }

        .balance-box {
          background: rgba(139, 92, 246, 0.05);
          padding: 2.5rem;
          border-radius: 24px;
          border: 1px solid rgba(139, 92, 246, 0.2);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.05);
        }

        .balance-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 0.5rem;
        }

        .balance-amount {
          font-size: 4rem;
          font-weight: 800;
          margin: 0.5rem 0;
          color: var(--accent-primary);
          line-height: 1;
          filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.3));
        }

        .balance-subtext {
          font-size: 0.95rem;
          opacity: 0.8;
          margin-bottom: 2.5rem;
        }

        .balance-actions {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .history-title {
          font-size: 1.1rem;
          margin-bottom: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .tx-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 350px;
          overflow-y: auto;
          padding-right: 0.75rem;
        }

        .tx-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem;
          background: rgba(255,255,255,0.02);
          border-radius: 16px;
          border: 1px solid var(--border-light);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tx-item:hover {
          background: rgba(255,255,255,0.05);
          border-color: var(--accent-primary);
          transform: translateX(4px);
        }

        .tx-desc {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .tx-date {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        .tx-amount {
          font-weight: 800;
          font-family: var(--font-mono);
          font-size: 1.1rem;
        }

        .positive { color: var(--accent-emerald); }
        .negative { color: var(--accent-rose); }

        .settings-columns {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 2rem;
        }

        .sovereign-guidance {
          margin-bottom: 2rem;
          padding: 1.25rem;
          background: rgba(139, 92, 246, 0.03);
          border-radius: 14px;
          border: 1px solid rgba(139, 92, 246, 0.1);
        }

        .sovereign-guidance p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.6;
        }

        .guidance-list {
          font-size: 0.8rem;
          margin-top: 1rem;
          padding-left: 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .guidance-list a {
          color: var(--accent-primary);
          text-decoration: none;
          font-weight: 600;
        }

        .guidance-list a:hover {
          text-decoration: underline;
        }

        .form-hint {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        .settings-main {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 var(--space-lg) 4rem;
        }

        .settings-header {
          margin-bottom: 4rem;
          text-align: center;
        }

        .settings-header h1 {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
          background: var(--gradient-text);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .settings-header p {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .settings-section {
          padding: 2.5rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 2.5rem;
          color: var(--accent-primary);
        }

        .section-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .form-group label {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .read-only {
          opacity: 0.6;
          cursor: not-allowed;
          background: rgba(0,0,0,0.1);
        }

        .status-message {
          position: fixed;
          bottom: 2.5rem;
          right: 2.5rem;
          padding: 1.25rem 2.5rem;
          border-radius: 16px;
          font-weight: 600;
          z-index: 1000;
          box-shadow: var(--shadow-lg);
        }

        .error {
          background: var(--accent-rose);
          color: white;
        }

        .success {
          background: var(--accent-emerald);
          color: white;
        }

        .settings-loading {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid var(--border-medium);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 992px) {
          .billing-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .settings-columns {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .economy-hero {
            padding: 2rem !important;
          }

          .balance-box {
            padding: 2rem;
          }

          .balance-amount { font-size: 3rem; }
          
          .settings-header h1 { font-size: 2.5rem; }
        }
      `}</style>
    </div>
  );
}
