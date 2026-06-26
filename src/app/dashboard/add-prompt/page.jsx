"use client";

import { PromptForm } from "@/components/PromptForm";

export default function AddPromptPage() {
  return (
    <>
      <div className="page-heading" style={{ width: "100%", margin: 0 }}>
        <p className="eyebrow">Add prompt</p>
        <h1>Submit a new prompt for review</h1>
        <p>New prompts are marked pending until an admin approves them.</p>
      </div>
      <PromptForm />
    </>
  );
}
