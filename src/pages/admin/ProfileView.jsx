import { CalendarDays, Mail, Settings, ShieldCheck, UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTitle, StatusBadge } from "./components";

function getInitials(name = "Admin") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function ProfileView({ admin, onOpenSettings }) {
  const adminName = admin?.name || "Admin Panel";
  const adminEmail = admin?.email || "No admin account";
  const adminRole = admin?.role || "Internal Access";
  const adminStatus = admin?.status || "Unavailable";

  return (
    <div className="admin-page-stack">
      <div className="admin-page-header">
        <SectionTitle title="Profile" subtitle="Current admin account and access details." />
        <Button className="admin-button" onClick={onOpenSettings}>
          <Settings className="admin-icon-sm" /> Settings
        </Button>
      </div>

      <Card className="admin-panel-card admin-profile-hero-card">
        <CardContent className="admin-profile-hero-content">
          <Avatar className="admin-profile-hero-avatar">
            {admin?.avatar ? (
              <img src={admin.avatar} alt={adminName} className="admin-profile-avatar-image" />
            ) : (
              <AvatarFallback>{getInitials(adminName)}</AvatarFallback>
            )}
          </Avatar>
          <div className="admin-profile-hero-copy">
            <div className="admin-profile-hero-heading">
              <h3>{adminName}</h3>
              <StatusBadge status={adminStatus} />
            </div>
            <p>{adminRole}</p>
            <span>{adminEmail}</span>
          </div>
        </CardContent>
      </Card>

      <div className="admin-profile-grid">
        <Card className="admin-panel-card">
          <CardHeader>
            <CardTitle className="admin-card-title admin-card-title-row">
              <UserRound className="admin-icon-md" /> Account
            </CardTitle>
          </CardHeader>
          <CardContent className="admin-profile-detail-list">
            <div className="admin-profile-detail-row">
              <span>Name</span>
              <strong>{adminName}</strong>
            </div>
            <div className="admin-profile-detail-row">
              <span>Role</span>
              <strong>{adminRole}</strong>
            </div>
            <div className="admin-profile-detail-row">
              <span>Status</span>
              <StatusBadge status={adminStatus} />
            </div>
          </CardContent>
        </Card>

        <Card className="admin-panel-card">
          <CardHeader>
            <CardTitle className="admin-card-title admin-card-title-row">
              <ShieldCheck className="admin-icon-md" /> Access
            </CardTitle>
          </CardHeader>
          <CardContent className="admin-profile-detail-list">
            <div className="admin-profile-detail-row">
              <span><Mail className="admin-icon-sm" /> Email</span>
              <strong>{adminEmail}</strong>
            </div>
            <div className="admin-profile-detail-row">
              <span><CalendarDays className="admin-icon-sm" /> Created</span>
              <strong>{admin?.joinedAt || "Not available"}</strong>
            </div>
            <div className="admin-profile-detail-row">
              <span>Last Updated</span>
              <strong>{admin?.lastUpdated || "Not available"}</strong>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
