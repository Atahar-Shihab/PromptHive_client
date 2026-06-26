"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Spinner } from "@/components/Spinner";
import { EmptyState } from "@/components/dashboard/NeuralWidgets";

export default function AdminReportsPage() {
  const [reports, setReports] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      setReports(await apiFetch("/api/reports"));
    } catch (requestError) {
      const message = requestError?.message ?? "Could not load reports.";
      setError(message);
      toast.error(message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function action(id, status) {
    try {
      await apiFetch(`/api/reports/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      toast.success("Report updated");
      load();
    } catch (requestError) {
      toast.error(requestError?.message ?? "Could not update report.");
    }
  }

  if (error) return <EmptyState title="Reports unavailable" text={error} actionHref="/admin" actionLabel="Back to Admin" />;
  if (!reports) return <Spinner />;

  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Prompt</th><th>Reporter</th><th>Reason</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report._id}>
              <td>{report.promptId?.title ?? "Removed prompt"}</td>
              <td>{report.reporter?.email}</td>
              <td>{report.reason}</td>
              <td>{report.status}</td>
              <td>{formatDate(report.createdAt)}</td>
              <td className="action-row">
                <button className="button small danger" onClick={() => action(report._id, "removed")}>Remove Prompt</button>
                <button className="button small secondary" onClick={() => action(report._id, "warned")}>Warn Creator</button>
                <button className="button small secondary" onClick={() => action(report._id, "dismissed")}>Dismiss</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
