import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { StatCard } from "@/components/common/StatCard";
import { EntityFormDialog } from "@/components/common/EntityFormDialog";
import { Users, CheckCircle2, UserCircle2, UserCheck, Plus, Eye, Edit, Filter, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrgs, orgOptions } from "@/hooks/useOrgs";
import { OrgSelect } from "@/components/common/OrgSelect";
import { initials } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_TONE = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  ON_DUTY: "bg-amber-100 text-amber-700",
  AVAILABLE: "bg-blue-100 text-blue-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-orange-100 text-orange-700",
  REJECTED: "bg-red-100 text-red-700",
  INACTIVE: "bg-red-100 text-red-700",
};

export default function VolunteersPage() {
  const { user, canDo, isSuperAdmin } = useAuth();
  const { orgs } = useOrgs();
  const [selectedOrg, setSelectedOrg] = useState("");
  const orgId = user?.organizationIds?.[0] || selectedOrg || (isSuperAdmin ? orgs[0]?.id : undefined);
  const [opportunities, setOpportunities] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/volunteers/opportunities").catch(() => ({ data: { data: [] } })),
      orgId ? api.get(`/volunteers/applications/org/${orgId}`).catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
    ]).then(([o, a]) => {
      setOpportunities(o.data?.data?.items || o.data?.data || []);
      setApps(a.data?.data?.items || a.data?.data || []);
    }).finally(() => setLoading(false));
    api.get("/master-data/volunteer-areas")
      .then((res) => setAreas(res.data?.data?.items || res.data?.data || []))
      .catch(() => {});
  }, [orgId, reloadKey]);

  const decide = async (appId, allow) => {
    try {
      await api.patch(`/volunteers/applications/${appId}`, { status: allow ? "APPROVED" : "REJECTED" });
      toast.success(allow ? "Volunteer approved." : "Volunteer rejected.");
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const total = apps.length;
  const active = apps.filter((a) => a.status === "ACTIVE" || a.status === "APPROVED").length;
  const onDuty = apps.filter((a) => a.status === "ON_DUTY").length;
  const available = apps.filter((a) => a.status === "AVAILABLE" || a.status === "PENDING").length;

  return (
    <div data-testid="volunteers-page">
      <PageHeader
        title="Volunteer Management"
        subtitle="Manage and coordinate volunteers across temples, events and yatras."
        actions={<Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setOpenCreate(true)} data-testid="volunteers-add-btn"><Plus className="h-4 w-4 mr-2" /> Create Opportunity</Button>}
      />

      {isSuperAdmin && (
        <div className="mb-4">
          <OrgSelect value={orgId} onChange={setSelectedOrg} label="Viewing applications for" testId="volunteers-org-select" />
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard label="Total Volunteers" value={total || opportunities.length} delta="All registered" icon={Users} tone="blue" />
        <StatCard label="Active Volunteers" value={active} delta={`${total>0?Math.round((active/total)*100):0}% of total`} icon={CheckCircle2} tone="green" />
        <StatCard label="On Duty" value={onDuty} delta="Currently assigned" icon={UserCircle2} tone="orange" />
        <StatCard label="Available" value={available} delta="Awaiting assignment" icon={UserCheck} tone="blue" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <Card className="xl:col-span-2 p-5 rounded-xl border-border">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-heading text-base font-semibold">Volunteer List</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Filter className="h-3.5 w-3.5 mr-1.5" /> Filters</Button>
            </div>
          </div>
          {loading ? (
            <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : apps.length === 0 && opportunities.length === 0 ? (
            <EmptyState title="No volunteers yet" description="Add your first volunteer to start coordinating seva activities." icon={Users} className="border-0" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="text-left font-semibold py-2">Name</th>
                    <th className="text-left font-semibold">Phone</th>
                    <th className="text-left font-semibold">Assigned</th>
                    <th className="text-left font-semibold">Role</th>
                    <th className="text-center font-semibold">Status</th>
                    <th className="text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(apps.length ? apps : opportunities).slice(0, 8).map((v, i) => {
                    const name = v.member?.fullName || (v.member?.firstName ? `${v.member.firstName} ${v.member.surname || ''}` : v.applicantName || v.role || v.title || "—");
                    const status = (v.status || "ACTIVE").toUpperCase();
                    return (
                      <tr key={v.id || i} className="border-b border-border/60 last:border-0">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8"><AvatarFallback className="text-[10px] bg-primary/10 text-primary">{initials(name)}</AvatarFallback></Avatar>
                            <span className="text-sm font-medium">{name}</span>
                          </div>
                        </td>
                        <td className="text-xs font-mono-num">{v.mobile || v.member?.mobile || "—"}</td>
                        <td className="text-xs">{v.organization?.name || v.opportunity?.title || "—"}</td>
                        <td className="text-xs">{v.role || v.area?.name || "Volunteer"}</td>
                        <td className="text-center"><span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${STATUS_TONE[status] || STATUS_TONE.ACTIVE}`}>{status.replace("_"," ")}</span></td>
                        <td className="text-right">
                          <div className="inline-flex gap-1">
                            {(v.status === "PENDING" || !v.status) && canDo("VOLUNTEERS", "APPROVE") ? (
                              <>
                                <button onClick={() => decide(v.id, true)} className="p-1.5 rounded hover:bg-emerald-50" data-testid={`vol-approve-${v.id}`}>
                                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                                </button>
                                <button onClick={() => decide(v.id, false)} className="p-1.5 rounded hover:bg-red-50" data-testid={`vol-reject-${v.id}`}>
                                  <X className="h-3.5 w-3.5 text-red-600" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button className="p-1.5 rounded hover:bg-secondary"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></button>
                                <button className="p-1.5 rounded hover:bg-secondary"><Edit className="h-3.5 w-3.5 text-muted-foreground" /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-5 rounded-xl border-border">
          <h2 className="font-heading text-base font-semibold mb-3">Attendance Overview</h2>
          <div className="relative h-40 flex items-center justify-center">
            <svg className="w-40 h-40 -rotate-90">
              <circle cx="80" cy="80" r="64" strokeWidth="14" stroke="hsl(var(--border))" fill="none" />
              <circle cx="80" cy="80" r="64" strokeWidth="14" stroke="hsl(var(--c-green))" fill="none" strokeDasharray={`${(active/(total||1))*402} 402`} strokeLinecap="round" />
              <circle cx="80" cy="80" r="64" strokeWidth="14" stroke="hsl(var(--c-orange))" fill="none" strokeDasharray={`${(onDuty/(total||1))*402} 402`} strokeDashoffset={`-${(active/(total||1))*402}`} strokeLinecap="round" />
            </svg>
            <div className="absolute text-center">
              <div className="text-2xl font-bold">{active}</div>
              <div className="text-[10px] text-muted-foreground">Present</div>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Present</span>
              <span className="font-mono-num font-semibold">{active} ({total>0?Math.round(active/total*100):0}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> On Duty</span>
              <span className="font-mono-num font-semibold">{onDuty} ({total>0?Math.round(onDuty/total*100):0}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Available</span>
              <span className="font-mono-num font-semibold">{available} ({total>0?Math.round(available/total*100):0}%)</span>
            </div>
          </div>
        </Card>
      </div>

      <EntityFormDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        title="Create Volunteer Opportunity"
        endpoint="/volunteers/opportunities"
        onSaved={() => setReloadKey((k) => k + 1)}
        testId="volunteer-opp-form"
        fields={[
          { name: "role", label: "Role / Opportunity title", required: true },
          { name: "details", label: "Details", type: "textarea" },
          { name: "areaId", label: "Area", type: "select",
            options: areas.map((a) => ({ value: a.id, label: a.name })),
          },
          { name: "organizationId", label: "Organization", type: "select", required: true, options: orgOptions(orgs) },
        ]}
        initial={{ organizationId: orgId }}
      />
    </div>
  );
}
