"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useState } from "react";

interface ProUpgradeProps {
  userId: string;
  onSuccess?: () => void;
}

export default function ProUpgrade({ userId, onSuccess }: ProUpgradeProps) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return (
      <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '8px', color: '#f59e0b', fontSize: '0.85rem' }}>
        ⚠️ PayPal Client ID not configured.
      </div>
    );
  }

  return (
    <div className="pro-upgrade-container">
      <div className="pro-benefit-card">
        <h4>Initra Pro Tier</h4>
        <p className="price">$29.00 <span className="period">/ one-time access</span></p>
        <ul className="benefits">
          <li>🚀 <strong>Managed Infrastructure</strong>: Hatch ventures on Initra's Vercel account.</li>
          <li>🛡️ <strong>Private Blueprints</strong>: Save and share ventures privately.</li>
          <li>🧠 <strong>Elite Models</strong>: Priority access to Claude 3.7 & GPT-4o.</li>
          <li>⚡ <strong>Advanced Analytics</strong>: Deep telemetry for all birthed ventures.</li>
        </ul>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <PayPalScriptProvider options={{ clientId: clientId, currency: "USD" }}>
          <PayPalButtons
            style={{ layout: "vertical", color: "blue", shape: "rect", label: "checkout" }}
            createOrder={(data, actions) => {
              return actions.order.create({
                intent: "CAPTURE",
                purchase_units: [
                  {
                    custom_id: `pro_upgrade:${userId}`,
                    amount: {
                      currency_code: "USD",
                      value: "29.00",
                    },
                    description: `Initra Pro - Lifetime Managed Infrastructure Access`,
                  },
                ],
              });
            }}
            onApprove={async (data, actions) => {
              if (actions.order) {
                await actions.order.capture();
                setStatus('success');
                if (onSuccess) onSuccess();
              }
            }}
            onError={(err) => {
              console.error("PayPal Error:", err);
              setStatus('error');
            }}
          />
        </PayPalScriptProvider>
      </div>

      {status === 'success' && (
        <div className="success-msg">
          🎉 Upgrade successful! Your Pro status will be active in a few seconds.
        </div>
      )}

      {status === 'error' && (
        <div className="error-msg">
          ❌ Payment failed. Please try again or contact support.
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
        .error-msg {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          border-radius: 8px;
          color: #ef4444;
          text-align: center;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
