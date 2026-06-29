"use client";

import { Flag, ShieldAlert, X } from "lucide-react";
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
    <div className="modal-backdrop report-modal-backdrop">
      <form className="modal report-modal" onSubmit={submit}>
        <button type="button" className="icon-button close report-modal-close" onClick={onClose} aria-label="Close report modal">
          <X size={18} />
        </button>
        <div className="report-modal-head">
          <span className="report-modal-icon">
            <Flag size={22} />
          </span>
          <p className="eyebrow">Marketplace safety</p>
          <h2>Report Prompt</h2>
          <p>Send this prompt to admin review with a clear reason. Reports help keep PromptHive useful and trustworthy.</p>
        </div>
        <label className="report-field">
          Reason
          <select name="reason">
            {reasons.map((reason) => (
              <option key={reason}>{reason}</option>
            ))}
          </select>
        </label>
        <label className="report-field">
          Optional Description
          <textarea name="description" rows={4} placeholder="Add context, links, or the exact issue admins should review." />
        </label>
        <div className="report-modal-note">
          <ShieldAlert size={16} />
          <span>Admins can dismiss, warn the creator, or remove reported prompts from the marketplace.</span>
        </div>
        <button className="button report-submit-button" type="submit">
          <Flag size={17} /> Submit Report
        </button>
      </form>
    </div>
  );
}
