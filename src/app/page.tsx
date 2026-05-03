"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const [ventureCount, setVentureCount] = useState(0);
  const [blueprintCount, setBlueprintCount] = useState(0);
  const [modelCount, setModelCount] = useState(0);
  const [scannerActive, setScannerActive] = useState(false);

  // Animated counters
  useEffect(() => {
    const animate = (setter: (n: number) => void, target: number, duration: number) => {
      let start = 0;
      const step = target / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(start));
        }
      }, 16);
      return timer;
    };

    const t1 = animate(setVentureCount, 429, 2000);
    const t2 = animate(setBlueprintCount, 8421, 2500);
    const t3 = animate(setModelCount, 7, 1000);

    const scannerTimer = setInterval(() => setScannerActive(prev => !prev), 3000);

    return () => {
      clearInterval(t1);
      clearInterval(t2);
      clearInterval(t3);
      clearInterval(scannerTimer);
    };
  }, []);

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="hero section-glow">
        <div className="container">
          <div className="hero-badge hairline-border">
            <span className="badge-dot" style={{ background: 'var(--accent-primary)' }}></span>
            Now Live: Hatch Engine 2.0
          </div>
          <h1 className="text-gradient">
            The Autonomous SaaS Builder for Sovereign Developers.
          </h1>
          <p className="hero-subtitle">
            Build, deploy, and manage production applications on your own Git infrastructure.
            Initra orchestrates your entire stack while ensuring you own every single line of code.
          </p>

          <div className="hero-actions">
            <Link href="/wizard" className="btn btn-primary">
              🚀 Hatch a New Venture
            </Link>
            <Link href="/community" className="btn btn-secondary">
              🌍 Browse Blueprints
            </Link>
          </div>

          {/* Terminal Teaser */}
          <div className="terminal-teaser">
            <div className="terminal-header">
              <div className="terminal-dot red"></div>
              <div className="terminal-dot yellow"></div>
              <div className="terminal-dot green"></div>
            </div>
            <div className="terminal-line">
              <span className="terminal-prompt">$</span>
              <span className="terminal-output">initra hatch --blueprint "SaaS Analytics Dashboard"</span>
            </div>
            <div className="terminal-line">
              <span className="terminal-output" style={{ color: 'var(--accent-secondary)' }}>[SYSTEM]</span>
              <span className="terminal-output">Allocating GitHub Repository... Done.</span>
            </div>
            <div className="terminal-line">
              <span className="terminal-output" style={{ color: 'var(--accent-primary)' }}>[SYSTEM]</span>
              <span className="terminal-output">Provisioning Vercel Cloud & Supabase DB...</span>
            </div>
            <div className="terminal-line">
              <span className="terminal-output" style={{ color: 'var(--accent-emerald)' }}>[SYSTEM]</span>
              <span className="terminal-output">Injecting Autonomous Agent Rules (Phase 23)...</span>
            </div>
            <div className="terminal-line">
              <span className="terminal-prompt">$</span>
              <span className="terminal-output" style={{ color: 'var(--accent-amber)', fontWeight: 'bold' }}>READY: https://analytics-dash.initra.ai</span>
            </div>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number" style={{ background: 'var(--gradient-sovereign)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{ventureCount.toLocaleString()}</div>
              <div className="stat-label">SaaS Ventures Hatched</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{blueprintCount.toLocaleString()}</div>
              <div className="stat-label">Daily Blueprints Generated</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{modelCount}</div>
              <div className="stat-label">Premium Models Supported</div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="features-section" style={{ background: 'var(--surface-1)' }}>
        <div className="container">
          <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '4rem' }}>
            A Developer-First Alternative to Vendor Lock-in.
          </h2>
          <div className="features-grid">
            <div className="card feature-card">
              <div className="feature-icon" style={{ borderColor: 'var(--accent-primary)' }}>🐙</div>
              <h3>100% Repository Ownership</h3>
              <p>
                Unlike closed-door app builders, Initra pushes every change directly to your own GitHub infrastructure.
                Your code, your data, your sovereign environment.
              </p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon" style={{ borderColor: 'var(--accent-secondary)' }}>🔍</div>
              <h3>Deep Heuristic Analysis</h3>
              <p>
                Scan existing repositories to automatically identify UI landmarks, logic blocks, and
                architecture patterns for instant AI-driven modification.
              </p>
              <div className="scanner-container hairline-border">
                <div className="scanner-line"></div>
                <div className={`scan-landmark ${scannerActive ? 'active' : ''}`} style={{ top: '20%', left: '10%', width: '80%', height: '30px' }}></div>
                <div className={`scan-landmark ${!scannerActive ? 'active' : ''}`} style={{ top: '60%', left: '20%', width: '40%', height: '50px' }}></div>
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  HEURISTIC_SCAN: TRUE
                </div>
              </div>
            </div>
            <div className="card feature-card">
              <div className="feature-icon" style={{ borderColor: 'var(--accent-blue)' }}>🧠</div>
              <h3>Multi-Agent Orchestration</h3>
              <p>
                Synthesis of complex business objectives into high-fidelity IDE rules.
                Configure your agents with specialized "Brain Overlays" for design, architecture, or security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Marketplace Section */}
      <section className="features-section" style={{ padding: '8rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
            <div className="card idea-card">
              <div className="hero-badge hairline-border" style={{ marginBottom: '1.5rem' }}>
                <span className="badge-dot" style={{ background: 'var(--accent-primary)' }}></span>
                Claude Opus 4.6 Blueprints
              </div>
              <h2 className="text-gradient" style={{ textAlign: 'left', lineHeight: 1.1 }}>
                The Autonomous Idea Fabric.
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.7 }}>
                Every 24 hours, our Idea Fabric autonomously generates high-fidelity venture blueprints.
                Vote on the next big open-source project, hatch it with one click, and contribute to a global ecosystem
                of autonomous ventures.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link href="/community" className="btn btn-primary">Visit the Marketplace →</Link>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <div className="glass-panel-themed">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="stat-number" style={{ fontSize: '1rem' }}>💡 Top Idea</div>
                  </div>
                  <span className="badge-outline" style={{ fontSize: '0.7rem', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>VOTING OPEN</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Peer-to-Peer AI Energy Grid</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>An autonomous billing and distribution network for localized renewable energy clusters.</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', WebkitMaskImage: 'linear-gradient(to right, black 50%, transparent 100%)' }}>
                    {[1, 2, 3, 4].map(i => <div key={i} style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--surface-3)', border: '2px solid var(--bg-primary)', marginLeft: i === 1 ? 0 : '-8px' }}></div>)}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 700 }}>2,841 UPVOTES</span>
                </div>
              </div>
              <div style={{ position: 'absolute', top: '10%', left: '10%', right: '-5%', bottom: '-5%', background: 'var(--accent-primary)', opacity: 0.1, filter: 'blur(100px)', borderRadius: '50%', zIndex: 1 }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="features-section" style={{ background: 'var(--bg-glass)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'var(--text-3xl)', marginBottom: '1.5rem' }}>Scale the Studio.</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
              Initra is a community-owned venture factory. Your donations help us maintain the high-performance
              inference clusters and cloud provisioning credits needed to keep hatching open-source ventures for everyone.
            </p>
            <div className="donation-card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'left', padding: '2rem', background: 'var(--gradient-card)', border: '1px solid var(--border-accent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 600 }}>Next Milestone: A100 Inference Buffer</span>
                <span style={{ color: 'var(--accent-amber)', fontWeight: 800 }}>82%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '82%', height: '100%', background: 'var(--accent-amber)', boxShadow: '0 0 10px var(--accent-amber)' }}></div>
              </div>
              <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '2rem', background: 'var(--bg-primary)' }}>❤️ Fuel the Studio</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '3rem 0', textAlign: 'center' }}>
        <div className="container">
          <div className="navbar-brand" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
            <span>INITRA</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            The Autonomous Venture Studio for Sovereign Developers.<br />
            Built with ❤️ · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </>
  );
}
