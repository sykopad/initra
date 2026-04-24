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

            <div className="economy-landscape">
              {/* Block 1: Balance */}
              <div className="economy-card balance-card">
                <span className="card-label">Current Balance</span>
                <div className="balance-display">
                  <span className="balance-number">{profile.credits || 0}</span>
                  <span className="balance-unit">Credits Available</span>
                </div>
                <button 
                  className="btn btn-primary topup-btn" 
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Top up Credits
                </button>
              </div>

              {/* Block 2: Subscription Tier */}
              <div className="economy-card subscription-card">
                <div className="tier-info">
                  <span className="tier-name">Initra Pro Monthly</span>
                  <div className="tier-price">
                    <span className="price-val">$19.00</span>
                    <span className="price-period">/ month</span>
                  </div>
                </div>
                {!profile.is_pro ? (
                  <div className="sub-cta">
                    <ProSubscription 
                      userId={profile.id} 
                      layout="minimal"
                      onSuccess={() => {
                        setToast("🎉 Subscription active! Refreshing status...");
                        setTimeout(() => window.location.reload(), 2000);
                      }} 
                    />
                  </div>
                ) : (
                  <div className="active-badge">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Pro Plan Active
                  </div>
                )}
              </div>

              {/* Block 3: Pro Benefits */}
              <div className="economy-card benefits-card">
                <span className="card-label">Pro Features</span>
                <ul className="premium-perks">
                  <li>🚀 <strong>Managed Infrastructure</strong>: Hatch ventures on Initra's Vercel account.</li>
                  <li>🛡️ <strong>Private Blueprints</strong>: Save and share ventures privately.</li>
                  <li>🧠 <strong>Elite Models</strong>: Priority access to Claude 3.7 & GPT-4o.</li>
                  <li>⚡ <strong>Advanced Analytics</strong>: Deep telemetry for all birthed ventures.</li>
                  <li>🎁 <strong>Monthly Credits</strong>: 200 free credits every month.</li>
                </ul>
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

                  <div className="form-row">
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
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? "Saving..." : "Update Profile"}
                    </button>
                  </div>
                </form>
              </section>

              {/* Security Section */}
              <section className="settings-section glass-panel" style={{ marginTop: '3rem' }}>
                <div className="section-header">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <h2>Security</h2>
                </div>

                <form onSubmit={handlePasswordUpdate} className="settings-form">
                  <div className="form-row">
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
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-secondary" disabled={saving}>
                      {saving ? "Updating..." : "Change Password"}
                    </button>
                  </div>
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
          flex-direction: column;
          gap: 3rem;
        }

        .economy-hero {
          border-top: 4px solid var(--accent-primary);
          padding: 3rem !important;
        }

        .economy-landscape {
          display: grid;
          grid-template-columns: 1fr 1fr 1.2fr;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .economy-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-subtle);
          border-radius: 24px;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.3s ease;
        }

        .economy-card:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(242, 155, 43, 0.3);
          transform: translateY(-4px);
        }

        .card-label {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          display: block;
        }

        .balance-display {
          margin-bottom: 2.5rem;
        }

        .balance-number {
          display: block;
          font-size: 4rem;
          font-weight: 950;
          line-height: 1;
          color: var(--accent-primary);
          letter-spacing: -0.05em;
        }

        .balance-unit {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-top: 0.5rem;
          display: block;
        }

        .tier-info {
          margin-bottom: 2rem;
        }

        .tier-name {
          font-size: 1.25rem;
          font-weight: 800;
          color: white;
          display: block;
          margin-bottom: 0.5rem;
        }

        .tier-price {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }

        .price-val {
          font-size: 2.5rem;
          font-weight: 900;
          color: var(--text-primary);
        }

        .price-period {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .active-badge {
          background: rgba(16, 185, 129, 0.1);
          color: var(--accent-emerald);
          padding: 1rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-weight: 700;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .premium-perks {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .premium-perks li {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .premium-perks strong {
          color: var(--text-primary);
        }

        .transaction-history {
          margin-top: 2rem;
          padding-top: 3rem;
          border-top: 1px solid var(--border-subtle);
        }

        .history-title {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .tx-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 380px;
          overflow-y: auto;
          padding-right: 1rem;
        }

        .tx-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          background: rgba(255,255,255,0.02);
          border-radius: 16px;
          border: 1px solid var(--border-subtle);
          transition: all 0.3s ease;
        }

        .tx-item:hover {
          background: rgba(255,255,255,0.05);
          border-color: var(--accent-primary);
          transform: translateY(-2px);
        }

        .tx-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .tx-desc {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .tx-date {
          font-size: 0.75rem;
          color: var(--text-muted);
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
          grid-template-columns: 1fr 400px;
          gap: 3rem;
          align-items: start;
        }

        .sovereign-guidance {
          margin-bottom: 2.5rem;
          padding: 1.5rem;
          background: rgba(139, 92, 246, 0.03);
          border-radius: 16px;
          border: 1px solid rgba(139, 92, 246, 0.1);
        }

        .sovereign-guidance p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.6;
        }

        .guidance-list {
          font-size: 0.8rem;
          margin-top: 1.25rem;
          padding-left: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .guidance-list a {
          color: var(--accent-primary);
          text-decoration: none;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .guidance-list a:hover {
          color: var(--accent-primary-light);
          text-decoration: underline;
        }

        .form-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.5rem;
          line-height: 1.4;
        }

        .settings-main {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 2rem 6rem;
        }

        .settings-header {
          margin-bottom: 5rem;
          text-align: center;
        }

        .settings-header h1 {
          font-size: 3.5rem;
          font-weight: 900;
          margin-bottom: 1rem;
          background: var(--gradient-text);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.05em;
        }

        .settings-header p {
          color: var(--text-secondary);
          font-size: 1.125rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .settings-section {
          padding: 3rem;
          height: 100%;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 3rem;
          color: var(--accent-primary);
        }

        .section-header h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.03em;
        }

        .settings-form {
          display: grid;
          gap: 2rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-input {
          padding: 1rem 1.25rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          color: var(--text-primary);
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .form-input:focus {
          background: rgba(255,255,255,0.06);
          border-color: var(--accent-primary);
          outline: none;
          box-shadow: 0 0 0 4px rgba(242, 155, 43, 0.1);
        }

        .read-only {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(0,0,0,0.2);
        }

        .status-message {
          position: fixed;
          bottom: 3rem;
          right: 3rem;
          padding: 1.25rem 2.5rem;
          border-radius: 20px;
          font-weight: 700;
          z-index: 1000;
          box-shadow: var(--shadow-lg);
          backdrop-filter: blur(10px);
        }

        .error {
          background: rgba(244, 63, 94, 0.9);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .success {
          background: rgba(16, 185, 129, 0.9);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .settings-loading {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spinner {
          width: 56px;
          height: 56px;
          border: 4px solid var(--border-subtle);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1100px) {
          .settings-columns {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 992px) {
          .billing-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .form-row {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .economy-hero, .settings-section {
            padding: 2rem !important;
          }

          .balance-box {
            padding: 2rem;
          }

          .balance-amount { font-size: 3.5rem; }
          .settings-header h1 { font-size: 2.5rem; }
        }
      `}</style>
    </div>
  );
}
