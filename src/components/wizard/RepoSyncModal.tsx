"use client";

import { useState, useEffect } from "react";

interface RepoSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (settings: RepoSettings) => void;
  initialName: string;
  isPushing: boolean;
}

export interface RepoSettings {
  name: string;
  description: string;
  isPrivate: boolean;
}

export default function RepoSyncModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  initialName,
  isPushing 
}: RepoSyncModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("Project bootstrapped with Initra AI (https://initra.app)");
  const [isPrivate, setIsPrivate] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setName(initialName.toLowerCase().replace(/\s+/g, '-'));
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card card-glass animate-in">
        <div className="modal-header">
          <div className="header-icon">🐙</div>
          <h3>GitHub Repository Settings</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Repository Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="my-awesome-agent"
              disabled={isPushing}
            />
            <p className="input-hint">Will be created under your GitHub account.</p>
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3}
              placeholder="What does this agent do?"
              disabled={isPushing}
            />
          </div>

          <div className="form-group inline">
            <div className="switch-wrapper">
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={isPrivate} 
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  disabled={isPushing}
                />
                <span className="slider round"></span>
              </label>
              <span>{isPrivate ? "Private Repository" : "Public Repository"}</span>
            </div>
            <p className="input-hint">
              {isPrivate 
                ? "Only you and authorized collaborators can see this repo." 
                : "Anyone on the internet can see this repository."}
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={isPushing}>
            Cancel
          </button>
          <button 
            className={`btn btn-primary ${isPushing ? "loading" : ""}`} 
            onClick={() => onConfirm({ name, description, isPrivate })}
            disabled={isPushing || !name}
          >
            {isPushing ? "Creating Repository..." : "🚀 Create & Push"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-card {
          width: 100%;
          max-width: 500px;
          padding: 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .animate-in {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .modal-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          position: relative;
        }

        .header-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        h3 {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .close-btn {
          position: absolute;
          top: -10px;
          right: -10px;
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
        }

        input, textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: white;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        input:focus, textarea:focus {
          outline: none;
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
        }

        .input-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.4rem;
        }

        .switch-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
          font-size: 0.95rem;
        }

        /* Switch Styling */
        .switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.1);
          transition: .4s;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
        }

        input:checked + .slider {
          background-color: var(--primary);
        }

        input:focus + .slider {
          box-shadow: 0 0 1px var(--primary);
        }

        input:checked + .slider:before {
          transform: translateX(24px);
        }

        .slider.round {
          border-radius: 34px;
        }

        .slider.round:before {
          border-radius: 50%;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .loading {
          position: relative;
          color: transparent !important;
        }

        .loading:after {
          content: "";
          position: absolute;
          width: 18px;
          height: 18px;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          margin: auto;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
