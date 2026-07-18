import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatCard } from "@/components/common/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { LiveBadge } from "@/components/common/LiveBadge";
import { formatDateTime } from "@/lib/utils";
import { useSocket } from "@/hooks/useSocket";
import { Route as RouteIcon, MapPin, Battery, AlertTriangle, Signal } from "lucide-react";

export default function TrackingPage() {
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState({}); // monkId -> {lat,lng,battery,ts}
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    let mounted = true;
    api.get("/tracking/journeys/active")
      .then((res) => mounted && setJourneys(res.data?.data?.items || res.data?.data || []))
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const { connected } = useSocket("/tracking", {
    "monk:location": (evt) => {
      if (!evt?.monkId) return;
      setLocations((prev) => ({ ...prev, [evt.monkId]: { ...evt, ts: evt.timestamp || new Date().toISOString() } }));
    },
    "journey:advanced": (evt) => {
      setJourneys((prev) => prev.map((j) => j.id === evt.journeyId ? { ...j, currentStopIndex: evt.currentStopIdx } : j));
    },
    "journey:completed": (evt) => {
      setJourneys((prev) => prev.filter((j) => j.id !== evt.journeyId));
    },
    "alert:new": (evt) => setAlerts((prev) => [evt, ...prev].slice(0, 20)),
  });

  const columns = [
    { key: "monk", header: "Monk", render: (r) => (
      <div>
        <div className="font-medium">{r.monk?.dikshaName || "—"}</div>
        <div className="text-xs text-muted-foreground font-mono">{r.monk?.publicId}</div>
      </div>
    ) },
    { key: "route", header: "Route", render: (r) => r.route?.name || "—" },
    { key: "progress", header: "Progress", render: (r) => (
      <span className="text-xs">Stop {r.currentStopIndex ?? 0} of {r.totalStops ?? 0}</span>
    ) },
    { key: "loc", header: "Last Location", render: (r) => {
      const loc = locations[r.monk?.id] || locations[r.monkId];
      if (!loc) return <span className="text-xs text-muted-foreground">—</span>;
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <MapPin className="h-3 w-3 text-primary" />
          <span className="font-mono-num">{loc.lat?.toFixed(3)}, {loc.lng?.toFixed(3)}</span>
        </div>
      );
    } },
    { key: "battery", header: "Battery", render: (r) => {
      const loc = locations[r.monk?.id] || locations[r.monkId];
      if (loc?.battery == null) return <span className="text-xs text-muted-foreground">—</span>;
      const tone = loc.battery < 20 ? "text-red-600" : loc.battery < 40 ? "text-orange-600" : "text-emerald-600";
      return <span className={`text-xs flex items-center gap-1 ${tone}`}><Battery className="h-3 w-3" /> {loc.battery}%</span>;
    } },
    { key: "eta", header: "ETA", render: (r) => <span className="text-xs">{formatDateTime(r.eta)}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status || "ONGOING"} /> },
  ];

  return (
    <div data-testid="tracking-page">
      <PageHeader
        title="Monk Tracking"
        subtitle="Live GPS journeys, battery status, and safety alerts."
        actions={<LiveBadge connected={connected} testId="tracking-live-status" />}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Active Journeys" value={journeys.length} icon={RouteIcon} tone="blue" testId="tracking-stat-active" />
        <StatCard label="Locations tracked" value={Object.keys(locations).length} icon={Signal} tone="green" testId="tracking-stat-locations" />
        <StatCard label="Recent alerts" value={alerts.length} icon={AlertTriangle} tone={alerts.length ? "red" : "default"} testId="tracking-stat-alerts" />
        <StatCard label="Realtime" value={connected ? "Online" : "Offline"} tone={connected ? "green" : "default"} testId="tracking-stat-live" />
      </div>

      {alerts.length > 0 && (
        <Card className="mb-4 p-4 border-red-200 bg-red-50/40" data-testid="tracking-alert-strip">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <div className="text-sm font-semibold text-red-800">Live alerts</div>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((a, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div>
                  <Badge variant="outline" className="mr-2">{a.type || "ALERT"}</Badge>
                  <span>{a.message || `Alert #${a.alertId}`}</span>
                </div>
                <span className="text-muted-foreground">{formatDateTime(a.timestamp || new Date().toISOString())}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <DataTable
        columns={columns}
        rows={journeys}
        loading={loading}
        testId="tracking-journeys-table"
        emptyTitle="No active journeys"
        emptyDescription="Start a journey from the monk profile to see live tracking here."
      />
    </div>
  );
}
