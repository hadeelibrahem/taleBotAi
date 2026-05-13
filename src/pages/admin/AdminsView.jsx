import { useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchAdmins } from "@/services/adminApi";
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

export default function AdminsView() {
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
    { key: "role", header: "Role" },
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
