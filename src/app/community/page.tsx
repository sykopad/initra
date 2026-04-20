"use client";

import { useState, useCallback, useEffect, useTransition } from "react";
import Navbar from "@/components/Navbar";
import { 
  getCommunityProjects, 
  voteProject, 
  suggestProject, 
  getUserVotes 
} from "@/lib/actions/community";

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
}

const STATUS_LABELS: Record<string, string> = {
  proposed: "Proposed",
  in_progress: "In Progress",
  needs_agents: "Needs Agents",
  completed: "Completed",
};

const FILTER_OPTIONS = ["All", "Proposed", "In Progress", "Needs Agents", "Completed"];

export default function CommunityPage() {
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // New project form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("web-app");
  const [newImpact, setNewImpact] = useState("");
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const loadData = useCallback(async () => {
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

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Vote handler
  const handleVoteAction = async (projectId: string, direction: 1 | -1) => {
    const currentVote = userVotes[projectId] || 0;
    const newValue = currentVote === direction ? 0 : direction;
    
    // Optimistic UI update
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
      alert(err.message || "Failed to cast vote. Are you signed in?");
      // Rollback on error
      loadData();
    }
  };

  // Add tag
  const handleAddTag = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!newTags.includes(tagInput.trim().toLowerCase())) {
        setNewTags((prev) => [...prev, tagInput.trim().toLowerCase()]);
      }
      setTagInput("");
    }
  }, [tagInput, newTags]);

  // Submit new project
  const handleSubmitProject = async () => {
    if (!newTitle.trim() || !newDescription.trim()) return;

    startTransition(async () => {
      try {
        await suggestProject({
          title: newTitle,
          description: newDescription,
          category: newCategory,
          impactStatement: newImpact,
          tags: newTags,
        });
        
        setShowSuggestModal(false);
        setNewTitle("");
        setNewDescription("");
        setNewImpact("");
        setNewTags([]);
        setTagInput("");
        loadData();
      } catch (err: any) {
        alert(err.message || "Failed to suggest project. Are you signed in?");
      }
    });
  };

  return (
    <>
      <Navbar />

      <div className="community-container">
        <div className="container">
          {/* Header */}
          <div className="community-header">
            <h1>🌍 Community Hub</h1>
            <p>
              Suggest open-source projects that benefit humanity. Vote, contribute
              agent configs, and build together.
            </p>
          </div>

          {/* Actions Bar */}
          <div className="community-actions">
            <div className="filter-tabs">
              {FILTER_OPTIONS.map((filter) => (
                <button
                  key={filter}
                  className={`filter-tab ${activeFilter === filter ? "active" : ""}`}
                  onClick={() => {
                    setActiveFilter(filter);
                    setLoading(true);
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" onClick={() => setShowSuggestModal(true)}>
              💡 Suggest a Project
            </button>
          </div>

          {/* Project Grid */}
          {loading ? (
            <div className="community-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="card community-card skeleton-card">
                  <div className="skeleton title"></div>
                  <div className="skeleton text"></div>
                  <div className="skeleton text-short"></div>
                  <div className="skeleton footer"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="community-grid">
              {projects.map((project) => (
                <div key={project.id} className="card community-card">
                  <div className="community-card-header">
                    <h3>{project.title}</h3>
                    <span className={`status-badge ${project.status.replace('_', '-')}`}>
                      {STATUS_LABELS[project.status]}
                    </span>
                  </div>
                  <p>{project.description}</p>
                  <div className="community-tags">
                    {project.tags.map((tag) => (
                      <span key={tag} className="community-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="community-card-footer">
                    <div className="vote-controls">
                      <button
                        className={`vote-btn ${userVotes[project.id] === 1 ? "active-up" : ""}`}
                        onClick={() => handleVoteAction(project.id, 1)}
                      >
                        ▲
                      </button>
                      <span className="vote-count">{project.vote_score}</span>
                      <button
                        className={`vote-btn ${userVotes[project.id] === -1 ? "active-down" : ""}`}
                        onClick={() => handleVoteAction(project.id, -1)}
                      >
                        ▼
                      </button>
                    </div>
                    <div className="agent-count">
                      🤖 {project.agent_count} agent{project.agent_count !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && projects.length === 0 && (
            <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
              <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</p>
              <p>No projects match this filter. Try another or suggest a new project!</p>
            </div>
          )}
        </div>
      </div>

      {/* Suggest Project Modal */}
      {showSuggestModal && (
        <div className="modal-overlay" onClick={() => setShowSuggestModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>💡 Suggest a Project</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", marginBottom: "1.5rem" }}>
              Propose an open-source project that benefits humanity. The community will vote on the best ideas.
            </p>

            <div className="form-group">
              <label className="form-label">
                Project Title <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Open Source Water Quality Monitor"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Description <span className="required">*</span>
              </label>
              <textarea
                className="form-textarea"
                placeholder="Describe the project, its goals, and why it matters..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option value="web-app">🌐 Web Application</option>
                <option value="mobile-app">📱 Mobile App</option>
                <option value="api-backend">🔧 API / Backend</option>
                <option value="ai-ml">🤖 AI / ML Project</option>
                <option value="infrastructure">🏗️ Infrastructure</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Impact Statement</label>
              <input
                type="text"
                className="form-input"
                placeholder="How will this benefit humanity?"
                value={newImpact}
                onChange={(e) => setNewImpact(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tags</label>
              <div className="tag-input-wrapper">
                {newTags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    {tag}
                    <button onClick={() => setNewTags((prev) => prev.filter((t) => t !== tag))}>
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  className="tag-input"
                  placeholder="Type a tag and press Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowSuggestModal(false)} disabled={isPending}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmitProject}
                disabled={!newTitle.trim() || !newDescription.trim() || isPending}
                style={{ opacity: !newTitle.trim() || !newDescription.trim() || isPending ? 0.5 : 1 }}
              >
                {isPending ? "Submitting..." : "🚀 Submit Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .skeleton-card {
           pointer-events: none;
           opacity: 0.6;
        }
        .skeleton {
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
          margin-bottom: 1rem;
          animation: pulse 1.5s infinite;
        }
        .skeleton.title { height: 24px; width: 60%; }
        .skeleton.text { height: 40px; }
        .skeleton.text-short { height: 20px; width: 40%; }
        .skeleton.footer { height: 32px; margin-top: 1rem; }

        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; }
        }

        .status-badge.in-progress { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2); }
        .status-badge.needs-agents { background: rgba(245, 158, 11, 0.1); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.2); }
        .status-badge.completed { background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }
      `}</style>
    </>
  );
}
