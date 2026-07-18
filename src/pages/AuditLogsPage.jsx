import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";
import { ALL_MODULES, ALL_ACTIONS } from "@/constants/modules";
import { Filter } from "lucide-react";

export default function AuditLogsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLog, setDetailLog] = useState(null);
  const [filters, setFilters] = useState({
    module: "ALL", action: "ALL", from: "", to: "", isCritical: "ALL",
  });

  const fetchLogs = useCallback(() => {
    setLoading(true);
    const params = { page: 1, pageSize: 100 };
    if (filters.module !== "ALL") params.module = filters.module;
    if (filters.action !== "ALL") params.action = filters.action;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    if (filters.isCritical !== "ALL") params.isCritical = filters.isCritical === "YES";

    api.get("/audit-logs", { params })
      .then((res) => setRows(res.data?.data?.items || res.data?.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const columns = [
    { key: "at", header: "Timestamp", render: (r) => <span className="text-xs font-mono-num">{formatDateTime(r.createdAt || r.at)}</span> },
    { key: "actor", header: "Actor", render: (r) => r.actor?.mobile || r.actorId || "system" },
    { key: "module", header: "Module", render: (r) => <Badge variant="outline" className="text-[10px]">{r.module}</Badge> },
    { key: "action", header: "Action", render: (r) => <Badge variant="outline" className="text-[10px]">{r.action}</Badge> },
    { key: "entity", header: "Entity", render: (r) => <span className="text-xs">{r.entityType} · {r.entityId?.slice(0, 12)}</span> },
    { key: "critical", header: "Critical", render: (r) => r.isCritical ? <Badge variant="destructive">Critical</Badge> : <span className="text-muted-foreground text-xs">—</span> },
  ];

  return (
    <div data-testid="audit-logs-page">
      <PageHeader
        title="Audit Logs"
        subtitle="Immutable, read-only trail of all critical actions on the platform."
      />

      <Card className="p-4 rounded-md border-border mb-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div>
            <Label className="text-xs">Module</Label>
            <Select value={filters.module} onValueChange={(v) => setFilters({ ...filters, module: v })}>
              <SelectTrigger data-testid="audit-filter-module"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                {ALL_MODULES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Action</Label>
            <Select value={filters.action} onValueChange={(v) => setFilters({ ...filters, action: v })}>
              <SelectTrigger data-testid="audit-filter-action"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                {ALL_ACTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">From</Label>
            <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">To</Label>
            <Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Critical</Label>
            <Select value={filters.isCritical} onValueChange={(v) => setFilters({ ...filters, isCritical: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="YES">Critical only</SelectItem>
                <SelectItem value="NO">Non-critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={fetchLogs} className="w-full" data-testid="audit-apply-button">
              <Filter className="h-4 w-4 mr-2" /> Apply
            </Button>
          </div>
        </div>
      </Card>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        testId="audit-logs-table"
        emptyTitle="No audit logs"
        emptyDescription="Actions performed by users will appear here."
        onRowClick={setDetailLog}
      />

      <Dialog open={Boolean(detailLog)} onOpenChange={() => setDetailLog(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" data-testid="audit-diff-dialog">
          <DialogHeader>
            <DialogTitle className="font-heading">Audit Log · <span className="font-mono text-sm">{detailLog?.id?.slice(0, 12)}</span></DialogTitle>
          </DialogHeader>
          {detailLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div><div className="text-muted-foreground">Actor</div><div className="font-medium mt-0.5">{detailLog.actor?.mobile || detailLog.actorId || "system"}</div></div>
                <div><div className="text-muted-foreground">Module</div><div className="font-medium mt-0.5"><Badge variant="outline">{detailLog.module}</Badge></div></div>
                <div><div className="text-muted-foreground">Action</div><div className="font-medium mt-0.5"><Badge variant="outline">{detailLog.action}</Badge></div></div>
                <div><div className="text-muted-foreground">Entity</div><div className="font-mono text-[11px] mt-0.5">{detailLog.entityType} · {detailLog.entityId?.slice(0, 12)}</div></div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Before</div>
                  <pre className="text-[11px] p-3 bg-red-50 border border-red-100 rounded-lg max-h-80 overflow-y-auto whitespace-pre-wrap break-all">
                    {detailLog.before ? JSON.stringify(detailLog.before, null, 2) : "—"}
                  </pre>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">After</div>
                  <pre className="text-[11px] p-3 bg-emerald-50 border border-emerald-100 rounded-lg max-h-80 overflow-y-auto whitespace-pre-wrap break-all">
                    {detailLog.after ? JSON.stringify(detailLog.after, null, 2) : "—"}
                  </pre>
                </div>
              </div>
              {detailLog.metadata && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Metadata</div>
                  <pre className="text-[11px] p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-40 overflow-y-auto whitespace-pre-wrap break-all">
                    {JSON.stringify(detailLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
