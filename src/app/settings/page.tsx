"use client";

import {
  ArrowLeft,
  Bell,
  Check,
  Database,
  Lock,
  Save,
  Settings as SettingsIcon,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingsPage() {
  const router = useRouter();

  const [profile, setProfile] = useState({
    name: "System Administrator",
    email: "admin@audit.local",
  });

  const [notifications, setNotifications] = useState(true);
  const [auditAlerts, setAuditAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  function saveSettings() {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-xl font-bold">Settings</h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage system preferences and account settings
              </p>
            </div>
          </div>

          <button
            onClick={saveSettings}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            {saved ? <Check size={17} /> : <Save size={17} />}
            {saved ? "Saved" : "Save Changes"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <SettingsNav
              icon={<UserRound size={17} />}
              label="Profile"
              active
            />
            <SettingsNav
              icon={<Bell size={17} />}
              label="Notifications"
            />
            <SettingsNav
              icon={<Lock size={17} />}
              label="Security"
            />
            <SettingsNav
              icon={<Database size={17} />}
              label="System"
            />
          </aside>

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                    <UserRound size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold">Profile Information</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Update the administrator profile
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>
                  <input
                    value={profile.name}
                    onChange={(event) =>
                      setProfile((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(event) =>
                      setProfile((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold">Notifications</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Configure system notification preferences
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                <ToggleRow
                  title="System Notifications"
                  description="Receive notifications about important system activity"
                  enabled={notifications}
                  onChange={() => setNotifications(!notifications)}
                />

                <ToggleRow
                  title="Audit Alerts"
                  description="Receive alerts when an audit requires attention"
                  enabled={auditAlerts}
                  onChange={() => setAuditAlerts(!auditAlerts)}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                    <Database size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold">System Information</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Current application information
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                <InfoRow label="Application" value="Financial Audit System" />
                <InfoRow label="Version" value="1.0.0" />
                <InfoRow label="Database" value="Supabase PostgreSQL" />
                <InfoRow label="Authentication" value="Supabase Auth" />
                <InfoRow label="Environment" value="Academic Demonstration" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function SettingsNav({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 p-5">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>

      <button
        onClick={onChange}
        aria-label={`Toggle ${title}`}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled ? "bg-slate-900" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
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
