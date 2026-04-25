"use client";

import { useState, useEffect, useRef } from "react";
import LivePreviewModal from "./LivePreviewModal";

import SegmentCard from "./SegmentCard";
import AuditScorecard from "./AuditScorecard";
import { AuditResult } from "@/lib/engine/types";
import { disconnectRepo } from "@/lib/actions/projects";
import { repairAuditAction } from "@/lib/actions/audit";
import { AuditCheck } from "@/lib/engine/types";
import { AI_MODELS } from "@/lib/ai/models";
import VentureTelemetry from "./VentureTelemetry";
import { publishSkillAction } from "@/lib/actions/community";
import StrategistView from "./StrategistView";

interface Repo {
  id: string;
  owner: string;
  repo_name: string;
  framework: string;
  last_synced_at: string;
}

interface Segment {
  id: string;
  name: string;
  type: string;
  landmarkType?: string;
  domain?: string;
  isLogic?: boolean;
  file_path: string;
  description: string;
}

interface RepoBuilderProps {
  initialRepos?: Repo[] | null;
}

export default function RepoBuilder({ initialRepos }: RepoBuilderProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [activeRepo, setActiveRepo] = useState<Repo | null>(initialRepos?.[0] || null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("openai/gpt-4o-mini");
  
  // Load segments for the first repo automatically if available
  useEffect(() => {
    if (activeRepo) {
      fetchSegments(activeRepo.id);
    }
  }, [activeRepo?.id]);

  const fetchSegments = async (repoId: string) => {
    setIsLoading(true);
    setSegments([]);
    setAudit(null);
    try {
      const res = await fetch(`/api/builder/segment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: `https://github.com/${activeRepo?.owner}/${activeRepo?.repo_name}` })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch segments");
      
      setSegments(data.segments || []);
      if (data.audit) setAudit(data.audit);
    } catch (e: any) {
      console.error(e);
      setError(e.message);
      if (e.message.includes("GitHub session expired")) {
        setShowReconnect(true);
      }
    } finally {
      setIsLoading(false);
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<{ files: Array<{ path: string; content: string; explanation?: string }> } | null>(null);
  const [isPushing, setIsPushing] = useState(false);
  const [showReconnect, setShowReconnect] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [studioSegmentId, setStudioSegmentId] = useState<string>("");
  const [studioPrompt, setStudioPrompt] = useState("");
  const [successfullyRepairedIds, setSuccessfullyRepairedIds] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'command' | 'studio' | 'strategist'>('command');
  const studioRef = useRef<HTMLDivElement>(null);
  const strategistRef = useRef<HTMLDivElement>(null);
  const [suggestionPrompt, setSuggestionPrompt] = useState<string | null>(null);

  const handleActOnSuggestion = (prompt: string) => {
    setStudioPrompt(prompt);
    setActiveTab('studio');
    // Scroll to studio after a short delay to allow tab change
    setTimeout(() => {
      studioRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleReconnect = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        scopes: "repo",
      },
    });
  };

  const handleSync = async () => {
    if (!repoUrl) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/builder/segment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      
      // Refresh repo data (we could also fetch from DB but data has it now)
      setActiveRepo({
        id: data.repoId,
        owner: repoUrl.split('/')[3],
        repo_name: repoUrl.split('/')[4],
        framework: data.framework,
        last_synced_at: new Date().toISOString()
      });
      setSegments(data.segments || []);
      if (data.audit) setAudit(data.audit);
    } catch (err: any) {
      setError(err.message);
      if (err.message === "GitHub session expired") {
        setShowReconnect(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSuccess = (newCode: string, filePath: string) => {
    setPendingChanges({ files: [{ path: filePath, content: newCode }] });
  };

  const handlePush = async () => {
    if (!activeRepo || !pendingChanges) return;
    setIsPushing(true);
    try {
      const res = await fetch("/api/builder/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoId: activeRepo.id,
          files: pendingChanges.files.map(f => ({ path: f.path, content: f.content })),
          commitMessage: `✨ AI built UI change: ${pendingChanges.files.map(f => f.path).join(', ')}`
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setPendingChanges(null);
      // Re-fetch to verify audit status
      fetchSegments(activeRepo.id);
      alert("Successfully pushed to GitHub! Refreshing audit status...");
    } catch (err: any) {
      alert("Push failed: " + err.message);
    } finally {
      setIsPushing(false);
    }
  };

  const handleRepair = async (check: AuditCheck) => {
    if (!activeRepo) return;
    try {
      const res = await repairAuditAction(activeRepo.id, check, activeRepo.framework, selectedModel);
      if (res.success) {
        setPendingChanges({ files: res.files });
        setSuccessfullyRepairedIds(prev => [...prev, check.id]);
      }
    } catch (err: any) {
      alert("Repair failed: " + err.message);
    }
  };

  const handleSaveSkill = async (check: AuditCheck) => {
    try {
      await publishSkillAction({
        name: check.title,
        description: check.message,
        prompt_template: check.actionable_repair || "",
        category: check.category,
        target_framework: activeRepo?.framework || "universal"
      });
      alert("🌟 Skill published to Community Hub!");
      setSuccessfullyRepairedIds(prev => prev.filter(id => id !== check.id));
    } catch (err: any) {
      alert("Publish failed: " + err.message);
    }
  };

  const handleStudioGenerate = () => {
    if (!studioSegmentId || !studioPrompt) return;
    setIsPreviewOpen(true);
  };

  const handleSelectSegmentForStudio = (segmentId: string) => {
    setStudioSegmentId(segmentId);
    studioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="repo-builder dashboard-card">
      <div className="card-header" style={{ padding: '0', borderBottom: 'none' }}>
        {activeRepo ? (
          <div className="universal-project-header animate-slide-down">
            <div className="header-left">
              <div className="repo-switcher-pill">
                <span className="pill-icon">📦</span>
                <select 
                  className="repo-select-minimal"
                  value={activeRepo.id}
                  onChange={(e) => {
                    const selected = initialRepos?.find(r => r.id === e.target.value);
                    if (selected) setActiveRepo(selected);
                  }}
                >
                  {initialRepos?.map((repo, idx) => (
                    <option key={repo.id || idx} value={repo.id}>{repo.owner}/{repo.repo_name}</option>
                  ))}
                </select>
              </div>
              <div className="sync-status">
                <span className="dot pulse"></span>
                <span style={{ opacity: 0.7 }}>Synced {new Date(activeRepo.last_synced_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="header-center">
              <div className="tab-switcher">
                <button 
                  className={`tab-btn ${activeTab === 'command' ? 'active' : ''}`}
                  onClick={() => setActiveTab('command')}
                >
                  🛡️ Command Center
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'studio' ? 'active' : ''}`}
                  onClick={() => setActiveTab('studio')}
                >
                  ✨ Creative Studio
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'strategist' ? 'active' : ''}`}
                  onClick={() => setActiveTab('strategist')}
                >
                  🧠 Strategist
                </button>
              </div>
            </div>

            <div className="header-right">
              {showReconnect && (
                <button className="btn btn-secondary btn-xs" onClick={handleReconnect} style={{ padding: '6px 12px', fontSize: '0.7rem' }}>Reconnect GitHub</button>
              )}
              <button className="btn-icon" onClick={() => fetchSegments(activeRepo.id)} title="Refresh Analysis">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="studio-icon" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>🛠️</div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Autonomous SaaS Builder</h3>
            </div>
          </div>
        )}
      </div>

      {!activeRepo ? (
        <div className="sync-interface">
          {initialRepos && initialRepos.length > 0 && (
            <div className="repo-selector" style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>Active Ventures</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {initialRepos.map(repo => (
                  <div 
                    key={repo.id} 
                    className="project-type-card" 
                    style={{ padding: '1rem', cursor: 'pointer', textAlign: 'left' }}
                    onClick={() => setActiveRepo(repo)}
                  >
                    <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>⚡</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {repo.repo_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{repo.framework}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed var(--border-medium)' }}>
            <p>Import a new GitHub repository to start building with AI.</p>
            <div className="input-group" style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="https://github.com/user/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                style={{ flex: 1 }}
              />
              <button 
                className="btn btn-primary" 
                onClick={handleSync}
                disabled={isLoading}
              >
                {isLoading ? "Analyzing..." : "Sync & Analyze"}
              </button>
            </div>
          </div>
          {error && (
            <div className="error-container" style={{ marginTop: '1rem' }}>
              <p className="error-msg" style={{ color: 'var(--accent-rose)', marginBottom: '0.75rem' }}>{error}</p>
              {showReconnect && (
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={handleReconnect}
                  style={{ background: '#24292e', color: 'white' }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                    <path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                  Reconnect GitHub
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="builder-wrapper">
          <div className="telemetry-strip animate-slide-down" style={{ width: '100%' }}>
            <VentureTelemetry 
              repoId={activeRepo.id} 
              repoName={activeRepo.repo_name}
              owner={activeRepo.owner}
            />
          </div>
          
          <div className="tab-content-area" style={{ padding: '0' }}>
            {error && (
              <div className="error-banner animate-slide-down">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
                <button className="close-btn" onClick={() => setError(null)}>×</button>
              </div>
            )}

            {pendingChanges && (
              <div className="changes-bar animate-slide-down">
                <div className="bar-inner">
                  <div className="changes-info">
                    <span className="sparkle">✨</span>
                    <span>AI has generated changes for <strong>{pendingChanges.files.length} file{pendingChanges.files.length > 1 ? 's' : ''}</strong></span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setPendingChanges(null)}>Discard</button>
                    <button className="btn btn-primary btn-sm" onClick={handlePush} disabled={isPushing}>{isPushing ? "Pushing..." : "Push to GitHub"}</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'command' && (
              <div className="tab-pane command-pane animate-fade-in">
                <div className="command-stack" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  <div className="command-section-full" style={{ padding: '1.5rem' }}>
                    {audit && (
                      <AuditScorecard 
                        audit={audit} 
                        onRepair={handleRepair} 
                        successfullyRepairedIds={successfullyRepairedIds}
                        onSaveSkill={handleSaveSkill}
                      />
                    )}
                  </div>
                  
                  <div className="command-section-full" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                     <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Domain Distribution</h3>
                     <div className="domains-container-mini" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                      {Object.entries(
                        (segments || []).reduce((acc, seg) => {
                          const domain = seg.domain || "Core Application";
                          if (!acc[domain]) acc[domain] = [];
                          acc[domain].push(seg);
                          return acc;
                        }, {} as Record<string, Segment[]>)
                      ).sort().map(([domain, domainSegments]) => (
                        <div key={domain} className="domain-item-mini" style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <span className="domain-dot"></span>
                          <span className="domain-name" style={{ fontWeight: 600 }}>{domain}</span>
                          <span className="domain-count" style={{ marginLeft: '8px', opacity: 0.6 }}>{domainSegments.length}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="domains-container" style={{ padding: '2rem 1.5rem' }}>
                  {Object.entries(
                    (segments || []).reduce((acc, seg) => {
                      const domain = seg.domain || "Core Application";
                      if (!acc[domain]) acc[domain] = [];
                      acc[domain].push(seg);
                      return acc;
                    }, {} as Record<string, Segment[]>)
                  ).sort().map(([domain, domainSegments]) => (
                    <div key={domain} className="domain-section">
                      <h4 className="domain-title">{domain}</h4>
                      <div className="segments-grid">
                        {domainSegments.map((seg, idx) => (
                          <SegmentCard 
                            key={seg.id || `${seg.file_path}-${seg.name}-${idx}`} 
                            segment={seg} 
                            repoId={activeRepo.id} 
                            onEditSuccess={handleEditSuccess}
                            onSelect={() => handleSelectSegmentForStudio(seg.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'studio' && (
              <div className="tab-pane studio-pane animate-fade-in">
                <div className="builder-controls" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="model-switcher-dashboard">
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Reasoning Engine</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        className="model-select-dashboard"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                      >
                        {AI_MODELS.map(m => (
                          <option key={m.slug} value={m.slug}>{m.name} ({m.creditCost} cr/op)</option>
                        ))}
                      </select>
                      <div className="model-price-tag">
                        <span className="price-pill">
                          {AI_MODELS.find(m => m.slug === selectedModel)?.creditCost || 0} Credits
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="creative-studio animate-fade-in" ref={studioRef}>
                  <div className="studio-inner" style={{ borderRadius: '0', border: 'none', background: 'transparent' }}>
                    <div className="studio-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="studio-icon">✨</div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Creative Studio <span style={{ fontSize: '0.7rem', verticalAlign: 'middle', background: 'var(--accent-primary)', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>v2.0</span></h3>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Autonomous interface refinement & feature expansion</p>
                        </div>
                      </div>
                      <div className="model-badge">
                        {AI_MODELS.find(m => m.slug === selectedModel)?.name}
                      </div>
                    </div>

                    <div className="studio-grid">
                      <div className="studio-field">
                        <label>1. Select Venture Segment</label>
                        <select 
                          value={studioSegmentId} 
                          onChange={(e) => setStudioSegmentId(e.target.value)}
                          className="studio-select"
                          style={{ width: '100%', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
                        >
                          <option value="" disabled>Choose a part of your venture to evolve...</option>
                          <optgroup label="Layouts & Structure" style={{ background: '#1a1a1a', color: 'var(--accent-primary)' }}>
                            {segments.filter(s => s.type === 'layout').map((s, idx) => (
                              <option key={`${s.id}-${idx}`} value={s.id} style={{ background: '#1a1a1a', color: 'white' }}>{s.name}</option>
                            ))}
                          </optgroup>
                          <optgroup label="User Interface (UI)" style={{ background: '#1a1a1a', color: 'var(--accent-primary)' }}>
                            {segments.filter(s => s.type === 'page' || s.type === 'component').map((s, idx) => (
                              <option key={`${s.id}-${idx}`} value={s.id} style={{ background: '#1a1a1a', color: 'white' }}>{s.name}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Backend & Business Logic" style={{ background: '#1a1a1a', color: 'var(--accent-primary)' }}>
                            {segments.filter(s => s.type === 'logic').map((s, idx) => (
                              <option key={`${s.id}-${idx}`} value={s.id} style={{ background: '#1a1a1a', color: 'white' }}>{s.name}</option>
                            ))}
                          </optgroup>
                        </select>

                        {studioSegmentId && segments.find(s => s.id === studioSegmentId) && (
                          <div className="segment-context-box animate-fade-in" style={{ marginTop: '1rem' }}>
                            <div className="context-header">
                              <span className="context-badge">{(segments.find(s => s.id === studioSegmentId)?.type || 'unknown').toUpperCase()}</span>
                              <span className="context-path">{segments.find(s => s.id === studioSegmentId)?.file_path}</span>
                            </div>
                            <p className="context-desc">{segments.find(s => s.id === studioSegmentId)?.description}</p>
                          </div>
                        )}
                      </div>

                      <div className="studio-field">
                        <label>2. Describe Your Objective</label>
                        <div className="studio-prompt-wrapper">
                          {studioSegmentId && (
                            <div className="prompt-suggestions animate-fade-in" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {segments.find(s => s.id === studioSegmentId)?.type === 'logic' ? (
                                <>
                                  <button className="suggestion-chip" onClick={() => setStudioPrompt("Add validation to this logic and handle error states.")}>🛡️ Add Validation</button>
                                  <button className="suggestion-chip" onClick={() => setStudioPrompt("Connect this to the database and implement CRUD operations.")}>🗄️ Database Hookup</button>
                                  <button className="suggestion-chip" onClick={() => setStudioPrompt("Refactor this for performance and readability.")}>⚡ Optimize</button>
                                </>
                              ) : (
                                <>
                                  <button className="suggestion-chip" onClick={() => setStudioPrompt("Make this look more modern with glassmorphism and vibrant colors.")}>🎨 Modernize UI</button>
                                  <button className="suggestion-chip" onClick={() => setStudioPrompt("Add a responsive dark mode toggle for this section.")}>🌙 Dark Mode</button>
                                  <button className="suggestion-chip" onClick={() => setStudioPrompt("Improve the mobile layout and accessibility of this component.")}>📱 Mobile Optimization</button>
                                </>
                              )}
                            </div>
                          )}
                          
                          <textarea 
                            value={studioPrompt}
                            onChange={(e) => setStudioPrompt(e.target.value)}
                            placeholder={studioSegmentId ? "e.g. 'Add a login button that redirects to /dashboard' or 'Secure this API with an API key check'" : "Select a segment first..."}
                            className="studio-textarea"
                          />
                          
                          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                             <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                               Approximate Cost: <strong style={{ color: 'white', marginLeft: '4px' }}>{AI_MODELS.find(m => m.slug === selectedModel)?.creditCost || 0} Credits</strong>
                             </p>
                             <button 
                              className="btn btn-primary studio-btn"
                              onClick={handleStudioGenerate}
                              disabled={!studioSegmentId || !studioPrompt}
                              style={{ padding: '14px 36px', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)' }}
                            >
                              🚀 Generate Refinement
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'strategist' && (
              <div className="tab-pane strategist-pane animate-fade-in" ref={strategistRef}>
                <StrategistView 
                  repoId={activeRepo.id} 
                  selectedModel={selectedModel}
                  onActOnSuggestion={handleActOnSuggestion}
                />
              </div>
            )}
          </div>
        </div>
      )}

          {/* Custom Disconnect Modal */}
          {showDisconnectConfirm && (
            <div className="modal-overlay animate-fade-in">
              <div className="modal-content animate-scale-up">
                <h3>Disconnect Repository?</h3>
                <p>This will stop Initra from managing <strong>{activeRepo.repo_name}</strong>. Your code and history on GitHub will remain completely untouched.</p>
                <div className="modal-actions">
                  <button className="btn btn-ghost" onClick={() => setShowDisconnectConfirm(false)}>Cancel</button>
                  <button 
                    className="btn btn-danger" 
                    onClick={async () => {
                      await disconnectRepo(activeRepo.id);
                      setActiveRepo(null);
                      setShowDisconnectConfirm(false);
                    }}
                  >
                    Confirm Disconnect
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Centralized Preview Modal */}
          {isPreviewOpen && studioSegmentId && segments.find(s => s.id === studioSegmentId) && (
            <LivePreviewModal 
              isOpen={isPreviewOpen}
              onClose={() => setIsPreviewOpen(false)}
              segment={segments.find(s => s.id === studioSegmentId)}
              repoId={activeRepo.id}
              initialPrompt={studioPrompt}
              onFinalize={() => {
                setIsPreviewOpen(false);
                fetchSegments(activeRepo.id);
              }}
            />
          )}

      <style jsx>{`
            .creative-studio {
              position: relative;
            }
            .studio-inner {
              padding: 2rem;
              border-radius: 24px;
              background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(16, 185, 129, 0.05));
              border: 1px solid rgba(255, 255, 255, 0.1);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            }
            .studio-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 2rem;
            }
            .studio-icon {
              font-size: 1.5rem;
              background: var(--accent-primary);
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 12px;
              box-shadow: 0 0 15px rgba(139, 92, 246, 0.5);
            }
            .model-badge {
              font-size: 0.7rem;
              font-weight: 700;
              padding: 4px 10px;
              background: rgba(255, 255, 255, 0.05);
              border-radius: 20px;
              color: var(--text-muted);
            }
            .studio-grid {
              display: flex;
              flex-direction: column;
              gap: 1.5rem;
            }
            .studio-field label {
              display: block;
              font-size: 0.75rem;
              font-weight: 700;
              color: var(--text-muted);
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .studio-select, .model-select-dashboard {
              width: 100%;
              padding: 14px;
              border-radius: 12px;
              color: white;
              background: #1a1a1a;
              border: 1px solid rgba(255, 255, 255, 0.1);
              outline: none;
              font-size: 0.95rem;
              font-weight: 500;
              transition: all 0.2s;
              cursor: pointer;
            }
            .model-select-dashboard {
              padding: 8px 14px;
              width: auto;
              min-width: 280px;
            }
            .studio-select:focus, .model-select-dashboard:focus {
              border-color: var(--accent-primary);
              box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
            }
            .studio-select option, .model-select-dashboard option {
              background: #1a1a1a;
              color: white;
              padding: 12px;
            }
            .price-pill {
              font-size: 0.75rem;
              font-weight: 700;
              color: var(--accent-primary);
              background: rgba(139, 92, 246, 0.1);
              padding: 6px 12px;
              border-radius: 8px;
              white-space: nowrap;
              border: 1px solid rgba(139, 92, 246, 0.2);
            }
            .segment-context-box {
              margin-top: 12px;
              padding: 12px 16px;
              background: rgba(255, 255, 255, 0.02);
              border: 1px solid rgba(255, 255, 255, 0.05);
              border-radius: 12px;
            }
            .context-header {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 6px;
            }
            .context-badge {
              font-size: 0.6rem;
              font-weight: 900;
              padding: 2px 6px;
              background: var(--accent-primary);
              color: white;
              border-radius: 4px;
              letter-spacing: 0.05em;
            }
            .context-path {
              font-family: monospace;
              font-size: 0.75rem;
              color: var(--text-muted);
            }
            .context-desc {
              margin: 0;
              font-size: 0.8rem;
              color: var(--text-secondary);
              line-height: 1.5;
            }
            .studio-prompt-wrapper {
              display: flex;
              gap: 12px;
              align-items: flex-end;
              flex-direction: column;
            }
            .studio-textarea {
              width: 100%;
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              padding: 16px;
              border-radius: 16px;
              color: white;
              min-height: 100px;
              resize: none;
              font-size: 0.95rem;
              outline: none;
              transition: border-color 0.2s;
            }
            .studio-textarea:focus {
              border-color: var(--accent-primary);
            }
            .suggestion-chip {
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              color: var(--text-secondary);
              padding: 6px 12px;
              border-radius: 99px;
              font-size: 0.7rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
            }
            .suggestion-chip:hover {
              background: rgba(139, 92, 246, 0.1);
              border-color: var(--accent-primary);
              color: white;
              transform: translateY(-1px);
            }
            .studio-btn {
              padding: 16px 24px !important;
              border-radius: 16px !important;
              height: auto !important;
              min-width: 180px;
            }

        .repo-select-minimal {
          background: transparent;
          border: none;
          color: white;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 4px;
          outline: none;
          transition: background 0.2s;
        }
        .repo-select-minimal:hover {
          background: rgba(255,255,255,0.05);
        }
        .repo-select-minimal option {
          background: #1a1a1a;
          color: white;
        }
        .btn-icon {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 50%;
          transition: all 0.2s;
        }
        .btn-icon:hover {
          color: white;
          background: rgba(255,255,255,0.1);
        }
        .btn-icon.spinning svg {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .error-banner {
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.2);
          padding: 0.75rem 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }
        .error-banner p {
          margin: 0;
          font-size: 0.85rem;
          color: var(--accent-rose);
        }
        .close-btn {
          margin-left: auto;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 1.2rem;
        }
        .animate-slide-down {
          animation: slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slide-down {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        .modal-content {
          background: var(--bg-secondary);
          border: 1px solid var(--border-medium);
          padding: 2rem;
          border-radius: 24px;
          max-width: 450px;
          width: 90%;
          text-align: center;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        }
        .modal-content h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: white;
        }
        .modal-content p {
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        .btn-danger {
          background: var(--accent-rose);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .btn-danger:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        .animate-scale-up {
          animation: scale-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes scale-up {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .model-select-dashboard {
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-medium);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.9rem;
          outline: none;
          min-width: 240px;
        }
        .model-select-dashboard:focus {
          border-color: var(--accent-primary);
        }
        .price-pill {
          background: rgba(139, 92, 246, 0.1);
          color: var(--accent-primary);
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          border: 1px solid rgba(139, 92, 246, 0.2);
          display: inline-block;
        }
        .repo-builder {
          grid-column: span 2;
          background: rgba(124, 58, 237, 0.05) !important;
          border: 1px solid rgba(139, 92, 246, 0.3) !important;
        }
        .framework-badge {
          background: rgba(255,255,255,0.1);
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .domains-container {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }
        .domain-section {
          background: rgba(255, 255, 255, 0.02);
          padding: 1.5rem;
          border-radius: 16px;
          border-left: 4px solid var(--accent-primary);
        }
        .domain-title {
          font-size: 0.9rem;
          color: var(--accent-primary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 800;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .domain-title::after {
          content: '';
          height: 1px;
          flex: 1;
          background: linear-gradient(to right, rgba(139, 92, 246, 0.3), transparent);
        }
        .segments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
        }
        .dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
        }
        .pulse {
          animation: pulse-green 2s infinite;
        }
        @keyframes pulse-green {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .changes-bar {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          width: 90%;
          max-width: 600px;
        }
        .bar-inner {
          background: var(--bg-secondary);
          border: 1px solid var(--accent-primary);
          padding: 1rem 1.5rem;
          border-radius: 99px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          backdrop-filter: blur(20px);
        }
        .changes-info {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.9rem;
        }
        .sparkle {
          font-size: 1.2rem;
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .universal-project-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          position: sticky;
          top: 0;
          z-index: 100;
          margin: -1.5rem -1.5rem 1.5rem -1.5rem;
          border-radius: 20px 20px 0 0;
        }

        .header-left, .header-right {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .repo-switcher-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 14px;
          background: rgba(124, 58, 237, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 99px;
          transition: all 0.2s;
        }

        .repo-switcher-pill:hover {
          background: rgba(124, 58, 237, 0.15);
          border-color: var(--accent-primary);
        }

        .pill-icon {
          font-size: 1rem;
        }

        .sync-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .tab-switcher {
          display: flex;
          background: rgba(0, 0, 0, 0.2);
          padding: 4px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tab-btn:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }

        .tab-btn.active {
          color: white;
          background: var(--accent-primary);
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        }

        .telemetry-strip {
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding: 0.75rem 1.5rem;
          margin: -1.5rem -1.5rem 0 -1.5rem;
          display: flex;
          justify-content: stretch;
        }

        @keyframes slide-up {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
