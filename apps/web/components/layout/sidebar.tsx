"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserRound,
  Contact,
  Package,
  ShoppingCart,
  Truck,
  Wallet,
  ChartNoAxesCombined,
  Settings,
  ChevronDown,
  Building2,
  Boxes,
  ShieldCheck,
  X,
} from "lucide-react";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const navigation = [
  {
    label: "OVERVIEW",
    items: [
      {
        name: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "WORKSPACE",
    items: [
      { name: "Employees", href: "/employees", icon: Users },
      { name: "CRM", href: "/crm", icon: Contact },
      { name: "Inventory", href: "/inventory", icon: Package },
      { name: "Sales", href: "/sales", icon: ShoppingCart },
      { name: "Purchasing", href: "/purchasing", icon: Truck },
      { name: "Finance", href: "/finance", icon: Wallet },
    ],
  },
  {
    label: "INSIGHTS",
    items: [
      {
        name: "Reports",
        href: "/reports",
        icon: ChartNoAxesCombined,
      },
    ],
  },
  {
    label: "ADMINISTRATION",
    items: [
      { name: "Users & Roles", href: "/settings/users", icon: ShieldCheck },
      { name: "Organization", href: "/settings/organization", icon: Building2 },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">
            <Boxes size={21} strokeWidth={2.2} />
          </div>

          <div className="brand-copy">
            <span className="brand-name">Unified-CS</span>
            <span className="brand-caption">Enterprise Suite</span>
          </div>

          <button
            type="button"
            className="icon-button sidebar-close"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>

        <button type="button" className="organization-switcher">
          <div className="organization-icon">
            <Building2 size={17} />
          </div>

          <div className="organization-copy">
            <span className="organization-label">WORKSPACE</span>
            <span className="organization-name">Demo Organization</span>
          </div>

          <ChevronDown size={16} className="muted-icon" />
        </button>

        <nav className="sidebar-navigation">
          {navigation.map((section) => (
            <div className="navigation-section" key={section.label}>
              <p className="navigation-section-label">{section.label}</p>

              {section.items.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`navigation-link ${
                      active ? "navigation-link-active" : ""
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.9} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-icon">
            <UserRound size={18} />
          </div>

          <div className="sidebar-footer-copy">
            <span className="sidebar-footer-title">System Administrator</span>
            <span className="sidebar-footer-caption">Administrator</span>
          </div>

          <span className="online-indicator" />
        </div>
      </aside>
    </>
  );
}