import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, BellRing, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils";
import { StatCard } from "@/components/common/StatCard";
import { useSocket } from "@/hooks/useSocket";
import { LiveBadge } from "@/components/common/LiveBadge";

export default function AlertsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [tab, setTab] = useState("ALL");

  useEffect(() => {
    setLoading(true);
    api.get("/alerts", { params: { pageSize: 100 } })
      .then((res) => setRows(res.data?.data?.items || res.data?.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [reload]);

  // Real-time alerts stream via /tracking namespace
  const { connected } = useSocket("/tracking", {
    "alert:new": (evt) => {
      setRows((prev) => [{ ...evt, createdAt: evt.timestamp || new Date().toISOString() }, ...prev]);
      toast.warning(`New ${evt.severity || "alert"}: ${evt.message || evt.type}`);
    },
    "alert:resolved": (evt) => {
      setRows((prev) => prev.map((r) => r.id === evt.alertId ? { ...r, resolvedAt: new Date().toISOString() } : r));
    },
  });

  const resolve = async (id) => {
    try {
      await api.patch(`/alerts/${id}/resolve`);
      toast.success("Alert resolved.");
      setReload((k) => k + 1);
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  const filtered = tab === "ALL" ? rows : rows.filter((r) => r.severity === tab || r.type === tab);
  const criticalCount = rows.filter((r) => r.severity === "CRITICAL").length;
  const warningCount = rows.filter((r) => r.severity === "WARNING").length;

  const columns = [
    { key: "severity", header: "Severity", render: (r) => <StatusBadge status={r.severity || "WARNING"} /> },
    { key: "type", header: "Type", render: (r) => <Badge variant="outline">{r.type}</Badge> },
    { key: "message", header: "Message", render: (r) => <div className="max-w-md truncate">{r.message || "—"}</div> },
    { key: "monk", header: "Monk / Device", render: (r) => r.monk?.dikshaName || r.device?.name || "—" },
    { key: "at", header: "Raised", render: (r) => <span className="text-xs">{formatDateTime(r.createdAt)}</span> },
    { key: "actions", header: "Actions", render: (r) => (
      !r.resolvedAt ? (
        <Button size="sm" variant="outline" onClick={() => resolve(r.id)} data-testid={`alert-resolve-${r.id}`}>
          <Check className="h-3 w-3 mr-1" /> Resolve
        </Button>
      ) : <span className="text-xs text-muted-foreground">Resolved</span>
    ) },
  ];

  return (
    <div data-testid="alerts-page">
      <PageHeader
        title="Alerts"
        subtitle="SOS, offline, route delays and low-battery notifications from the field."
        actions={<LiveBadge connected={connected} testId="alerts-live-status" />}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <StatCard label="Critical" value={criticalCount} icon={ShieldAlert} tone="danger" />
        <StatCard label="Warning" value={warningCount} icon={BellRing} tone="warning" />
        <StatCard label="Total Active" value={rows.filter((r) => !r.resolvedAt).length} tone="default" />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          {["ALL", "CRITICAL", "WARNING", "SOS", "OFFLINE", "LOW_BATTERY", "ROUTE_DELAY"].map((t) => (
            <TabsTrigger key={t} value={t} className="text-xs">{t.replace(/_/g, " ")}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable columns={columns} rows={filtered} loading={loading} testId="alerts-table"
        emptyTitle="All clear" emptyDescription="No active alerts. Enjoy the calm." />
    </div>
  );
}
