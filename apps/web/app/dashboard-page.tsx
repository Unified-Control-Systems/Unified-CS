
import {
  Users,
  IndianRupee,
  ShoppingCart,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Download,
  Receipt,
  UserPlus,
  ShoppingBag,
  ClipboardCheck,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";

const metrics = [
  {
    label: "Total Revenue",
    value: "₹12,84,500",
    change: "+12.8%",
    description: "Compared to last month",
    positive: true,
    icon: IndianRupee,
  },
  {
    label: "Total Employees",
    value: "248",
    change: "+4.2%",
    description: "Compared to last month",
    positive: true,
    icon: Users,
  },
  {
    label: "Total Orders",
    value: "1,284",
    change: "+8.4%",
    description: "Compared to last month",
    positive: true,
    icon: ShoppingCart,
  },
  {
    label: "Low Stock Items",
    value: "18",
    change: "-3.1%",
    description: "Compared to last month",
    positive: false,
    icon: Package,
  },
];

const activities = [
  {
    title: "New employee registered",
    detail: "Employee onboarding completed",
    time: "10 minutes ago",
    icon: UserPlus,
  },
  {
    title: "Sales order created",
    detail: "Order #SO-2026-1284",
    time: "35 minutes ago",
    icon: ShoppingBag,
  },
  {
    title: "Purchase request submitted",
    detail: "Request #PR-2026-042",
    time: "1 hour ago",
    icon: Receipt,
  },
  {
    title: "Inventory approval pending",
    detail: "Warehouse stock adjustment",
    time: "2 hours ago",
    icon: ClipboardCheck,
  },
];

const orders = [
  {
    id: "SO-2026-1284",
    customer: "Acme Technologies",
    date: "26 Nov 2026",
    amount: "₹84,500",
    status: "Completed",
  },
  {
    id: "SO-2026-1283",
    customer: "Global Solutions",
    date: "26 Nov 2026",
    amount: "₹42,000",
    status: "Processing",
  },
  {
    id: "SO-2026-1282",
    customer: "Vertex Industries",
    date: "25 Nov 2026",
    amount: "₹1,24,800",
    status: "Pending",
  },
  {
    id: "SO-2026-1281",
    customer: "Nexus Enterprises",
    date: "25 Nov 2026",
    amount: "₹63,200",
    status: "Completed",
  },
];

function DashboardMetric({
  metric,
}: {
  metric: (typeof metrics)[number];
}) {
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
        <span className="metric-change">
          {metric.positive ? (
            <ArrowUpRight size={12} className="inline" />
          ) : (
            <ArrowDownRight size={12} className="inline" />
          )}

          {metric.change}
        </span>

        <span>{metric.description}</span>
      </div>
    </section>
  );
}

function DashboardChart() {
  const revenue = [42, 57, 48, 72, 63, 84, 69, 92, 77, 100, 87, 95];

  const expenses = [29, 38, 32, 46, 43, 53, 49, 62, 55, 68, 61, 70];

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Financial Overview</h2>

          <p className="panel-subtitle">
            Revenue and expenses over the year
          </p>
        </div>

        <select
          className="select-control"
          defaultValue="year"
          aria-label="Financial chart period"
        >
          <option value="year">This year</option>
          <option value="month">This month</option>
        </select>
      </div>

      <div className="panel-body">
        <div className="flex flex-wrap items-center gap-4 mb-3">
          <span className="flex items-center gap-2 text-[10px] text-[var(--foreground-secondary)]">
            <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
            Revenue
          </span>

          <span className="flex items-center gap-2 text-[10px] text-[var(--foreground-secondary)]">
            <span className="h-2 w-2 rounded-full bg-[#93c5fd]" />
            Expenses
          </span>
        </div>

        <div className="chart-placeholder">
          <div className="chart-bars">
            {revenue.map((height, index) => (
              <div className="chart-bar-group" key={months[index]}>
                <div
                  className="chart-bar chart-bar-secondary"
                  style={{ height: `${expenses[index]}%` }}
                />

                <div
                  className="chart-bar"
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>

          <div className="chart-labels">
            {months.map((month) => (
              <span key={month}>{month}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RecentActivity() {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Recent Activity</h2>

          <p className="panel-subtitle">
            Latest workspace updates
          </p>
        </div>

        <button type="button" className="button">
          View all
        </button>
      </div>

      <div className="panel-body">
        <div className="activity-list">
          {activities.map((activity) => {
            const Icon = activity.icon;

            return (
              <div className="activity-item" key={activity.title}>
                <div className="activity-icon">
                  <Icon size={15} />
                </div>

                <div className="activity-copy">
                  <span className="activity-title">
                    {activity.title}
                  </span>

                  <span className="activity-time">
                    {activity.detail}
                  </span>

                  <span className="activity-time">
                    {activity.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RecentOrders() {
  return (
    <section className="panel dashboard-bottom">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Recent Sales Orders</h2>

          <p className="panel-subtitle">
            Overview of the latest sales transactions
          </p>
        </div>

        <button type="button" className="button">
          View all orders
        </button>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.date}</td>
                <td>{order.amount}</td>

                <td>
                  <span
                    className={`status-badge ${
                      order.status === "Completed"
                        ? "status-completed"
                        : order.status === "Pending"
                          ? "status-pending"
                          : "status-processing"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <AppShell>
      <div>
        <div className="page-heading">
          <div>
            <h1 className="page-title">Dashboard</h1>

            <p className="page-description">
              Welcome back. Heres whats happening across your organization.
            </p>
          </div>

          <div className="page-actions">
            <button type="button" className="button">
              <Download size={14} />
              Export
            </button>

            <button type="button" className="button button-primary">
              <Plus size={15} />
              Quick action
            </button>
          </div>
        </div>

        <div className="metrics-grid">
          {metrics.map((metric) => (
            <DashboardMetric
              key={metric.label}
              metric={metric}
            />
          ))}
        </div>

        <div className="dashboard-grid">
          <DashboardChart />
          <RecentActivity />
        </div>

        <RecentOrders />
      </div>
    </AppShell>
  );
}