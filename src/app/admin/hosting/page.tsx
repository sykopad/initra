"use client";

import { useEffect, useState } from "react";
import { getAdminStats } from "@/lib/actions/admin";
import Navbar from "@/components/Navbar";

export default function AdminHostingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ paddingTop: '8rem', textAlign: 'center', color: 'var(--text-muted)' }}>📊 Loading Analytics...</div>;

  const totalRevenue = data.revenue.creditsRevenue + data.revenue.proUpgradesRevenue;
  const estimatedHostingCost = data.stats.totalManaged * 2.50; // Arbitrary estimate for Vercel/compute overhead

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '8rem', paddingBottom: '4rem', maxWidth: '1000px', margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', margin: 0 }}>🛡️ Admin: Hosting & Revenue</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Real-time oversight of platform infrastructure costs vs. income.</p>
          </div>
          <div className="glass-panel" style={{ padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.8rem', border: '1px solid var(--accent-primary)' }}>
            Status: <span style={{ color: 'var(--success)' }}>Active</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {/* Revenue Card */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>Total Revenue</h3>
            <p style={{ fontSize: '3rem', fontWeight: 800, margin: 0 }}>${totalRevenue.toFixed(2)}</p>
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Credit Purchases:</span>
                <span style={{ fontWeight: 600 }}>${data.revenue.creditsRevenue.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Pro Upgrades:</span>
                <span style={{ fontWeight: 600 }}>${data.revenue.proUpgradesRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Hosting Card */}
          <div className="glass-panel" style={{ padding: '2rem', borderColor: estimatedHostingCost > totalRevenue ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-subtle)' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>Infrastructure Cost (Est.)</h3>
            <p style={{ fontSize: '3rem', fontWeight: 800, margin: 0, color: estimatedHostingCost > totalRevenue ? '#ef4444' : 'inherit' }}>
              ${estimatedHostingCost.toFixed(2)}
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Managed Projects:</span>
                <span style={{ fontWeight: 600 }}>{data.stats.totalManaged}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Sovereign Projects:</span>
                <span style={{ fontWeight: 600, color: 'var(--success)' }}>{data.stats.totalSovereign} (Free)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Recent Provisioning Distribution</h3>
          <div style={{ height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ 
              width: `${(data.stats.totalManaged / (data.stats.totalManaged + data.stats.totalSovereign || 1)) * 100}%`, 
              background: 'var(--accent-primary)', 
              height: '100%' 
            }} />
            <div style={{ 
              width: `${(data.stats.totalSovereign / (data.stats.totalManaged + data.stats.totalSovereign || 1)) * 100}%`, 
              background: 'var(--success)', 
              height: '100%' 
            }} />
          </div>
          <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', background: 'var(--accent-primary)', borderRadius: '2px' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Managed Infrastructure ({((data.stats.totalManaged / (data.stats.totalManaged + data.stats.totalSovereign || 1)) * 100).toFixed(1)}%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', background: 'var(--success)', borderRadius: '2px' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Sovereign Infrastructure ({((data.stats.totalSovereign / (data.stats.totalManaged + data.stats.totalSovereign || 1)) * 100).toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
        }
      `}</style>
    </>
  );
}
