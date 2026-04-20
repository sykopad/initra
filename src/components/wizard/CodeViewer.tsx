"use client";

import { useEffect, useState } from "react";
import { createHighlighter } from "shiki";

interface CodeViewerProps {
  code: string;
  language: string;
  filename?: string;
}

export default function CodeViewer({ code, language, filename }: CodeViewerProps) {
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initHighlighter() {
      try {
        const highlighter = await createHighlighter({
          themes: ["vitesse-dark"],
          langs: ["typescript", "javascript", "json", "markdown", "python", "go", "bash", "yaml", "css", "html"],
        });

        if (isMounted) {
          const html = highlighter.codeToHtml(code, {
            lang: language === "py" ? "python" : language === "sh" ? "bash" : language === "yml" ? "yaml" : language,
            theme: "vitesse-dark",
          });
          setHighlighted(html);
          setLoading(false);
        }
      } catch (err) {
        console.error("Highlighter error:", err);
        if (isMounted) {
          setHighlighted(`<pre><code>${code}</code></pre>`);
          setLoading(false);
        }
      }
    }

    initHighlighter();

    return () => {
      isMounted = false;
    };
  }, [code, language]);

  if (loading) {
    return (
      <div className="code-viewer-skeleton">
        <div className="skeleton-line" style={{ width: '80%' }}></div>
        <div className="skeleton-line" style={{ width: '90%' }}></div>
        <div className="skeleton-line" style={{ width: '70%' }}></div>
      </div>
    );
  }

  return (
    <div className="code-viewer-container">
      {filename && (
        <div className="code-viewer-header">
          <span className="code-viewer-filename">{filename}</span>
        </div>
      )}
      <div 
        className="code-viewer-body"
        dangerouslySetInnerHTML={{ __html: highlighted || "" }} 
      />
      
      <style jsx global>{`
        .shiki {
          background-color: transparent !important;
          padding: 1.5rem;
          margin: 0;
          font-family: var(--font-mono);
          font-size: 0.85rem;
          line-height: 1.6;
          overflow-x: auto;
        }
        .code-viewer-container {
          background: #121212;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          overflow: hidden;
          position: relative;
        }
        .code-viewer-header {
          background: rgba(255,255,255,0.05);
          padding: 0.5rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
        }
        .code-viewer-filename {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-family: var(--font-mono);
        }
        .code-viewer-skeleton {
          padding: 1.5rem;
          background: #121212;
          border-radius: 8px;
        }
        .skeleton-line {
          height: 12px;
          background: rgba(255,255,255,0.05);
          margin-bottom: 10px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
