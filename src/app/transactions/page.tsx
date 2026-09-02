"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Filter,
  Plus,
  Search,
  Wallet,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type TransactionType = "income" | "expense";

type Transaction = {
  id: string;
  reference: string;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
  date: string;
  status: "Completed" | "Pending";
};

const initialTransactions: Transaction[] = [
  {
    id: "1",
    reference: "TRX-2026-001",
    description: "Office Equipment",
    category: "Equipment",
    type: "expense",
    amount: 850000,
    date: "2026-09-02",
    status: "Completed",
  },
  {
    id: "2",
    reference: "TRX-2026-002",
    description: "Client Payment",
    category: "Revenue",
    type: "income",
    amount: 2400000,
    date: "2026-09-01",
    status: "Completed",
  },
  {
    id: "3",
    reference: "TRX-2026-003",
    description: "Internet & Utilities",
    category: "Utilities",
    type: "expense",
    amount: 185000,
    date: "2026-08-31",
    status: "Completed",
  },
  {
    id: "4",
    reference: "TRX-2026-004",
    description: "Consulting Revenue",
    category: "Revenue",
    type: "income",
    amount: 1750000,
    date: "2026-08-29",
    status: "Completed",
  },
  {
    id: "5",
    reference: "TRX-2026-005",
    description: "Staff Salaries",
    category: "Payroll",
    type: "expense",
    amount: 1250000,
    date: "2026-08-28",
    status: "Completed",
  },
  {
    id: "6",
    reference: "TRX-2026-006",
    description: "Project Advance",
    category: "Revenue",
    type: "income",
    amount: 3200000,
    date: "2026-08-26",
    status: "Pending",
  },
];

const categories = [
  "All categories",
  "Revenue",
  "Equipment",
  "Utilities",
  "Payroll",
  "Operations",
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [showModal, setShowModal] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.description
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        transaction.reference.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter;

      const matchesCategory =
        categoryFilter === "All categories" ||
        transaction.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, search, typeFilter, categoryFilter]);

  const totals = useMemo(() => {
    const income = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const expenses = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  function addTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const description = String(formData.get("description") || "");
    const category = String(formData.get("category") || "");
    const type = String(formData.get("type") || "expense") as TransactionType;
    const amount = Number(formData.get("amount") || 0);
    const date = String(formData.get("date") || "");

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      reference: `TRX-${new Date().getFullYear()}-${String(
        transactions.length + 1
      ).padStart(3, "0")}`,
      description,
      category,
      type,
      amount,
      date,
      status: "Completed",
    };

    setTransactions((current) => [newTransaction, ...current]);
    setShowModal(false);
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1600px] px-5 py-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Wallet size={16} />
                <span>Financial Management</span>
              </div>

              <h1 className="mt-1 text-2xl font-bold tracking-tight">
                Transactions
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Record, review and monitor financial transactions.
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus size={18} />
              Add Transaction
            </button>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1600px] p-5 lg:p-8">
        <div className="grid gap-5 md:grid-cols-3">
          <SummaryCard
            title="Total Income"
            value={formatCurrency(totals.income)}
            icon={<ArrowUpRight size={20} />}
            description="All recorded income"
          />

          <SummaryCard
            title="Total Expenses"
            value={formatCurrency(totals.expenses)}
            icon={<ArrowDownRight size={20} />}
            description="All recorded expenses"
          />

          <SummaryCard
            title="Net Balance"
            value={formatCurrency(totals.balance)}
            icon={<Wallet size={20} />}
            description="Income less expenses"
          />
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 lg:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="font-bold">Transaction Records</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {filteredTransactions.length} transaction
                  {filteredTransactions.length === 1 ? "" : "s"} found
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search transactions..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 md:w-64"
                  />
                </div>

                <div className="relative">
                  <Filter
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={typeFilter}
                    onChange={(event) =>
                      setTypeFilter(
                        event.target.value as "all" | TransactionType
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-10 text-sm outline-none md:w-40"
                  >
                    <option value="all">All types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expenses</option>
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm outline-none md:w-48"
                  >
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Reference</th>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 text-sm font-semibold">
                      {transaction.reference}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium">
                        {transaction.description}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {transaction.category}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          transaction.type === "income"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {transaction.type === "income" ? "Income" : "Expense"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(transaction.date)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          transaction.status === "Completed"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>

                    <td
                      className={`px-6 py-4 text-right text-sm font-bold ${
                        transaction.type === "income"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}

                {filteredTransactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-sm text-slate-500"
                    >
                      No transactions match your current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="font-bold">Add Transaction</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Record a new financial transaction.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={addTransaction} className="space-y-5 p-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <input
                  name="description"
                  required
                  placeholder="e.g. Office supplies"
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Transaction Type
                  </label>

                  <select
                    name="type"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Category
                  </label>

                  <select
                    name="category"
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
                  >
                    <option value="">Select category</option>
                    {categories
                      .filter((category) => category !== "All categories")
                      .map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Amount
                  </label>

                  <input
                    name="amount"
                    required
                    min="1"
                    type="number"
                    placeholder="0"
                    className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Date
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      name="date"
                      required
                      type="date"
                      defaultValue="2026-09-02"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-2xl font-bold tracking-tight">{value}</p>

      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
