"use client";

import {
  ArrowLeft,
  ClipboardCheck,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Audit = {
  id: string;
  audit_reference: string;
  title: string;
  department: string;
  auditor: string;
  start_date: string;
  end_date: string | null;
  status: "Planned" | "In Progress" | "Completed" | "Requires Attention";
  findings: number;
  notes: string | null;
  created_at: string;
};

const statusOptions = [
  "All",
  "Planned",
  "In Progress",
  "Completed",
  "Requires Attention",
];

const emptyForm = {
  title: "",
  department: "",
  auditor: "",
  start_date: new Date().toISOString().split("T")[0],
  status: "Planned",
  findings: "0",
  notes: "",
};

export default function AuditsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  async function loadAudits() {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("audits")
      .select("*")
      .order("start_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setAudits([]);
    } else {
      setAudits((data ?? []) as Audit[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAudits();
  }, []);

  const filteredAudits = audits.filter((audit) => {
    const matchesSearch =
      audit.audit_reference.toLowerCase().includes(search.toLowerCase()) ||
      audit.title.toLowerCase().includes(search.toLowerCase()) ||
      audit.department.toLowerCase().includes(search.toLowerCase()) ||
      audit.auditor.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || audit.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const reference = `AUD-${new Date().getFullYear()}-${String(
      audits.length + 1
    ).padStart(3, "0")}`;

    const { error: insertError } = await supabase.from("audits").insert({
      audit_reference: reference,
      title: form.title,
      department: form.department,
      auditor: form.auditor,
      start_date: form.start_date,
      status: form.status,
      findings: Number(form.findings) || 0,
      notes: form.notes || null,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setForm(emptyForm);
    setModalOpen(false);
    setSaving(false);
    await loadAudits();
  }

  function statusClass(status: Audit["status"]) {
    if (status === "Completed") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "In Progress") {
      return "bg-blue-50 text-blue-700";
    }

    if (status === "Requires Attention") {
      return "bg-rose-50 text-rose-700";
    }

    return "bg-amber-50 text-amber-700";
  }

  const summary = {
    total: audits.length,
    inProgress: audits.filter((a) => a.status === "In Progress").length,
    completed: audits.filter((a) => a.status === "Completed").length,
    attention: audits.filter((a) => a.status === "Requires Attention").length,
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-xl font-bold">Audit Management</h1>
              <p className="mt-1 text-sm text-slate-500">
                Plan, monitor and manage financial audits
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setError("");
              setForm(emptyForm);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <Plus size={18} />
            New Audit
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard title="Total Audits" value={summary.total} />
          <SummaryCard title="In Progress" value={summary.inProgress} />
          <SummaryCard title="Completed" value={summary.completed} />
          <SummaryCard title="Requires Attention" value={summary.attention} />
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-bold">Audit Records</h2>
              <p className="mt-1 text-xs text-slate-500">
                {filteredAudits.length} audit
                {filteredAudits.length === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search audits..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 sm:w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-400"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === "All" ? "All Statuses" : status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="mx-5 mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Reference</th>
                  <th className="px-6 py-4 font-semibold">Audit</th>
                  <th className="px-6 py-4 font-semibold">Department</th>
                  <th className="px-6 py-4 font-semibold">Auditor</th>
                  <th className="px-6 py-4 font-semibold">Start Date</th>
                  <th className="px-6 py-4 font-semibold">Findings</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      Loading audits...
                    </td>
                  </tr>
                ) : filteredAudits.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      <ClipboardCheck
                        size={30}
                        className="mx-auto mb-3 text-slate-300"
                      />
                      No audit records found.
                    </td>
                  </tr>
                ) : (
                  filteredAudits.map((audit) => (
                    <tr
                      key={audit.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-semibold">
                        {audit.audit_reference}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium">{audit.title}</p>
                        {audit.notes && (
                          <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                            {audit.notes}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {audit.department}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {audit.auditor}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {new Date(audit.start_date).toLocaleDateString(
                          "en-NG",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </td>

                      <td className="px-6 py-4 font-semibold">
                        {audit.findings}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                            audit.status
                          )}`}
                        >
                          {audit.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="font-bold">Create New Audit</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Enter the basic details for this audit.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Audit Title">
                  <input
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="Annual Financial Audit"
                    className="input-field"
                  />
                </Field>

                <Field label="Department">
                  <input
                    required
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                    placeholder="Finance Department"
                    className="input-field"
                  />
                </Field>

                <Field label="Auditor">
                  <input
                    required
                    value={form.auditor}
                    onChange={(e) =>
                      setForm({ ...form, auditor: e.target.value })
                    }
                    placeholder="Auditor name"
                    className="input-field"
                  />
                </Field>

                <Field label="Start Date">
                  <input
                    required
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm({ ...form, start_date: e.target.value })
                    }
                    className="input-field"
                  />
                </Field>

                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="input-field"
                  >
                    {statusOptions.slice(1).map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Findings">
                  <input
                    type="number"
                    min="0"
                    value={form.findings}
                    onChange={(e) =>
                      setForm({ ...form, findings: e.target.value })
                    }
                    className="input-field"
                  />
                </Field>
              </div>

              <Field label="Notes">
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                  placeholder="Additional audit notes..."
                  rows={3}
                  className="input-field resize-none"
                />
              </Field>

              {error && (
                <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  disabled={saving}
                  type="submit"
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Audit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .input-field {
          width: 100%;
          border: 1px solid rgb(226 232 240);
          border-radius: 0.75rem;
          background: rgb(248 250 252);
          padding: 0.65rem 0.9rem;
          font-size: 0.875rem;
          outline: none;
        }

        .input-field:focus {
          border-color: rgb(148 163 184);
        }
      `}</style>
    </main>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
