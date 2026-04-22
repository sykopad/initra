"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteProject } from "@/lib/actions/projects";
import { SERVICE_LIBRARY } from "@/lib/engine/service-library";

interface ProjectItemProps {
  session: any;
}

export default function ProjectItem({ session }: ProjectItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${session.project_name || 'this project'}? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProject(session.id);
    } catch (err: any) {
      alert("Failed to delete project: " + err.message);
      setIsDeleting(false);
    }
  };

  const template = Array.isArray(session.project_templates) ? session.project_templates[0] : session.project_templates;
  const services = session.generated_config?.selectedServices || [];

  return (
    <div className={`project-item ${isDeleting ? 'deleting' : ''}`} style={{ opacity: isDeleting ? 0.5 : 1 }}>
      <div className="project-info" style={{ flex: 1 }}>
        <span className="icon">
          {template?.icon_emoji || '📁'}
        </span>
        <div style={{ flex: 1 }}>
          <h4>{session.project_name || 'Untitled Project'}</h4>
          <span className="template">
            {template?.name} • {new Date(session.created_at).toLocaleDateString()}
          </span>
          {services.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {services.map((slug: string) => {
                const svc = SERVICE_LIBRARY.find(s => s.slug === slug);
                if (!svc) return null;
                return (
                  <span key={slug} title={svc.name} style={{
                    fontSize: '0.7rem', 
                    padding: '0.1rem 0.4rem', 
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {svc.icon} {svc.name}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <div className="project-actions" style={{ display: 'flex', gap: '0.5rem' }}>
        <Link href={`/shared/${session.share_slug}`} className="btn-link">View Files</Link>
        <button 
          onClick={handleDelete} 
          disabled={isDeleting}
          className="btn-icon-delete"
          title="Delete Project"
          style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', fontSize: '1.2rem' }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
