"use client";

import { useEffect, useState } from "react";
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

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {mounted && theme === "dark" ? (
            <Sun size={19} />
          ) : (
            <Moon size={19} />
          )}
        </button>

        <button
          type="button"
          className="icon-button notification-button"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="notification-dot" />
        </button>

        <div className="topbar-divider profile-divider" />

        <button type="button" className="profile-menu">
          <div className="avatar">SA</div>

          <div className="profile-copy">
            <span className="profile-name">System Admin</span>
            <span className="profile-role">Administrator</span>
          </div>

          <ChevronDown size={15} className="muted-icon" />
        </button>
      </div>
    </header>
  );
}