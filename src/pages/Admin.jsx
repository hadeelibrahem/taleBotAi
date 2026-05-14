import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  CheckCheck,
  Image as ImageIcon,
  LogOut,
  Menu,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchAdminDashboard,
  fetchAdminImages,
  fetchAdminLogs,
  fetchAdminStories,
  fetchAdminUsers,
  fetchAdmins,
  fetchCurrentAdmin,
  logoutAdmin,
} from "@/services/adminApi";
import DashboardView from "./admin/DashboardView";
import ProfileView from "./admin/ProfileView";
import ProfileSettingsView from "./admin/ProfileSettingsView";
import AdminsView from "./admin/AdminsView";
import UsersView from "./admin/UsersView";
import StoriesView from "./admin/StoriesView";
import ImagesView from "./admin/ImagesView";
import LogsView from "./admin/LogsView";
import PaymentsView from "./admin/PaymentsView";
import { navItems } from "./admin/data";
import "../styles/AdminTheme.css";

export default function Admin() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState("");
  const [notificationItems, setNotificationItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [readNotificationIds, setReadNotificationIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("talebot-admin-read-notifications") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let isMounted = true;

    fetchCurrentAdmin()
      .then((admin) => {
        if (isMounted) {
          setCurrentAdmin(admin);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCurrentAdmin(null);
          logoutAdmin().finally(() => navigate("/", { replace: true }));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    let ignore = false;

    async function loadNotifications() {
      try {
        setNotificationsLoading(true);
        setNotificationsError("");

        const [dashboard, images, stories] = await Promise.all([
          fetchAdminDashboard(),
          fetchAdminImages(),
          fetchAdminStories(),
        ]);

        if (ignore) {
          return;
        }

        const pendingImages = images.filter((image) => image.status === "Pending");
        const rejectedImages = images.filter((image) => image.status === "Rejected");
        const pendingStories = stories.filter((story) => story.status === "Pending");
        const rejectedStories = stories.filter((story) => story.status === "Rejected");
        const alerts = Array.isArray(dashboard.recentAlerts) ? dashboard.recentAlerts : [];

        const nextNotifications = [
          pendingImages.length
            ? {
                id: `pending-images-${pendingImages.length}`,
                title: `${pendingImages.length} image${pendingImages.length === 1 ? "" : "s"} waiting for review`,
                detail: "Approve, reject, or keep generated story artwork pending.",
                time: pendingImages[0]?.createdAt || "Now",
                type: "warning",
                target: "images",
                icon: ImageIcon,
              }
            : null,
          rejectedImages.length
            ? {
                id: `rejected-images-${rejectedImages.length}`,
                title: `${rejectedImages.length} rejected image${rejectedImages.length === 1 ? "" : "s"}`,
                detail: "Review rejected outputs before notifying families.",
                time: rejectedImages[0]?.createdAt || "Now",
                type: "danger",
                target: "images",
                icon: AlertTriangle,
              }
            : null,
          pendingStories.length
            ? {
                id: `pending-stories-${pendingStories.length}`,
                title: `${pendingStories.length} story${pendingStories.length === 1 ? "" : "ies"} waiting for approval`,
                detail: "Story status needs an admin decision.",
                time: pendingStories[0]?.createdAt || "Now",
                type: "warning",
                target: "stories",
                icon: BookOpen,
              }
            : null,
          rejectedStories.length
            ? {
                id: `rejected-stories-${rejectedStories.length}`,
                title: `${rejectedStories.length} rejected story${rejectedStories.length === 1 ? "" : "ies"}`,
                detail: "Rejected stories may need follow-up or edits.",
                time: rejectedStories[0]?.createdAt || "Now",
                type: "danger",
                target: "stories",
                icon: ShieldAlert,
              }
            : null,
          ...alerts.map((alert) => ({
            id: `alert-${alert.id}`,
            title: `${alert.type} from ${alert.source}`,
            detail: alert.detail,
            time: alert.time,
            type: ["Error", "Critical", "Alert", "Emergency"].includes(alert.type) ? "danger" : "info",
            target: "logs",
            icon: ShieldAlert,
          })),
        ].filter(Boolean);

        setNotificationItems(nextNotifications);
      } catch (loadError) {
        if (!ignore) {
          setNotificationsError(loadError.message || "Failed to load admin notifications.");
          setNotificationItems([]);
        }
      } finally {
        if (!ignore) {
          setNotificationsLoading(false);
        }
      }
    }

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 60000);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("talebot-admin-read-notifications", JSON.stringify(readNotificationIds));
  }, [readNotificationIds]);

  useEffect(() => {
    let ignore = false;
    const cleanQuery = searchQuery.trim().toLowerCase();

    if (!cleanQuery) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError("");
      return undefined;
    }

    setSearchOpen(true);
    setSearchLoading(true);
    setSearchError("");

    const timeoutId = window.setTimeout(async () => {
      try {
        const [admins, users, stories, images, logs] = await Promise.all([
          fetchAdmins(),
          fetchAdminUsers(),
          fetchAdminStories(),
          fetchAdminImages(),
          fetchAdminLogs(),
        ]);

        if (ignore) {
          return;
        }

        const matches = (parts) => parts.filter(Boolean).join(" ").toLowerCase().includes(cleanQuery);
        const sectionResults = navItems
          .filter((item) => matches([item.label, item.key]))
          .map((item) => ({
            id: `section-${item.key}`,
            title: item.label,
            detail: "Open admin section",
            meta: "Section",
            target: item.key,
            icon: item.icon,
          }));

        const adminResults = admins
          .filter((admin) => matches([admin.name, admin.email, admin.role, admin.status]))
          .slice(0, 4)
          .map((admin) => ({
            id: `admin-${admin.id}`,
            title: admin.name || admin.email || "Admin account",
            detail: [admin.email, admin.role].filter(Boolean).join(" - "),
            meta: "Admin",
            target: "admins",
            icon: ShieldCheck,
          }));

        const userResults = users
          .filter((user) => matches([user.name, user.email, user.role, user.plan, user.status]))
          .slice(0, 5)
          .map((user) => ({
            id: `user-${user.id}`,
            title: user.name || user.email || "User account",
            detail: [user.email, user.plan, user.status].filter(Boolean).join(" - "),
            meta: "User",
            target: "users",
            icon: Users,
          }));

        const storyResults = stories
          .filter((story) => matches([story.title, story.author, story.email, story.genre, story.status, story.childName]))
          .slice(0, 5)
          .map((story) => ({
            id: `story-${story.id}`,
            title: story.title || "Untitled story",
            detail: [story.author, story.genre, story.status].filter(Boolean).join(" - "),
            meta: "Story",
            target: "stories",
            icon: BookOpen,
          }));

        const imageResults = images
          .filter((image) => matches([image.story, image.user, image.email, image.prompt, image.status, image.moderation]))
          .slice(0, 5)
          .map((image) => ({
            id: `image-${image.id}`,
            title: image.story || "Generated image",
            detail: [image.user, image.status, image.moderation].filter(Boolean).join(" - "),
            meta: "Image",
            target: "images",
            icon: ImageIcon,
          }));

        const logResults = logs
          .filter((log) => matches([log.type, log.level, log.source, log.detail, log.message]))
          .slice(0, 4)
          .map((log) => ({
            id: `log-${log.id}`,
            title: `${log.type || "Log"} from ${log.source || "System"}`,
            detail: log.detail || log.message || "Admin log entry",
            meta: "Log",
            target: "logs",
            icon: ShieldAlert,
          }));

        setSearchResults([
          ...sectionResults,
          ...adminResults,
          ...userResults,
          ...storyResults,
          ...imageResults,
          ...logResults,
        ].slice(0, 12));
      } catch (loadError) {
        if (!ignore) {
          setSearchError(loadError.message || "Failed to search admin records.");
          setSearchResults([]);
        }
      } finally {
        if (!ignore) {
          setSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  const unreadNotificationCount = notificationItems.filter((item) => !readNotificationIds.includes(item.id)).length;

  function openNotificationTarget(item) {
    setReadNotificationIds((current) => Array.from(new Set([...current, item.id])));
    setActive(item.target);
    setNotificationsOpen(false);
    setMobileOpen(false);
  }

  function markAllNotificationsRead() {
    setReadNotificationIds(notificationItems.map((item) => item.id));
  }

  function openSearchResult(result) {
    setActive(result.target);
    setSearchOpen(false);
    setNotificationsOpen(false);
    setMobileOpen(false);
  }

  function submitSearch(event) {
    event.preventDefault();

    if (searchResults[0]) {
      openSearchResult(searchResults[0]);
    }
  }

  async function handleAdminLogout() {
    await logoutAdmin();
    navigate("/", { replace: true });
  }

  const adminName = currentAdmin?.name || "Admin Panel";
  const adminEmail = currentAdmin?.email || "No admin account";
  const adminRole = currentAdmin?.role || "Internal Access";
  const adminInitials = (adminName || "Admin")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const currentView = useMemo(() => {
    switch (active) {
      case "profile":
        return <ProfileView admin={currentAdmin} onOpenSettings={() => setActive("profile-settings")} />;
      case "profile-settings":
        return <ProfileSettingsView admin={currentAdmin} onAdminUpdated={setCurrentAdmin} />;
      case "admins":
        return <AdminsView currentAdmin={currentAdmin} />;
      case "users":
        return <UsersView />;
      case "stories":
        return <StoriesView />;
      case "images":
        return <ImagesView />;
      case "logs":
        return <LogsView />;
      case "payments":
        return <PaymentsView currentAdmin={currentAdmin} />;
      default:
        return <DashboardView />;
    }
  }, [active, currentAdmin]);

  return (
    <div className="admin-theme">
      <div className="admin-shell">
        <aside className={`admin-sidebar ${mobileOpen ? "admin-sidebar--open" : ""}`}>
          <div>
            <div className="admin-sidebar-brand">
              <div className="admin-brand-lockup">
                <div className="admin-brand-logo">
                  <img src="/imags/logo.jpg" alt="TaleBot AI" className="admin-brand-logo-image" />
                </div>
                <div>
                  <h1 className="admin-brand-title">TaleBot AI</h1>
                  <p className="admin-brand-subtitle">Admin control panel</p>
                </div>
              </div>
              <button className="admin-mobile-close" onClick={() => setMobileOpen(false)}>
                <X />
              </button>
            </div>

            <nav className="admin-nav-list">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;

                return (
                  <Motion.button
                    key={item.key}
                    onClick={() => {
                      setActive(item.key);
                      setMobileOpen(false);
                    }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`admin-nav-button ${isActive ? "is-active" : ""}`}
                  >
                    <span className="admin-nav-label">
                      <Icon className="admin-icon-md" />
                      <span>{item.label}</span>
                    </span>
                  </Motion.button>
                );
              })}
            </nav>
          </div>

          <button
            type="button"
            className="admin-user-card"
            onClick={() => {
              setActive("profile");
              setMobileOpen(false);
            }}
            aria-label="Open admin profile"
          >
            <Avatar className="admin-avatar-chip admin-avatar-large">
              {currentAdmin?.avatar ? (
                <img src={currentAdmin.avatar} alt={adminName} className="admin-avatar-image" />
              ) : (
                <AvatarFallback>{adminInitials}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <h4 className="admin-user-name">{adminName}</h4>
              <p className="admin-plan-badge">
                {adminRole}
              </p>
            </div>
          </button>

          <Button className="admin-button admin-button--danger admin-logout-button" onClick={handleAdminLogout}>
            <LogOut className="admin-button-icon" />
            Logout
          </Button>
        </aside>

        <div className="admin-main">
          <header className="admin-header">
            <div className="admin-header-search-group">
              <Button variant="outline" size="icon" className="admin-mobile-menu-button" onClick={() => setMobileOpen(true)}>
                <Menu className="admin-icon-md" />
              </Button>
              <form className="admin-global-search" onSubmit={submitSearch}>
                <Search className="admin-global-search-icon" />
                <Input
                  className="admin-global-search-input"
                  placeholder="Search users, stories, images, logs..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onFocus={() => searchQuery.trim() && setSearchOpen(true)}
                />
                {searchQuery ? (
                  <button
                    type="button"
                    className="admin-global-search-clear"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchOpen(false);
                    }}
                    aria-label="Clear admin search"
                  >
                    <X className="admin-icon-sm" />
                  </button>
                ) : null}

                {searchOpen && searchQuery.trim() ? (
                  <div className="admin-search-popover">
                    <div className="admin-popover-header">
                      <p className="admin-popover-title">Search Results</p>
                      <p className="admin-popover-subtitle">Press Enter to open the first result</p>
                    </div>

                    <div className="admin-popover-list">
                      {searchLoading ? (
                        <div className="admin-popover-state">Searching admin records...</div>
                      ) : searchError ? (
                        <div className="admin-popover-state admin-popover-state--error">{searchError}</div>
                      ) : searchResults.length ? (
                        searchResults.map((result) => {
                          const Icon = result.icon;

                          return (
                            <button
                              key={result.id}
                              type="button"
                              className="admin-search-result"
                              onClick={() => openSearchResult(result)}
                            >
                              <span className="admin-search-result-icon">
                                <Icon className="admin-icon-sm" />
                              </span>
                              <span className="admin-search-result-copy">
                                <span className="admin-search-result-heading">
                                  <span className="admin-search-result-title">{result.title}</span>
                                  <span className="admin-search-result-meta">
                                    {result.meta}
                                  </span>
                                </span>
                                <span className="admin-search-result-detail">
                                  {result.detail || "Open result"}
                                </span>
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="admin-popover-state">No admin results found.</div>
                      )}
                    </div>
                  </div>
                ) : null}
              </form>
            </div>

            <div className="admin-header-actions">
              <div className="admin-notification-wrap">
                <Button
                  variant="outline"
                  size="icon"
                  className="admin-icon-button"
                  onClick={() => setNotificationsOpen((current) => !current)}
                  aria-label="Open admin notifications"
                >
                  <Bell className="admin-icon-sm" />
                  {unreadNotificationCount ? (
                    <span className="admin-unread-badge">
                      {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                    </span>
                  ) : null}
                </Button>

                {notificationsOpen ? (
                  <div className="admin-notification-popover">
                    <div className="admin-popover-header admin-popover-header--split">
                      <div>
                        <p className="admin-popover-title">Notifications</p>
                        <p className="admin-popover-subtitle">
                          {unreadNotificationCount ? `${unreadNotificationCount} unread` : "All caught up"}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="admin-button"
                        onClick={markAllNotificationsRead}
                        disabled={!notificationItems.length}
                      >
                        <CheckCheck className="admin-button-icon" />
                        Read
                      </Button>
                    </div>

                    <div className="admin-popover-list admin-notification-list">
                      {notificationsLoading ? (
                        <div className="admin-popover-state">Loading notifications...</div>
                      ) : notificationsError ? (
                        <div className="admin-popover-state admin-popover-state--error">{notificationsError}</div>
                      ) : notificationItems.length ? (
                        notificationItems.map((item) => {
                          const Icon = item.icon;
                          const isUnread = !readNotificationIds.includes(item.id);
                          const tone = item.type === "danger"
                            ? "admin-notification-icon--danger"
                            : item.type === "warning"
                              ? "admin-notification-icon--warning"
                              : "admin-notification-icon--neutral";

                          return (
                            <button
                              key={item.id}
                              className="admin-notification-item"
                              onClick={() => openNotificationTarget(item)}
                            >
                              <span className={`admin-notification-icon ${tone}`}>
                                <Icon className="admin-icon-sm" />
                              </span>
                              <span className="admin-notification-copy">
                                <span className="admin-notification-heading">
                                  <span className="admin-notification-title">{item.title}</span>
                                  {isUnread ? <span className="admin-notification-dot" /> : null}
                                </span>
                                <span className="admin-notification-detail">{item.detail}</span>
                                <span className="admin-notification-time">{item.time}</span>
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="admin-popover-state">No notifications right now.</div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                className="admin-profile-card"
                onClick={() => setActive("profile")}
                aria-label="Open admin profile"
              >
                <Avatar className="admin-avatar-chip">
                  {currentAdmin?.avatar ? (
                    <img src={currentAdmin.avatar} alt={adminName} className="admin-avatar-image" />
                  ) : (
                    <AvatarFallback>{adminInitials}</AvatarFallback>
                  )}
                </Avatar>
                <div className="admin-profile-copy">
                  <p className="admin-profile-name">{adminName}</p>
                  <p className="admin-profile-email">{adminEmail}</p>
                </div>
              </button>
              <Button className="admin-button admin-button--danger admin-header-logout" onClick={handleAdminLogout}>
                <LogOut className="admin-button-icon" />
                Logout
              </Button>
            </div>
          </header>

          <main className="admin-content">
            <AnimatePresence mode="wait">
              <Motion.div
                key={active}
                initial={{ opacity: 0, y: 18, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                {currentView}
              </Motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
