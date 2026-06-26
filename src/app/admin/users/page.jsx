"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Spinner } from "@/components/Spinner";
import { EmptyState } from "@/components/dashboard/NeuralWidgets";

export default function AdminUsersPage() {
  const [users, setUsers] = useState(null);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [error, setError] = useState("");

  async function load(page = 1) {
    try {
      setError("");
      const result = await apiFetch(`/api/users?page=${page}&limit=10`);
      setUsers(result.data);
      setMeta(result.meta);
    } catch (requestError) {
      const message = requestError?.message ?? "Could not load users.";
      setError(message);
      toast.error(message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeRole(id, role) {
    try {
      await apiFetch(`/api/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
      toast.success("Role updated");
      load(meta.page);
    } catch (requestError) {
      toast.error(requestError?.message ?? "Could not update role.");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this user?")) return;
    try {
      await apiFetch(`/api/users/${id}`, { method: "DELETE" });
      toast.success("User deleted");
      load(meta.page);
    } catch (requestError) {
      toast.error(requestError?.message ?? "Could not delete user.");
    }
  }

  if (error) return <EmptyState title="Users unavailable" text={error} actionHref="/admin" actionLabel="Back to Admin" />;
  if (!users) return <Spinner />;

  return (
    <>
      <div className="table-wrap">
        <table>
          <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Subscription</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map((user, index) => {
              const adminUserId = user.recordId ?? user.id;
              const rowKey = `${adminUserId}-${user.email ?? index}`;

              return (
                <tr key={rowKey}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select value={user.role} onChange={(event) => changeRole(adminUserId, event.target.value)}>
                      <option value="user">user</option>
                      <option value="creator">creator</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td><span className="status-pill">{user.subscription}</span></td>
                  <td><button className="icon-button" onClick={() => remove(adminUserId)} title="Delete user"><Trash2 size={16} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="pagination-row">
        <button className="button secondary small" disabled={meta.page <= 1} onClick={() => load(meta.page - 1)}>
          <ChevronLeft size={16} /> Previous
        </button>
        <span className="status-pill">Page {meta.page} of {meta.totalPages} - {meta.total} users</span>
        <button className="button secondary small" disabled={meta.page >= meta.totalPages} onClick={() => load(meta.page + 1)}>
          Next <ChevronRight size={16} />
        </button>
      </div>
    </>
  );
}
