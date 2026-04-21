"use client";

import { useState, useCallback, useEffect, useTransition } from "react";
import Navbar from "@/components/Navbar";
import { 
  voteProject, 
  suggestProject, 
  getUserVotes,
  getCommunityProjects,
  hatchVentureAction
} from "@/lib/actions/community";
import Link from "next/link";

interface SharedProject {
  id: string;
  slug: string;
  projectName: string;
  templateSlug: string;
  created_at: string;
  config: any;
  profiles: {
    display_name: string;
    avatar_url: string;
  };
}

interface CommunityProject {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  impact_statement: string;
  status: "proposed" | "in_progress" | "needs_agents" | "completed";
  vote_score: number;
  agent_count: number;
  suggested_by: string | null;
  created_at: string;
  venture_type: 'ai-generated' | 'user-suggested';
  is_hatched: boolean;
  live_url?: string;
  github_url?: string;
  blueprint_config?: any;
}

const STATUS_LABELS: Record<string, string> = {
  proposed: "Proposed",
  in_progress: "Building",
  needs_agents: "Needs Agents",
  completed: "Live & Scaling",
};

export default function CommunityPage() {
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [sharedConfigs, setSharedConfigs] = useState<SharedProject[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [hatchingId, setHatchingId] = useState<string | null>(null);

  // New project form state
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [fetchedProjects, fetchedVotes] = await Promise.all([
        getCommunityProjects("All"),
        getUserVotes()
      ]);
      setProjects(fetchedProjects as any);
      setUserVotes(fetchedVotes);
    } catch (err) {
      console.error("Failed to load community data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleVoteAction = async (projectId: string, direction: 1 | -1) => {
    const currentVote = userVotes[projectId] || 0;
    const newValue = currentVote === direction ? 0 : direction;
    
    setUserVotes(prev => ({ ...prev, [projectId]: newValue }));
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const delta = newValue - currentVote;
        return { ...p, vote_score: p.vote_score + delta };
      }
      return p;
    }));

    try {
      await voteProject(projectId, newValue);
    } catch (err: any) {
      alert(err.message || "Failed to cast vote.");
      loadData();
    }
  };

  const handleHatch = async (projectId: string) => {
    if (!confirm("Are you sure you want to HATCH this venture? This will create a GitHub repo and Vercel site autonomously.")) return;
    
    setHatchingId(projectId);
    try {
      const result = await hatchVentureAction(projectId);
      alert(`Venture Hatched Successfully!\nRepo: ${result.repoUrl}\nSite: ${result.liveUrl}`);
      loadData();
    } catch (err: any) {
      alert(err.message || "Hatching failed. Check server logs.");
    } finally {
      setHatchingId(null);
    }
  };

  const aiGenerated = projects.filter(p => p.venture_type === 'ai-generated');
  const userSuggested = projects.filter(p => p.venture_type === 'user-suggested');

  return (
    <>
      <Navbar />

      <div className="community-container">
        <div className="container" style={{ maxWidth: '1200px' }}>
          {/* Header */}
          <div className="community-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #fff 0%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🚀 Venture Studio
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
              AI-architected blueprints and community-voted startups, hatched autonomously.
            </p>
          </div>

          {/* AI VENTURES SECTION */}
          <div className="section-title" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              🧠 AI-Generated Blueprints
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Daily high-impact project ideas from the Initra Architect.</p>
          </div>

          <div className="community-grid" style={{ marginBottom: '5rem' }}>
            {loading ? (
               [1, 2, 3].map(i => <div key={i} className="card skeleton-card" style={{ height: '300px' }}></div>)
            ) : aiGenerated.map((project) => (
              <div key={project.id} className={`card community-card ${project.is_hatched ? 'hatched' : ''}`} style={{ position: 'relative' }}>
                {project.is_hatched && <div className="hatched-ribbon">LIVE</div>}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                       <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(124,58,237,0.2)', border: '1px solid var(--primary)', borderRadius: '4px', color: 'var(--primary-light)' }}>
                         {project.category}
                       </span>
                       <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--bg-glass)', borderRadius: '4px' }}>
                         {project.blueprint_config?.templateSlug}
                       </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{project.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                      {project.description}
                    </p>
                  </div>
                  
                  <div className="vote-controls">
                    <button className={`vote-btn ${userVotes[project.id] === 1 ? 'active' : ''}`} onClick={() => handleVoteAction(project.id, 1)}>▲</button>
                    <span className="vote-score">{project.vote_score}</span>
                    <button className={`vote-btn ${userVotes[project.id] === -1 ? 'active' : ''}`} onClick={() => handleVoteAction(project.id, -1)}>▼</button>
                  </div>
                </div>

                <div className="card-footer" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                   {project.is_hatched ? (
                     <>
                       <a href={project.live_url} target="_blank" className="btn btn-sm btn-primary">🌐 Visit Site</a>
                       <a href={project.github_url} target="_blank" className="btn btn-sm btn-ghost">📂 Repo</a>
                     </>
                   ) : (
                     <button 
                       className="btn btn-sm btn-secondary" 
                       onClick={() => handleHatch(project.id)}
                       disabled={hatchingId === project.id}
                     >
                       {hatchingId === project.id ? "🍼 Hatching..." : "🐣 Hatch Venture"}
                     </button>
                   )}
                </div>
              </div>
            ))}
          </div>

          {/* USER SUGGESTIONS SECTION */}
          <div className="section-title" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                💡 Community Proposals
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Citizen-led project ideas for the future of Initra.</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowSuggestModal(true)}>+ Propose Idea</button>
          </div>

          <div className="community-grid">
            {userSuggested.map(project => (
              <div key={project.id} className="card community-card">
                 <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{project.title}</h3>
                 <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{project.description}</p>
                 <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span className="status-badge proposed">{STATUS_LABELS[project.status]}</span>
                    <div className="vote-controls small">
                      <span className="vote-score">{project.vote_score} votes</span>
                    </div>
                 </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      <style jsx>{`
        .community-container { padding: 80px 0; min-height: 100vh; }
        .community-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 2rem; }
        .community-card { 
          padding: 1.5rem; 
          display: flex; 
          flex-direction: column; 
          border: 1px solid var(--border-medium);
          background: var(--bg-card);
        }
        .community-card:hover { border-color: var(--accent-violet); transform: translateY(-2px); }
        .community-card.hatched { border-color: var(--accent-emerald); }
        
        .vote-controls { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px; background: var(--bg-tertiary); border-radius: 8px; border: 1px solid var(--border-subtle); }
        .vote-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem; transition: all 0.2s; }
        .vote-btn:hover { color: var(--accent-violet-light); }
        .vote-btn.active { color: var(--accent-violet); transform: scale(1.1); }
        .vote-score { font-weight: 700; font-size: 1rem; color: var(--text-primary); }

        .hatched-ribbon { position: absolute; top: 12px; right: 12px; background: var(--success); color: #000; font-size: 0.6rem; font-weight: 900; padding: 2px 8px; borderRadius: 4px; letterSpacing: 0.05em; }

        .skeleton-card { background: rgba(255,255,255,0.02); borderRadius: 12px; border: 1px dashed rgba(255,255,255,0.1); }
      `}</style>
    </>
  );
}
