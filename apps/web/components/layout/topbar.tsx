
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Command,
  UserRound,
  Settings,
  LogOut,
  Check,
  LoaderCircle,
} from "lucide-react";

import type { DashboardUser } from "./app-shell";

interface TopbarProps {
  onMenuClick: () => void;
  currentUser?: DashboardUser;
  unreadNotifications?: number;
}

interface NotificationItem {
  id: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const seconds = Math.floor((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
  });

  if (Math.abs(seconds) < 60) {
    return formatter.format(seconds, "second");
  }

  if (Math.abs(seconds) < 3600) {
    return formatter.format(Math.round(seconds / 60), "minute");
  }

  if (Math.abs(seconds) < 86400) {
    return formatter.format(Math.round(seconds / 3600), "hour");
  }

  return formatter.format(Math.round(seconds / 86400), "day");
}

export function Topbar({
  onMenuClick,
  currentUser,
  unreadNotifications = 0,
}: TopbarProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationCount, setNotificationCount] =
    useState(unreadNotifications);

  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [markingReadId, setMarkingReadId] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const [notificationError, setNotificationError] = useState("");
  const [logoutError, setLogoutError] = useState("");

  const topbarRef = useRef<HTMLDivElement>(null);

  const fullName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : "Loading profile";

  const initials = currentUser
    ? `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`.toUpperCase()
    : "—";

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        topbarRef.current &&
        !topbarRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  async function loadNotifications() {
    setLoadingNotifications(true);
    setNotificationError("");

    try {
      const response = await fetch("/api/notifications", {
        method: "GET",
        cache: "no-store",
      });

      if (response.status === 401) {
        router.replace("/login");
        router.refresh();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load notifications");
      }

      const result = data as NotificationsResponse;

      setNotifications(result.notifications ?? []);
      setNotificationCount(result.unreadCount ?? 0);
    } catch (error) {
      setNotificationError(
        error instanceof Error
          ? error.message
          : "Unable to load notifications",
      );
    } finally {
      setLoadingNotifications(false);
    }
  }

  async function toggleNotifications() {
    const shouldOpen = !notificationsOpen;

    setProfileOpen(false);
    setNotificationsOpen(shouldOpen);

    if (shouldOpen) {
      await loadNotifications();
    }
  }

  async function markAsRead(notificationId: string) {
    setMarkingReadId(notificationId);
    setNotificationError("");

    try {
      const response = await fetch(
        `/api/notifications/${encodeURIComponent(notificationId)}/read`,
        {
          method: "PATCH",
        },
      );

      if (response.status === 401) {
        router.replace("/login");
        router.refresh();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update notification");
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : notification,
        ),
      );

      setNotificationCount((previous) => Math.max(0, previous - 1));
    } catch (error) {
      setNotificationError(
        error instanceof Error
          ? error.message
          : "Unable to update notification",
      );
    } finally {
      setMarkingReadId(null);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to log out");
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : "Unable to log out",
      );
      setLoggingOut(false);
    }
  }

  return (
    <header className="topbar" ref={topbarRef}>
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

        {/* Notifications */}
        <div className="topbar-popover-anchor">
          <button
            type="button"
            className="icon-button notification-button"
            aria-label={`${notificationCount} unread notifications`}
            aria-expanded={notificationsOpen}
            title={`${notificationCount} unread notifications`}
            onClick={toggleNotifications}
          >
            <Bell size={19} />

            {notificationCount > 0 && (
              <span className="notification-dot" />
            )}
          </button>

          {notificationsOpen && (
            <div className="topbar-popover notification-popover">
              <div className="popover-heading">
                <div>
                  <strong>Notifications</strong>
                  <span>{notificationCount} unread</span>
                </div>

                <button
                  type="button"
                  className="popover-close"
                  onClick={() => setNotificationsOpen(false)}
                  aria-label="Close notifications"
                >
                  ×
                </button>
              </div>

              {loadingNotifications ? (
                <div className="popover-empty">
                  <LoaderCircle className="animate-spin" size={22} />
                  <span>Loading notifications...</span>
                </div>
              ) : notificationError ? (
                <div className="popover-error">
                  {notificationError}
                  <button
                    type="button"
                    onClick={loadNotifications}
                  >
                    Retry
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="popover-empty">
                  <Bell size={23} />
                  <strong>You&apos;re all caught up</strong>
                  <span>No notifications available.</span>
                </div>
              ) : (
                <div className="notification-list">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${
                        notification.isRead ? "" : "notification-unread"
                      }`}
                    >
                      <div className="notification-content">
                        <div className="notification-title">
                          {notification.title}
                        </div>

                        <p>{notification.message}</p>

                        <span className="notification-time">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>

                      {!notification.isRead && (
                        <button
                          type="button"
                          className="notification-read-button"
                          title="Mark as read"
                          aria-label={`Mark ${notification.title} as read`}
                          disabled={markingReadId === notification.id}
                          onClick={() => markAsRead(notification.id)}
                        >
                          {markingReadId === notification.id ? (
                            <LoaderCircle
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <Check size={15} />
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="topbar-divider profile-divider" />

        {/* Profile */}
        <div className="topbar-popover-anchor">
          <button
            type="button"
            className="profile-menu"
            title={currentUser?.email ?? "Loading profile"}
            aria-expanded={profileOpen}
            onClick={() => {
              setNotificationsOpen(false);
              setProfileOpen((previous) => !previous);
            }}
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

          {profileOpen && (
            <div className="topbar-popover profile-popover">
              <div className="popover-user">
                <div className="avatar">{initials}</div>
                <div>
                  <strong>{fullName}</strong>
                  <span>{currentUser?.email}</span>
                </div>
              </div>

              <div className="popover-divider" />

              <button
                type="button"
                className="popover-action"
                onClick={() => {
                  setProfileOpen(false);
                  router.push("/settings");
                }}
              >
                <Settings size={16} />
                Account settings
              </button>

              {logoutError && (
                <div className="popover-error">{logoutError}</div>
              )}

              <button
                type="button"
                className="popover-action popover-logout"
                disabled={loggingOut}
                onClick={handleLogout}
              >
                {loggingOut ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <LogOut size={16} />
                )}
                {loggingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
