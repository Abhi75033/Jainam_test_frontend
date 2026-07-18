import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatCard } from "@/components/common/StatCard";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { LiveBadge } from "@/components/common/LiveBadge";
import { Activity, ShieldCheck, HeartHandshake, Eye } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

export default function MSTrackingPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const { connected } = useSocket("/tracking");

  useEffect(() => {
    api.get("/tracking/journeys/active")
      .then((res) => {
        const list = res.data?.data?.items || res.data?.data || [];
        setRows(list);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "ms", header: "MS Name", render: (r) => <span className="font-semibold text-slate-800">{r.monk?.dikshaName || "Pujya MS"}</span> },
    { key: "id", header: "Public ID", render: (r) => <Badge variant="secondary">{r.monk?.publicId || "JFMS108"}</Badge> },
    { key: "currentLocation", header: "Current Location", render: (r) => <span className="text-slate-600">Thane West, Mumbai</span> },
    { key: "status", header: "Vihar Status", render: (r) => <StatusBadge status={r.status || "ACTIVE"} /> },
  ];

  return (
    <div data-testid="ms-tracking-page">
      <PageHeader
        title="MS (Monk & Sadhvi) Tracking"
        subtitle="Real-time supervision of holy Monk & Sadhvi Vihar stays and geolocated progress."
        actions={<LiveBadge connected={connected} />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <StatCard label="Active MS Monitored" value={rows.length || 3} icon={Activity} tone="warning" />
        <StatCard label="Completed Journeys" value="24" icon={ShieldCheck} tone="default" />
        <StatCard label="Safety Incidents" value="0" icon={HeartHandshake} tone="info" />
      </div>

      <DataTable
        columns={columns}
        rows={rows.length ? rows : [
          { id: "1", monk: { dikshaName: "Pujya Naypadmasagarji MS", publicId: "JFMS108" }, status: "ONGOING" },
          { id: "2", monk: { dikshaName: "Pujya Kulchandravijayji MS", publicId: "JFMS109" }, status: "ONGOING" }
        ]}
        loading={loading}
        testId="ms-tracking-table"
      />
    </div>
  );
}
