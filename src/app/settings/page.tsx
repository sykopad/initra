"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateProfile, getProfile } from "@/lib/actions/profiles";
import Navbar from "@/components/Navbar";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [profile, setProfile] = useState({
    display_name: "",
    github_username: "",
    email: "",
    credits: 0
  });

  const [transactions, setTransactions] = useState<any[]>([]);

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
          display_name: prof.display_name || "",
          github_username: prof.github_username || "",
          email: user.email || "",
          credits: prof.credits || 0
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

        <div className="settings-grid">
          {/* Profile Section */}
          <section className="settings-section glass-panel">
            <div className="section-header">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <h2>Profile Information</h2>
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
          <section className="settings-section glass-panel">
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

          {/* Billing & Usage Section */}
          <section className="settings-section glass-panel" style={{ gridColumn: 'span 2' }}>
            <div className="section-header">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              <h2>Billing & Usage</h2>
            </div>

            <div className="billing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
              <div className="balance-box" style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.2)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Current Balance</span>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.5rem 0', color: 'var(--accent-primary)' }}>
                  {profile.credits || 0}
                </div>
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Credits Available</span>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '1.5rem' }}
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Top up Credits
                </button>
              </div>

              <div className="transaction-history">
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Recent Activity</h3>
                <div className="tx-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {transactions.length > 0 ? (
                    transactions.map(tx => (
                      <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{tx.description}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(tx.created_at).toLocaleDateString()}</div>
                        </div>
                        <div style={{ fontWeight: 700, color: tx.amount > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No recent transactions.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {error && <div className="status-message error animate-slide-up">{error}</div>}
        {success && <div className="status-message success animate-slide-up">{success}</div>}
      </main>

      <style jsx>{`
        .settings-container {
          min-height: 100vh;
          background: var(--bg-primary);
          padding-top: 100px;
        }

        .settings-main {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 var(--space-lg) 4rem;
        }

        .settings-header {
          margin-bottom: 3rem;
          text-align: center;
        }

        .settings-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          background: var(--gradient-text);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .settings-header p {
          color: var(--text-secondary);
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        .settings-section {
          padding: 2rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          color: var(--accent-primary);
        }

        .section-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.875rem;
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
          bottom: 2rem;
          right: 2rem;
          padding: 1rem 2rem;
          border-radius: 12px;
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
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-medium);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
