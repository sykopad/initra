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
  fork_count: number;
  trending_score: number;
  blueprint_config?: any;
  suggestion_type?: 'initra' | 'project';
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
  const [activeFilter, setActiveFilter] = useState("Trending");

  // New project form state
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [suggestionType, setSuggestionType] = useState<'initra' | 'project'>('project');
  const [newCategory, setNewCategory] = useState("");
  const [newImpact, setNewImpact] = useState("");
  const [newTags, setNewTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedProjects, fetchedVotes] = await Promise.all([
        getCommunityProjects(activeFilter),
        getUserVotes()
      ]);
      setProjects(fetchedProjects as any);
      setUserVotes(fetchedVotes);
    } catch (err) {
      console.error("Failed to load community data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

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

  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;
    
    setIsSubmitting(true);
    try {
      await suggestProject({
        title: newTitle,
        description: newDescription,
        category: newCategory || (suggestionType === 'initra' ? 'Feature' : 'Other'),
        impactStatement: newImpact,
        tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
        suggestion_type: suggestionType,
      });
      setShowSuggestModal(false);
      setNewTitle("");
      setNewDescription("");
      setNewCategory("");
      setNewImpact("");
      setNewTags("");
      loadData();
    } catch (err: any) {
      alert("Failed to submit idea: " + err.message);
    } finally {
      setIsSubmitting(false);
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
  const userSuggestedInitra = projects.filter(p => p.venture_type === 'user-suggested' && p.suggestion_type === 'initra');
  const userSuggestedProjects = projects.filter(p => p.venture_type === 'user-suggested' && (p.suggestion_type === 'project' || !p.suggestion_type));

  const filterOptions = ["Trending", "Recent", "Votes", "Proposed", "Needs Agents", "Completed"];

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

          {/* Economy & Social Loop */}
          <div className="economy-row" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2.5rem', marginBottom: '5rem' }}>
            <div className="referral-portal glass-panel" style={{ padding: '2.5rem', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
               <div style={{ marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>🤝 Citizen Rewards</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Expand the Initra ecosystem and earn <strong>50 Credits</strong> for every new architect you onboard.</p>
               </div>
               
               <div className="referral-link-box" style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <code style={{ flex: 1, color: 'var(--accent-primary)', fontSize: '0.9rem' }}>initra.com/join?ref= faiz_architect</code>
                  <button className="btn btn-sm btn-ghost" onClick={() => alert("Link Copied!")}>Copy Link</button>
               </div>

               <div className="referral-stats" style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                  <div className="stat">
                     <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800 }}>12</span>
                     <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Architects Invited</span>
                  </div>
                  <div className="stat">
                     <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-success)' }}>600</span>
                     <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Credits Earned</span>
                  </div>
               </div>
            </div>

            <div className="leaderboard-sidebar glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
               <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🏆 Top Referrers
               </h3>
               <div className="leaderboard-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { name: 'Alex K.', count: 42, avatar: '👤', tier: 'Pro' },
                    { name: 'Sarah M.', count: 38, avatar: '👤', tier: 'Sovereign' },
                    { name: 'David L.', count: 25, avatar: '👤', tier: 'Pro' },
                    { name: 'Elena R.', count: 19, avatar: '👤', tier: 'Pro' },
                    { name: 'Mark T.', count: 12, avatar: '👤', tier: 'Sovereign' }
                  ].map((user, i) => (
                    <div key={i} className="leaderboard-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', width: '20px' }}>{i + 1}</span>
                       <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', fontSize: '1rem', justifyContent: 'center' }}>{user.avatar}</div>
                       <div style={{ flex: 1 }}>
                          <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</span>
                          <span style={{ fontSize: '0.65rem', color: user.tier === 'Pro' ? 'var(--accent-primary)' : 'var(--text-muted)' }}>{user.tier}</span>
                       </div>
                       <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{user.count}</span>
                    </div>
                  ))}
               </div>
               <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: '1.5rem', fontSize: '0.75rem' }}>View Full Leaderboard</button>
            </div>
          </div>

          {/* Filtering Hub */}
          <div className="filter-pill-container" style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '4rem', flexWrap: 'wrap' }}>
            {filterOptions.map(opt => (
              <button 
                key={opt}
                className={`filter-pill ${activeFilter === opt ? 'active' : ''}`}
                onClick={() => setActiveFilter(opt)}
                disabled={loading}
              >
                {opt}
              </button>
            ))}
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
                  {project.trending_score > 50 && <span className="badge-trending">🔥 Trending</span>}
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

                  <div className="fork-display">
                    <span className="icon">🔱</span>
                    <span className="count"><strong>{project.fork_count || 0}</strong> Hatches</span>
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
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Citizen-led ideas for Initra platform and new ventures.</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowSuggestModal(true)}>+ Propose Idea</button>
          </div>

          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Initra Platform Ideas</h3>
          <div className="community-grid" style={{ marginBottom: '4rem' }}>
            {userSuggestedInitra.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No platform ideas proposed yet.</p>
            ) : userSuggestedInitra.map(project => (
              <div key={project.id} className="card community-card">
                 <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span className="badge-soft">Platform</span>
                    <span className="badge-outline">{project.category}</span>
                 </div>
                 <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{project.title}</h3>
                 <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{project.description}</p>
                 <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="status-badge proposed">{STATUS_LABELS[project.status] || project.status}</span>
                    <div className="vote-pill small">
                      <button onClick={() => handleVoteAction(project.id, 1)} className={userVotes[project.id] === 1 ? 'active' : ''}>▲</button>
                      <span>{project.vote_score}</span>
                      <button onClick={() => handleVoteAction(project.id, -1)} className={userVotes[project.id] === -1 ? 'active' : ''}>▼</button>
                    </div>
                 </div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Venture/Project Ideas</h3>
          <div className="community-grid">
            {userSuggestedProjects.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No project ideas proposed yet.</p>
            ) : userSuggestedProjects.map(project => (
              <div key={project.id} className="card community-card">
                 <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span className="badge-soft">Project</span>
                    <span className="badge-outline">{project.category}</span>
                 </div>
                 <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{project.title}</h3>
                 <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{project.description}</p>
                 <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="status-badge proposed">{STATUS_LABELS[project.status] || project.status}</span>
                    <div className="vote-pill small">
                      <button onClick={() => handleVoteAction(project.id, 1)} className={userVotes[project.id] === 1 ? 'active' : ''}>▲</button>
                      <span>{project.vote_score}</span>
                      <button onClick={() => handleVoteAction(project.id, -1)} className={userVotes[project.id] === -1 ? 'active' : ''}>▼</button>
                    </div>
                 </div>
              </div>
            ))}
          </div>

          {/* Suggest Idea Modal */}
          {showSuggestModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <button className="modal-close" onClick={() => setShowSuggestModal(false)}>×</button>
                <h2>Propose an Idea</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Share your vision with the community.</p>
                
                <form onSubmit={handleSubmitSuggestion}>
                  <div className="form-group">
                    <label>Idea Type</label>
                    <select 
                      value={suggestionType} 
                      onChange={(e) => setSuggestionType(e.target.value as 'initra' | 'project')}
                      className="form-input"
                    >
                      <option value="project">Venture / Project Idea</option>
                      <option value="initra">Initra Platform Feature</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Title</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="E.g. AI-powered CRM" 
                      value={newTitle} 
                      onChange={e => setNewTitle(e.target.value)} 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <textarea 
                      className="form-input" 
                      placeholder="Describe what it does and why it's needed..." 
                      rows={3} 
                      value={newDescription} 
                      onChange={e => setNewDescription(e.target.value)} 
                      required 
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Category</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder={suggestionType === 'initra' ? "E.g. UI/UX" : "E.g. SaaS"} 
                        value={newCategory} 
                        onChange={e => setNewCategory(e.target.value)} 
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Tags (comma separated)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="E.g. AI, Analytics" 
                        value={newTags} 
                        onChange={e => setNewTags(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Impact Statement (Optional)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="How will this change the world?" 
                      value={newImpact} 
                      onChange={e => setNewImpact(e.target.value)} 
                    />
                  </div>
                  
                  <div className="modal-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => setShowSuggestModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting || !newTitle.trim() || !newDescription.trim()}>
                      {isSubmitting ? "Submitting..." : "Submit Proposal"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

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
        
        .category-row { display: flex; align-items: center; gap: 0.75rem; marginBottom: 1.5rem; }
        .badge-outline { font-size: 0.7rem; padding: 2px 8px; border: 1px solid var(--border-medium); border-radius: 4px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .badge-soft { font-size: 0.7rem; padding: 2px 8px; background: rgba(124,58,237,0.1); color: var(--primary-light); border-radius: 4px; }
        .badge-trending { font-size: 0.7rem; padding: 2px 8px; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; border-radius: 4px; font-weight: 700; }
        
        .filter-pill-container { }
        .filter-pill { 
          padding: 8px 18px; 
          border-radius: 20px; 
          border: 1px solid var(--border-medium); 
          background: rgba(255,255,255,0.02); 
          color: var(--text-secondary); 
          cursor: pointer; 
          font-size: 0.9rem; 
          transition: all 0.2s;
        }
        .filter-pill:hover { background: rgba(255,255,255,0.05); }
        .filter-pill.active { 
          background: var(--primary); 
          color: white; 
          border-color: var(--primary); 
          box-shadow: 0 4px 12px rgba(124,58,237,0.3);
        }

        .fork-display { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--text-secondary); }
        .fork-display .icon { font-size: 1rem; opacity: 0.8; }
        
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

        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: 16px;
          padding: 2rem;
          width: 90%;
          max-width: 500px;
          position: relative;
        }
        .modal-close {
          position: absolute;
          top: 1rem; right: 1rem;
          background: none; border: none;
          color: var(--text-muted);
          font-size: 1.5rem; cursor: pointer;
        }
        .form-group { margin-bottom: 1.25rem; }
        .form-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }
        .form-input {
          width: 100%;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.95rem;
        }
        .form-input:focus {
          outline: none;
          border-color: var(--primary);
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }
      `}</style>
    </>
  );
}
