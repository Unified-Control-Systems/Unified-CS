
"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export interface DashboardUser {
  firstName: string;
  lastName: string;
  email: string;
}

interface AppShellProps {
  children: ReactNode;
  currentUser?: DashboardUser;
  organizationName?: string;
  unreadNotifications?: number;
}

export function AppShell({
  children,
  currentUser,
  organizationName,
  unreadNotifications = 0,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        currentUser={currentUser}
        organizationName={organizationName}
      />

      <div className="app-main">
        <Topbar
          onMenuClick={() => setMobileOpen(true)}
          currentUser={currentUser}
          unreadNotifications={unreadNotifications}
        />

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
