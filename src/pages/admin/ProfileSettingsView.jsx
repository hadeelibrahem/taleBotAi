import { useEffect, useState } from "react";
import { ImagePlus, RefreshCw, Save, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updateCurrentAdmin } from "@/services/adminApi";
import { SectionTitle } from "./components";

function getInitials(name = "Admin") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function ProfileSettingsView({ admin, onAdminUpdated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    password_confirmation: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm((current) => ({
      ...current,
      name: admin?.name || "",
      email: admin?.email || "",
      role: admin?.role || "",
      password: "",
      password_confirmation: "",
    }));
    setAvatarFile(null);
    setAvatarPreview("");
  }, [admin]);

  useEffect(() => {
    if (!avatarFile) {
      return undefined;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function selectAvatar(event) {
    setAvatarFile(event.target.files?.[0] || null);
  }

  async function saveProfile(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = new FormData();
      payload.append("_method", "PATCH");
      payload.append("name", form.name.trim());
      payload.append("email", form.email.trim());
      payload.append("role", form.role.trim());

      if (avatarFile) {
        payload.append("avatar", avatarFile);
      }

      if (form.password || form.password_confirmation) {
        payload.append("password", form.password);
        payload.append("password_confirmation", form.password_confirmation);
      }

      const updatedAdmin = await updateCurrentAdmin(payload);
      onAdminUpdated(updatedAdmin);
      setAvatarFile(null);
      setAvatarPreview("");
      setForm((current) => ({ ...current, password: "", password_confirmation: "" }));
      setMessage("Profile saved.");
    } catch (saveError) {
      setError(saveError.message || "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="admin-page-stack">
      <SectionTitle title="Profile Settings" subtitle="Edit the current admin account details." />

      {message ? <div className="admin-success-message">{message}</div> : null}
      {error ? <div className="admin-error-message">{error}</div> : null}

      <div className="admin-profile-settings-grid">
        <Card className="admin-panel-card admin-profile-settings-card">
          <CardHeader>
            <CardTitle className="admin-card-title admin-card-title-row">
              <ShieldCheck className="admin-icon-md" /> Account Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="admin-profile-form" onSubmit={saveProfile}>
              <label className="admin-field-group">
                <span className="admin-field-label">Full Name</span>
                <Input value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
              </label>

              <label className="admin-field-group">
                <span className="admin-field-label">Email</span>
                <Input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
              </label>

              <label className="admin-field-group">
                <span className="admin-field-label">Role</span>
                <Input value={form.role} onChange={(event) => updateField("role", event.target.value)} required />
              </label>

              <div className="admin-avatar-upload-row">
                <Avatar className="admin-profile-upload-avatar">
                  {avatarPreview || admin?.avatar ? (
                    <img src={avatarPreview || admin.avatar} alt={form.name || "Admin"} className="admin-avatar-image" />
                  ) : (
                    <AvatarFallback>{getInitials(form.name)}</AvatarFallback>
                  )}
                </Avatar>
                <label className="admin-avatar-upload-control">
                  <input type="file" accept="image/png,image/jpeg,image/jpg,image/gif,image/webp" onChange={selectAvatar} />
                  <span className="admin-button admin-avatar-upload-button">
                    <ImagePlus className="admin-icon-sm" />
                    Choose Image
                  </span>
                  <span className="admin-field-help">PNG, JPG, GIF, or WebP up to 2 MB.</span>
                </label>
              </div>

              <div className="admin-profile-form-split">
                <label className="admin-field-group">
                  <span className="admin-field-label">New Password</span>
                  <Input type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} />
                </label>

                <label className="admin-field-group">
                  <span className="admin-field-label">Confirm Password</span>
                  <Input
                    type="password"
                    value={form.password_confirmation}
                    onChange={(event) => updateField("password_confirmation", event.target.value)}
                  />
                </label>
              </div>

              <div className="admin-profile-form-actions">
                <Button className="admin-button" type="submit" disabled={isSaving}>
                  {isSaving ? <RefreshCw className="admin-icon-sm admin-icon-spin" /> : <Save className="admin-icon-sm" />}
                  Save Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
