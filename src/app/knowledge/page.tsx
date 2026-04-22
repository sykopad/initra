"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useState } from "react";

const IDE_GUIDES = [
  {
    slug: "antigravity",
    name: "Google Antigravity",
    icon: "🚀",
    content: (
      <>
        <h3>Advanced Agent Orchestration</h3>
        <p>Google Antigravity is the next evolution in agentic coding, offering a hierarchical structure for rules, workflows, and skills.</p>
        
        <div className="guide-section">
          <h4>📁 Folder Structure</h4>
          <pre className="code-block">
{`.agents/
├── rules/          # Workspace-specific constraints
├── workflows/      # Repeatable /slash commands
└── skills/         # Specialized knowledge packages`}
          </pre>
        </div>

        <div className="guide-section">
          <h4>📜 Rules</h4>
          <p>Rules allow you to guide the agent to follow behaviors particular to your own use cases and style.</p>
          <ul>
            <li><strong>Global Rules</strong>: ~/.gemini/GEMINI.md</li>
            <li><strong>Workspace Rules</strong>: .agents/rules/</li>
            <li><strong>Activation</strong>: Can be Manual, Always On, Model Decision, or Glob patterns.</li>
          </ul>
        </div>

        <div className="guide-section">
          <h4>🔄 Workflows</h4>
          <p>Define a series of steps to guide the Agent through repetitive tasks. Save as markdown and invoke with <code>/workflow-name</code>.</p>
        </div>

        <div className="guide-section">
          <h4>🛠️ Skills</h4>
          <p>Reusable packages of knowledge that extend what the agent can do. Each skill contains a <code>SKILL.md</code> with YAML frontmatter.</p>
        </div>
      </>
    )
  },
  {
    slug: "cursor",
    name: "Cursor",
    icon: "⚡",
    content: (
      <>
        <h3>Cursor Rules (.mdc)</h3>
        <p>Cursor uses <code>.mdc</code> files with YAML frontmatter to define rules that can be automatically applied based on file path or model decision.</p>
        <div className="guide-section">
          <h4>Setup</h4>
          <ol>
            <li>Place generated <code>.mdc</code> files in <code>.cursor/rules/</code>.</li>
            <li>Cursor will detect them and apply the context during your chat or composer sessions.</li>
          </ol>
        </div>
      </>
    )
  },
  {
    slug: "claude",
    name: "Claude Code",
    icon: "🟣",
    content: (
      <>
        <h3>CLAUDE.md</h3>
        <p>Claude Code reads <code>CLAUDE.md</code> at the start of every session. It provides the essential tech stack context and commands.</p>
        <div className="guide-section">
          <h4>Usage</h4>
          <p>Simply keep <code>CLAUDE.md</code> in your project root. Claude will refer to it to understand how to build, test, and run your project without being asked.</p>
        </div>
      </>
    )
  }
];

