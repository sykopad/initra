"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="legal-container">
      <Navbar />
      
      <main className="legal-content animate-fade-in">
        <header className="legal-header">
          <h1>Terms and Conditions</h1>
          <p>Last updated: April 23, 2026</p>
        </header>

        <section className="glass-panel legal-card">
          <div className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Initra, you agree to be bound by these Terms and Conditions and all applicable laws and regulations.
              If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </div>

          <div className="legal-section">
            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on Initra's website for personal, 
              non-commercial transitory viewing only.
            </p>
            <ul>
              <li>Modify or copy the materials;</li>
              <li>Use the materials for any commercial purpose;</li>
              <li>Attempt to decompile or reverse engineer any software contained on Initra;</li>
              <li>Remove any copyright or other proprietary notations from the materials.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>3. Disclaimer</h2>
            <p>
              The materials on Initra's website are provided on an 'as is' basis. Initra makes no warranties, expressed or implied, 
              and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions 
              of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </div>

          <div className="legal-section">
            <h2>4. Limitations</h2>
            <p>
              In no event shall Initra or its suppliers be liable for any damages (including, without limitation, damages for loss of data 
              or profit, or due to business interruption) arising out of the use or inability to use the materials on Initra's website.
            </p>
          </div>

          <div className="legal-section">
            <h2>5. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Initra operates 
              and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </p>
          </div>

          <div className="legal-footer">
            <Link href="/login" className="btn btn-secondary">Back to Login</Link>
          </div>
        </section>
      </main>

      <style jsx>{`
        .legal-container {
          min-height: 100vh;
          background: var(--bg-primary);
          padding-top: 120px;
          padding-bottom: 4rem;
        }

        .legal-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 var(--space-lg);
        }

        .legal-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .legal-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          background: var(--gradient-text);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .legal-header p {
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .legal-card {
          padding: 3rem;
        }

        .legal-section {
          margin-bottom: 2.5rem;
        }

        .legal-section h2 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--accent-primary);
        }

        .legal-section p {
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 1rem;
        }

        .legal-section ul {
          padding-left: 1.5rem;
          color: var(--text-secondary);
          line-height: 1.7;
        }

        .legal-section li {
          margin-bottom: 0.5rem;
        }

        .legal-footer {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-subtle);
          text-align: center;
        }
      `}</style>
    </div>
  );
}
