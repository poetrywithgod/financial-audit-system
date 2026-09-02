"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type TransactionType = "income" | "expense";
type TransactionStatus = "Completed" | "Pending" | "Cancelled";

type Transaction = {
  id: string;
  reference: string;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
  transaction_date: string;
  status: TransactionStatus;
  notes: string | null;
};

const categories = [
  "Sales",
  "Services",
  "Operations",
  "Salaries",
  "Utilities",
  "Procurement",
  "Transport",
  "Marketing",
  "Other",
];

const statuses: TransactionStatus[] = [
  "Completed",
  "Pending",
  "Cancelled",
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export default function TransactionsPage() {
  const supabase = createClient();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Sales");
  const [type, setType] = useState<TransactionType>("income");
  const [amount, setAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [status, setStatus] =
    useState<TransactionStatus>("Completed");
  const [notes, setNotes] = useState("");

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("transactions")
      .select(
        "id, reference, description, category, type, amount, transaction_date, status, notes"
      )
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setTransactions(
      (data ?? []).map((transaction) => ({
        ...transaction,
        amount: Number(transaction.amount),
        type: transaction.type as TransactionType,
        status: transaction.status as TransactionStatus,
      }))
    );

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !query ||
        transaction.reference.toLowerCase().includes(query) ||
        transaction.description.toLowerCase().includes(query) ||
        transaction.category.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        transaction.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, search, typeFilter, categoryFilter]);

  const totalIncome = useMemo(
    () =>
      transactions
        .filter(
          (transaction) =>
            transaction.type === "income" &&
            transaction.status !== "Cancelled"
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    [transactions]
  );

  const totalExpenses = useMemo(
    () =>
      transactions
        .filter(
          (transaction) =>
            transaction.type === "expense" &&
            transaction.status !== "Cancelled"
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    [transactions]
  );

  const netBalance = totalIncome - totalExpenses;

  function resetForm() {
    setDescription("");
    setCategory("Sales");
    setType("income");
    setAmount("");
    setTransactionDate(new Date().toISOString().split("T")[0]);
    setStatus("Completed");
    setNotes("");
  }

  function generateReference() {
    const timestamp = Date.now().toString().slice(-8);
    return `TXN-${timestamp}`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const numericAmount = Number(amount);

    if (!description.trim()) {
      setError("Transaction description is required.");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setError("Enter a valid transaction amount.");
      return;
    }

    setSaving(true);
    setError("");

    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Your session has expired. Please sign in again.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("transactions").insert({
      reference: generateReference(),
      description: description.trim(),
      category,
      type,
      amount: numericAmount,
      transaction_date: transactionDate,
      status,
      notes: notes.trim() || null,
      created_by: user.id,
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    resetForm();
    setShowModal(false);
    setSaving(false);

    await loadTransactions();
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-400">
              Financial Management
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Transactions
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Record and monitor financial transactions.
            </p>
          </div>

          <button
            onClick={() => {
              setError("");
              setShowModal(true);
            }}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
          >
            + Add Transaction
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/4 p-5">
            <p className="text-sm text-slate-400">Total Income</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">
              {formatCurrency(totalIncome)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/4 p-5">
            <p className="text-sm text-slate-400">Total Expenses</p>
            <p className="mt-2 text-2xl font-semibold text-red-400">
              {formatCurrency(totalExpenses)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/4 p-5">
            <p className="text-sm text-slate-400">Net Balance</p>
            <p
              className={`mt-2 text-2xl font-semibold ${
                netBalance >= 0
                  ? "text-blue-400"
                  : "text-red-400"
              }`}
            >
              {formatCurrency(netBalance)}
            </p>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-white/10 bg-white/4 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search transactions..."
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400"
            />

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value as "all" | TransactionType
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            >
              <option value="all">All Categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/4">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="font-semibold">Transaction Records</h2>
            <p className="mt-1 text-sm text-slate-400">
              {filteredTransactions.length} transaction
              {filteredTransactions.length === 1 ? "" : "s"}
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-slate-400">
              Loading transactions...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-medium">
                No transactions found
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Add your first transaction to begin building the
                financial record.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 text-left text-sm">
                <thead className="border-b border-white/10 bg-white/2 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Reference</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="transition hover:bg-white/2"
                    >
                      <td className="px-6 py-4 font-medium text-slate-300">
                        {transaction.reference}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {transaction.description}
                        </div>

                        {transaction.notes && (
                          <div className="mt-1 max-w-xs truncate text-xs text-slate-500">
                            {transaction.notes}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {transaction.category}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            transaction.type === "income"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {transaction.type === "income"
                            ? "Income"
                            : "Expense"}
                        </span>
                      </td>

                      <td
                        className={`px-6 py-4 font-semibold ${
                          transaction.type === "income"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {transaction.type === "income"
                          ? "+"
                          : "-"}
                        {formatCurrency(transaction.amount)}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {formatDate(transaction.transaction_date)}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300">
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Add Transaction
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Record a new financial transaction.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg px-3 py-2 text-slate-400 hover:bg-white/5 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>

                <input
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="e.g. Office equipment purchase"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Type
                  </label>

                  <select
                    value={type}
                    onChange={(event) =>
                      setType(
                        event.target.value as TransactionType
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                  >
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Amount
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(event) =>
                      setAmount(event.target.value)
                    }
                    placeholder="0.00"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Date
                  </label>

                  <input
                    type="date"
                    value={transactionDate}
                    onChange={(event) =>
                      setTransactionDate(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value as TransactionStatus
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                >
                  {statuses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Notes
                </label>

                <textarea
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  rows={3}
                  placeholder="Optional notes..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
