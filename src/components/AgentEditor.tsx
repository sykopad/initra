"use client";

import { useState, useCallback, useEffect } from "react";

interface RuleBlock {
  id: string;
  title: string;
  content: string;
}

interface AgentEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  onClose: () => void;
}

export default function AgentEditor({ initialContent, onSave, onClose }: AgentEditorProps) {
  const [blocks, setBlocks] = useState<RuleBlock[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Parse markdown into blocks based on ## headers
  useEffect(() => {
    const lines = initialContent.split("\n");
    const newBlocks: RuleBlock[] = [];
    let currentBlock: RuleBlock | null = null;
    let preamble = "";

    lines.forEach((line) => {
      if (line.startsWith("## ")) {
        if (currentBlock) newBlocks.push(currentBlock);
        currentBlock = {
          id: Math.random().toString(36).substring(2, 9),
          title: line.replace("## ", ""),
          content: "",
        };
      } else if (!currentBlock) {
        preamble += line + "\n";
      } else {
        currentBlock.content += line + "\n";
      }
    });

    if (currentBlock) newBlocks.push(currentBlock);
    
    // Add preamble as first block if it exists
    if (preamble.trim()) {
      newBlocks.unshift({
        id: "preamble",
        title: "Introduction / Header",
        content: preamble,
      });
    }

    setBlocks(newBlocks);
  }, [initialContent]);

  const updateBlockContent = (index: number, content: string) => {
    setBlocks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, content } : b))
    );
  };

  const handleSave = () => {
    const fullContent = blocks
      .map((b) => (b.id === "preamble" ? b.content : `## ${b.title}\n${b.content}`))
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
    onSave(fullContent);
  };

  // Drag and drop logic
  const onDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newBlocks = [...blocks];
    const draggedItem = newBlocks[draggedIndex];
    newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setBlocks(newBlocks);
    if (activeIndex === draggedIndex) setActiveIndex(index);
    else if (index <= activeIndex && draggedIndex > activeIndex) setActiveIndex(activeIndex + 1);
    else if (index >= activeIndex && draggedIndex < activeIndex) setActiveIndex(activeIndex - 1);
  };

  return (
    <div className="editor-overlay">
      <div className="editor-window card-glass">
        <header className="editor-header">
          <div className="header-info">
            <span className="icon">✍️</span>
            <div>
              <h3>Custom Rules Editor</h3>
              <p>Reorder sections or edit rules directly.</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Apply & Save</button>
          </div>
        </header>

        <div className="editor-body">
          {/* Sidebar / Section List */}
          <aside className="editor-sidebar">
            <div className="sidebar-label">REORDER SECTIONS</div>
            <div className="section-list">
              {blocks.map((block, idx) => (
                <div
                  key={block.id}
                  draggable={block.id !== "preamble"}
                  onDragStart={() => onDragStart(idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  onDragEnd={() => setDraggedIndex(null)}
                  className={`section-item ${activeIndex === idx ? "active" : ""} ${draggedIndex === idx ? "dragging" : ""}`}
                  onClick={() => setActiveIndex(idx)}
                >
                  <span className="drag-handle">⠿</span>
                  <span className="section-title">{block.title}</span>
                </div>
              ))}
            </div>
          </aside>

          {/* Editor Workspace */}
          <main className="editor-workspace">
            <div className="workspace-header">
              <h4>Editing: {blocks[activeIndex]?.title}</h4>
            </div>
            <textarea
              className="rule-textarea"
              value={blocks[activeIndex]?.content || ""}
              onChange={(e) => updateBlockContent(activeIndex, e.target.value)}
              placeholder="Enter rule content here..."
              spellCheck={false}
            />
          </main>

          {/* Live Preview */}
          <section className="editor-preview">
            <div className="workspace-header">
              <h4>Live Preview</h4>
            </div>
            <div className="preview-content">
              {blocks.map((b, i) => (
                <div key={b.id} className={`preview-block ${activeIndex === i ? "highlight" : ""}`}>
                  {b.id !== "preamble" && <h5>{b.title}</h5>}
                  <pre>{b.content}</pre>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .editor-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(10px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .editor-window {
          width: 100%;
          max-width: 1200px;
          height: 85vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #0a0a0a;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .editor-header {
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.02);
        }

        .header-info {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .header-info h3 {
          font-size: 1.1rem;
          margin: 0;
        }

        .header-info p {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .editor-body {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .editor-sidebar {
          width: 240px;
          border-right: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.01);
          display: flex;
          flex-direction: column;
        }

        .sidebar-label {
          padding: 1rem;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .section-list {
          flex: 1;
          overflow-y: auto;
        }

        .section-item {
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .section-item:hover {
          background: rgba(255,255,255,0.05);
        }

        .section-item.active {
          background: var(--primary-subtle, rgba(124,58,237,0.1));
          border-left: 3px solid var(--primary);
        }

        .section-item.dragging {
          opacity: 0.5;
          background: var(--primary-subtle);
        }

        .drag-handle {
          color: var(--text-muted);
          cursor: grab;
          font-family: monospace;
        }

        .section-title {
          font-size: 0.85rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .editor-workspace {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #111;
        }

        .workspace-header {
          padding: 0.75rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.02);
        }

        .workspace-header h4 {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--text-muted);
          margin: 0;
        }

        .rule-textarea {
          flex: 1;
          background: transparent;
          border: none;
          color: #eee;
          padding: 1.5rem;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.9rem;
          line-height: 1.6;
          resize: none;
          outline: none;
        }

        .editor-preview {
          width: 380px;
          border-left: 1px solid rgba(255,255,255,0.1);
          background: #000;
          display: flex;
          flex-direction: column;
        }

        .preview-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .preview-block {
          margin-bottom: 1.5rem;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background 0.3s;
        }

        .preview-block.highlight {
          background: rgba(124,58,237,0.05);
          border: 1px solid rgba(124,58,237,0.2);
        }

        .preview-block h5 {
          color: var(--primary-light);
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
        }

        .preview-block pre {
          white-space: pre-wrap;
          font-family: inherit;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
