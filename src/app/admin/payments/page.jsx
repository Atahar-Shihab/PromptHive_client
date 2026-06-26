"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { Spinner } from "@/components/Spinner";
import { EmptyState } from "@/components/dashboard/NeuralWidgets";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState(null);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [error, setError] = useState("");

  async function load(page = 1) {
    try {
      setError("");
      const result = await apiFetch(`/api/payments?page=${page}&limit=10`);
      setPayments(result.data);
      setMeta(result.meta);
    } catch (requestError) {
      const message = requestError?.message ?? "Could not load payments.";
      setError(message);
      toast.error(message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (error) return <EmptyState title="Payments unavailable" text={error} actionHref="/admin" actionLabel="Back to Admin" />;
  if (!payments) return <Spinner />;
  return (
    <>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Transaction</th><th>Email</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment._id}>
                <td>{payment.transactionId}</td>
                <td>{payment.email}</td>
                <td>${payment.amount}</td>
                <td><span className="status-pill">{payment.status}</span></td>
                <td>{formatDate(payment.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination-row">
        <button className="button secondary small" disabled={meta.page <= 1} onClick={() => load(meta.page - 1)}>
          <ChevronLeft size={16} /> Previous
        </button>
        <span className="status-pill">Page {meta.page} of {meta.totalPages} - {meta.total} payments</span>
        <button className="button secondary small" disabled={meta.page >= meta.totalPages} onClick={() => load(meta.page + 1)}>
          Next <ChevronRight size={16} />
        </button>
      </div>
    </>
  );
}
