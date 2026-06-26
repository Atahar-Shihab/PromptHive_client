"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Elements, CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { motion } from "framer-motion";
import { CheckCircle2, CreditCard, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { apiFetch } from "@/lib/api";
import { Protected } from "@/components/Protected";
import { Spinner } from "@/components/Spinner";

function CheckoutForm({ previous }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [theme, setTheme] = useState("dark");
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    apiFetch("/api/payments/create-intent", { method: "POST", body: JSON.stringify({}) })
      .then((result) => setClientSecret(result.clientSecret))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () => setTheme(root.dataset.theme === "light" ? "light" : "dark");
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const cardOptions = useMemo(() => {
    const light = theme === "light";
    return {
      hidePostalCode: true,
      style: {
        base: {
          color: light ? "#07111f" : "#f8fafc",
          iconColor: light ? "var(--primary-dark)" : "var(--cyan)",
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
          fontSize: "16px",
          fontWeight: "700",
          fontSmoothing: "antialiased",
          "::placeholder": {
            color: light ? "#64748b" : "#cbd5e1"
          }
        },
        complete: {
          color: light ? "#047857" : "#a7f3d0",
          iconColor: light ? "#047857" : "#34d399"
        },
        invalid: {
          color: light ? "#be123c" : "#fda4af",
          iconColor: light ? "#be123c" : "#f87171"
        }
      }
    };
  }, [theme]);

  async function submit(event) {
    event.preventDefault();
    if (!stripe || !elements || !clientSecret) return;
    setPaying(true);
    const card = elements.getElement(CardElement);
    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card }
      });
      if (result.error) {
        toast.error(result.error.message);
        return;
      }
      await apiFetch("/api/payments/confirm", {
        method: "POST",
        body: JSON.stringify({ paymentIntentId: result.paymentIntent.id })
      });
      toast.success("Premium unlocked");
      setSuccess(true);
      window.setTimeout(() => router.push(previous || "/dashboard/profile"), 1200);
    } catch (error) {
      toast.error(error?.message ?? "Payment could not be confirmed");
    } finally {
      setPaying(false);
    }
  }

  if (loading) return <Spinner label="Preparing checkout" />;
  if (success) {
    return (
      <motion.div
        className="checkout-success"
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
      >
        <CheckCircle2 size={42} />
        <h3>Premium unlocked</h3>
        <p>Your private prompt access, premium copy permissions, and badge are active.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="form-panel">
      <label>
        Card Details
        <div className="prompt-content stripe-card-field">
          <CardElement key={theme} options={cardOptions} />
        </div>
      </label>
      <button className="button" disabled={!stripe || paying} type="submit">
        <CreditCard size={18} /> {paying ? "Processing..." : "Pay $5"}
      </button>
    </form>
  );
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const previous = searchParams.get("from") ?? "/dashboard/profile";
  const stripePromise = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    return key ? loadStripe(key) : null;
  }, []);

  return (
    <Protected>
      {(user) => (
        <section className="section payment-stage">
          <div className="page-heading">
            <p className="eyebrow">Premium plan</p>
            <h1>Unlock every private prompt for $5</h1>
            <p>One-time Stripe payment. After payment, your user status updates to Premium and private prompt content unlocks immediately.</p>
          </div>
          {user.subscription === "premium" ? (
            <div className="details-layout payment-layout">
              <motion.div className="payment-panel premium-checkout-card ring-1 ring-white/10" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
                <span className="eyebrow">
                  <CheckCircle2 size={15} /> Premium active
                </span>
                <h2>Your Premium access is already unlocked</h2>
                <p>You can view, copy, review, fork, test, and download every private prompt in PromptHive.</p>
                <Link className="button" href={previous || "/prompts"}>
                  Continue Browsing
                </Link>
              </motion.div>
              <div className="payment-panel">
                <h2>Premium benefits</h2>
                {["Private prompt vault access", "Premium copy permissions", "Premium review and testing", "Creator growth without the free limit"].map((item) => (
                  <p key={item} className="card-bottom" style={{ justifyContent: "flex-start" }}>
                    <CheckCircle2 size={18} color="var(--primary)" /> {item}
                  </p>
                ))}
              </div>
            </div>
          ) : (
          <div className="details-layout payment-layout">
            <motion.div
              className="payment-panel premium-checkout-card ring-1 ring-white/10"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="eyebrow">
                <Sparkles size={15} /> PromptHive Premium
              </span>
              <h2>$5 one-time unlock</h2>
              {["Access private prompts", "Copy premium prompt content", "Review premium prompts", "Publish more than 3 prompts"].map((item) => (
                <p key={item} className="card-bottom" style={{ justifyContent: "flex-start" }}>
                  <CheckCircle2 size={18} color="var(--primary)" /> {item}
                </p>
              ))}
              <p className="trust-note">
                <ShieldCheck size={18} /> Secure Stripe test payment. Your premium status updates immediately after confirmation.
              </p>
            </motion.div>
            <motion.div
              className="payment-panel checkout-panel ring-1 ring-white/10"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2>
                <LockKeyhole size={20} /> Payment Details
              </h2>
              {stripePromise ? (
                <Elements stripe={stripePromise}>
                  <CheckoutForm previous={previous} />
                </Elements>
              ) : (
                <p>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing. Add it to the client environment before testing Stripe.</p>
              )}
            </motion.div>
          </div>
          )}
        </section>
      )}
    </Protected>
  );
}
