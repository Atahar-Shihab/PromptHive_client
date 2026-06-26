"use client";

import { X } from "lucide-react";
import { toast } from "react-toastify";
import { apiFetch } from "@/lib/api";

const reasons = ["Inappropriate Content", "Spam", "Copyright Violation", "Unsafe Advice", "Other"];

export function ReportModal({ promptId, onClose }) {
  async function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await apiFetch(`/api/prompts/${promptId}/reports`, {
        method: "POST",
        body: JSON.stringify({
          reason: data.get("reason"),
          description: data.get("description")
        })
      });
      toast.success("Report submitted for admin review");
      onClose();
    } catch (error) {
      toast.error(error?.message ?? "Could not submit report");
    }
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={submit}>
        <button type="button" className="icon-button close" onClick={onClose} aria-label="Close report modal">
          <X size={18} />
        </button>
        <h2>Report Prompt</h2>
        <label>
          Reason
          <select name="reason">
            {reasons.map((reason) => (
              <option key={reason}>{reason}</option>
            ))}
          </select>
        </label>
        <label>
          Optional Description
          <textarea name="description" rows={4} />
        </label>
        <button className="button" type="submit">
          Submit Report
        </button>
      </form>
    </div>
  );
}
