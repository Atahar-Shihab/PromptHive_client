"use client";

import { PromptForm } from "@/components/PromptForm";

export default function CreatorAddPromptPage() {
  return (
    <>
      <div className="page-heading" style={{ width: "100%", margin: 0 }}>
        <p className="eyebrow">Creator prompt</p>
        <h1>Add a creator prompt</h1>
      </div>
      <PromptForm redirectTo="/creator/my-prompts" />
    </>
  );
}
