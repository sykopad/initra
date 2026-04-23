"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"password" | "magic-link">("password");

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

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Try to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // If user doesn't exist, try to sign up
        if (signInError.message.includes("Invalid login credentials")) {
           const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            }
          });
          if (signUpError) throw signUpError;
          setMessage("Check your email for the confirmation link to complete registration.");
        } else {
          throw signInError;
        }
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
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
      setMessage("Magic link sent! Please check your email.");
    } catch (err: any) {
      setError(err.message || "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">
            <img src="/initra-dark.svg" alt="Initra Logo" height="40" className="brand-logo" />
          </Link>
        </div>
      </nav>

      <main className="login-content">
        <div className="login-card card-glass">
          <div className="login-header">
            <img src="/initra-dark.svg" alt="Initra Logo" height="60" className="login-logo" />
            <h1>{mode === "password" ? "Welcome Back" : "Sign In with Link"}</h1>
            <p>
              {mode === "password" 
                ? "Enter your credentials to continue your venture building journey." 
                : "Enter your email and we'll send you a secure magic link."}
            </p>
          </div>

          <div className="login-actions">
            <form onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              {mode === "password" && (
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              )}

              <button 
                type="submit" 
                className={`btn btn-primary btn-lg submit-btn ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? <span className="spinner"></span> : (mode === "password" ? "Sign In / Sign Up" : "Send Magic Link")}
              </button>
            </form>

            <div className="divider">
              <span>OR</span>
            </div>

            <button 
              className={`btn btn-secondary btn-lg github-btn ${loading ? "loading" : ""}`}
              onClick={handleGitHubLogin}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" className="icon">
                <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              Continue with GitHub
            </button>
            
            <div className="mode-toggle">
              <button 
                className="btn-link" 
                onClick={() => setMode(mode === "password" ? "magic-link" : "password")}
                type="button"
              >
                {mode === "password" ? "Use magic link instead" : "Sign in with password"}
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}
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
          background: #0a0a1a;
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
          max-width: 460px;
          padding: 3rem;
          z-index: 10;
          text-align: center;
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .login-header {
          margin-bottom: 2rem;
        }

        .login-logo {
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 0 8px rgba(124, 58, 237, 0.3));
        }

        h1 {
          font-size: 1.875rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
          letter-spacing: -0.025em;
        }

        .login-header p {
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 0.9375rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          text-align: left;
          margin-bottom: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .submit-btn {
          width: 100%;
          margin-top: 0.5rem;
          height: 3.25rem;
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 1.5rem 0;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
        }

        .divider::before, .divider::after {
          content: "";
          flex: 1;
          border-bottom: 1px solid var(--border-subtle);
        }

        .divider span {
          padding: 0 1rem;
        }

        .github-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          height: 3.25rem;
          font-weight: 600;
        }

        .icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .mode-toggle {
          margin-top: 1.5rem;
        }

        .btn-link {
          background: none;
          border: none;
          color: var(--accent-primary);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .btn-link:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        .login-footer {
          color: var(--text-muted);
          font-size: 0.75rem;
          margin-top: 1rem;
        }

        .error-message {
          margin-top: 1.5rem;
          padding: 0.75rem;
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid var(--accent-rose);
          border-radius: 8px;
          color: #fda4af;
          font-size: 0.8125rem;
        }

        .success-message {
          margin-top: 1.5rem;
          padding: 0.75rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid var(--accent-emerald);
          border-radius: 8px;
          color: #6ee7b7;
          font-size: 0.8125rem;
        }

        /* Background Blobs */
        .login-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          z-index: 1;
        }

        .blob {
          position: absolute;
          filter: blur(80px);
          opacity: 0.15;
          border-radius: 50%;
        }

        .blob-1 {
          width: 400px;
          height: 400px;
          background: var(--accent-primary);
          top: -100px;
          left: -100px;
          animation: float 20s infinite alternate;
        }

        .blob-2 {
          width: 500px;
          height: 500px;
          background: var(--accent-secondary);
          bottom: -150px;
          right: -150px;
          animation: float 25s infinite alternate-reverse;
        }

        .blob-3 {
          width: 300px;
          height: 300px;
          background: #3b82f6;
          top: 40%;
          left: 50%;
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
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
