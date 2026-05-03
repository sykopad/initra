"use client";

import React from 'react';
import { getAllDesignPresets } from '@/lib/engine/design-library';
import { DesignPreset } from '@/lib/engine/types';

interface DesignPresetSelectorProps {
  selectedPreset: string | null;
  onSelect: (preset: string | null) => void;
  recommendedPreset?: string;
}

export default function DesignPresetSelector({ 
  selectedPreset, 
  onSelect, 
  recommendedPreset 
}: DesignPresetSelectorProps) {
  const presets = getAllDesignPresets();

  return (
    <div className="design-preset-selector">
      <div className="project-type-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {/* No Preset Option */}
        <div 
          className={`project-type-card ${selectedPreset === null ? 'selected' : ''}`}
          onClick={() => onSelect(null)}
          style={{ textAlign: 'left', padding: '1.5rem', border: selectedPreset === null ? '2px solid var(--primary)' : '1px solid var(--border-subtle)' }}
        >
          <span style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}>📄</span>
          <h3 style={{ marginBottom: '0.5rem' }}>Bare Boilerplate</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            No design constraints. Let the AI decide the styling.
          </p>
        </div>

        {presets.map((preset) => (
          <div 
            key={preset.slug}
            className={`project-type-card ${selectedPreset === preset.slug ? 'selected' : ''}`}
            onClick={() => onSelect(preset.slug)}
            style={{ 
              textAlign: 'left', 
              padding: '1.5rem', 
              border: selectedPreset === preset.slug ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>✨</span>
              <span 
                className="badge"
                style={{ 
                  fontSize: '0.7rem', 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '1rem',
                  backgroundColor: 'rgba(124, 58, 237, 0.1)',
                  color: 'var(--primary-light)',
                  border: '1px solid rgba(124, 58, 237, 0.2)'
                }}
              >
                {preset.slug === recommendedPreset ? 'Recommended' : 'Preset'}
              </span>
            </div>
            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
              {preset.name}
              {preset.slug === recommendedPreset && (
                <span 
                  style={{ 
                    marginLeft: 'auto',
                    fontSize: '0.6rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    color: 'var(--primary-light)'
                  }}
                >
                  Best Match
                </span>
              )}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              {preset.description}
            </p>
            <div style={{ fontSize: '0.75rem', display: 'flex', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <strong>Style:</strong>
              <span>State-of-the-Art UI</span>
            </div>

            {/* Subtle color preview if available */}
            {preset.colors && (
              <div style={{ display: 'flex', gap: '4px', marginTop: '1rem' }}>
                {Object.values(preset.colors).slice(0, 5).map((color, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '2px', 
                      backgroundColor: color,
                      border: '1px solid rgba(255,255,255,0.1)'
                    }} 
                  />
                ))}
              </div>
            )}
            
            {selectedPreset === preset.slug && (
              <div className="checkmark" style={{ background: 'var(--primary)', position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: 'white' }}>
                ✓
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .design-preset-selector {
          margin-top: 2rem;
        }
        .project-type-card {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .project-type-card:hover {
          background: rgba(255, 255, 255, 0.06);
          transform: translateY(-2px);
        }
        .project-type-card.selected {
          background: rgba(124, 58, 237, 0.08);
          border-color: var(--primary) !important;
        }
      `}</style>
    </div>
  );
}
