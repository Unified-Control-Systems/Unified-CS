
"use client";

import { useEffect, useState } from "react";
import {
  Users,
  GitBranch,
  Building2,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  ShoppingCart,
  Package,
  Download,
  UserPlus,
  Activity,
  Bell,
} from "lucide-react";

import {
  AppShell,
  type DashboardUser,
} from "@/components/layout/app-shell";

interface DashboardOverview {
  organization: {
    id: string;
    name: string;
  };
  currentUser: DashboardUser & {
    id: string;
  };
  metrics: {
    users: {
      total: number;
      active: number;
      invited: number;
      suspended: number;
    };
    branches: {
      total: number;
      active: number;
    };
    departments: {
      total: number;
      active: number;
    };
    roles: {
      total: number;
    };
  };
  recentActivity: {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    metadata: unknown;
    createdAt: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
  }[];
  unreadNotifications: number;
}

interface Metric {
  label: string;
  value: string;
  description: string;
  icon: typeof Users;
  positive?: boolean;
  change?: string;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const difference = date.getTime() - Date.now();

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  const minutes = Math.round(difference / 60000);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  const formatter = new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
  });

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, "minute");
  }

  if (Math.abs(hours) < 24) {
    return formatter.format(hours, "hour");
  }

  return formatter.format(days, "day");
}

function formatActivityTitle(action: string, entity: string): string {
  const formattedAction = action
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

  const formattedEntity = entity
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

  return `${formattedAction} · ${formattedEntity}`;
}

function DashboardMetric({ metric }: { metric: Metric }) {
  const Icon = metric.icon;

  return (
    <section className="metric-card">
      <div className="metric-top">
        <span className="metric-label">{metric.label}</span>

        <div className="metric-icon">
          <Icon size={17} />
        </div>
      </div>

      <div className="metric-value">{metric.value}</div>

      <div className="metric-bottom">
        {metric.change && (
          <span className="metric-change">
            {metric.positive ? (
              <ArrowUpRight size={12} className="inline" />
            ) : (
              <ArrowDownRight size={12} className="inline" />
            )}
            {metric.change}
          </span>
        )}

        <span>{metric.description}</span>
      </div>
    </section>
  );
}

function UnavailablePanel({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  icon: typeof IndianRupee;
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">{title}</h2>
          <p className="panel-subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="panel-body flex min-h-48 flex-col items-center justify-center gap-3 text-center">
        <div className="metric-icon">
          <Icon size={20} />
        </div>

        <p className="text-sm font-medium">
          No data available yet
        </p>

        <p className="text-xs text-[var(--foreground-secondary)]">
          This information will appear when the relevant module is implemented
          and contains records.
        </p>
      </div>
    </section>
  );
}

function RecentActivity({
  activities,
}: {
  activities: DashboardOverview["recentActivity"];
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Recent Activity</h2>
          <p className="panel-subtitle">
            Latest organization audit records
          </p>
        </div>
      </div>

      <div className="panel-body">
        {activities.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-center">
            <Activity
              size={22}
              className="text-[var(--foreground-secondary)]"
            />
            <p className="text-sm font-medium">No activity recorded</p>
            <p className="text-xs text-[var(--foreground-secondary)]">
              Organization activity will appear here.
            </p>
          </div>
        ) : (
          <div className="activity-list">
            {activities.map((activity) => (
              <div className="activity-item" key={activity.id}>
                <div className="activity-icon">
                  <Activity size={15} />
                </div>

                <div className="activity-copy">
                  <span className="activity-title">
                    {formatActivityTitle(
                      activity.action,
                      activity.entity,
                    )}
                  </span>

                  <span className="activity-time">
                    {activity.user
                      ? `${activity.user.firstName} ${activity.user.lastName}`
                      : "System"}
                  </span>

                  <span className="activity-time">
                    {formatRelativeTime(activity.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function DashboardChart() {
  return (
    <UnavailablePanel
      title="Financial Overview"
      subtitle="Revenue and expenses over time"
      icon={IndianRupee}
    />
  );
}

function RecentOrders() {
  return (
    <section className="panel dashboard-bottom">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Recent Sales Orders</h2>
          <p className="panel-subtitle">
            Latest sales transactions
          </p>
        </div>
      </div>

      <div className="panel-body flex min-h-36 flex-col items-center justify-center gap-2 text-center">
        <ShoppingCart
          size={22}
          className="text-[var(--foreground-secondary)]"
        />

        <p className="text-sm font-medium">No sales orders available</p>

        <p className="text-xs text-[var(--foreground-secondary)]">
          Sales orders will appear here after the Sales module is implemented.
        </p>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const [dashboard, setDashboard] =
    useState<DashboardOverview | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const response = await fetch("/api/dashboard/overview", {
          method: "GET",
          cache: "no-store",
        });

        if (response.status === 401) {
          window.location.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load dashboard information.");
        }

        const data: DashboardOverview = await response.json();

        if (!cancelled) {
          setDashboard(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "An unexpected error occurred.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="page-heading">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-description">
              Loading your organization overview...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !dashboard) {
    return (
      <AppShell>
        <div className="page-heading">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-description">
              {error ?? "Dashboard data is unavailable."}
            </p>
          </div>

          <button
            type="button"
            className="button button-primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </AppShell>
    );
  }

  const { metrics } = dashboard;

  const dashboardMetrics: Metric[] = [
    {
      label: "Total Users",
      value: metrics.users.total.toLocaleString("en-IN"),
      description: `${metrics.users.active} active · ${metrics.users.invited} invited`,
      icon: Users,
    },
    {
      label: "Total Branches",
      value: metrics.branches.total.toLocaleString("en-IN"),
      description: `${metrics.branches.active} active branches`,
      icon: GitBranch,
    },
    {
      label: "Total Departments",
      value: metrics.departments.total.toLocaleString("en-IN"),
      description: `${metrics.departments.active} active departments`,
      icon: Building2,
    },
    {
      label: "Total Roles",
      value: metrics.roles.total.toLocaleString("en-IN"),
      description: "Configured organization roles",
      icon: ShieldCheck,
    },
  ];

  return (
    <AppShell
      currentUser={dashboard.currentUser}
      unreadNotifications={dashboard.unreadNotifications}
    >
      <div className="page-heading">
        <div>
          <h1 className="page-title">Dashboard</h1>

          <p className="page-description">
            Welcome back, {dashboard.currentUser.firstName}. Heres whats
            happening at {dashboard.organization.name}.
          </p>
        </div>

        <div className="page-actions">
          <span className="button">
            <Bell size={14} />
            {dashboard.unreadNotifications} unread
          </span>
        </div>
      </div>

      <div className="metrics-grid">
        {dashboardMetrics.map((metric) => (
          <DashboardMetric key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="dashboard-grid">
        <DashboardChart />
        <RecentActivity activities={dashboard.recentActivity} />
      </div>

      <RecentOrders />

      <section className="panel mt-4">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Organization Overview</h2>
            <p className="panel-subtitle">
              Current organization statistics
            </p>
          </div>
        </div>

        <div className="panel-body grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="metric-label">Active users</p>
            <p className="text-lg font-semibold">
              {metrics.users.active}
            </p>
          </div>

          <div>
            <p className="metric-label">Invited users</p>
            <p className="text-lg font-semibold">
              {metrics.users.invited}
            </p>
          </div>

          <div>
            <p className="metric-label">Suspended users</p>
            <p className="text-lg font-semibold">
              {metrics.users.suspended}
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
