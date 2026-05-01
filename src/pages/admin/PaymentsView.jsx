import { useEffect, useMemo, useState } from "react";
import { CreditCard, DollarSign, RefreshCw, Search, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdminDataTable, SectionTitle, StatCard, StatusBadge } from "./components";
import { fetchAdminPayments, updateAdminUserPlan } from "@/services/adminApi";

const planOptions = ["free", "premium"];

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function PaymentsView() {
  const [summary, setSummary] = useState({});
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [savingUserIds, setSavingUserIds] = useState([]);

  async function loadPayments() {
    try {
      setLoading(true);
      setError("");
      const payload = await fetchAdminPayments();
      setSummary(payload.summary || {});
      setPlans(Array.isArray(payload.plans) ? payload.plans : []);
      setSubscriptions(Array.isArray(payload.subscriptions) ? payload.subscriptions : []);
    } catch (loadError) {
      setError(loadError.message || "Failed to load payment data.");
      setSummary({});
      setPlans([]);
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
        <select
          className="admin-select admin-plan-select"
          value={subscription.planKey}
          onChange={(event) => changePlan(subscription, event.target.value)}
          disabled={savingUserIds.includes(subscription.id)}
        >
          {planOptions.map((plan) => (
            <option key={plan} value={plan}>
              {plan[0].toUpperCase() + plan.slice(1)}
            </option>
          ))}
        </select>
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
