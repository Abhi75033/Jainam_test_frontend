import GenericListPage from "@/components/common/GenericListPage";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDateTime } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export default function DevicesPage() {
  const columns = [
    { key: "publicId", header: "ID", width: 120, render: (r) => <Badge variant="outline" className="font-mono text-[10px]">{r.publicId || "—"}</Badge> },
    { key: "name", header: "Device", render: (r) => (
      <div>
        <div className="font-medium">{r.name || "—"}</div>
        <div className="text-xs text-muted-foreground">{r.deviceType || "GPS"} · {r.imei}</div>
      </div>
    ) },
    { key: "assignedTo", header: "Assigned To", render: (r) => r.assignedMonk?.dikshaName || "—" },
    { key: "battery", header: "Battery", render: (r) => (
      <div className="w-24">
        <div className="text-xs font-mono-num mb-1">{r.batteryLevel ?? "—"}%</div>
        <Progress value={r.batteryLevel || 0} className="h-1.5" />
      </div>
    ) },
    { key: "lastSeen", header: "Last Seen", render: (r) => <span className="text-xs">{formatDateTime(r.lastPingAt || r.lastSeenAt)}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status || "ACTIVE"} /> },
  ];
  return (
    <GenericListPage title="Devices" subtitle="GPS trackers assigned to monks."
      endpoint="/devices" columns={columns} testId="devices-page"
      emptyTitle="No devices registered" emptyDescription="Register a GPS tracker to enable real-time monk tracking." />
  );
}

// Also export a shared Progress-friendly wrapper for reuse
