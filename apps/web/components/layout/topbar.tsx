
"use client";

import { useTheme } from "next-themes";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Command,
} from "lucide-react";
import type { DashboardUser } from "./app-shell";

interface TopbarProps {
  onMenuClick: () => void;
  currentUser?: DashboardUser;
  unreadNotifications?: number;
}

export function Topbar({
  onMenuClick,
  currentUser,
  unreadNotifications = 0,
}: TopbarProps) {
  const { resolvedTheme, setTheme } = useTheme();

  const fullName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : "Loading profile";

  const initials = currentUser
    ? `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`.toUpperCase()
    : "—";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="icon-button mobile-menu-button"
          aria-label="Open navigation"
          onClick={onMenuClick}
        >
          <Menu size={21} />
        </button>

        <div className="breadcrumb">
          <span className="breadcrumb-muted">Workspace</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Dashboard</span>
        </div>
      </div>

      <div className="topbar-right">
        <label className="global-search">
          <Search size={17} className="muted-icon" />

          <input
            type="search"
            placeholder="Search anything..."
            aria-label="Search"
          />

          <span className="search-shortcut">
            <Command size={11} /> K
          </span>
        </label>

        <div className="topbar-divider" />

        <button
          type="button"
          className="icon-button theme-toggle"
          aria-label={
            resolvedTheme === "dark"
              ? "Switch to light theme"
              : "Switch to dark theme"
          }
          onClick={() =>
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
        >
          {resolvedTheme === "dark" ? (
            <Sun size={19} />
          ) : (
            <Moon size={19} />
          )}
        </button>

        <button
          type="button"
          className="icon-button notification-button"
          aria-label={`${unreadNotifications} unread notifications`}
          title={`${unreadNotifications} unread notifications`}
        >
          <Bell size={19} />

          {unreadNotifications > 0 && (
            <span className="notification-dot" />
          )}
        </button>

        <div className="topbar-divider profile-divider" />

        <button
          type="button"
          className="profile-menu"
          title={currentUser?.email ?? "Loading profile"}
        >
          <div className="avatar">{initials}</div>

          <div className="profile-copy">
            <span className="profile-name">{fullName}</span>
            <span className="profile-role">
              {currentUser?.email ?? "Loading..."}
            </span>
          </div>

          <ChevronDown size={15} className="muted-icon" />
        </button>
      </div>
    </header>
  );
}
