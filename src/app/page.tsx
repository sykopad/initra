"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const [projectCount, setProjectCount] = useState(0);
  const [communityCount, setCommunityCount] = useState(0);
  const [ideCount, setIdeCount] = useState(0);

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

    const t1 = animate(setProjectCount, 2847, 2000);
    const t2 = animate(setCommunityCount, 156, 1500);
    const t3 = animate(setIdeCount, 6, 800);

    return () => {
      clearInterval(t1);
      clearInterval(t2);
      clearInterval(t3);
    };
  }, []);

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Open Source · Community Driven
          </div>
          <h1>
            Initiate infrastructure.<br />
            <span className="gradient-text">With the right AI agent.</span>
          </h1>
          <p className="hero-subtitle">
            Generate perfect AGENTS.md, CLAUDE.md, and Cursor rules for your next project
            in 60 seconds. Choose your stack, pick your IDE, and get production-ready
            agent configurations instantly.
          </p>
          <div className="hero-actions">
            <Link href="/wizard" className="btn btn-primary btn-lg">
              🧙‍♂️ Start the Wizard
            </Link>
            <Link href="/community" className="btn btn-secondary btn-lg">
              🌍 Explore Community
            </Link>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">{projectCount.toLocaleString()}</div>
              <div className="stat-label">Projects Bootstrapped</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{communityCount}</div>
              <div className="stat-label">Community Projects</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{ideCount}</div>
              <div className="stat-label">IDEs Supported</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>
            How it <span className="gradient-text" style={{
              background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>works</span>
          </h2>
          <div className="features-grid">
            <div className="card feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Choose Your Stack</h3>
              <p>
                Pick from 8+ project categories — Next.js, React Native, FastAPI,
                Flutter, and more. Configure every detail of your tech stack with
                smart defaults.
              </p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Generate Agent Files</h3>
              <p>
                Our prompt engine creates perfectly structured CLAUDE.md, Cursor rules,
                Windsurf configs, GEMINI.md, and Copilot instructions — tailored to your
                exact setup.
              </p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Join the Community</h3>
              <p>
                Suggest open-source projects that benefit humanity. Vote on ideas,
                contribute agent configurations, and collaborate with builders worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Venture Studio Section */}
      <section className="features-section" style={{ background: 'rgba(124,58,237,0.02)', padding: '6rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <div className="hero-badge" style={{ marginBottom: '1.5rem' }}>
                <span className="badge-dot" style={{ background: 'var(--success)' }}></span>
                New: Autonomous Hatching
              </div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                The World's First <span className="gradient-text" style={{ 
                  background: 'linear-gradient(135deg, #fff 0%, #7c3aed 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>Autonomous</span> Venture Studio.
              </h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
                Initra doesn't just generate rules anymore. Our <strong>Hatch Engine</strong> creates repositories, provisions hosting, 
                and assigns AI agents to start building your projects autonomously. From idea to live site in 120 seconds.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link href="/community" className="btn btn-primary">Visit the Studio →</Link>
              </div>
            </div>
            <div className="card" style={{ padding: '2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124,58,237,0.2)' }}>
               <h3 style={{ marginBottom: '1rem', color: 'var(--primary-light)' }}>Why We Need Your Support</h3>
               <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                 Initra runs on a Vercel Hobby account. Each autonomous venture "hatched" by the community requires its own 
                 isolated repository and hosting environment. To keep the Venture Studio free and truly autonomous at scale, 
                 we rely on community donations.
               </p>
               <div className="donation-card" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Next Reward: Dedicated Pro Cluster</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary-light)' }}>64% funded</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '64%', height: '100%', background: 'var(--primary)' }}></div>
                  </div>
               </div>
               <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '1.5rem' }}>❤️ Support the Studio</button>
            </div>
          </div>
        </div>
      </section>

      {/* IDE Support Section */}
      <section className="features-section" style={{ paddingBottom: '6rem' }}>
        <div className="container">
          <h2>
            Every IDE. <span className="gradient-text" style={{
              background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>One wizard.</span>
          </h2>
          <div className="ide-grid" style={{ maxWidth: '900px', margin: '0 auto' }}>
            {[
              { icon: '🟣', name: 'Claude Code', file: 'CLAUDE.md' },
              { icon: '⚡', name: 'Cursor', file: '.cursor/rules/*.mdc' },
              { icon: '🌊', name: 'Windsurf', file: '.windsurf/rules/*.md' },
              { icon: '💎', name: 'Gemini', file: 'GEMINI.md' },
              { icon: '🐙', name: 'GitHub Copilot', file: '.github/copilot-instructions.md' },
              { icon: '🌐', name: 'Universal', file: 'AGENTS.md' },
            ].map((ide) => (
              <div key={ide.name} className="card" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.25rem 1.5rem',
                cursor: 'default',
              }}>
                <span style={{ fontSize: '2rem' }}>{ide.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{ide.name}</div>
                  <code style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-accent)',
                    fontFamily: 'var(--font-mono)',
                  }}>{ide.file}</code>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/wizard" className="btn btn-primary btn-lg">
              Generate Your Agent Files →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '2rem 0',
        textAlign: 'center',
      }}>
        <div className="container">
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            Built with ❤️ for the developer community · Initra © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </>
  );
}
