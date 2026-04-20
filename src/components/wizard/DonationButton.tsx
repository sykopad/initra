"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useState } from "react";

interface DonationButtonProps {
  userId?: string;
  onSuccess?: (amount: string) => void;
}

export default function DonationButton({ userId, onSuccess }: DonationButtonProps) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="alert alert-warning">
        PayPal Client ID not configured.
      </div>
    );
  }

  return (
    <div className="donation-container" style={{ marginTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>☕ Support Initra</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Help us keep higher-tier models (like Opus 4.7) open for the community with a small donation.
        </p>
      </div>

      <PayPalScriptProvider options={{ clientId: clientId, currency: "USD" }}>
        <PayPalButtons
          style={{ layout: "horizontal", color: "gold", shape: "pill", label: "pay" }}
          createOrder={(data, actions) => {
            return actions.order.create({
              intent: "CAPTURE",
              purchase_units: [
                {
                  custom_id: userId,
                  amount: {
                    currency_code: "USD",
                    value: "5.00", // Default "coffee" amount
                  },
                  description: "Initra AI Architect Coffee Support",
                },
              ],
            });
          }}
          onApprove={async (data, actions) => {
            if (actions.order) {
              const details = await actions.order.capture();
              const amount = details.purchase_units?.[0]?.amount?.value || "0.00";
              setStatus('success');
              if (onSuccess) onSuccess(amount);
            }
          }}
          onError={(err) => {
            console.error("PayPal Error:", err);
            setStatus('error');
          }}
        />
      </PayPalScriptProvider>

      {status === 'success' && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', borderRadius: '8px', textAlign: 'center', color: '#10b981' }}>
          🎉 Thank you for your support! Your account will be upgraded shortly.
        </div>
      )}
    </div>
  );
}
