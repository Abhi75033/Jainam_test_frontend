import { useEffect, useState, useRef } from "react";
import { api, extractErrorMessage, API_BASE } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Plus,
  Calendar,
  MapPin,
  Users,
  Check,
  X,
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
  Download,
  Upload,
  AlertTriangle,
  QrCode,
  Image as ImageIcon,
  Video,
  Star,
  Users2,
  Compass,
  ArrowRightLeft,
  Building,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useOrgs } from "@/hooks/useOrgs";
import { OrgSelect } from "@/components/common/OrgSelect";

const EVENT_CATEGORIES = [
  "Religious", "Pravachan", "Pooja", "Cultural Program", "Community Meeting",
  "Youth Event", "Women's Program", "Senior Citizen Program", "Chaturmas",
  "Paryushan", "Ayambil", "Varshitap", "Other"
];

const SECT_HIERARCHY = {
  Digambar: ["Bispanthi", "Terapanthi", "Taran Panth", "Other Digambar Traditions"],
  Shwetambar: ["Murtipujak", "Sthanakvasi", "Terapanth"]
};

const MURTIPUJAK_GACCHAS = [
  "Tapa Gaccha", "Khartar Gaccha", "Achalgaccha", "Tristutik Gaccha", "Other Gacchas"
];

export default function EventsPage() {
  const { canDo, user, isSuperAdmin } = useAuth();
  const { orgs } = useOrgs();
  const [selectedOrg, setSelectedOrg] = useState("");
  const orgId = user?.organizationIds?.[0] || selectedOrg || (isSuperAdmin ? orgs[0]?.id : undefined);

  // States
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Dashboards States
  const [dashboardStats, setDashboardStats] = useState({
    total: 0, active: 0, upcoming: 0, completed: 0, cancelled: 0, rsvps: 0, waitingList: 0,
    ticketsSold: 0, revenue: 0
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState("admin_events");

  // Selection & Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [detailEvent, setDetailEvent] = useState(null);
  const [rsvpsList, setRsvpsList] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  // Form Fields - Creation Wizard Step
  const [wizardStep, setWizardStep] = useState(1);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Religious");
  const [isPaid, setIsPaid] = useState(false);
  const [bannerUrl, setBannerUrl] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [desc, setDesc] = useState("");
  const [rsvpCapacity, setRsvpCapacity] = useState(200);
  const [waitingListEnabled, setWaitingListEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields - Visibility Target
  const [geoCountry, setGeoCountry] = useState("Entire India");
  const [geoState, setGeoState] = useState("");
  const [geoCity, setGeoCity] = useState("");
  const [geoRadius, setGeoRadius] = useState(10);
  const [targetSect, setTargetSect] = useState("All Jain Members");
  const [targetSubSect, setTargetSubSect] = useState("");

  // Post-Event media gallery inputs
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [submittingMedia, setSubmittingMedia] = useState(false);

  // Scanner Simulator variables
  const [ticketQrCode, setTicketQrCode] = useState("");
  const [scanning, setScanning] = useState(false);

  const loadData = async () => {
    if (!orgId) { setLoading(false); return; }
    setLoading(true);
    try {
      const listRes = await api.get(`/events/org/${orgId}`).catch(() => ({ data: { data: [] } }));
      const statsRes = await api.get(`/events/dashboard/org/${orgId}`).catch(() => ({ data: { data: null } }));

      const items = listRes.data?.data?.items || listRes.data?.data || [];
      const stats = statsRes.data?.data || null;

      setRows(items);
      if (stats) {
        setDashboardStats({
          total: stats.totalEvents || items.length,
          active: stats.activeEvents || 0,
          upcoming: stats.upcomingEvents || 0,
          completed: stats.completedEvents || 0,
          cancelled: stats.cancelledEvents || 0,
          rsvps: stats.totalRSVP || 0,
          waitingList: stats.waitingListCount || 0,
          ticketsSold: stats.paidTicketsSold || 0,
          revenue: stats.totalRevenue || 0
        });
      }
    } catch (e) {
      toast.error("Failed to load events ledger data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, reloadKey]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title || !startAt || !endAt) {
      toast.error("Please fill in all mandatory event timeline fields.");
      return;
    }
    if (isPaid && !isSuperAdmin) {
      toast.error("Paid Events can only be created by JiNANAM. Please raise a support ticket.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        organizationId: orgId,
        title,
        categoryId: "cat_default",
        category: { name: category },
        isPaid,
        bannerUrl: bannerUrl || "attached_banner_placeholder.png",
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        venue,
        description: desc,
        rsvpCapacity: Number(rsvpCapacity),
        waitingListEnabled,
        visibilityConfig: {
          geo: {
            country: geoCountry,
            state: geoState,
            city: geoCity,
            gpsRadiusKm: Number(geoRadius)
          },
          sect: targetSect,
          subSect: targetSubSect
        }
      };

      await api.post("/events", payload);
      toast.success("Event created successfully! Eligibility visibility targets published.");
      setCreateOpen(false);
      setReloadKey(k => k + 1);
      resetWizard();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const resetWizard = () => {
    setWizardStep(1);
    setTitle("");
    setCategory("Religious");
    setIsPaid(false);
    setBannerUrl("");
    setStartAt("");
    setEndAt("");
    setVenue("");
    setAddress("");
    setDesc("");
    setRsvpCapacity(200);
    setWaitingListEnabled(true);
  };

  const openEventDetails = async (ev) => {
    setDetailEvent(ev);
    try {
      const rsvpsRes = await api.get(`/events/${ev.id}/rsvps`).catch(() => ({ data: { data: [] } }));
      const feedbackRes = await api.get(`/events/${ev.id}/feedback`).catch(() => ({ data: { data: [] } }));
      setRsvpsList(rsvpsRes.data?.data || []);
      setFeedbackList(feedbackRes.data?.data || []);
    } catch {
      setRsvpsList([]);
      setFeedbackList([]);
    }
  };

  // Gallery uploads (Temple Admin allowed only after event completes)
  const handleUploadMedia = async (e) => {
    e.preventDefault();
    if (!detailEvent) return;
    setSubmittingMedia(true);
    try {
      if (newImageUrl) {
        await api.post(`/events/${detailEvent.id}/gallery`, {
          images: [{ url: newImageUrl, caption: "Event Capture" }]
        });
        toast.success("Gallery image uploaded successfully.");
        setNewImageUrl("");
      }
      if (newVideoUrl) {
        await api.post(`/events/${detailEvent.id}/video-links`, {
          links: [{ url: newVideoUrl, title: "Event Video" }]
        });
        toast.success("Video redirect link saved.");
        setNewVideoUrl("");
      }
      setReloadKey(k => k + 1);
      setGalleryOpen(false);
      setDetailEvent(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSubmittingMedia(false);
    }
  };

  // QR Validation Scan Simulator
  const handleScanTicket = async (e) => {
    e.preventDefault();
    if (!ticketQrCode) return;
    setScanning(true);
    try {
      // Validation payload simulator
      toast.success("QR Token validated! Attendee marked Checked-In.");
      setScannerOpen(false);
      setTicketQrCode("");
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err) || "Invalid QR Validation Token");
    } finally {
      setScanning(false);
    }
  };

  const handleExportRsvps = async (format) => {
    if (!detailEvent) return;
    try {
      const token = localStorage.getItem("jinanam_access_token");
      const res = await fetch(`${API_BASE}/events/${detailEvent.id}/rsvps/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Report generation failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `event-rsvps-${detailEvent.publicId}.${format === "xlsx" ? "xlsx" : "csv"}`;
      a.click();
      toast.success("RSVP report downloaded.");
    } catch (e) {
      toast.error("Export failed");
    }
  };

  const filtered = q
    ? rows.filter(
        (r) =>
          r.title?.toLowerCase().includes(q.toLowerCase()) ||
          r.venue?.toLowerCase().includes(q.toLowerCase()) ||
          r.publicId?.toLowerCase().includes(q.toLowerCase())
      )
    : rows;

  const columns = [
    { key: "publicId", header: "Event ID", render: (r) => <Badge variant="outline" className="font-mono text-[9px]">{r.publicId}</Badge> },
    {
      key: "title",
      header: "Event",
      render: (r) => (
        <div>
          <div className="font-bold text-slate-805 text-xs">{r.title}</div>
          <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {r.venue || "—"}</div>
        </div>
      )
    },
    { key: "category", header: "Category", render: (r) => <Badge variant="secondary" className="text-[9px]">{r.category?.name || "Religious"}</Badge> },
    { key: "dates", header: "Dates", render: (r) => <span className="text-slate-500 font-mono text-xs">{formatDateTime(r.startAt)}</span> },
    { key: "type", header: "Type", render: (r) => <Badge variant={r.isPaid ? "default" : "outline"} className="text-[10px]">{r.isPaid ? "PAID" : "FREE"}</Badge> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status || "DRAFT"} /> },
    {
      key: "action",
      header: "Audits",
      render: (r) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => openEventDetails(r)}>
            Review
          </Button>
          {r.status === "COMPLETED" && (
            <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => { setDetailEvent(r); setGalleryOpen(true); }}>
              <ImageIcon className="h-3.5 w-3.5" /> Media
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6" data-testid="events-page">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-gradient-to-r from-orange-600 to-amber-700 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-amber-200" />
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">Events Management Registry</h1>
          </div>
          <p className="text-orange-100 text-xs mt-1 max-w-lg">
            Plan community yatras, pravachans, pooja camps, and handle attendee seating allocations for paid auditoriums.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {isSuperAdmin && (
            <Button
              onClick={() => setScannerOpen(true)}
              className="bg-orange-850 hover:bg-orange-900 text-white font-bold h-10 px-5 border border-orange-700/50 shadow-md"
            >
              <QrCode className="h-4 w-4 mr-2" /> QR Scanner Simulator
            </Button>
          )}
          {canDo("EVENTS", "CREATE") && (
            <Button
              onClick={() => { resetWizard(); setCreateOpen(true); }}
              data-testid="events-add-button"
              className="bg-white hover:bg-orange-50 text-orange-700 font-bold h-10 px-5 shadow-md border border-white"
            >
              <Plus className="h-4 w-4 mr-2" /> Onboard New Event
            </Button>
          )}
        </div>
      </div>

      {isSuperAdmin && (
        <div className="max-w-xs">
          <OrgSelect value={orgId} onChange={setSelectedOrg} label="Active Location Facility" testId="events-org-select" />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="admin_events" className="px-5 py-2 font-bold text-xs rounded-lg">🛡️ Admin Control Ledger ({rows.length})</TabsTrigger>
        </TabsList>

        {/* Tab 1: Admin Control Grid & Dashboards */}
        <TabsContent value="admin_events" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-orange-50 text-orange-700 rounded-lg"><Calendar className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Events</div>
                <div className="text-xl font-black text-slate-805">{dashboardStats.total}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-sky-50 text-sky-700 rounded-lg"><Users className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Total RSVPs Confirmed</div>
                <div className="text-xl font-black text-slate-805">{dashboardStats.rsvps}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-700 rounded-lg"><AlertTriangle className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Waiting List Count</div>
                <div className="text-xl font-black text-rose-700">{dashboardStats.waitingList}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg"><DollarSign className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Tickets Sold / Revenue</div>
                <div className="text-sm font-bold text-slate-700 font-mono-num mt-1">
                  🎟️ {dashboardStats.ticketsSold} | {formatCurrency(dashboardStats.revenue)}
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-4 bg-white border rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-800">Operational Events Registry</h3>
                <p className="text-[11px] text-slate-400">Onboard community yatras, Pravachans, and monitor daily check-ins.</p>
              </div>
              <div className="relative max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search event title, venue..." className="pl-8 text-xs h-8" />
              </div>
            </div>

            <DataTable
              columns={columns}
              rows={filtered}
              loading={loading}
              testId="events-table"
              emptyTitle="No events registered"
              emptyDescription="Onboard new free/paid events to populate the active directory."
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Onboard Event Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-850 font-heading font-black">
              <Plus className="h-5 w-5 text-orange-650" /> Onboard Event Wizard
            </DialogTitle>
          </DialogHeader>

          {/* Stepper Wizard Indicator */}
          <div className="flex border-b shrink-0 mb-4">
            {[1, 2, 3, 4].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setWizardStep(s)}
                className={`flex-1 py-2 text-[10px] font-black transition-all border-b-2 capitalize ${
                  wizardStep === s ? "border-orange-600 text-orange-700 bg-orange-50/20" : "border-transparent text-slate-400"
                }`}
              >
                {s === 1 ? "1. Details" : s === 2 ? "2. Paid Settings" : s === 3 ? "3. Targets" : "4. RSVP limits"}
              </button>
            ))}
          </div>

          <form onSubmit={handleCreateEvent} className="space-y-4">
            {wizardStep === 1 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Event Title *</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Mahavir Janma Kalyanak" required className="h-9 mt-1" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Category *</Label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full mt-1.5 h-9 rounded border px-2 focus:outline-none">
                      {EVENT_CATEGORIES.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Start date & time *</Label>
                    <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required className="h-9 mt-1" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">End date & time *</Label>
                    <Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} required className="h-9 mt-1" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Venue Name *</Label>
                    <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Shanti Hall" required className="h-9 mt-1" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Banner URL</Label>
                    <Input value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="/static/events/banner1.png" className="h-9 mt-1" />
                  </div>
                </div>

                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Event Description *</Label>
                  <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Provide full details of the Poojari, Pravachan discourse schedules, etc." required className="mt-1" />
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400 font-black">Event Type Option *</Label>
                  <div className="flex gap-2 mt-1.5 bg-slate-100 p-1 rounded-lg">
                    <button type="button" onClick={() => setIsPaid(false)}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        !isPaid ? "bg-white text-orange-700 shadow-sm" : "text-slate-500"
                      }`}>
                      Free Community Event
                    </button>
                    <button type="button" onClick={() => setIsPaid(true)}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        isPaid ? "bg-white text-orange-700 shadow-sm" : "text-slate-500"
                      }`}>
                      Paid Event (Online ticketing)
                    </button>
                  </div>
                </div>

                {isPaid && !isSuperAdmin && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-2 text-orange-850">
                    <p className="font-semibold leading-relaxed">
                      "Paid Events are managed exclusively by JiNANAM. If you wish to organize a paid event, please raise a support ticket. Our team will coordinate with you and create the event on your behalf."
                    </p>
                    <Button type="button" variant="outline" className="border-orange-300 text-orange-850 h-8 font-bold" onClick={() => toast.success("Support ticket raised!")}>
                      Raise Support Ticket
                    </Button>
                  </div>
                )}
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 text-xs">Target Location Visibilities</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Country</Label>
                    <Input value={geoCountry} onChange={(e) => setGeoCountry(e.target.value)} className="h-9 mt-1" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">State Target</Label>
                    <Input value={geoState} onChange={(e) => setGeoState(e.target.value)} placeholder="Maharashtra" className="h-9 mt-1" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">City Target</Label>
                    <Input value={geoCity} onChange={(e) => setGeoCity(e.target.value)} placeholder="Mumbai" className="h-9 mt-1" />
                  </div>
                </div>

                <div className="border-t pt-3 space-y-3">
                  <h4 className="font-bold text-slate-700 text-xs">Community Target Visibility</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-400">Target Sect</Label>
                      <select value={targetSect} onChange={(e) => { setTargetSect(e.target.value); setTargetSubSect(""); }} className="w-full mt-1.5 h-9 rounded border px-2 bg-white focus:outline-none">
                        <option value="All Jain Members">All Jain Members</option>
                        <option value="Digambar">Digambar</option>
                        <option value="Shwetambar">Shwetambar</option>
                      </select>
                    </div>

                    {["Digambar", "Shwetambar"].includes(targetSect) && (
                      <div>
                        <Label className="text-[10px] uppercase font-bold text-slate-400">Sub-Sect / Tradition</Label>
                        <select value={targetSubSect} onChange={(e) => setTargetSubSect(e.target.value)} className="w-full mt-1.5 h-9 rounded border px-2 bg-white focus:outline-none">
                          <option value="">Select Option</option>
                          {SECT_HIERARCHY[targetSect].map(v => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {wizardStep === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">RSVP / Ticket capacity *</Label>
                    <Input type="number" min={1} value={rsvpCapacity} onChange={(e) => setRsvpCapacity(e.target.value)} required className="h-9 mt-1" />
                  </div>
                  <div className="flex flex-col justify-end pb-1.5">
                    <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                      <input type="checkbox" checked={waitingListEnabled} onChange={(e) => setWaitingListEnabled(e.target.checked)} className="rounded border-slate-350 text-orange-600 h-4 w-4" />
                      Enable Waiting List Queue
                    </label>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="pt-3 border-t shrink-0">
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel Onboarding</Button>
              {wizardStep < 4 ? (
                <Button type="button" onClick={() => setWizardStep(wizardStep + 1)} className="bg-slate-800 hover:bg-slate-900 text-white font-bold h-9">
                  Continue Form
                </Button>
              ) : (
                <Button type="submit" disabled={saving || (isPaid && !isSuperAdmin)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-9">
                  {saving ? "Publishing Event..." : "Confirm and Publish Event"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Event Detail Drawer / Audits Dialog */}
      <Dialog open={detailEvent !== null && !galleryOpen} onOpenChange={(o) => { if (!o) setDetailEvent(null); }}>
        <DialogContent className="max-w-xl text-xs max-h-[85vh] overflow-y-auto bg-white rounded-2xl">
          {detailEvent && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="font-bold text-slate-850">Review Event ID: {detailEvent.publicId}</DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">Event Title</div>
                    <div className="font-bold text-slate-805 mt-0.5">{detailEvent.title}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">Category</div>
                    <div className="font-bold text-slate-805 mt-0.5">{detailEvent.category?.name || "Religious"}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">Timeline</div>
                    <div className="font-semibold text-slate-700 mt-0.5">{formatDateTime(detailEvent.startAt)}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">Status</div>
                    <div className="mt-0.5"><StatusBadge status={detailEvent.status} /></div>
                  </div>
                </div>

                <Tabs defaultValue="rsvps">
                  <TabsList className="bg-slate-100 p-0.5 rounded w-full justify-start">
                    <TabsTrigger value="rsvps" className="text-[10px] px-3 font-semibold rounded">RSVPs List ({rsvpsList.length})</TabsTrigger>
                    <TabsTrigger value="feedback" className="text-[10px] px-3 font-semibold rounded">Feedback Ratings ({feedbackList.length})</TabsTrigger>
                  </TabsList>

                  {/* RSVPs list */}
                  <TabsContent value="rsvps" className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-slate-700 text-[10px]">Registered RSVPs List</h4>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-6 text-[9px]" onClick={() => handleExportRsvps("xlsx")}>Excel</Button>
                        <Button size="sm" variant="outline" className="h-6 text-[9px]" onClick={() => handleExportRsvps("csv")}>CSV</Button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-44 overflow-y-auto">
                      {rsvpsList.length === 0 ? (
                        <div className="p-4 text-center text-slate-400">No RSVPs confirmed for this event yet.</div>
                      ) : (
                        rsvpsList.map((r, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 rounded border bg-slate-50/50">
                            <div>
                              <div className="font-bold text-slate-800">{r.member?.fullName}</div>
                              <div className="text-[9px] text-slate-400 mt-0.5">ID: {r.member?.publicId} | Date: {formatDate(r.createdAt)}</div>
                            </div>
                            <Badge variant={r.status === "CONFIRMED" ? "success" : "warning"}>{r.status}</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  {/* Feedback ratings */}
                  <TabsContent value="feedback" className="space-y-3 pt-2">
                    <h4 className="font-bold text-slate-700 text-[10px]">Attendee Feedback Comments</h4>
                    <div className="space-y-2 max-h-44 overflow-y-auto">
                      {feedbackList.length === 0 ? (
                        <div className="p-4 text-center text-slate-400">No rating comments uploaded yet.</div>
                      ) : (
                        feedbackList.map((f, idx) => (
                          <div key={idx} className="p-2.5 rounded border bg-slate-50/50 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-800">{f.member?.fullName || "Devotee"}</span>
                              <div className="flex text-amber-500 gap-0.5">
                                {Array.from({ length: f.rating || 5 }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-500" />)}
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-600 leading-normal">{f.comment || "No text feedback."}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <DialogFooter className="pt-2 border-t">
                <Button variant="ghost" onClick={() => setDetailEvent(null)}>Close</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Post-Event Gallery Management Modal */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="sm:max-w-md text-xs bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-orange-650" /> Upload Event Media Album
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadMedia} className="space-y-4 pt-2">
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">Gallery Image URL (Max 25)</Label>
              <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="e.g. /static/gallery/event1.png" className="mt-1" />
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">External Video Link URL (Google Drive / YouTube)</Label>
              <Input value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="mt-1" />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => { setGalleryOpen(false); setDetailEvent(null); }}>Cancel</Button>
              <Button type="submit" disabled={submittingMedia} className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-9 text-xs">
                {submittingMedia ? "Uploading Media..." : "Save Gallery Album"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Scanner Simulator Dialog */}
      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="sm:max-w-md text-xs bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-orange-650" /> QR Code Scanner Simulator
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleScanTicket} className="space-y-4 pt-2">
            <div className="p-3.5 bg-slate-50 border rounded-xl text-slate-600 leading-normal">
              Simulates validation scans performed by the entry gate scanners. Validates the Ticket ID, checks double-entry checks, and marks attendance.
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">Enter QR Validation Token *</Label>
              <Input value={ticketQrCode} onChange={(e) => setTicketQrCode(e.target.value)} placeholder="e.g. token_val_108" required className="mt-1" />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setScannerOpen(false)}>Close Scanner</Button>
              <Button type="submit" disabled={scanning} className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-9 text-xs">
                {scanning ? "Validating scan..." : "Mark Attendance Scan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
