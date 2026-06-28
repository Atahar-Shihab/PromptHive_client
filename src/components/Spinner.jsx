export function Spinner({ label = "Loading" }) {
  return (
    <div className="spinner-wrap">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="market-loader-wrap">
      <article className="market-loader-card" role="status" aria-live="polite">
        <div className="hive-loader" aria-hidden="true">
          <span className="hive-loader-core" />
        </div>
        <div className="market-loader-copy">
          <span>PromptHive sync</span>
          <strong>Curating marketplace signals</strong>
          <p>Loading public prompts, premium vault cards, ratings, and creator metadata.</p>
        </div>
        <div className="loader-stream" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </article>

      <div className="prompt-grid skeleton-grid" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="skeleton-card" key={index}>
            <span className="skeleton-thumb" />
            <span className="skeleton-line wide" />
            <span className="skeleton-line medium" />
            <span className="skeleton-tags">
              <i />
              <i />
              <i />
            </span>
            <span className="skeleton-footer">
              <i />
              <i />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
