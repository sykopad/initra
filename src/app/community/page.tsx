"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface CommunityProject {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  impactStatement: string;
  status: "proposed" | "in-progress" | "needs-agents" | "completed";
  voteScore: number;
  agentCount: number;
  suggestedBy: string;
  createdAt: string;
}

// Demo data — will be replaced with Supabase queries
const DEMO_PROJECTS: CommunityProject[] = [
  {
    id: "1",
    title: "Open Source Disaster Relief Coordination",
    description:
      "A real-time platform for coordinating disaster relief efforts. Features live mapping, volunteer dispatching, and inventory tracking for aid organizations.",
    category: "web-app",
    tags: ["humanitarian", "real-time", "mapping"],
    impactStatement: "Helps save lives by improving disaster response coordination",
    status: "proposed",
    voteScore: 142,
    agentCount: 0,
    suggestedBy: "Sarah_K",
    createdAt: "2026-04-15",
  },
  {
    id: "2",
    title: "Accessible Education Platform for Developing Nations",
    description:
      "Offline-first mobile learning platform with AI-powered tutoring. Supports low-bandwidth environments and local language translations.",
    category: "mobile-app",
    tags: ["education", "accessibility", "offline-first"],
    impactStatement: "Brings quality education to underserved communities worldwide",
    status: "in-progress",
    voteScore: 98,
    agentCount: 3,
    suggestedBy: "DevForGood",
    createdAt: "2026-04-10",
  },
  {
    id: "3",
    title: "Community Health Monitoring API",
    description:
      "Open API for aggregating anonymized community health data. Helps public health officials identify disease outbreaks and allocate resources.",
    category: "api-backend",
    tags: ["health", "open-data", "api"],
    impactStatement: "Early detection of health crises through data-driven monitoring",
    status: "needs-agents",
    voteScore: 76,
    agentCount: 1,
    suggestedBy: "HealthTech_Co",
    createdAt: "2026-04-08",
  },
  {
    id: "4",
    title: "Carbon Footprint Tracker",
    description:
      "ML-powered personal carbon footprint calculator and reduction advisor. Integrates with smart home devices and transportation APIs.",
    category: "ai-ml",
    tags: ["climate", "sustainability", "ml"],
    impactStatement: "Empowers individuals to reduce their environmental impact",
    status: "proposed",
    voteScore: 64,
    agentCount: 0,
    suggestedBy: "EcoBuilder",
    createdAt: "2026-04-12",
  },
  {
    id: "5",
    title: "Sign Language Learning App",
    description:
      "Flutter app using computer vision to teach sign language interactively. Real-time hand tracking with instant feedback on gesture accuracy.",
    category: "mobile-app",
    tags: ["accessibility", "education", "computer-vision"],
    impactStatement: "Makes sign language learning accessible and engaging for everyone",
    status: "in-progress",
    voteScore: 89,
    agentCount: 2,
    suggestedBy: "AccessibleTech",
    createdAt: "2026-04-09",
  },
  {
    id: "6",
    title: "Open Source Food Bank Network",
    description:
      "Platform connecting food banks, donors, and volunteers. Smart logistics for minimizing food waste and maximizing distribution efficiency.",
    category: "web-app",
    tags: ["humanitarian", "logistics", "food-waste"],
    impactStatement: "Reducing food waste while fighting hunger in communities",
    status: "completed",
    voteScore: 201,
    agentCount: 5,
    suggestedBy: "FeedForward",
    createdAt: "2026-03-20",
  },
];

const STATUS_LABELS: Record<string, string> = {
  proposed: "Proposed",
  "in-progress": "In Progress",
  "needs-agents": "Needs Agents",
  completed: "Completed",
};

const FILTER_OPTIONS = ["All", "Proposed", "In Progress", "Needs Agents", "Completed"];

export default function CommunityPage() {
  const [projects, setProjects] = useState<CommunityProject[]>(DEMO_PROJECTS);
  const [activeFilter, setActiveFilter] = useState("All");
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});

  // New project form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("web-app");
  const [newImpact, setNewImpact] = useState("");
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    if (activeFilter === "All") return true;
    const statusMap: Record<string, string> = {
      Proposed: "proposed",
      "In Progress": "in-progress",
      "Needs Agents": "needs-agents",
      Completed: "completed",
    };
    return p.status === statusMap[activeFilter];
  });

  // Sort by vote score
  const sortedProjects = [...filteredProjects].sort((a, b) => b.voteScore - a.voteScore);

  // Vote handler
  const handleVote = useCallback((projectId: string, direction: 1 | -1) => {
    const currentVote = userVotes[projectId] || 0;

    if (currentVote === direction) {
      // Remove vote
      setUserVotes((prev) => ({ ...prev, [projectId]: 0 }));
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, voteScore: p.voteScore - direction } : p))
      );
    } else {
      // Add/change vote
      const delta = direction - currentVote;
      setUserVotes((prev) => ({ ...prev, [projectId]: direction }));
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, voteScore: p.voteScore + delta } : p))
      );
    }
  }, [userVotes]);

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
  const handleSubmitProject = useCallback(() => {
    if (!newTitle.trim() || !newDescription.trim()) return;

    const project: CommunityProject = {
      id: String(Date.now()),
      title: newTitle,
      description: newDescription,
      category: newCategory,
      tags: newTags,
      impactStatement: newImpact,
      status: "proposed",
      voteScore: 1,
      agentCount: 0,
      suggestedBy: "You",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setProjects((prev) => [project, ...prev]);
    setShowSuggestModal(false);
    setNewTitle("");
    setNewDescription("");
    setNewImpact("");
    setNewTags([]);
    setTagInput("");
  }, [newTitle, newDescription, newCategory, newImpact, newTags]);

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
            <li><Link href="/">Home</Link></li>
            <li><Link href="/wizard">Wizard</Link></li>
            <li>
              <Link href="/wizard" className="btn btn-primary btn-sm">
                Start Building →
              </Link>
            </li>
          </ul>
        </div>
      </nav>

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
                  onClick={() => setActiveFilter(filter)}
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
          <div className="community-grid">
            {sortedProjects.map((project) => (
              <div key={project.id} className="card community-card">
                <div className="community-card-header">
                  <h3>{project.title}</h3>
                  <span className={`status-badge ${project.status}`}>
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
                      onClick={() => handleVote(project.id, 1)}
                    >
                      ▲
                    </button>
                    <span className="vote-count">{project.voteScore}</span>
                    <button
                      className={`vote-btn ${userVotes[project.id] === -1 ? "active-down" : ""}`}
                      onClick={() => handleVote(project.id, -1)}
                    >
                      ▼
                    </button>
                  </div>
                  <div className="agent-count">
                    🤖 {project.agentCount} agent{project.agentCount !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sortedProjects.length === 0 && (
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
              <button className="btn btn-ghost" onClick={() => setShowSuggestModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmitProject}
                disabled={!newTitle.trim() || !newDescription.trim()}
                style={{ opacity: !newTitle.trim() || !newDescription.trim() ? 0.5 : 1 }}
              >
                🚀 Submit Project
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
