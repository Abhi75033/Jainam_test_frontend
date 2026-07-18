import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/common/EmptyState";
import { EntityFormDialog } from "@/components/common/EntityFormDialog";
import { Plus, Users, Check, X, Loader2, Crown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function CommunityPagesPage() {
  const { user, isSuperAdmin, canDo } = useAuth();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [membersPage, setMembersPage] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/community-pages")
      .then((res) => setPages(res.data?.data?.items || res.data?.data || []))
      .catch(() => setPages([]))
      .finally(() => setLoading(false));
    api.get("/master-data/community-page-categories")
      .then((res) => setCategories(res.data?.data?.items || res.data?.data || []))
      .catch(() => {});
  }, [reloadKey]);

  const openMembers = async (pg) => {
    setMembersPage(pg);
    setMembersLoading(true);
    try {
      const [pending, approved] = await Promise.all([
        api.get(`/community-pages/${pg.id}/members`, { params: { status: "PENDING" } }).catch(() => ({ data: { data: [] } })),
        api.get(`/community-pages/${pg.id}/members`, { params: { status: "APPROVED" } }).catch(() => ({ data: { data: [] } })),
      ]);
      setMembers([...(pending.data?.data || []), ...(approved.data?.data || [])]);
    } catch {
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const decide = async (memberId, allow) => {
    if (!membersPage) return;
    try {
      await api.post(`/community-pages/${membersPage.id}/members/decision`, {
        memberId,
        decision: allow ? "APPROVED" : "REJECTED",
      });
      toast.success(allow ? "Member approved." : "Member rejected.");
      openMembers(membersPage);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div data-testid="community-pages-page">
      <PageHeader
        title="Community Pages"
        subtitle="Community and organization pages on the platform."
        actions={isSuperAdmin && (
          <Button onClick={() => setOpenCreate(true)} data-testid="cp-create-btn">
            <Plus className="h-4 w-4 mr-2" /> Create Page
          </Button>
        )}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : pages.length === 0 ? (
        <EmptyState title="No community pages yet" description="Create the first community page." icon={Users} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((p) => (
            <Card key={p.id} className="p-5 rounded-xl border-border" data-testid={`cp-card-${p.id}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-heading font-semibold text-base">{p.name}</div>
                  <Badge variant="outline" className="mt-1 text-[10px]">{p.category?.name || "—"}</Badge>
                </div>
                <StatusBadge status={p.subscriptionStatus || "ACTIVE"} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {p.memberCount || 0} members</span>
                <Badge variant="outline" className="text-[10px]">{p.joinApprovalMode || p.joinMode || "AUTO"}</Badge>
              </div>
              {p.pendingCount > 0 && (
                <div className="mt-3 flex items-center gap-2 text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-md px-2 py-1.5">
                  <Crown className="h-3 w-3" /> {p.pendingCount} pending join request(s)
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => openMembers(p)}
                data-testid={`cp-view-members-${p.id}`}
              >
                Manage members
              </Button>
            </Card>
          ))}
        </div>
      )}

      <EntityFormDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        title="Create Community Page"
        endpoint="/community-pages"
        onSaved={() => setReloadKey((k) => k + 1)}
        testId="cp-form"
        fields={[
          { name: "name", label: "Page name", required: true },
          { name: "about", label: "Description", type: "textarea" },
          { name: "categoryId", label: "Category", type: "select",
            options: categories.map((c) => ({ value: c.id, label: c.name })),
          },
          { name: "joinApprovalMode", label: "Join mode", type: "select", required: true,
            options: [{ value: "AUTO", label: "Auto-approve" }, { value: "MANUAL", label: "Manual approval" }] },
          { name: "bannerUrl", label: "Cover image URL" },
        ]}
        transform={(payload) => ({ ...payload, ownerUserIds: [user?.id].filter(Boolean) })}
      />

      <Dialog open={Boolean(membersPage)} onOpenChange={() => setMembersPage(null)}>
        <DialogContent className="max-w-lg" data-testid="cp-members-dialog">
          <DialogHeader>
            <DialogTitle>{membersPage?.name} · Members</DialogTitle>
          </DialogHeader>
          {membersLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : members.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">No members / requests.</div>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-border">
              {members.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{m.member?.firstName || m.name || "Member"} {m.member?.surname || ""}</div>
                    <div className="text-[11px] text-muted-foreground">{m.member?.mobile || m.mobile || m.publicId}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.status === "PENDING" || !m.status ? (
                      canDo("COMMUNITY_PAGES", "EDIT") && (
                        <>
                          <Button size="sm" onClick={() => decide(m.id, true)} data-testid={`cp-approve-${m.id}`}>
                            <Check className="h-3 w-3 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => decide(m.id, false)} data-testid={`cp-reject-${m.id}`}>
                            <X className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </>
                      )
                    ) : (
                      <Badge variant="outline">{m.status}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
