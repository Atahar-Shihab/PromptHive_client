"use client";

export default function ErrorPage({ reset }) {
  return (
    <section className="section">
      <div className="page-heading">
        <p className="eyebrow">Something broke</p>
        <h1>We could not load this view.</h1>
        <p>The API may be starting up or a request failed. Try again after a moment.</p>
        <button className="button" onClick={reset}>
          Try Again
        </button>
      </div>
    </section>
  );
}
