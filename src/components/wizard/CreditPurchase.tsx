"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useState } from "react";

interface CreditPurchaseProps {
  userId: string;
  onSuccess?: (creditsAdded: number) => void;
}

const PURCHASE_OPTIONS = [
  { amount: "5.00", credits: 100, label: "$5 for 100 Credits" },
  { amount: "10.00", credits: 200, label: "$10 for 200 Credits" },
  { amount: "25.00", credits: 500, label: "$25 for 500 Credits" },
];

export default function CreditPurchase({ userId, onSuccess }: CreditPurchaseProps) {
  const [selectedOption, setSelectedOption] = useState(PURCHASE_OPTIONS[0]);
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
    <div className="credit-purchase-container">
      <div className="option-selector">
        {PURCHASE_OPTIONS.map((opt) => (
          <button
            key={opt.amount}
            className={`option-btn ${selectedOption.amount === opt.amount ? 'active' : ''}`}
            onClick={() => setSelectedOption(opt)}
          >
            <span className="amount">{opt.label}</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <PayPalScriptProvider options={{ clientId: clientId, currency: "USD" }}>
          <PayPalButtons
            key={selectedOption.amount} // Force re-render when option changes
            style={{ layout: "vertical", color: "blue", shape: "rect", label: "buynow" }}
            createOrder={(data, actions) => {
              return actions.order.create({
                intent: "CAPTURE",
                purchase_units: [
                  {
                    custom_id: `credits:${userId}`,
                    amount: {
                      currency_code: "USD",
                      value: selectedOption.amount,
                    },
                    description: `Initra AI - ${selectedOption.credits} Credits Purchase`,
                  },
                ],
              });
            }}
            onApprove={async (data, actions) => {
              if (actions.order) {
                await actions.order.capture();
                setStatus('success');
                if (onSuccess) onSuccess(selectedOption.credits);
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
          🎉 Credits purchased successfully! Your balance will be updated in a few seconds.
        </div>
      )}

      <style jsx>{`
        .credit-purchase-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .option-selector {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .option-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }
        .option-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .option-btn.active {
          background: rgba(99, 102, 241, 0.1);
          border-color: #6366f1;
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
