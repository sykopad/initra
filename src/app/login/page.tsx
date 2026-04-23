"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup" | "magic-link";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleGitHubLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: "repo",
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to initiate GitHub login");
      setLoading(false);
    }
  };

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = "/dashboard";
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage("Check your email for the confirmation link!");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setMessage("Magic link sent! Check your email.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">
            <span className="logo-icon">⚡</span>
            <span className="brand-text">Initra</span>
          </Link>
        </div>
      </nav>

      <main className="login-content">
        <div className="login-card card-glass">
          <div className="login-header">
            <span className="login-icon">⚡</span>
            <h1>{mode === "signup" ? "Create Account" : "Welcome Back"}</h1>
            <p>
              {mode === "magic-link" 
                ? "We'll email you a magic link for a passwordless sign-in." 
                : "Enter your credentials to access your workspace."}
            </p>
          </div>

          <div className="auth-tabs">
            <button 
              className={`tab ${mode !== "magic-link" ? "active" : ""}`}
              onClick={() => setMode("login")}
            >
              Password
            </button>
            <button 
              className={`tab ${mode === "magic-link" ? "active" : ""}`}
              onClick={() => setMode("magic-link")}
            >
              Magic Link
            </button>
          </div>

          <div className="login-actions">
            {mode === "magic-link" ? (
              <form onSubmit={handleMagicLink} className="auth-form">
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <button className="btn btn-primary btn-lg w-full" disabled={loading}>
                  {loading ? <span className="spinner"></span> : "Send Magic Link"}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePasswordAuth} className="auth-form">
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    required
                    minLength={6}
                  />
                </div>
                <button className="btn btn-primary btn-lg w-full" disabled={loading}>
                  {loading ? <span className="spinner"></span> : (mode === "signup" ? "Sign Up" : "Sign In")}
                </button>
                
                <div className="mode-toggle">
                  {mode === "login" ? (
                    <p>Don't have an account? <button type="button" onClick={() => setMode("signup")}>Sign Up</button></p>
                  ) : (
                    <p>Already have an account? <button type="button" onClick={() => setMode("login")}>Sign In</button></p>
                  )}
                </div>
              </form>
            )}

            <div className="divider">
              <span>OR</span>
            </div>

            <button 
              className={`btn btn-secondary btn-lg github-btn ${loading ? "loading" : ""}`}
              onClick={handleGitHubLogin}
              disabled={loading}
              type="button"
            >
              <svg viewBox="0 0 24 24" className="icon">
                <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              Continue with GitHub
            </button>
            
            {error && <div className="status-message error">{error}</div>}
            {message && <div className="status-message success">{message}</div>}
          </div>

          <div className="login-footer">
            <p>By signing in, you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.</p>
          </div>
        </div>

        <div className="login-background">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>
      </main>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          color: white;
          overflow: hidden;
        }

        .login-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 2rem;
        }

        .login-card {
          width: 100%;
          max-width: 480px;
          padding: 3rem;
          z-index: 10;
          text-align: center;
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .login-header { margin-bottom: 2rem; }

        .login-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          font-size: 2.5rem;
          background: var(--gradient-primary);
          border-radius: 16px;
          margin-bottom: 1.5rem;
          box-shadow: 0 10px 25px -5px rgba(242, 155, 43, 0.3);
        }

        h1 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
          letter-spacing: -0.025em;
        }

        .login-header p {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .auth-tabs {
          display: flex;
          background: var(--bg-input);
          padding: 4px;
          border-radius: 12px;
          margin-bottom: 2rem;
          border: 1px solid var(--border-medium);
        }

        .tab {
          flex: 1;
          padding: 0.75rem;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab.active {
          background: var(--bg-secondary);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .mode-toggle {
          margin-top: 1rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .mode-toggle button {
          background: none;
          border: none;
          color: var(--accent-primary);
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }

        .divider {
          display: flex;
          align-items: center;
          margin: 2rem 0;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 700;
        }

        .divider::before, .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--border-subtle);
        }

        .divider span { padding: 0 1rem; }

        .github-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          height: 3.5rem;
          font-weight: 600;
          border-color: var(--border-medium);
        }

        .icon { width: 20px; height: 20px; }

        .status-message {
          margin-top: 1.5rem;
          padding: 1rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .error {
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid var(--accent-rose);
          color: var(--accent-rose);
        }

        .success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid var(--accent-emerald);
          color: var(--accent-emerald);
        }

        .login-footer {
          margin-top: 2.5rem;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .login-footer a {
          color: var(--text-secondary);
          text-decoration: underline;
        }

        .w-full { width: 100%; }

        /* Background Blobs */
        .login-background {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          overflow: hidden; z-index: 1;
        }

        .blob {
          position: absolute;
          filter: blur(100px);
          opacity: 0.15;
          border-radius: 50%;
        }

        .blob-1 {
          width: 400px; height: 400px;
          background: var(--accent-primary);
          top: -100px; left: -100px;
          animation: float 20s infinite alternate;
        }

        .blob-2 {
          width: 500px; height: 500px;
          background: var(--accent-secondary);
          bottom: -150px; right: -150px;
          animation: float 25s infinite alternate-reverse;
        }

        .blob-3 {
          width: 300px; height: 300px;
          background: var(--accent-blue);
          top: 40%; left: 50%;
          animation: float 15s infinite alternate;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          from { transform: translate(0, 0); }
          to { transform: translate(50px, 50px); }
        }

        .spinner {
          width: 20px; height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
