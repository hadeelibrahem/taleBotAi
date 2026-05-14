import { useEffect, useState } from "react";
import { Plus, RefreshCw, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchAdmins, registerAdmin, updateAdminRole } from "@/services/adminApi";
import { AdminDataTable, SectionTitle, StatusBadge } from "./components";

function getInitials(name = "Admin") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const defaultForm = {
  full_name: "",
  email: "",
  password: "",
  password_confirmation: "",
  role: "admin",
};

export default function AdminsView({ currentAdmin }) {
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(defaultForm);
  const [createMessage, setCreateMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [roleMessage, setRoleMessage] = useState("");
  const [updatingRoleId, setUpdatingRoleId] = useState(null);

  const canCreateAdmins = currentAdmin?.role?.toLowerCase() === "super admin";
  const canUpdateAdminRoles = canCreateAdmins;

  async function loadAdmins() {
    setIsLoading(true);
    setError("");

    try {
      setAdmins(await fetchAdmins());
    } catch (err) {
      setError(err.message || "Unable to load admins.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  async function handleCreateAdmin(event) {
    event.preventDefault();
    setCreateMessage("");

    if (formData.password !== formData.password_confirmation) {
      setCreateMessage("Passwords do not match.");
      return;
    }

    setIsCreating(true);

    try {
      await registerAdmin(formData);
      setCreateMessage("Admin account created.");
      setFormData(defaultForm);
      await loadAdmins();
    } catch (err) {
      setCreateMessage(err.message || "Unable to create admin account.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRoleChange(admin, role) {
    setRoleMessage("");
    setUpdatingRoleId(admin.id);

    try {
      const updatedAdmin = await updateAdminRole(admin.id, role);
      setAdmins((current) => current.map((item) => (item.id === admin.id ? updatedAdmin : item)));
      setRoleMessage(`Role updated for ${updatedAdmin.name}.`);
    } catch (err) {
      setRoleMessage(err.message || "Unable to update admin role.");
    } finally {
      setUpdatingRoleId(null);
    }
  }

  const filteredAdmins = admins.filter((admin) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return true;
    }

    return [admin.name, admin.email, admin.role, admin.status]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(keyword));
  });

  const columns = [
    {
      key: "admin",
      header: "Admin",
      render: (admin) => (
        <div className="admin-person-cell">
          <Avatar>
            <AvatarFallback>{getInitials(admin.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="admin-person-name">{admin.name}</p>
            <p className="admin-person-email">{admin.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (admin) => {
        const canEditRole = canUpdateAdminRoles && currentAdmin?.id !== admin.id;

        if (!canEditRole) {
          return admin.role;
        }

        return (
          <select
            className="admin-search-input"
            value={admin.role}
            disabled={updatingRoleId === admin.id}
            onChange={(event) => handleRoleChange(admin, event.target.value)}
          >
            <option value="admin">admin</option>
            <option value="super admin">super admin</option>
          </select>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (admin) => <StatusBadge status={admin.status} />,
    },
    { key: "joinedAt", header: "Created" },
    { key: "lastUpdated", header: "Last Updated" },
  ];

  return (
    <div className="admin-page-stack">
      <SectionTitle title="Admin Accounts" subtitle="Accounts loaded directly from the admins table." />
      {error ? <div className="admin-error-message">{error}</div> : null}
      {roleMessage ? <div className="admin-success-message">{roleMessage}</div> : null}
      {canCreateAdmins ? (
        <form className="admin-data-card" onSubmit={handleCreateAdmin}>
          <div className="admin-data-header">
            <div>
              <h3>Create Admin</h3>
              <p>Only super admins can add internal access accounts.</p>
            </div>
            <Button className="admin-button" type="submit" disabled={isCreating}>
              <Plus className="admin-icon-sm" />
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </div>
          <div className="admin-profile-form-split">
            <label className="admin-field-group">
              <span>Full Name</span>
              <Input
                className="admin-search-input"
                value={formData.full_name}
                onChange={(event) => setFormData((prev) => ({ ...prev, full_name: event.target.value }))}
                required
              />
            </label>
            <label className="admin-field-group">
              <span>Email</span>
              <Input
                className="admin-search-input"
                type="email"
                value={formData.email}
                onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
            </label>
            <label className="admin-field-group">
              <span>Password</span>
              <Input
                className="admin-search-input"
                type="password"
                value={formData.password}
                onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                minLength={8}
                required
              />
            </label>
            <label className="admin-field-group">
              <span>Confirm Password</span>
              <Input
                className="admin-search-input"
                type="password"
                value={formData.password_confirmation}
                onChange={(event) => setFormData((prev) => ({ ...prev, password_confirmation: event.target.value }))}
                minLength={8}
                required
              />
            </label>
          </div>
          {createMessage ? <div className="admin-error-message">{createMessage}</div> : null}
        </form>
      ) : null}
      <AdminDataTable
        title="All Admins"
        description={isLoading ? "Loading admin accounts..." : "Manage internal access records connected to the backend."}
        filters={
          <>
            <div className="admin-search-field admin-search-field--compact">
              <Search className="admin-search-icon" />
              <Input
                className="admin-search-input"
                placeholder="Search admins..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Button className="admin-button" onClick={loadAdmins} disabled={isLoading}>
              <RefreshCw className={`admin-icon-sm ${isLoading ? "admin-icon-spin" : ""}`} /> Refresh
            </Button>
          </>
        }
        columns={columns}
        rows={filteredAdmins}
        emptyMessage={isLoading ? "Loading admins..." : "No admin accounts found."}
      />
    </div>
  );
}
