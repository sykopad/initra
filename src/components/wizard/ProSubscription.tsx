"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useState } from "react";

interface ProSubscriptionProps {
  userId: string;
  onSuccess?: () => void;
  layout?: 'portrait' | 'minimal';
}

export default function ProSubscription({ userId, onSuccess, layout = 'portrait' }: ProSubscriptionProps) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const planId = process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_PRO || "P-DEFAULT_PRO_PLAN";

  if (!clientId) {
    return (
      <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '8px', color: '#f59e0b', fontSize: '0.85rem' }}>
        ⚠️ PayPal Client ID not configured.
      </div>
    );
  }

  return (
    <div className={`pro-upgrade-container ${layout}`}>
      {layout === 'portrait' && (
        <div className="pro-benefit-card">
          <h4>Initra Pro Monthly</h4>
          <p className="price">$19.00 <span className="period">/ month</span></p>
          <ul className="benefits">
            <li>🚀 <strong>Managed Infrastructure</strong>: Hatch ventures on Initra's Vercel account.</li>
            <li>🛡️ <strong>Private Blueprints</strong>: Save and share ventures privately.</li>
            <li>🧠 <strong>Elite Models</strong>: Priority access to Claude 3.7 & GPT-4o.</li>
            <li>⚡ <strong>Advanced Analytics</strong>: Deep telemetry for all birthed ventures.</li>
            <li>🎁 <strong>Monthly Credits</strong>: 200 free credits every month.</li>
          </ul>
        </div>
      )}

      <div style={{ marginTop: layout === 'minimal' ? '0' : '1.5rem' }}>
        <PayPalScriptProvider options={{ 
          clientId: clientId, 
          currency: "USD",
          vault: true, // Required for subscriptions
          intent: "subscription"
        }}>
          <PayPalButtons
            style={{ layout: "vertical", color: "blue", shape: "rect", label: "subscribe" }}
            createSubscription={(data, actions) => {
              return actions.subscription.create({
                plan_id: planId,
                custom_id: `pro_subscription:${userId}`,
              });
            }}
            onApprove={async (data, actions) => {
              setStatus('success');
              if (onSuccess) onSuccess();
            }}
            onError={(err) => {
              console.error("PayPal Subscription Error:", err);
              setStatus('error');
            }}
          />
        </PayPalScriptProvider>
      </div>

      {status === 'success' && (
        <div className="success-msg">
          🎉 Subscription active! Your Pro status will be activated shortly.
        </div>
      )}

      <style jsx>{`
        .pro-upgrade-container {
          display: flex;
          flex-direction: column;
        }
        .pro-benefit-card {
          background: rgba(124, 58, 237, 0.05);
          border: 1px solid rgba(124, 58, 237, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
        }
        h4 {
          margin: 0;
          font-size: 1.1rem;
          color: var(--accent-primary-light);
        }
        .price {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0.5rem 0 1rem 0;
          color: white;
        }
        .period {
          font-size: 0.85rem;
          font-weight: 400;
          color: var(--text-muted);
        }
        .benefits {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .benefits li {
          font-size: 0.85rem;
          color: var(--text-secondary);
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .benefits li:before {
          content: "✓";
          color: var(--accent-primary);
          font-weight: 800;
        }
        .success-msg {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid #10b981;
          border-radius: 8px;
          color: #10b981;
          text-align: center;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
