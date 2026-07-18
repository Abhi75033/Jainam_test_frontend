import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatCard } from "@/components/common/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { QrScanner } from "@/components/common/QrScanner";
import { formatDateTime } from "@/lib/utils";
import { Ticket, ScanLine, CheckCircle2, XCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";

export default function TicketsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanOpen, setScanOpen] = useState(false);
  const [detailTicket, setDetailTicket] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.get("/tickets/my")
      .then((res) => setRows(res.data?.data?.items || res.data?.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [reload]);

  const handleScan = async (qrText) => {
    setScanOpen(false);
    try {
      const { data } = await api.post("/tickets/scan", { qrToken: qrText });
      toast.success(`Checked in: ${data?.data?.publicId || "ticket"}`);
      setReload((k) => k + 1);
    } catch (e) {
      toast.error(extractErrorMessage(e));
    }
  };

  const columns = [
    { key: "publicId", header: "Ticket ID", width: 130, render: (r) => (
      <button
        onClick={(e) => { e.stopPropagation(); setDetailTicket(r); }}
        className="font-mono text-[10px] text-primary hover:underline"
        data-testid={`ticket-open-${r.id || r.publicId}`}
      >
        <Badge variant="outline" className="font-mono text-[10px]">{r.publicId || "—"}</Badge>
      </button>
    ) },
    { key: "event", header: "Event", render: (r) => r.event?.title || "—" },
    { key: "category", header: "Category", render: (r) => r.category?.name || "—" },
    { key: "holder", header: "Holder", render: (r) => r.holder?.mobile || r.buyerMobile || "—" },
    { key: "amount", header: "Amount", render: (r) => `₹${r.amount ?? 0}` },
    { key: "purchasedAt", header: "Purchased", render: (r) => formatDateTime(r.purchasedAt || r.createdAt) },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status || "PENDING_PAYMENT"} /> },
  ];

  const checkedInCount = rows.filter((r) => r.status === "CHECKED_IN").length;
  const activeCount = rows.filter((r) => r.status === "TICKET_GENERATED" || r.status === "PAYMENT_SUCCESSFUL").length;

  return (
    <div data-testid="tickets-page">
      <PageHeader
        title="Tickets"
        subtitle="Paid event tickets with QR check-in support."
        actions={
          <Button onClick={() => setScanOpen(true)} data-testid="tickets-scan-button">
            <ScanLine className="h-4 w-4 mr-2" /> Scan QR
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Total Tickets" value={rows.length} icon={Ticket} tone="blue" testId="stat-tickets-total" />
        <StatCard label="Active" value={activeCount} icon={Users} tone="green" testId="stat-tickets-active" />
        <StatCard label="Checked In" value={checkedInCount} icon={CheckCircle2} tone="green" testId="stat-tickets-in" />
        <StatCard label="Cancelled" value={rows.filter((r) => r.status === "CANCELLED").length} icon={XCircle} tone="red" testId="stat-tickets-cancelled" />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        testId="tickets-table"
        emptyTitle="No tickets yet"
        emptyDescription="Purchased tickets will appear here."
      />

      {scanOpen && <QrScanner onScan={handleScan} onClose={() => setScanOpen(false)} />}

      <Dialog open={Boolean(detailTicket)} onOpenChange={() => setDetailTicket(null)}>
        <DialogContent className="max-w-sm" data-testid="ticket-detail-dialog">
          <DialogHeader>
            <DialogTitle>Ticket · {detailTicket?.publicId}</DialogTitle>
          </DialogHeader>
          {detailTicket && (
            <div className="flex flex-col items-center gap-3">
              <div className="text-sm font-semibold">{detailTicket.event?.title || "Event"}</div>
              <div className="text-xs text-muted-foreground">{detailTicket.category?.name}</div>
              <div className="rounded-lg border border-border p-4 bg-white">
                <QRCodeCanvas
                  value={detailTicket.qrPayload || detailTicket.publicId || String(detailTicket.id || "")}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <StatusBadge status={detailTicket.status || "TICKET_GENERATED"} />
              <div className="text-[11px] text-muted-foreground">
                Show this QR at the venue for check-in.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
