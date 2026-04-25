"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="legal-container">
      <Navbar />
      
      <main className="legal-content animate-fade-in">
        <header className="legal-header">
          <h1>Privacy Policy</h1>
          <p>Last updated: April 23, 2026</p>
        </header>

        <section className="glass-panel legal-card">
          <div className="legal-section">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create or modify your account, 
              request support, or otherwise communicate with us. This information may include: name, email, 
              GitHub profile information, and project metadata.
            </p>
          </div>

          <div className="legal-section">
            <h2>2. How We Use Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul>
              <li>Provide, maintain, and improve our services;</li>
              <li>Process transactions and send related information;</li>
              <li>Send you technical notices, updates, and security alerts;</li>
              <li>Respond to your comments and questions;</li>
              <li>Monitor and analyze trends, usage, and activities.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>3. Information Sharing</h2>
            <p>
              We do not share your personal information with third parties except as described in this policy. 
              We may share information with vendors, consultants, and other service providers who need access 
              to such information to carry out work on our behalf.
            </p>
          </div>

          <div className="legal-section">
            <h2>4. Security</h2>
            <p>
              We take reasonable measures to help protect information about you from loss, theft, misuse and 
              unauthorized access, disclosure, alteration, and destruction.
            </p>
          </div>

          <div className="legal-section">
            <h2>5. Your Choices</h2>
            <p>
              You may update or correct your account information at any time by logging into your account 
              and visiting the settings page. You may also request deletion of your data by contacting us.
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
