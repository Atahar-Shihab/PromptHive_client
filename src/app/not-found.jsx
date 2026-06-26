import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="page-heading">
        <p className="eyebrow">404</p>
        <h1>This page is outside the prompt map.</h1>
        <p>Return to the marketplace and keep exploring verified AI prompts.</p>
        <Link href="/prompts" className="button">
          Browse Prompts
        </Link>
      </div>
    </section>
  );
}
