"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function SharedConfigPage() {
  const params = useParams();
  const slug = params.slug as string;

  // TODO: Fetch shared config from Supabase using slug
  // For now, show a placeholder that explains the feature

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">
            <span className="logo-icon">⚡</span>
            <span className="brand-text">Initra</span>
          </Link>
          <ul className="navbar-links">
            <li><Link href="/wizard">Wizard</Link></li>
            <li><Link href="/community">Community</Link></li>
            <li>
              <Link href="/wizard" className="btn btn-primary btn-sm">
                Start Building →
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className="wizard-container">
        <div className="container" style={{ paddingTop: "4rem" }}>
          <div style={{
            maxWidth: "600px",
            margin: "0 auto",
            textAlign: "center",
            padding: "4rem 2rem",
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>🔗</div>
            <h1 style={{
              fontSize: "var(--text-3xl)",
              fontWeight: 800,
              marginBottom: "1rem",
            }}>
              Shared Configuration
            </h1>
            <p style={{
              color: "var(--text-secondary)",
              fontSize: "var(--text-base)",
              lineHeight: 1.7,
              marginBottom: "2rem",
            }}>
              Configuration <code style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-sm)",
                background: "var(--bg-tertiary)",
                padding: "2px 8px",
                borderRadius: "var(--radius-sm)",
                color: "var(--accent-cyan-light)",
              }}>{slug}</code> will be available when connected to Supabase.
            </p>
            <p style={{
              color: "var(--text-muted)",
              fontSize: "var(--text-sm)",
              marginBottom: "2rem",
            }}>
              Share your agent configuration files with teammates or the community.
              Each shared config gets a unique permalink that anyone can view and download.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <Link href="/wizard" className="btn btn-primary">
                🧙‍♂️ Create Your Own
              </Link>
              <Link href="/community" className="btn btn-secondary">
                🌍 Community Hub
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
