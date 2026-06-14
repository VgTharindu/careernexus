import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import Avatar, { getImageUrl } from "../ui/Avatar";
import {
  Sun,
  Moon,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import api from "../../utils/api";

export default function Topbar({ collapsed }) {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, profileImage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef();
  const userRef = useRef();

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
    } catch {
      /* silent fail */
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ── Dynamic page title ────────────────────────────────
  const getTitle = () => {
    const path = location.pathname;
    if (path.includes("dashboard")) return "Dashboard";
    if (path.includes("post-job")) return "Post a Job";
    if (path.includes("applicants")) return "Applicants";
    if (path.includes("jobs")) return "Jobs";
    if (path.includes("applications")) return "My Applications";
    if (path.includes("notifications")) return "Notifications";
    if (path.includes("profile")) return "Profile";
    if (path.includes("settings")) return "Settings";
    if (path.includes("companies")) return "Company Management";
    if (path.includes("analytics")) return "Analytics";
    if (path.includes("reports")) return "Reports";
    if (path.includes("students")) return "Students";
    if (path.includes("users")) return "User Management";
    return "CareerNexus";
  };

  // ── Profile and settings paths by role ───────────────
  const profilePath =
    user?.role === "student"
      ? "/student/profile"
      : user?.role === "company"
        ? "/company/profile"
        : "/admin/dashboard";

  const settingsPath =
    user?.role === "student"
      ? "/student/settings"
      : user?.role === "company"
        ? "/company/settings"
        : "/admin/dashboard";

  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center justify-between px-6"
      style={{
        left: collapsed ? "64px" : "240px",
        height: "64px",
        background: "var(--color-bg-secondary)",
        borderBottom: "1px solid var(--color-border)",
        transition: "left 0.25s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Page title */}
      <h1
        className="text-lg font-semibold"
        style={{ color: "var(--color-text-primary)" }}
      >
        {getTitle()}
      </h1>

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-colors"
          style={{
            color: "var(--color-text-muted)",
            background: "var(--color-bg-hover)",
          }}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-lg transition-colors"
            style={{
              color: "var(--color-text-muted)",
              background: "var(--color-bg-hover)",
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold"
                style={{ background: "#EF4444", fontSize: "10px" }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifs && (
            <div
              className="absolute right-0 top-12 w-80 rounded-xl border shadow-xl z-50 overflow-hidden fade-in"
              style={{
                background: "var(--color-bg-card)",
                borderColor: "var(--color-border)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: "var(--color-border)" }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs hover:underline"
                    style={{ color: "var(--color-blue-light)" }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell
                      size={28}
                      className="mx-auto mb-2 opacity-30"
                      style={{ color: "var(--color-text-muted)" }}
                    />
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notif) => (
                    <div
                      key={notif.id}
                      className="px-4 py-3 border-b transition-colors"
                      style={{
                        borderColor: "var(--color-border)",
                        background: notif.isRead
                          ? "transparent"
                          : "rgba(59,130,246,0.06)",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {!notif.isRead && (
                          <div
                            className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                            style={{ background: "#3B82F6" }}
                          />
                        )}
                        <div className={notif.isRead ? "pl-5" : ""}>
                          <p
                            className="text-xs leading-relaxed"
                            style={{
                              color: "var(--color-text-primary)",
                              fontWeight: notif.isRead ? 400 : 500,
                            }}
                          >
                            {notif.message}
                          </p>
                          <p
                            className="text-xs mt-1"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* View all link */}
              {notifications.length > 0 && (
                <div
                  className="px-4 py-2 border-t text-center"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <button
                    onClick={() => {
                      navigate(`/${user?.role}/notifications`);
                      setShowNotifs(false);
                    }}
                    className="text-xs hover:underline"
                    style={{ color: "#60A5FA" }}
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
            style={{ background: "var(--color-bg-hover)" }}
          >
            <Avatar name={user?.name} src={profileImage} size="sm" />
            <div className="hidden sm:block text-left">
              <p
                className="text-xs font-semibold leading-tight"
                style={{ color: "var(--color-text-primary)" }}
              >
                {user?.name?.split(" ")[0]}
              </p>
              <p
                className="text-xs leading-tight capitalize"
                style={{ color: "var(--color-text-muted)" }}
              >
                {user?.role}
              </p>
            </div>
            <ChevronDown
              size={14}
              style={{ color: "var(--color-text-muted)" }}
            />
          </button>

          {/* User dropdown */}
          {showUserMenu && (
            <div
              className="absolute right-0 top-12 w-48 rounded-xl border shadow-xl z-50 overflow-hidden fade-in"
              style={{
                background: "var(--color-bg-card)",
                borderColor: "var(--color-border)",
              }}
            >
              {/* User info header */}
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: "var(--color-border)" }}
              >
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {user?.name}
                </p>
                <p
                  className="text-xs truncate capitalize"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {user?.email}
                </p>
              </div>

              {/* Menu items */}
              {[
                { icon: User, label: "My Profile", path: profilePath },
                { icon: Settings, label: "Settings", path: settingsPath },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.path);
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left"
                  style={{
                    color: "var(--color-text-secondary)",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--color-bg-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <item.icon size={15} />
                  {item.label}
                </button>
              ))}

              {/* Sign out */}
              <div
                className="border-t"
                style={{ borderColor: "var(--color-border)" }}
              >
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 transition-colors"
                  style={{ background: "transparent" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(239,68,68,0.08)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
