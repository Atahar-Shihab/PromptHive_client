"use client";

export function BrandMark({ className = "", title = "PromptHive" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
      focusable="false"
    >
      <path
        className="brand-mark-cell brand-mark-cell-main"
        d="M24 5.5 39.2 14.3v17.4L24 40.5 8.8 31.7V14.3L24 5.5Z"
      />
      <path
        className="brand-mark-cell brand-mark-cell-left"
        d="M14.3 20.1 21 16.2l6.7 3.9v7.8L21 31.8l-6.7-3.9v-7.8Z"
      />
      <path
        className="brand-mark-cell brand-mark-cell-right"
        d="M26.1 14.6 31.8 11.3l5.7 3.3v6.6l-5.7 3.3-5.7-3.3v-6.6Z"
      />
      <path
        className="brand-mark-caret"
        d="m18.8 20.8 4.2 3.3-4.2 3.3M25.3 28.1h6.8"
      />
      <path
        className="brand-mark-orbit"
        d="M15.5 33.2c5.6 3.9 14.1 3.3 19.1-1.7M32.5 14.9c-5.6-3.8-13.9-3.1-18.8 1.8"
      />
    </svg>
  );
}
