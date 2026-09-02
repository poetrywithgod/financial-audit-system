"use client";

import {
  ArrowLeft,
  BarChart3,
  Download,
  FileText,
  Printer,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Transaction = {
  id: string;
  reference: string;
  description: string;
  category: string;
  type: "income" | "expense";
  amount: number;
  transaction_date: string;
  status: "Completed" | "Pending" | "Cancelled";
};

export default function ReportsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTransactions() {
      const { data } = await supabase
        .from("transactions")
        .select(
          "id, reference, description, category, type, amount, transaction_date, status"
        )
        .order("transaction_date", { ascending: false });

      setTransactions((data ?? []) as Transaction[]);
      setLoading(false);
    }

    loadTransactions();
  }, [supabase]);

  const validTransactions = transactions.filter(
    (transaction) => transaction.status !== "Cancelled"
  );

  const totalIncome = validTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const totalExpenses = validTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const netPosition = totalIncome - totalExpenses;

  const formatNaira = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);

  const expenseBreakdown = validTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce<Record<string, number>>((result, transaction) => {
      result[transaction.category] =
        (result[transaction.category] || 0) + Number(transaction.amount);
      return result;
    }, {});

  const sortedExpenses = Object.entries(expenseBreakdown).sort(
    ([, a], [, b]) => b - a
  );

  function printReport() {
    window.print();
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <header className="border-b border-slate-200 bg-white print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-xl font-bold">Financial Reports</h1>
              <p className="mt-1 text-sm text-slate-500">
                Financial summaries and audit information
              </p>
            </div>
          </div>

          <button
            onClick={printReport}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <Printer size={17} />
            Print Report
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <BarChart3 size={21} />
          </div>
          <div>
            <h2 className="font-bold">Financial Statement Summary</h2>
            <p className="text-sm text-slate-500">
              Generated from recorded transactions
            </p>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReportCard
            title="Total Income"
            value={loading ? "..." : formatNaira(totalIncome)}
          />
          <ReportCard
            title="Total Expenses"
            value={loading ? "..." : formatNaira(totalExpenses)}
          />
          <ReportCard
            title="Net Position"
            value={loading ? "..." : formatNaira(netPosition)}
          />
          <ReportCard
            title="Transactions"
            value={loading ? "..." : String(validTransactions.length)}
          />
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <h3 className="font-bold">Expense Breakdown</h3>
              <p className="mt-1 text-xs text-slate-500">
                Expenses grouped by category
              </p>
            </div>

            <div className="p-5">
              {sortedExpenses.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  No expense records available.
                </div>
              ) : (
                <div className="space-y-5">
                  {sortedExpenses.map(([category, amount]) => {
                    const percentage =
                      totalExpenses > 0
                        ? Math.round((amount / totalExpenses) * 100)
                        : 0;

                    return (
                      <div key={category}>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="font-medium">{category}</span>
                          <span className="font-semibold">
                            {formatNaira(amount)}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-slate-900"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <p className="mt-1 text-xs text-slate-400">
                          {percentage}% of total expenses
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <h3 className="font-bold">Report Information</h3>
              <p className="mt-1 text-xs text-slate-500">
                Summary of the current financial records
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              <InfoRow
                label="Report Type"
                value="Financial Transaction Report"
              />
              <InfoRow label="Currency" value="Nigerian Naira (NGN)" />
              <InfoRow
                label="Income Records"
                value={String(
                  validTransactions.filter((t) => t.type === "income").length
                )}
              />
              <InfoRow
                label="Expense Records"
                value={String(
                  validTransactions.filter((t) => t.type === "expense").length
                )}
              />
              <InfoRow
                label="Report Date"
                value={new Date().toLocaleDateString("en-NG", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              />
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h3 className="font-bold">Transaction Report</h3>
              <p className="mt-1 text-xs text-slate-500">
                Detailed financial activity
              </p>
            </div>

            <FileText size={20} className="text-slate-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Reference</th>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                      Loading report...
                    </td>
                  </tr>
                ) : validTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                      No transaction records available.
                    </td>
                  </tr>
                ) : (
                  validTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 font-semibold">
                        {transaction.reference}
                      </td>
                      <td className="px-6 py-4">{transaction.description}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {transaction.category}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(
                          transaction.transaction_date
                        ).toLocaleDateString("en-NG")}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-bold ${
                          transaction.type === "income"
                            ? "text-emerald-600"
                            : "text-slate-900"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatNaira(Number(transaction.amount))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5 text-xs text-slate-400">
          <span>Financial Audit System</span>
          <span>Generated for academic demonstration</span>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          @page {
            margin: 15mm;
          }
        }
      `}</style>
    </main>
  );
}

function ReportCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold">{value}</span>
    </div>
  );
}
