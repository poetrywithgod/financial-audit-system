"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Transactions", icon: Wallet },
  { label: "Audits", icon: ClipboardCheck },
  { label: "Reports", icon: BarChart3 },
  { label: "Users", icon: Users },
  { label: "Settings", icon: Settings },
];

const transactions = [
  {
    reference: "TRX-2026-001",
    description: "Office Equipment",
    category: "Equipment",
    amount: "₦850,000",
    type: "expense",
    date: "02 Sep 2026",
  },
  {
    reference: "TRX-2026-002",
    description: "Client Payment",
    category: "Revenue",
    amount: "₦2,400,000",
    type: "income",
    date: "01 Sep 2026",
  },
  {
    reference: "TRX-2026-003",
    description: "Internet & Utilities",
    category: "Utilities",
    amount: "₦185,000",
    type: "expense",
    date: "31 Aug 2026",
  },
  {
    reference: "TRX-2026-004",
    description: "Consulting Revenue",
    category: "Revenue",
    amount: "₦1,750,000",
    type: "income",
    date: "29 Aug 2026",
  },
];

const chartData = [
  { month: "Mar", income: 3.2, expenses: 1.8 },
  { month: "Apr", income: 4.1, expenses: 2.2 },
  { month: "May", income: 3.7, expenses: 2.5 },
  { month: "Jun", income: 5.2, expenses: 2.8 },
  { month: "Jul", income: 4.8, expenses: 2.1 },
  { month: "Aug", income: 6.1, expenses: 3.2 },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <ShieldCheck size={22} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Financial Audit
                </p>
                <p className="text-xs text-slate-500">Management System</p>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    item.active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon size={19} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-slate-100 p-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  VA
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Administrator</p>
                  <p className="truncate text-xs text-slate-500">
                    System Administrator
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="text-lg font-bold text-slate-900">Dashboard</h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                Financial overview and audit activity
              </p>
            </div>
          </div>

          <button className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50">
            <Bell size={19} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>
        </header>

        <section className="mx-auto max-w-[1600px] p-5 lg:p-8">
          <div className="mb-8">
            <p className="text-sm font-medium text-slate-500">
              Wednesday, 2 September 2026
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Financial Overview
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Income"
              value="₦18.45M"
              change="+12.8%"
              positive
              icon={<ArrowUpRight size={20} />}
            />

            <StatCard
              title="Total Expenses"
              value="₦9.72M"
              change="+6.4%"
              positive={false}
              icon={<ArrowDownRight size={20} />}
            />

            <StatCard
              title="Net Position"
              value="₦8.73M"
              change="+18.2%"
              positive
              icon={<Wallet size={20} />}
            />

            <StatCard
              title="Active Audits"
              value="8"
              change="3 require attention"
              positive={false}
              icon={<ClipboardCheck size={20} />}
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold">Income vs Expenses</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Monthly financial performance
                  </p>
                </div>

                <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none">
                  <option>Last 6 months</option>
                  <option>Last 12 months</option>
                  <option>This year</option>
                </select>
              </div>

              <div className="flex h-64 items-end gap-3 sm:gap-6">
                {chartData.map((item) => (
                  <div
                    key={item.month}
                    className="flex h-full flex-1 items-end justify-center gap-1"
                  >
                    <div className="flex h-full items-end gap-1">
                      <div
                        className="w-3 rounded-t-md bg-slate-900 sm:w-5"
                        style={{ height: `${item.income * 11}%` }}
                      />
                      <div
                        className="w-3 rounded-t-md bg-slate-200 sm:w-5"
                        style={{ height: `${item.expenses * 11}%` }}
                      />
                    </div>

                    <span className="absolute mt-[285px] text-[11px] text-slate-400">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex items-center gap-5 text-xs text-slate-500">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
                  Income
                </span>

                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                  Expenses
                </span>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold">Audit Status</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Current audit distribution
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <AuditStatus
                  label="Completed"
                  value="42"
                  percentage="52%"
                />
                <AuditStatus
                  label="In Progress"
                  value="21"
                  percentage="26%"
                />
                <AuditStatus
                  label="Pending Review"
                  value="12"
                  percentage="15%"
                />
                <AuditStatus
                  label="Overdue"
                  value="6"
                  percentage="7%"
                />
              </div>

              <div className="mt-8 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Total audit records
                </p>
                <p className="mt-1 text-2xl font-bold">81</p>
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between lg:p-6">
              <div>
                <h3 className="font-bold">Recent Transactions</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Latest recorded financial activities
                </p>
              </div>

              <button className="flex items-center gap-2 text-sm font-semibold text-slate-900 hover:underline">
                <FileText size={16} />
                View all
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
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
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.reference}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 text-sm font-medium">
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

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {transaction.date}
                      </td>

                      <td
                        className={`px-6 py-4 text-right text-sm font-bold ${
                          transaction.type === "income"
                            ? "text-emerald-600"
                            : "text-slate-900"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {transaction.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  change,
  positive,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
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

      <p className="mt-2 text-xs text-slate-500">
        <span className={positive ? "font-semibold text-emerald-600" : "font-semibold text-amber-600"}>
          {change}
        </span>{" "}
        from previous period
      </p>
    </div>
  );
}

function AuditStatus({
  label,
  value,
  percentage,
}: {
  label: string;
  value: string;
  percentage: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-900"
          style={{ width: percentage }}
        />
      </div>
    </div>
  );
}