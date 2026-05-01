import { useEffect, useMemo, useState } from "react";
import { Baby, Ban, BookOpen, Eye, Image as ImageIcon, Search, Trash2, UserCheck, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminDataTable, SectionTitle, StatCard, StatusBadge } from "./components";
import { deleteAdminUser, fetchAdminUserDetail, fetchAdminUsers, updateAdminUserStatus } from "@/services/adminApi";

function getInitials(name) {
  return (name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [deletingUserIds, setDeletingUserIds] = useState([]);
  const [savingUserIds, setSavingUserIds] = useState([]);

  useEffect(() => {
    let ignore = false;

    async function loadUsers() {
      try {
        setLoading(true);
        setError("");
        const payload = await fetchAdminUsers();
        if (!ignore) {
          setUsers(payload);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message || "Failed to load users.");
          setUsers([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      setUserDetail(null);
      setDetailError("");
      setDetailLoading(false);
      return;
    }

    let ignore = false;

    async function loadUserDetail() {
      try {
        setDetailLoading(true);
        setDetailError("");
        const payload = await fetchAdminUserDetail(selectedUser.id);
        if (!ignore) {
          setUserDetail(payload);
        }
      } catch (loadError) {
        if (!ignore) {
          setUserDetail(null);
          setDetailError(loadError.message || "Failed to load user details.");
        }
      } finally {
        if (!ignore) {
          setDetailLoading(false);
        }
      }
    }

    loadUserDetail();

    return () => {
      ignore = true;
    };
  }, [selectedUser]);

  async function removeUser(user) {
    const confirmed = window.confirm(`Delete ${user.name}? This will remove the user and their stories.`);
    if (!confirmed) {
      return;
    }

    setDeletingUserIds((current) => [...current, user.id]);
    setError("");

    try {
      await deleteAdminUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      setSelectedUser((current) => (current?.id === user.id ? null : current));
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete user.");
    } finally {
      setDeletingUserIds((current) => current.filter((id) => id !== user.id));
    }
  }

  async function toggleUserBan(user) {
    const nextStatus = user.status === "Banned" ? "Active" : "Banned";
    const confirmed = window.confirm(`${nextStatus === "Banned" ? "Ban" : "Activate"} ${user.name}?`);
    if (!confirmed) {
      return;
    }

    setSavingUserIds((current) => [...current, user.id]);
    setError("");
    setDetailError("");

    try {
      const payload = await updateAdminUserStatus(user.id, nextStatus);
      setUsers((current) => current.map((item) => (item.id === user.id ? { ...item, ...payload } : item)));
      setSelectedUser((current) => (current?.id === user.id ? { ...current, ...payload } : current));
      setUserDetail((current) => (current?.id === user.id ? { ...current, ...payload } : current));
    } catch (saveError) {
      const message = saveError.message || "Failed to update user status.";
      setError(message);
      setDetailError(message);
    } finally {
      setSavingUserIds((current) => current.filter((id) => id !== user.id));
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      [user.name, user.email, user.role, user.plan, user.status]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [query, users]);

  const userStats = useMemo(() => {
    const stories = users.reduce((sum, user) => sum + Number(user.stories || 0), 0);
    const images = users.reduce((sum, user) => sum + Number(user.images || 0), 0);
    const children = users.reduce((sum, user) => sum + Number(user.children || 0), 0);

    return [
      { title: "Total Users", value: String(users.length), change: `${users.length} synced`, icon: Baby },
      { title: "Stories Created", value: String(stories), change: `${stories} total`, icon: BookOpen },
      { title: "Images Generated", value: String(images), change: `${images} total`, icon: ImageIcon },
      { title: "Child Profiles", value: String(children), change: `${children} linked`, icon: Baby },
    ];
  }, [users]);

  const columns = [
    {
      key: "user",
      header: "User",
      render: (user) => (
        <div className="admin-person-cell">
          <Avatar>
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="admin-person-name">{user.name}</p>
            <p className="admin-person-email">{user.email}</p>
          </div>
        </div>
      ),
    },
    { key: "role", header: "Role" },
    { key: "plan", header: "Plan" },
    { key: "stories", header: "Stories" },
    { key: "images", header: "Images" },
    { key: "children", header: "Children" },
    { key: "totalSpent", header: "Spent" },
    { key: "joinedAt", header: "Joined" },
    {
      key: "status",
      header: "Status",
      render: (user) => <StatusBadge status={user.status} />,
    },
    { key: "lastActive", header: "Last Active" },
    {
      key: "actions",
      header: "Actions",
      render: (user) => (
        <div className="admin-row-actions">
          <Button variant="outline" size="sm" className="admin-button" onClick={() => setSelectedUser(user)}>
            <Eye className="admin-icon-sm" /> View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={user.status === "Banned" ? "admin-button admin-button--success" : "admin-button admin-button--danger"}
            onClick={() => toggleUserBan(user)}
            disabled={savingUserIds.includes(user.id)}
          >
            {user.status === "Banned" ? <UserCheck className="admin-icon-sm" /> : <Ban className="admin-icon-sm" />}
            {user.status === "Banned" ? "Activate" : "Ban"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="admin-button"
            onClick={() => removeUser(user)}
            disabled={deletingUserIds.includes(user.id)}
          >
            <Trash2 className="admin-icon-sm" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page-stack">
      <SectionTitle title="User Management" subtitle="Manage accounts, plans, activity, and moderation from one table." />

      <div className="admin-stats-grid">
        {userStats.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      <AdminDataTable
        title="All Users"
        description="Live account records from the backend with usage, child profiles, and activity details."
        filters={
          <div className="admin-search-field">
            <Search className="admin-search-icon" />
            <Input
              className="admin-search-input"
              placeholder="Search users..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        }
        columns={columns}
        rows={filteredUsers}
        emptyMessage={
          loading
            ? "Loading users..."
            : error
              ? `Failed to load users: ${error}`
              : "No users matched your current search."
        }
      />

      {selectedUser ? (
        <div className="admin-modal-backdrop">
          <div className="admin-modal admin-modal--medium">
            <div className="admin-modal-header">
              <div className="admin-person-cell">
                <Avatar className="admin-avatar-large">
                  <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="admin-modal-label">User Profile</p>
                  <h3 className="admin-modal-title">{selectedUser.name}</h3>
                </div>
              </div>
              <Button variant="outline" size="sm" className="admin-button" onClick={() => setSelectedUser(null)}>
                <X className="admin-icon-sm" />
              </Button>
            </div>

            <div className="admin-modal-body">
              {detailLoading ? (
                <div className="admin-loading-state">Loading user details...</div>
              ) : detailError ? (
                <div className="admin-loading-state">{detailError}</div>
              ) : (
                <div className="admin-detail-stack">
                  <div className="admin-detail-grid">
                    <p><span>Email:</span> {userDetail?.email || selectedUser.email}</p>
                    <p><span>Plan:</span> {userDetail?.plan || selectedUser.plan}</p>
                    <p><span>Status:</span> {userDetail?.status || selectedUser.status}</p>
                    <p><span>Joined:</span> {userDetail?.joinedAt || selectedUser.joinedAt}</p>
                    <p><span>Last active:</span> {userDetail?.lastActive || selectedUser.lastActive}</p>
                  </div>

                  <div className="admin-filter-row">
                    <Button
                      className="admin-button"
                      variant={selectedUser.status === "Banned" ? "default" : "outline"}
                      onClick={() => toggleUserBan(userDetail || selectedUser)}
                      disabled={savingUserIds.includes(selectedUser.id)}
                    >
                      {selectedUser.status === "Banned" ? <UserCheck className="admin-icon-sm" /> : <Ban className="admin-icon-sm" />}
                      {selectedUser.status === "Banned" ? "Activate User" : "Ban User"}
                    </Button>
                  </div>

                  <div className="admin-detail-stats">
                    <div className="admin-detail-stat-card">
                      <p>Stories</p>
                      <strong>{userDetail?.stories ?? selectedUser.stories}</strong>
                    </div>
                    <div className="admin-detail-stat-card">
                      <p>Images</p>
                      <strong>{userDetail?.images ?? selectedUser.images}</strong>
                    </div>
                    <div className="admin-detail-stat-card">
                      <p>Children</p>
                      <strong>{userDetail?.children?.length ?? selectedUser.children}</strong>
                    </div>
                  </div>

                  <div className="admin-detail-card">
                    <h4>Child Profiles</h4>
                    <div className="admin-chip-row">
                      {userDetail?.children?.length ? (
                        userDetail.children.map((child) => (
                          <span key={child.id} className="admin-chip">
                            {child.name}{child.age ? `, ${child.age}` : ""}
                          </span>
                        ))
                      ) : (
                        <p className="admin-muted-text">No child profiles yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="admin-detail-card">
                    <h4>Recent Stories</h4>
                    <div className="admin-detail-list">
                      {userDetail?.recentStories?.length ? (
                        userDetail.recentStories.map((story) => (
                          <div key={story.id} className="admin-detail-list-row">
                            <div>
                              <p className="admin-list-row-title">{story.title}</p>
                              <p className="admin-list-row-meta">{story.genre} - {story.createdAt}</p>
                            </div>
                            <StatusBadge status={story.status} />
                          </div>
                        ))
                      ) : (
                        <p className="admin-muted-text">No stories created yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
