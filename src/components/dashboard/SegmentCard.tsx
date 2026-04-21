"use client";

import { useState } from "react";

interface Segment {
  id: string;
  name: string;
  type: string;
  file_path: string;
  description: string;
}

interface SegmentCardProps {
  segment: Segment;
  repoId: string;
  onEditSuccess?: (newCode: string, filePath: string) => void;
}

export default function SegmentCard({ segment, repoId, onEditSuccess }: SegmentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/builder/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoId,
          segmentId: segment.id,
          userPrompt: prompt
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate edit");

      if (onEditSuccess) {
        onEditSuccess(data.updatedCode, data.filePath);
      }
      setIsEditing(false);
      setPrompt("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'navigation': return '🧭';
      case 'layout': return '🏗️';
      case 'page': return '📄';
      case 'style': return '🎨';
      default: return '🧩';
    }
  };

  return (
    <div className="segment-card glass-panel">
      <div className="segment-header">
        <span className="segment-icon">{getIcon(segment.type)}</span>
        <div className="segment-info">
          <h3>{segment.name}</h3>
          <p className="file-path">{segment.file_path}</p>
        </div>
      </div>
      
      <p className="segment-desc">{segment.description}</p>

      {!isEditing ? (
        <button 
          className="btn btn-ghost btn-sm" 
          onClick={() => setIsEditing(true)}
          style={{ width: '100%', marginTop: '1rem' }}
        >
          Customize with AI
        </button>
      ) : (
        <div className="edit-interface animate-fade-in" style={{ marginTop: '1rem' }}>
          <textarea 
            className="form-input" 
            placeholder="What change do you want to make? (e.g. 'Make the background semi-transparent blur')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ fontSize: '0.85rem', minHeight: '80px' }}
          />
          {error && <p className="error-msg">{error}</p>}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button 
              className="btn btn-primary btn-sm" 
              style={{ flex: 1 }}
              onClick={handleEdit}
              disabled={isLoading || !prompt}
            >
              {isLoading ? "Generating..." : "Generate Change"}
            </button>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => {
                setIsEditing(false);
                setError(null);
              }}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .segment-card {
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: transform 0.2s, border-color 0.2s;
        }
        .segment-card:hover {
          border-color: var(--accent-violet);
          transform: translateY(-2px);
        }
        .segment-header {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .segment-icon {
          font-size: 1.5rem;
        }
        .segment-info h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }
        .file-path {
          font-family: monospace;
          font-size: 0.7rem;
          color: var(--text-muted);
          margin: 0;
        }
        .segment-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.4;
        }
        .error-msg {
          color: var(--accent-rose);
          font-size: 0.75rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}