export default function KnowledgeCenter() {
  const [activeIde, setActiveIde] = useState("antigravity");

  return (
    <>
      <Navbar />
      
      <div className="knowledge-page" style={{ paddingTop: "8rem", paddingBottom: "6rem", background: "var(--gradient-hero)", minHeight: "100vh" }}>
        <div className="container">
          {/* Hero Section */}
          <div className="knowledge-hero" style={{ textAlign: "center", marginBottom: "5rem" }}>
            <span className="hero-badge">
              <span className="badge-dot"></span>
              The Future of Creation
            </span>
            <h1 style={{ fontSize: "3.5rem", marginBottom: "1.5rem" }}>
              <span className="gradient-text">Knowledge Center</span>
            </h1>
            <p className="hero-subtitle" style={{ margin: "0 auto", maxWidth: "800px" }}>
              Welcome to the new world of agentic coding. Whether you're a seasoned architect or a former WordPress designer, 
              Initra and modern AI agents empower you to build world-class infrastructure in minutes.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "3rem" }}>
            {/* Sidebar / Navigation */}
            <aside className="knowledge-sidebar">
              <div className="glass-panel" style={{ padding: "1.5rem", position: "sticky", top: "100px" }}>
                <h4 style={{ marginBottom: "1.5rem", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
                  Setup Guides
                </h4>
                <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {IDE_GUIDES.map(ide => (
                    <button
                      key={ide.slug}
                      onClick={() => setActiveIde(ide.slug)}
                      className={`btn ${activeIde === ide.slug ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ justifyContent: "flex-start", width: "100%" }}
                    >
                      <span style={{ marginRight: "0.75rem" }}>{ide.icon}</span>
                      {ide.name}
                    </button>
                  ))}
                </nav>

                <hr style={{ margin: "2rem 0", borderColor: "var(--border-subtle)" }} />

                <h4 style={{ marginBottom: "1rem", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
                  Education
                </h4>
                <Link href="#layman-guide" className="btn btn-ghost" style={{ justifyContent: "flex-start", width: "100%" }}>
                  💡 Frameworks Explained
                </Link>
              </div>
            </aside>

            {/* Main Content */}
            <main className="knowledge-main">
              {/* IDE Guide Section */}
              <section className="glass-panel" style={{ padding: "3rem", marginBottom: "4rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
                  <div style={{ fontSize: "3rem", background: "rgba(255,255,255,0.05)", width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "16px", border: "1px solid var(--border-accent)" }}>
                    {IDE_GUIDES.find(i => i.slug === activeIde)?.icon}
                  </div>
                  <div>
                    <h2 style={{ fontSize: "2rem" }}>{IDE_GUIDES.find(i => i.slug === activeIde)?.name} Setup</h2>
                    <p style={{ color: "var(--text-secondary)" }}>How to use Initra files with your preferred agent.</p>
                  </div>
                </div>
                
                <div className="guide-content">
                  {IDE_GUIDES.find(i => i.slug === activeIde)?.content}
                </div>
              </section>

              {/* Layman Post */}
              <section id="layman-guide" className="glass-panel" style={{ padding: "4rem" }}>
                <div style={{ maxWidth: "700px" }}>
                  <span style={{ color: "var(--accent-primary)", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", marginBottom: "1rem", display: "block" }}>
                    From Designer to Creator
                  </span>
                  <h2 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>A New World of Creation</h2>
                  
                  <div style={{ fontSize: "1.1rem", color: "var(--text-secondary)", lineHeight: "1.8" }}>
                    <p style={{ marginBottom: "1.5rem" }}>
                      If you&apos;re coming from a background in WordPress, Wix, or Shopify, terms like &quot;Framework,&quot; &quot;Repository,&quot; and &quot;Next.js&quot; might sound intimidating. 
                      I know, because I was exactly where you are.
                    </p>
                    
                    <p style={{ marginBottom: "1.5rem" }}>
                      I used to be a WordPress website designer. I relied on heavy plugins, paid subscriptions, and limited templates. 
                      I knew very little about &quot;real&quot; coding. But then, the world changed.
                    </p>

                    <blockquote style={{ borderLeft: "4px solid var(--accent-primary)", paddingLeft: "2rem", margin: "2.5rem 0", fontStyle: "italic", color: "var(--text-primary)", fontSize: "1.25rem" }}>
                      &quot;I can now spin up Next.js websites with ease&mdash;even easier than WordPress, and they look better, load faster, and I have 100% control.&quot;
                    </blockquote>

                    <h3 style={{ color: "var(--text-primary)", marginTop: "3rem", marginBottom: "1rem" }}>What is a Framework?</h3>
                    <p style={{ marginBottom: "1.5rem" }}>
                      Think of a <strong>Framework</strong> (like Next.js or Nuxt) as a high-performance engine and chassis for your car. 
                      Unlike WordPress, which is like a pre-built trailer you can only customize so much, a framework gives you the professional tools to build exactly what you want.
                    </p>

                    <p style={{ marginBottom: "1.5rem" }}>
                      With modern AI agents like <strong>Google Antigravity</strong> or <strong>Cursor</strong>, you don&apos;t need to write the engine yourself. 
                      You just need to know how to talk to the mechanics. Initra generates the blueprints (the rules) that tell these AI mechanics exactly how to build your dream.
                    </p>

                    <p>
                      No more plugin purchases. No more slow loading times. No more vendor lock-in. 
                      Next.js sites are <strong>faster</strong>, <strong>nicer looking</strong>, and give you <strong>more control</strong> than WordPress ever could.
                      Welcome to the era of the Autonomous Creator.
                    </p>
                  </div>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .guide-content h3 { margin-top: 2rem; margin-bottom: 1rem; }
        .guide-content h4 { margin-top: 1.5rem; margin-bottom: 0.75rem; color: var(--accent-primary); }
        .guide-content p { color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.6; }
        .guide-content ul, .guide-content ol { margin-left: 1.5rem; margin-bottom: 1.5rem; color: var(--text-secondary); }
        .guide-content li { margin-bottom: 0.5rem; }
        
        .code-block {
          background: rgba(0,0,0,0.3);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--border-subtle);
          font-family: var(--font-mono);
          font-size: 0.9rem;
          color: #a5b4fc;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        .guide-section {
          margin-bottom: 2.5rem;
        }
      `}</style>
    </>
  );
}
