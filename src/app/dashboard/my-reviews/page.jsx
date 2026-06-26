"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Star } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Spinner } from "@/components/Spinner";
import { EmptyState } from "@/components/dashboard/NeuralWidgets";

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    apiFetch("/api/reviews/me")
      .then((result) => {
        if (alive) setReviews(result);
      })
      .catch((requestError) => {
        if (!alive) return;
        const message = requestError?.message ?? "Could not load your reviews.";
        setError(message);
        toast.error(message);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (error) return <EmptyState title="Reviews unavailable" text={error} actionHref="/dashboard" actionLabel="Back to Dashboard" />;
  if (!reviews) return <Spinner />;

  return (
    <>
      <div className="page-heading" style={{ width: "100%", margin: 0 }}>
        <p className="eyebrow">My reviews</p>
        <h1>Reviews you submitted</h1>
      </div>
      <div className="review-list">
        {reviews.map((review) => (
          <article className="review-card" key={review._id}>
            <div className="card-bottom">
              <strong>{review.promptId?.title ?? "Prompt"}</strong>
              <span><Star size={15} /> {review.rating}</span>
              <span>{formatDate(review.createdAt)}</span>
            </div>
            <p>{review.comment}</p>
          </article>
        ))}
      </div>
    </>
  );
}
