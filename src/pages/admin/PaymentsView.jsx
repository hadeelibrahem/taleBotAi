import { useEffect, useMemo, useState } from "react";
import { CreditCard, DollarSign, RefreshCw, Search, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdminDataTable, SectionTitle, StatCard, StatusBadge } from "./components";
import { fetchAdminPayments, renewAdminUserPlan, updateAdminUserPlan, updatePlanSettings } from "@/services/adminApi";

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function PaymentsView({ currentAdmin }) {
  const [summary, setSummary] = useState({});
  const [plans, setPlans] = useState([]);
  const [planForms, setPlanForms] = useState({});
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [planMessage, setPlanMessage] = useState("");
  const [query, setQuery] = useState("");
  const [savingUserIds, setSavingUserIds] = useState([]);
  const [savingPlanKey, setSavingPlanKey] = useState("");
  const isSuperAdmin = currentAdmin?.role?.toLowerCase() === "super admin";

  async function loadPayments() {
    try {
      setLoading(true);
      setError("");
      const payload = await fetchAdminPayments();
      setSummary(payload.summary || {});
      setPlans(Array.isArray(payload.plans) ? payload.plans : []);
      setPlanForms(
        Object.fromEntries((payload.plans || []).map((plan) => [plan.key, planToForm(plan)]))
      );
      setSubscriptions(Array.isArray(payload.subscriptions) ? payload.subscriptions : []);
    } catch (loadError) {
      setError(loadError.message || "Failed to load payment data.");
      setSummary({});
      setPlans([]);
      setPlanForms({});
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  async function changePlan(subscription, plan) {
    if (plan === subscription.planKey) {
      return;
    }

    setSavingUserIds((current) => [...current, subscription.id]);
    setError("");

    try {
      const updated = await updateAdminUserPlan(subscription.id, plan);
      setSubscriptions((current) => current.map((item) => (item.id === subscription.id ? { ...item, ...updated } : item)));
      await loadPayments();
    } catch (saveError) {
      setError(saveError.message || "Failed to update user plan.");
    } finally {
      setSavingUserIds((current) => current.filter((id) => id !== subscription.id));
    }
  }

  async function renewPlan(subscription) {
    setSavingUserIds((current) => [...current, subscription.id]);
    setError("");
    setPlanMessage("");

    try {
      const updated = await renewAdminUserPlan(subscription.id);
      setSubscriptions((current) => current.map((item) => (item.id === subscription.id ? { ...item, ...updated } : item)));
      setPlanMessage(`${updated.name}'s subscription renewed until ${updated.expiresAt}.`);
      await loadPayments();
    } catch (saveError) {
      setError(saveError.message || "Failed to renew subscription.");
    } finally {
      setSavingUserIds((current) => current.filter((id) => id !== subscription.id));
    }
  }

  function planToForm(plan) {
    return {
      name: plan.name || "",
      monthly_price: String(plan.price ?? 0),
      story_limit: plan.storyLimit ?? "",
      image_limit: plan.imageLimit ?? "",
      child_profile_limit: plan.childProfileLimit ?? "",
      features: Array.isArray(plan.features) ? plan.features.join("\n") : "",
    };
  }

  function updatePlanForm(planKey, field, value) {
    setPlanForms((current) => ({
      ...current,
      [planKey]: {
        ...(current[planKey] || {}),
        [field]: value,
      },
    }));
  }

  async function savePlanSettings(planKey) {
    const form = planForms[planKey] || {};
    setError("");
    setPlanMessage("");
    setSavingPlanKey(planKey);

    try {
      const updatedPlan = await updatePlanSettings(planKey, {
        name: form.name,
        monthly_price: Number(form.monthly_price || 0),
        story_limit: form.story_limit === "" ? null : Number(form.story_limit),
        image_limit: form.image_limit === "" ? null : Number(form.image_limit),
        child_profile_limit: form.child_profile_limit === "" ? null : Number(form.child_profile_limit),
        features: String(form.features || "")
          .split("\n")
          .map((feature) => feature.trim())
          .filter(Boolean),
      });

      setPlans((current) => current.map((plan) => (plan.key === planKey ? updatedPlan : plan)));
      setPlanForms((current) => ({ ...current, [planKey]: planToForm(updatedPlan) }));
      setPlanMessage(`${updatedPlan.name} plan settings updated.`);
      await loadPayments();
    } catch (saveError) {
      setError(saveError.message || "Failed to update plan settings.");
    } finally {
      setSavingPlanKey("");
    }
  }

  const filteredSubscriptions = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return subscriptions;
    }

    return subscriptions.filter((subscription) =>
      [subscription.name, subscription.email, subscription.plan, subscription.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [query, subscriptions]);

  const stats = [
    {
      title: "Premium Users",
      value: String(summary.premiumUsers || 0),
      change: `${summary.paidUsers || 0} paid accounts`,
      icon: Users,
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(summary.monthlyRevenue),
      change: "estimated from plans",
      icon: DollarSign,
    },
    {
      title: "Premium Feature Usage",
      value: `${summary.premiumFeatureUsage || 0}%`,
      change: "child settings enabled",
      icon: Settings,
    },
    {
      title: "Total Accounts",
      value: String(summary.totalUsers || subscriptions.length),
      change: `${filteredSubscriptions.length} visible`,
      icon: CreditCard,
    },
  ];

  const columns = [
    {
      key: "customer",
      header: "Customer",
      render: (subscription) => (
        <div>
          <p className="admin-person-name">{subscription.name}</p>
          <p className="admin-person-email">{subscription.email}</p>
        </div>
      ),
    },
    { key: "plan", header: "Plan" },
    { key: "monthlyPriceLabel", header: "Monthly" },
    { key: "paymentStatus", header: "Payment" },
    { key: "renewsAt", header: "Renews" },
    { key: "expiresAt", header: "Expires" },
    { key: "stories", header: "Stories" },
    { key: "children", header: "Children" },
    {
      key: "status",
      header: "Status",
      render: (subscription) => <StatusBadge status={subscription.status} />,
    },
    { key: "joinedAt", header: "Joined" },
    { key: "lastUpdated", header: "Updated" },
    {
      key: "actions",
      header: "Plan Control",
      render: (subscription) => (
        <div className="admin-row-actions">
          <select
            className="admin-select admin-plan-select"
            value={subscription.planKey}
            onChange={(event) => changePlan(subscription, event.target.value)}
            disabled={!isSuperAdmin || savingUserIds.includes(subscription.id)}
          >
            {plans.map((plan) => (
              <option key={plan.key} value={plan.key}>
                {plan.name}
              </option>
            ))}
          </select>
          {isSuperAdmin && subscription.planKey !== "free" ? (
            <Button className="admin-button" onClick={() => renewPlan(subscription)} disabled={savingUserIds.includes(subscription.id)}>
              Renew
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page-stack">
      <SectionTitle title="Payments & Premium" subtitle="Plan revenue, premium usage, and subscription controls." />

      <div className="admin-stats-grid">
        {stats.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      {error ? <div className="admin-error-message">{error}</div> : null}
      {planMessage ? <div className="admin-success-message">{planMessage}</div> : null}

      <div className="admin-plan-grid">
        {plans.map((plan) => (
          <Card key={plan.key} className="admin-panel-card">
            <CardContent className="admin-panel-content">
              <div className="admin-plan-header">
                <div>
                  <p className="admin-muted-text">{plan.name} Plan</p>
                  <h3 className="admin-plan-price">{formatCurrency(plan.price)}</h3>
                </div>
                <span className="admin-plan-users">
                  {plan.users} users
                </span>
              </div>
              <p className="admin-plan-revenue">{formatCurrency(plan.monthlyRevenue)} monthly estimate</p>
              <div className="admin-detail-list">
                <div className="admin-detail-list-row">
                  <span>Stories</span>
                  <strong>{plan.storyLimit ?? "Unlimited"}</strong>
                </div>
                <div className="admin-detail-list-row">
                  <span>Images</span>
                  <strong>{plan.imageLimit ?? "Unlimited"}</strong>
                </div>
                <div className="admin-detail-list-row">
                  <span>Child Profiles</span>
                  <strong>{plan.childProfileLimit ?? "Unlimited"}</strong>
                </div>
              </div>
              {plan.features?.length ? (
                <div className="admin-chip-row">
                  {plan.features.map((feature) => (
                    <span className="admin-chip" key={feature}>{feature}</span>
                  ))}
                </div>
              ) : null}
              {isSuperAdmin && plan.key !== "free" ? (
                <div className="admin-profile-form">
                  <label className="admin-field-group">
                    <span>Plan Name</span>
                    <Input value={planForms[plan.key]?.name || ""} onChange={(event) => updatePlanForm(plan.key, "name", event.target.value)} />
                  </label>
                  <label className="admin-field-group">
                    <span>Monthly Price</span>
                    <Input type="number" min="0" step="0.01" value={planForms[plan.key]?.monthly_price || ""} onChange={(event) => updatePlanForm(plan.key, "monthly_price", event.target.value)} />
                  </label>
                  <div className="admin-profile-form-split">
                    <label className="admin-field-group">
                      <span>Story Limit</span>
                      <Input type="number" min="0" value={planForms[plan.key]?.story_limit ?? ""} onChange={(event) => updatePlanForm(plan.key, "story_limit", event.target.value)} placeholder="Unlimited" />
                    </label>
                    <label className="admin-field-group">
                      <span>Image Limit</span>
                      <Input type="number" min="0" value={planForms[plan.key]?.image_limit ?? ""} onChange={(event) => updatePlanForm(plan.key, "image_limit", event.target.value)} placeholder="Unlimited" />
                    </label>
                    <label className="admin-field-group">
                      <span>Child Profiles</span>
                      <Input type="number" min="0" value={planForms[plan.key]?.child_profile_limit ?? ""} onChange={(event) => updatePlanForm(plan.key, "child_profile_limit", event.target.value)} placeholder="Unlimited" />
                    </label>
                  </div>
                  <label className="admin-field-group">
                    <span>Features</span>
                    <textarea
                      className="admin-search-input"
                      rows={4}
                      value={planForms[plan.key]?.features || ""}
                      onChange={(event) => updatePlanForm(plan.key, "features", event.target.value)}
                    />
                    <span className="admin-field-help">One feature per line.</span>
                  </label>
                  <Button className="admin-button" onClick={() => savePlanSettings(plan.key)} disabled={savingPlanKey === plan.key}>
                    {savingPlanKey === plan.key ? <RefreshCw className="admin-icon-sm admin-icon-spin" /> : <Settings className="admin-icon-sm" />}
                    Save {plan.name} Settings
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <AdminDataTable
        title="Subscriptions"
        description="Account plans are stored on users; revenue here is estimated from plan prices until invoices are added."
        filters={
          <>
            <div className="admin-search-field">
              <Search className="admin-search-icon" />
              <Input
                className="admin-search-input"
                placeholder="Search subscriptions..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Button className="admin-button" onClick={loadPayments} disabled={loading}>
              <RefreshCw className={`admin-icon-sm ${loading ? "admin-icon-spin" : ""}`} /> Refresh
            </Button>
          </>
        }
        columns={columns}
        rows={filteredSubscriptions}
        emptyMessage={
          loading
            ? "Loading payment data..."
            : error
              ? `Failed to load payment data: ${error}`
              : "No subscriptions matched your current search."
        }
      />
    </div>
  );
}
