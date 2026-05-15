import React, { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api";

export default function SubscriptionModal({ onClose, currentPlan = "Free" }) {
  const [plans, setPlans] = useState([]);
  const [step, setStep] = useState("plans");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const normalizedCurrentPlan = currentPlan.toLowerCase();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/plans`, {
          headers: {
            Accept: "application/json",
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch plans");
        }

        setPlans(data.data || []);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const formatLimit = (value, label) => {
    if (value === null || value === undefined) return `Unlimited ${label}`;
    return `${value} ${label}`;
  };

  const choosePlan = (plan) => {
    if (plan.key === normalizedCurrentPlan) return;

    setSelectedPlan(plan);
    setPaymentMethod(plan.key === "free" ? "free" : "");
    setStep("payment");
  };

  const confirmPayment = async () => {
    if (!paymentMethod) {
      alert("Please choose a payment method");
      return;
    }

    try {
      setPaying(true);

      const res = await fetch(`${API_BASE}/subscription/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: selectedPlan.key,
          payment_method: paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Payment failed");
      }

      alert("Subscription updated successfully!");
      onClose();
      window.location.reload();
    } catch (err) {
      alert(err.message || "Something went wrong");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="subscription-modal wide"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="subscription-close" onClick={onClose}>
          ✕
        </button>

        {step === "plans" && (
          <>
            <div className="subscription-icon">👑</div>

            <h2>Choose Your Plan</h2>

            <p className="subscription-subtitle">
              Current plan: <strong>{currentPlan}</strong>
            </p>

            {loading && <p>Loading plans...</p>}
            {error && <p style={{ color: "crimson" }}>{error}</p>}

            {!loading && !error && (
              <div className="user-plans-grid">
                {plans.map((plan) => {
                  const isCurrent = plan.key === normalizedCurrentPlan;

                  return (
                    <div
                      key={plan.key}
                      className={`user-plan-card ${
                        plan.key === "premium" ? "featured" : ""
                      } ${isCurrent ? "current-plan-card" : ""}`}
                    >
                      {plan.key === "premium" && (
                        <span className="best-badge">Best Value</span>
                      )}

                      <h3>{plan.name}</h3>

                      <div className="plan-price">
                        ${Number(plan.monthly_price).toFixed(2)}
                        <span>/month</span>
                      </div>

                      <div className="plan-limits">
                        <p>{formatLimit(plan.story_limit, "Stories")}</p>
                        <p>{formatLimit(plan.image_limit, "Images")}</p>
                        <p>
                          {formatLimit(
                            plan.child_profile_limit,
                            "Child Profiles"
                          )}
                        </p>
                      </div>

                      <div className="plan-features-list">
                        {(plan.features || []).map((feature, index) => (
                          <span key={index}>✓ {feature}</span>
                        ))}
                      </div>

                      <button
                        type="button"
                        className={`select-plan-btn ${plan.key}`}
                        onClick={() => choosePlan(plan)}
                        disabled={isCurrent}
                      >
                        {isCurrent ? "Current Plan" : `Choose ${plan.name}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {step === "payment" && selectedPlan && (
          <>
            <button
              type="button"
              className="back-btn"
              onClick={() => setStep("plans")}
            >
              ← Back
            </button>

            <div className="subscription-icon">
              {selectedPlan.key === "free" ? "✅" : "💳"}
            </div>

            <h2>
              {selectedPlan.key === "free"
                ? "Switch to Free Plan"
                : "Payment Method"}
            </h2>

            <p className="subscription-subtitle">
              You selected <strong>{selectedPlan.name}</strong> plan
              {selectedPlan.key !== "free" &&
                ` for $${Number(selectedPlan.monthly_price).toFixed(2)}/month`}
            </p>

            {selectedPlan.key !== "free" && (
              <>
                <div className="payment-options">
                  <button
                    type="button"
                    className={
                      paymentMethod === "card"
                        ? "payment-card active"
                        : "payment-card"
                    }
                    onClick={() => setPaymentMethod("card")}
                  >
                    💳 Credit / Debit Card
                  </button>

                
                
                </div>

                {paymentMethod === "card" && (
                  <div className="card-form">
                    <input placeholder="Card Holder Name" />
                    <input placeholder="Card Number" />
                    <div className="card-row">
                      <input placeholder="MM/YY" />
                      <input placeholder="CVV" />
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              type="button"
              className="confirm-payment-btn"
              onClick={confirmPayment}
              disabled={paying}
            >
              {paying
                ? "Processing..."
                : selectedPlan.key === "free"
                ? "Confirm Free Plan"
                : "Confirm Payment"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}