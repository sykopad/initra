"use client";

import { useState, useCallback, useEffect, useTransition } from "react";
import Navbar from "@/components/Navbar";
import { 
  voteProject, 
  suggestProject, 
  getUserVotes,
  getCommunityProjects,
  hatchVentureAction,
  forkVentureAction,
  generateVentureBlueprintAction
} from "@/lib/actions/community";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [sharedConfigs, setSharedConfigs] = useState<SharedProject[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [hatchingId, setHatchingId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateVentureBlueprintAction();
      await loadData();
    } catch (err: any) {
      alert("Architect failed: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFork = async (projectId: string) => {
    try {
      const { sessionId } = await forkVentureAction(projectId);
      router.push(`/wizard?sessionId=${sessionId}`);
    } catch (err: any) {
      alert("Fork failed: " + err.message);
    }
  };

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
            <h1 className="gradient-text" style={{ fontSize: '3.5rem', marginBottom: '1rem', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #fff 0%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Discovery Hub
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto' }}>
              Hatch autonomous ventures or discover community-led blueprints architected by Claude 4.6.
            </p>
          </div>

          {/* AI VENTURES SECTION */}
          <div className="section-title" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>⚡ AI Architected</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>High-fidelity venture blueprints. Costs 50 Credits per generation.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <button 
                className={`btn ${isGenerating ? 'btn-ghost' : 'btn-primary'}`}
                onClick={handleGenerate}
                disabled={isGenerating || loading}
              >
                {isGenerating ? "🧠 Architecting..." : "✨ Draft New Idea (50 CR)"}
              </button>
              {loading && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Checking session...</span>}
            </div>
          </div>

          <div className="community-grid" style={{ marginBottom: '6rem' }}>
            {loading ? (
               [1, 2, 3].map(i => <div key={i} className="card skeleton-card" style={{ height: '400px' }}></div>)
            ) : aiGenerated.map((project) => (
              <div key={project.id} className={`discovery-card ${project.is_hatched ? 'is-hatched' : ''}`}>
                <div className="category-row">
                  <span className="badge-outline">{project.category}</span>
                  <span className="badge-soft">{project.blueprint_config?.templateSlug}</span>
                </div>
                
                <h3 className="venture-title">{project.title}</h3>
                <p className="venture-description">{project.description}</p>
                
                {project.impact_statement && (
                  <div className="impact-box">
                    <strong>Impact:</strong> {project.impact_statement}
                  </div>
                )}

                <div className="architect-reasoning">
                  <span className="reasoning-label">Architect Reasoning</span>
                  <p>{project.blueprint_config?.architectureReasoning || "Optimized for sovereign infrastructure and low-latency agent orchestration."}</p>
                </div>

                <div className="social-row">
                  <div className="vote-pill">
                    <button onClick={() => handleVoteAction(project.id, 1)} className={userVotes[project.id] === 1 ? 'active' : ''}>▲</button>
                    <span>{project.vote_score}</span>
                    <button onClick={() => handleVoteAction(project.id, -1)} className={userVotes[project.id] === -1 ? 'active' : ''}>▼</button>
                  </div>
                  
                  <div className="action-group">
                    {project.is_hatched ? (
                      <a href={project.live_url} target="_blank" className="btn btn-sm btn-outline">Visit Live</a>
                    ) : (
                      <button 
                        className="btn btn-sm btn-ghost" 
                        onClick={() => handleFork(project.id)}
                      >
                        Fork & Hatch
                      </button>
                    )}
                    
                    {!project.is_hatched && (
                      <button 
                        className="btn btn-sm btn-primary" 
                        onClick={() => handleHatch(project.id)}
                        disabled={hatchingId === project.id}
                      >
                        {hatchingId === project.id ? "🍼..." : "Hatch"}
                      </button>
                    )}
                  </div>
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
        .community-container { padding: 100px 0; min-height: 100vh; }
        .community-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 2.5rem; }
        
        .discovery-card {
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: 16px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .discovery-card:hover {
          border-color: var(--primary);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        
        .discovery-card.is-hatched {
          border-color: var(--success);
        }
        
        .category-row { display: flex; gap: 0.75rem; marginBottom: 1.5rem; }
        .badge-outline { font-size: 0.7rem; padding: 2px 8px; border: 1px solid var(--border-medium); border-radius: 4px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .badge-soft { font-size: 0.7rem; padding: 2px 8px; background: rgba(124,58,237,0.1); color: var(--primary-light); border-radius: 4px; }
        
        .venture-title { font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; color: var(--text-primary); }
        .venture-description { font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem; }
        
        .impact-box {
          background: rgba(255,255,255,0.03);
          border-left: 3px solid var(--primary);
          padding: 1rem;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        
        .architect-reasoning {
          background: var(--bg-tertiary);
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 2rem;
        }
        
        .reasoning-label { font-size: 0.65rem; font-weight: 900; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 0.5rem; letter-spacing: 0.1em; }
        .architect-reasoning p { font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; margin: 0; }
        
        .social-row {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-subtle);
        }
        
        .vote-pill {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-glass);
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px solid var(--border-subtle);
        }
        
        .vote-pill button { background: none; border: none; color: var(--text-muted); cursor: pointer; transition: 0.2s; }
        .vote-pill button.active { color: var(--primary); }
        .vote-pill span { font-weight: 700; font-size: 0.9rem; }
        
        .action-group { display: flex; gap: 0.75rem; }
        
        .skeleton-card { background: rgba(255,255,255,0.02); borderRadius: 16px; border: 1px dashed rgba(255,255,255,0.1); }
      `}</style>
    </>
  );
}
