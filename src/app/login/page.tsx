"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGitHubLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to initiate GitHub login");
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
            <h1>Welcome to Initra</h1>
            <p>Connect your account to save sessions, vote on projects, and contribute agent configs.</p>
          </div>

          <div className="login-actions">
            <button 
              className={`btn btn-primary btn-lg github-btn ${loading ? "loading" : ""}`}
              onClick={handleGitHubLogin}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="icon">
                    <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                  Continue with GitHub
                </>
              )}
            </button>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
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
          background: #0a0a0a;
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
          max-width: 440px;
          padding: 3rem;
          z-index: 10;
          text-align: center;
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .login-header {
          margin-bottom: 2.5rem;
        }

        .login-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          font-size: 2.5rem;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border-radius: 16px;
          margin-bottom: 1.5rem;
          box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.4);
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

        .login-actions {
          margin-bottom: 2rem;
        }

        .github-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background: #24292e;
          border-color: #24292e;
          height: 3.5rem;
          font-weight: 600;
        }

        .github-btn:hover {
          background: #2f363d;
          border-color: #2f363d;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -10px rgba(0,0,0,0.5);
        }

        .icon {
          width: 20px;
          height: 20px;
        }

        .error-message {
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--danger);
          border-radius: 8px;
          color: var(--danger-light);
          font-size: 0.875rem;
        }

        .login-footer {
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .login-footer a {
          color: var(--text-secondary);
          text-decoration: underline;
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
          opacity: 0.2;
          border-radius: 50%;
        }

        .blob-1 {
          width: 400px;
          height: 400px;
          background: var(--primary);
          top: -100px;
          left: -100px;
          animation: float 20s infinite alternate;
        }

        .blob-2 {
          width: 500px;
          height: 500px;
          background: var(--secondary);
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
