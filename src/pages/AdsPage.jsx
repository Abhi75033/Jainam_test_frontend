import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Megaphone, Store, Eye, Tag, TrendingUp, Upload, RefreshCw, Calendar, BarChart3 } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/common/EmptyState";
import { EntityFormDialog } from "@/components/common/EntityFormDialog";

export default function AdsPage() {
  const [ads, setAds] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [createOfferOpen, setCreateOfferOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/ads").catch(() => ({ data: { data: [] } })),
      api.get("/offers").catch(() => ({ data: { data: [] } })),
    ]).then(([a, o]) => {
      setAds(a.data?.data?.items || a.data?.data || []);
      setOffers(o.data?.data?.items || o.data?.data || []);
    }).finally(() => setLoading(false));
  }, [reload]);

  const totalViews = ads.reduce((s, a) => s + (a.viewCount || 0), 0);
  const totalClicks = ads.reduce((s, a) => s + (a.clickCount || 0), 0);
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : "0";

  const gradients = [
    "linear-gradient(135deg,#F59E0B,#F97316)",
    "linear-gradient(135deg,#10B981,#059669)",
    "linear-gradient(135deg,#8B5CF6,#7C3AED)",
    "linear-gradient(135deg,#F97316,#DC2626)",
  ];

  return (
    <div data-testid="ads-page">
      <PageHeader
        title="Advertisement & Offers Management"
        subtitle="Manage sponsors, support partners, banners, offers, and monetization."
        actions={<Button onClick={() => setCreateOpen(true)} data-testid="ads-create-btn"><Plus className="h-4 w-4 mr-2" /> Create Advertisement</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard label="Active Ads" value={ads.length} delta="Across all platforms" icon={Megaphone} tone="green" />
        <StatCard label="Community Partners" value={ads.filter(a=>a.isPartner).length || "—"} delta="Verified partners" icon={Store} tone="orange" />
        <StatCard label="Total Banner Views" value={totalViews.toLocaleString()} delta="Across placements" icon={Eye} tone="purple" />
        <StatCard label="Active Offers" value={offers.filter(o => o.status === "ACTIVE" || !o.status).length} delta="Live on offers page" icon={Tag} tone="red" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <Card className="xl:col-span-2 p-5 rounded-xl border-border">
          <h2 className="font-heading text-base font-semibold mb-4">Banner Management</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[1,2,3,4].map(i=><Skeleton key={i} className="h-40" />)}</div>
          ) : ads.length === 0 ? (
            <EmptyState title="No ads yet" description="Create your first advertisement banner." icon={Megaphone} className="border-0" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ads.slice(0, 4).map((b, i) => (
                <div key={b.id} className="rounded-lg overflow-hidden border border-border" data-testid={`banner-${i}`}>
                  <div className="h-32 relative flex flex-col items-center justify-center text-white p-4" style={{background: gradients[i % 4]}}>
                    <Badge className="absolute top-2 left-2 bg-white/25 text-white border-white/40 text-[9px]">{b.slot || "TOP_BANNER"}</Badge>
                    <div className="text-center text-xs md:text-sm font-bold tracking-wide">{b.title || b.tagline || "Banner"}</div>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold truncate">{b.title || b.name || b.slot}</div>
                      <div className="text-[11px] text-muted-foreground">{formatDate(b.startAt || b.startDate)} — {formatDate(b.endAt || b.endDate)}</div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">{b.status || "Active"}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 rounded-xl border-border">
          <h2 className="font-heading text-base font-semibold mb-4">Analytics</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Impressions", value: totalViews.toLocaleString(), tone: "green" },
              { label: "Clicks", value: totalClicks.toLocaleString(), tone: "blue" },
              { label: "CTR", value: `${ctr}%`, tone: "purple" },
              { label: "Ads Live", value: ads.length, tone: "orange" },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-lg border border-border">
                <div className="text-[11px] text-muted-foreground">{s.label}</div>
                <div className="font-bold text-xl font-mono-num mt-0.5">{s.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {[
              { icon: Upload, label: "Upload Banner", tone: "green" },
              { icon: RefreshCw, label: "Replace Logo", tone: "purple" },
              { icon: Calendar, label: "Schedule Campaign", tone: "orange" },
              { icon: BarChart3, label: "Export Analytics", tone: "red" },
            ].map((q, i) => (
              <button key={i} className="w-full p-3 rounded-lg text-white text-left flex items-center gap-2 transition-transform hover:scale-[1.01]" style={{background: `hsl(var(--c-${q.tone}))`}} data-testid={`ads-qa-${i}`}>
                <q.icon className="h-4 w-4" />
                <span className="text-xs font-semibold">{q.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Offers */}
      <Card className="p-5 rounded-xl border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-base font-semibold">Offers Page Management</h2>
          <Button size="sm" onClick={() => setCreateOfferOpen(true)} data-testid="offers-create-btn">
            <Plus className="h-4 w-4 mr-1.5" /> Add Offer
          </Button>
        </div>
        {offers.length === 0 ? (
          <EmptyState title="No offers yet" description="Create offers from community partners." icon={Tag} className="border-0" />
        ) : (
          <div className="space-y-2">
            {offers.map((o, i) => (
              <div key={o.id || i} className="flex items-start gap-3 p-2.5 rounded-lg border border-border">
                <div className="h-10 w-10 rounded bg-gradient-to-br from-orange-200 to-orange-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{o.title}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{o.description || o.companyName || o.merchantName}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-muted-foreground">{formatDate(o.endAt || o.validUntil)}</div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] mt-1">{o.status || "ACTIVE"}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <EntityFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create Advertisement"
        endpoint="/ads"
        onSaved={() => setReload((k) => k + 1)}
        testId="ads-form"
        fields={[
          { name: "bannerUrl", label: "Banner image URL", required: true, placeholder: "https://…" },
          { name: "targetLink", label: "Click-through URL", type: "url", placeholder: "https://…" },
          { name: "slot", label: "Placement", type: "select", required: true, options: [
            { value: "TOP_BANNER", label: "Top Banner" },
            { value: "IN_FEED", label: "In-Feed" },
          ]},
          { name: "startAt", label: "Start date", type: "date", required: true },
          { name: "endAt", label: "End date", type: "date", required: true },
        ]}
      />

      <EntityFormDialog
        open={createOfferOpen}
        onOpenChange={setCreateOfferOpen}
        title="Create Offer"
        endpoint="/offers"
        onSaved={() => setReload((k) => k + 1)}
        testId="offers-form"
        fields={[
          { name: "title", label: "Title", required: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "companyName", label: "Merchant / Partner", required: true },
          { name: "bannerUrl", label: "Banner URL" },
          { name: "companyLogoUrl", label: "Logo URL" },
          { name: "startAt", label: "Valid from", type: "date", required: true },
          { name: "endAt", label: "Valid until", type: "date", required: true },
        ]}
      />
    </div>
  );
}
