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
import {
  Search,
  Calendar,
  Check,
  X,
  FileText,
  CreditCard,
  Building,
  QrCode,
  Download,
  Info,
  CalendarDays,
  Plus,
  AlertTriangle,
  Upload,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  ShieldCheck,
  Ban,
  FileSpreadsheet
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useOrgs } from "@/hooks/useOrgs";
import { OrgSelect } from "@/components/common/OrgSelect";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { toOptions } from "@/constants/dropdownOptions";

const BOOKING_CATEGORIES = [
  "Dharamshala Room", "Event Hall", "Temple Hall", "Temple Space", "Pooja Booking",
  "Pooja Materials", "Bhojanshala Booking", "Pathshala Hall", "Seminar Hall",
  "Conference Room", "Meeting Room", "Locker", "Parking", "Other"
];

export default function BookingsPage() {
  const { canDo, user, isSuperAdmin } = useAuth();
  const { orgs } = useOrgs();
  const [selectedOrg, setSelectedOrg] = useState("");
  const orgId = user?.organizationIds?.[0] || selectedOrg || (isSuperAdmin ? orgs[0]?.id : undefined);

  // Lists & States
  const [bookingItems, setBookingItems] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Active Tab
  const [activeTab, setActiveTab] = useState("admin_bookings");

  // Advanced Filters for Bookings Search
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterScope, setFilterScope] = useState("all");

  // Selection & Dialog States
  const [itemSetupOpen, setItemSetupOpen] = useState(false);
  const [newBookingOpen, setNewBookingOpen] = useState(false);
  const [detailBooking, setDetailBooking] = useState(null);
  const [paymentProofOpen, setPaymentProofOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [blackoutOpen, setBlackoutOpen] = useState(false);
  const [requestInfoOpen, setRequestInfoOpen] = useState(false);

  // Selected Booking Item for Calendar View
  const [selectedCalendarItem, setSelectedCalendarItem] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [itemCalendarDays, setItemCalendarDays] = useState([]);

  // Form Fields - Setup Booking Item
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("Dharamshala Room");
  const [itemDesc, setItemDesc] = useState("");
  const [itemTerms, setItemTerms] = useState("");
  const [itemGuidelines, setItemGuidelines] = useState("");
  const [itemCancelPolicy, setItemCancelPolicy] = useState("");
  const [itemType, setItemType] = useState("PAID"); // FREE | PAID
  const [itemDuration, setItemDuration] = useState("Hourly"); // Hourly | Half Day | Full Day | Multiple Days
  const [itemCapacityMax, setItemCapacityMax] = useState(10);
  const [itemCapacityPeople, setItemCapacityPeople] = useState(4);
  const [itemCharge, setItemCharge] = useState(500);
  const [itemPaymentHours, setItemPaymentHours] = useState(24);
  const [itemBankName, setItemBankName] = useState("");
  const [itemBankAccount, setItemBankAccount] = useState("");
  const [itemBankIfsc, setItemBankIfsc] = useState("");
  const [itemUpiId, setItemUpiId] = useState("");

  // Form Fields - Member Booking Submission
  const [selectedBookingItem, setSelectedBookingItem] = useState(null);
  const [bookDateFrom, setBookDateFrom] = useState("");
  const [bookDateTo, setBookDateTo] = useState("");
  const [bookPeople, setBookPeople] = useState(1);
  const [bookSlot, setBookSlot] = useState("09:00 - 10:00");

  // Form Fields - Offline Payment Proof
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // Form Fields - Admin Internal Reservation & Blackouts
  const [reserveDate, setReserveDate] = useState("");
  const [reserveReason, setReserveReason] = useState("");
  const [blackoutDate, setBlackoutDate] = useState("");
  const [blackoutReason, setBlackoutReason] = useState("");

  // Form Fields - Request Information Reason
  const [requestInfoReason, setRequestInfoReason] = useState("");

  const loadData = async () => {
    if (!orgId) { setLoading(false); return; }
    setLoading(true);
    try {
      // 1. Fetch configured Booking Items
      const itemsRes = await api.get(`/bookings/org/${orgId}`).catch(() => ({ data: { data: [] } }));
      // 2. Fetch admin bookings list
      const bookingsRes = await api.get(isSuperAdmin ? "/bookings" : `/bookings/org/${orgId}`).catch(() => ({ data: { data: [] } }));
      // 3. Fetch current member's bookings
      const myBookingsRes = await api.get("/bookings/my", { params: { scope: filterScope === "all" ? "all" : filterScope } }).catch(() => ({ data: { data: [] } }));

      // Format arrays safely
      const items = itemsRes.data?.data?.items || itemsRes.data?.data || [];
      const adminBookings = bookingsRes.data?.data?.items || bookingsRes.data?.data || [];
      const userBookings = myBookingsRes.data?.data?.items || myBookingsRes.data?.data || [];

      setBookingItems(items);
      setBookings(adminBookings);
      setMyBookings(userBookings);

      if (items.length > 0 && !selectedCalendarItem) {
        setSelectedCalendarItem(items[0]);
      }
    } catch (e) {
      toast.error("Failed to load booking ledger data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, reloadKey, filterScope]);

  // Fetch Live Calendar Availability
  const loadCalendarAvailability = async () => {
    if (!selectedCalendarItem) return;
    try {
      const from = new Date(calendarYear, calendarMonth, 1);
      const to = new Date(calendarYear, calendarMonth + 1, 0); // End of month
      const res = await api.get(`/bookings/items/${selectedCalendarItem.id}/availability`, {
        params: {
          from: from.toISOString(),
          to: to.toISOString()
        }
      });
      setItemCalendarDays(res.data?.data?.days || []);
    } catch (e) {
      toast.error("Failed to compile availability calendar");
    }
  };

  useEffect(() => {
    loadCalendarAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCalendarItem, calendarMonth, calendarYear, reloadKey]);

  // Booking Item Registration Setup
  const handleSetupItem = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        organizationId: orgId,
        name: itemName,
        categoryId: "default_cat", // Configurable category placeholders
        category: itemCategory,
        description: itemDesc,
        termsAndConditions: itemTerms,
        guidelines: itemGuidelines,
        cancellationPolicy: itemCancelPolicy,
        type: itemType,
        durationType: itemDuration.toUpperCase().replace(" ", "_"),
        capacityMaxBookings: Number(itemCapacityMax),
        capacityMaxPeople: Number(itemCapacityPeople),
        chargeAmount: Number(itemCharge),
        paymentWindowHours: Number(itemPaymentHours),
        paymentType: "BANK_TRANSFER",
        bankDetails: {
          bankName: itemBankName,
          accountNumber: itemBankAccount,
          ifscCode: itemBankIfsc,
          upiId: itemUpiId
        },
        availabilityConfig: { availableDays: [0, 1, 2, 3, 4, 5, 6] }
      };

      await api.post("/bookings/items", payload);
      toast.success("Booking item configured successfully!");
      setItemSetupOpen(false);
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Submit Member Booking
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!selectedBookingItem) return;
    try {
      await api.post("/bookings", {
        bookingItemId: selectedBookingItem.id,
        dateFrom: new Date(bookDateFrom).toISOString(),
        dateTo: bookDateTo ? new Date(bookDateTo).toISOString() : undefined,
        slot: bookSlot,
        peopleCount: Number(bookPeople)
      });
      toast.success("Booking request submitted! Awaiting administrator approval.");
      setNewBookingOpen(false);
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Submit Payment Proof Upload
  const handleUploadPayment = async (e) => {
    e.preventDefault();
    if (!detailBooking || !paymentRef) return;
    try {
      const idempotencyKey = "pay_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      await api.post(`/bookings/${detailBooking.id}/payment-proof`, {
        paymentReference: paymentRef,
        paymentProofUrl: paymentProofUrl || "screenshot_placeholder.png",
        paymentNotes,
        idempotencyKey
      });
      toast.success("Payment proof submitted successfully! Verification pending.");
      setPaymentProofOpen(false);
      setDetailBooking(null);
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Reserve slot internally
  const handleAddReservation = async (e) => {
    e.preventDefault();
    if (!selectedCalendarItem || !reserveDate) return;
    try {
      await api.post(`/bookings/items/${selectedCalendarItem.id}/internal-reservations`, {
        date: new Date(reserveDate).toISOString(),
        reason: reserveReason
      });
      toast.success("Slot reserved internally. Member view blocked.");
      setReserveOpen(false);
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Add Blackout Maintenance dates
  const handleAddBlackout = async (e) => {
    e.preventDefault();
    if (!selectedCalendarItem || !blackoutDate) return;
    try {
      await api.post(`/bookings/items/${selectedCalendarItem.id}/blackout-dates`, {
        date: new Date(blackoutDate).toISOString(),
        reason: blackoutReason
      });
      toast.success("Maintenance dates added successfully.");
      setBlackoutOpen(false);
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Admin decision on Booking Requests
  const handleBookingDecision = async (bookingId, decision, reason) => {
    try {
      await api.post(`/bookings/${bookingId}/decision`, { decision, reason });
      toast.success(`Booking request decided: ${decision}`);
      setDetailBooking(null);
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  // Admin decision on Payment verification
  const handlePaymentVerification = async (bookingId, decision, reason) => {
    try {
      await api.post(`/bookings/${bookingId}/payment-verification`, { decision, reason });
      toast.success(`Payment verified status: ${decision}`);
      setDetailBooking(null);
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleExportReports = async (type, format) => {
    try {
      const token = localStorage.getItem("jinanam_access_token");
      const res = await fetch(`${API_BASE}/bookings/org/${orgId}/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `booking-registry-${orgId}-${new Date().toISOString().slice(0, 10)}.${format === "xlsx" ? "xlsx" : "csv"}`;
      a.click();
      toast.success("Booking registry exported.");
    } catch (e) {
      toast.error("Export failed");
    }
  };

  // Filters mapping
  const filteredBookings = bookings.filter((r) => {
    if (filterStatus !== "ALL" && r.status !== filterStatus) return false;
    if (q && !JSON.stringify(r).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const columns = [
    { key: "publicId", header: "Booking ID", render: (r) => <Badge variant="outline" className="font-mono text-[9px]">{r.publicId || "—"}</Badge> },
    {
      key: "item",
      header: "Booking Item",
      render: (r) => (
        <div>
          <div className="font-bold text-slate-800 text-xs">{r.bookingItem?.name || "—"}</div>
          <div className="text-[10px] text-slate-400 font-semibold">{r.bookingItem?.category || "—"}</div>
        </div>
      )
    },
    {
      key: "member",
      header: "Devotee Member",
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-850 text-xs">{r.member?.fullName || "Guest Booker"}</div>
          <div className="text-[10px] text-slate-400 font-mono-num">{r.member?.publicId}</div>
        </div>
      )
    },
    {
      key: "dates",
      header: "Booking Dates",
      render: (r) => (
        <span className="text-slate-500 font-mono text-xs">
          {formatDate(r.dateFrom)} {r.dateTo ? `→ ${formatDate(r.dateTo)}` : ""}
        </span>
      )
    },
    { key: "amount", header: "Charges", render: (r) => <span className="font-bold text-slate-700 text-xs font-mono-num">{formatCurrency(r.amount)}</span> },
    {
      key: "status",
      header: "Current Status",
      render: (r) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={r.status} />
          {r.status === "PAYMENT_PENDING" && r.paymentWindowExpiresAt && (
            <Badge className="bg-rose-50 text-rose-800 border-rose-200 text-[8px] flex items-center gap-0.5 w-fit">
              <Clock className="h-2 w-2" /> Expires: {formatDateTime(r.paymentWindowExpiresAt).slice(11, 16)}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: "action",
      header: "Audit / Verify",
      render: (r) => (
        <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => setDetailBooking(r)}>
          Review Details
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6" data-testid="bookings-page">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-gradient-to-r from-orange-600 to-amber-700 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6 text-amber-200" />
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">Booking & Reservations</h1>
          </div>
          <p className="text-orange-100 text-xs mt-1 max-w-lg">
            Polymorphic reservation engine for Dharamshala rooms, halls, space events, and bhojanshala packages.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {canDo("BOOKINGS", "CREATE") && (
            <Button
              onClick={() => setItemSetupOpen(true)}
              className="bg-white hover:bg-orange-50 text-orange-700 font-bold h-10 px-5 shadow-md border border-white"
            >
              <Plus className="h-4 w-4 mr-2" /> Configure Booking Item
            </Button>
          )}
          <Button
            onClick={() => { setSelectedBookingItem(bookingItems[0]); setNewBookingOpen(true); }}
            className="bg-orange-850 hover:bg-orange-900 text-white font-bold h-10 px-5 border border-orange-700/50 shadow-md"
          >
            <Calendar className="h-4 w-4 mr-2" /> Submit Booking Request
          </Button>
        </div>
      </div>

      {isSuperAdmin && (
        <div className="max-w-xs">
          <OrgSelect value={orgId} onChange={setSelectedOrg} label="Active Location Facility" testId="bookings-org-select" />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="admin_bookings" className="px-5 py-2 font-bold text-xs rounded-lg">🛡️ Admin Ledger ({bookings.length})</TabsTrigger>
          <TabsTrigger value="availability_calendar" className="px-5 py-2 font-bold text-xs rounded-lg">📅 Live Availability Grid</TabsTrigger>
          <TabsTrigger value="my_bookings" className="px-5 py-2 font-bold text-xs rounded-lg">👤 My Unified Bookings ({myBookings.length})</TabsTrigger>
        </TabsList>

        {/* Tab 1: Admin Bookings Ledger */}
        <TabsContent value="admin_bookings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-700 rounded-lg"><CalendarDays className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Submitted Requests</div>
                <div className="text-xl font-black text-slate-800">{bookings.filter(b => b.status === "SUBMITTED" || b.status === "PENDING_APPROVAL").length}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-sky-50 text-sky-700 rounded-lg"><Clock className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Payment Verification</div>
                <div className="text-xl font-black text-slate-800">{bookings.filter(b => b.status === "PAYMENT_VERIFICATION").length}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg"><ShieldCheck className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Confirmed Stays</div>
                <div className="text-xl font-black text-slate-800">{bookings.filter(b => b.status === "CONFIRMED").length}</div>
              </div>
            </Card>
            <Card className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-lg"><FileSpreadsheet className="h-5 w-5" /></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Reports Exports</div>
                <div className="flex gap-1.5 mt-1">
                  <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleExportReports("bookings", "xlsx")}>Excel</Button>
                  <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleExportReports("bookings", "csv")}>CSV</Button>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-4 bg-white border rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-800">Platform Bookings Ledger</h3>
                <p className="text-[11px] text-slate-400">Audit stay timelines, verify payment receipts, and issue confirmations.</p>
              </div>
              <div className="flex gap-2">
                <select className="h-8 rounded border text-xs px-2 bg-slate-50 focus:outline-none"
                  value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="ALL">All Status</option>
                  {["SUBMITTED", "PENDING_APPROVAL", "APPROVED", "PAYMENT_PENDING", "PAYMENT_VERIFICATION", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED", "EXPIRED"].map(st => (
                    <option key={st} value={st}>{st.replace("_", " ")}</option>
                  ))}
                </select>
                <div className="relative max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="pl-8 text-xs h-8" />
                </div>
              </div>
            </div>

            <DataTable
              columns={columns}
              rows={filteredBookings}
              loading={loading}
              testId="bookings-table"
              emptyTitle="No bookings registered"
              emptyDescription="Booking requests submitted by members will appear here."
            />
          </Card>
        </TabsContent>

        {/* Tab 2: Availability Calendar Grid */}
        <TabsContent value="availability_calendar" className="space-y-4">
          <div className="grid grid-cols-12 gap-5">
            {/* Left selector */}
            <Card className="col-span-12 md:col-span-3 p-4 bg-white border rounded-xl shadow-sm space-y-4">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Bookable Services</h3>
              <div className="space-y-2 text-xs">
                {bookingItems.length === 0 ? (
                  <div className="text-slate-400 text-center py-4">No services configured.</div>
                ) : (
                  bookingItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedCalendarItem(item)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedCalendarItem?.id === item.id
                          ? "border-orange-500 bg-orange-50/20 text-orange-850 font-bold"
                          : "border-slate-100 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div>{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{item.category}</div>
                    </button>
                  ))
                )}
              </div>

              {selectedCalendarItem && (
                <div className="pt-4 border-t flex flex-col gap-2">
                  <Button size="sm" variant="outline" onClick={() => setReserveOpen(true)} className="w-full text-[11px] font-bold">
                    Add Internal Reservation
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setBlackoutOpen(true)} className="w-full text-[11px] font-bold">
                    Add Maintenance / Block
                  </Button>
                </div>
              )}
            </Card>

            {/* Calendar Grid */}
            <Card className="col-span-12 md:col-span-9 p-5 bg-white border rounded-xl shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <CalendarDays className="h-5 w-5 text-orange-500" />
                  Availability: {selectedCalendarItem?.name || "—"} ({new Date(calendarYear, calendarMonth).toLocaleString("default", { month: "long", year: "numeric" })})
                </h3>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => {
                    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
                    else setCalendarMonth(m => m - 1);
                  }}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
                    else setCalendarMonth(m => m + 1);
                  }}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d}>{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: new Date(calendarYear, calendarMonth, 1).getDay() }).map((_, pad) => (
                  <div key={`pad-${pad}`} className="h-16 bg-slate-50/50 rounded-lg"></div>
                ))}

                {itemCalendarDays.map((day, idx) => {
                  const dateNum = new Date(day.date).getDate();
                  const isAvailable = day.status === "AVAILABLE";
                  const isBooked = day.status === "BOOKED";
                  const isMaintenance = day.status === "MAINTENANCE";
                  const isReserved = day.status === "RESERVED" || day.status === "UNAVAILABLE";

                  return (
                    <div key={idx} className={`h-20 p-1.5 rounded-lg border flex flex-col justify-between transition-all ${
                      isAvailable ? "border-slate-100 hover:border-orange-300 bg-white" :
                      isBooked ? "border-rose-100 bg-rose-50/40 text-rose-800" :
                      isMaintenance ? "border-amber-100 bg-amber-50/30 text-amber-800" :
                      "border-slate-200 bg-slate-100 text-slate-500"
                    }`}>
                      <span className="text-[10px] font-black">{dateNum}</span>
                      <span className={`text-[8px] uppercase tracking-wider font-extrabold w-fit px-1 rounded ${
                        isAvailable ? "bg-emerald-50 text-emerald-700" :
                        isBooked ? "bg-rose-100 text-rose-800" :
                        isMaintenance ? "bg-amber-100 text-amber-800" :
                        "bg-slate-200 text-slate-600"
                      }`}>
                        {day.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Unified Member Bookings */}
        <TabsContent value="my_bookings" className="space-y-4">
          <Card className="p-4 bg-white border rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-800">My Platform Bookings Ledger</h3>
                <p className="text-[11px] text-slate-400">View current, historical and future stays in one unified dashboard.</p>
              </div>
              <div className="flex gap-2">
                <select className="h-8 rounded border text-xs px-2 bg-slate-50 focus:outline-none"
                  value={filterScope} onChange={(e) => setFilterScope(e.target.value)}>
                  <option value="all">All Bookings</option>
                  <option value="upcoming">Upcoming Bookings</option>
                  <option value="past">Past Bookings History</option>
                </select>
              </div>
            </div>

            <DataTable
              columns={[
                { key: "publicId", header: "Booking ID", render: (r) => <Badge variant="outline" className="font-mono text-[9px]">{r.publicId}</Badge> },
                {
                  key: "item",
                  header: "Service Details",
                  render: (r) => (
                    <div>
                      <div className="font-bold text-slate-800 text-xs">{r.bookingItem?.name}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{r.organization?.name}</div>
                    </div>
                  )
                },
                {
                  key: "dates",
                  header: "Dates",
                  render: (r) => (
                    <span className="text-slate-500 font-mono text-xs">
                      {formatDate(r.dateFrom)} {r.dateTo ? `→ ${formatDate(r.dateTo)}` : ""}
                    </span>
                  )
                },
                { key: "amount", header: "Charges Paid", render: (r) => <span className="font-bold text-slate-700 text-xs font-mono-num">{formatCurrency(r.amount)}</span> },
                { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
                {
                  key: "actions",
                  header: "Actions",
                  render: (r) => (
                    <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {r.status === "PAYMENT_PENDING" && (
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-7 text-[10px]" onClick={() => { setDetailBooking(r); setPaymentProofOpen(true); }}>
                          <Upload className="h-3 w-3 mr-1" /> Upload Screenshot
                        </Button>
                      )}
                      {r.status === "CONFIRMED" && r.receipt?.pdfUrl && (
                        <a href={r.receipt.pdfUrl} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="outline" className="h-7 text-[10px]">
                            <Download className="h-3 w-3 mr-1" /> Receipt
                          </Button>
                        </a>
                      )}
                    </div>
                  )
                }
              ]}
              rows={myBookings}
              loading={loading}
              emptyTitle="No bookings found"
              emptyDescription="Submit booking request triggers above to create a booking."
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* dialog 1: Configure Booking Item */}
      <Dialog open={itemSetupOpen} onOpenChange={setItemSetupOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <Plus className="h-5 w-5 text-orange-600" /> Configure Booking Item
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSetupItem} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">Booking Item Name *</Label>
                <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g. Deluxe Room 302" required className="h-9" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">Booking Category *</Label>
                <SearchableSelect
                  value={itemCategory}
                  onValueChange={setItemCategory}
                  options={toOptions(BOOKING_CATEGORIES)}
                  placeholder="Select Category"
                />
              </div>
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">Description</Label>
              <Textarea value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} placeholder="Describe the room, hall facilities, beds, etc." className="mt-1" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">Item Booking Type *</Label>
                <SearchableSelect
                  value={itemType}
                  onValueChange={setItemType}
                  options={[
                    { value: "PAID", label: "Paid Booking" },
                    { value: "FREE", label: "Free / Complementary" },
                  ]}
                  placeholder="Select Type"
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">Booking Duration *</Label>
                <SearchableSelect
                  value={itemDuration}
                  onValueChange={setItemDuration}
                  options={toOptions(["Hourly basis", "Half Day basis", "Full Day basis", "Multiple Days stay"])}
                  placeholder="Select Duration"
                />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">Max Capacity bookings *</Label>
                <Input type="number" min={1} value={itemCapacityMax} onChange={(e) => setItemCapacityMax(e.target.value)} required className="h-9" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">Max People Allowed</Label>
                <Input type="number" min={1} value={itemCapacityPeople} onChange={(e) => setItemCapacityPeople(e.target.value)} required className="h-9" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">Charges Amount (INR)</Label>
                <Input type="number" min={0} value={itemCharge} onChange={(e) => setItemCharge(e.target.value)} required className="h-9" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">Payment window (Hours)</Label>
                <Input type="number" min={1} value={itemPaymentHours} onChange={(e) => setItemPaymentHours(e.target.value)} required className="h-9" />
              </div>
            </div>

            <div className="border-t pt-3 space-y-3">
              <h4 className="font-bold text-slate-700 text-xs">Offline Bank & UPI Details</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Bank Name</Label>
                  <Input value={itemBankName} onChange={(e) => setItemBankName(e.target.value)} placeholder="e.g. State Bank of India" className="h-9" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">Account Number</Label>
                  <Input value={itemBankAccount} onChange={(e) => setItemBankAccount(e.target.value)} placeholder="e.g. 1002345564" className="h-9" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">IFSC Code</Label>
                  <Input value={itemBankIfsc} onChange={(e) => setItemBankIfsc(e.target.value)} placeholder="e.g. SBIN000123" className="h-9" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-400">UPI Pay ID</Label>
                  <Input value={itemUpiId} onChange={(e) => setItemUpiId(e.target.value)} placeholder="e.g. jinanam@sbi" className="h-9" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">Terms & Conditions</Label>
                <Input value={itemTerms} onChange={(e) => setItemTerms(e.target.value)} className="h-9" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">Booking Guidelines</Label>
                <Input value={itemGuidelines} onChange={(e) => setItemGuidelines(e.target.value)} className="h-9" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">Cancellation Policy</Label>
                <Input value={itemCancelPolicy} onChange={(e) => setItemCancelPolicy(e.target.value)} className="h-9" />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setItemSetupOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold">Save Configuration</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 2: Submit Booking Request */}
      <Dialog open={newBookingOpen} onOpenChange={setNewBookingOpen}>
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <Calendar className="h-5 w-5 text-orange-600" /> New Booking Request
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitBooking} className="space-y-4 pt-2">
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">Select Booking Item *</Label>
              <select className="w-full mt-1 h-9 rounded border px-2 focus:outline-none"
                value={selectedBookingItem?.id} onChange={(e) => setSelectedBookingItem(bookingItems.find(i => i.id === e.target.value))}>
                {bookingItems.map(item => (
                  <option key={item.id} value={item.id}>{item.name} ({item.category})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">Date From *</Label>
                <Input type="date" value={bookDateFrom} onChange={(e) => setBookDateFrom(e.target.value)} required className="mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">Date To (Optional)</Label>
                <Input type="date" value={bookDateTo} onChange={(e) => setBookDateTo(e.target.value)} className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">Slot Time / Hours</Label>
                <Input value={bookSlot} onChange={(e) => setBookSlot(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">Devotees Count *</Label>
                <Input type="number" min={1} value={bookPeople} onChange={(e) => setBookPeople(e.target.value)} required className="mt-1" />
              </div>
            </div>

            {selectedBookingItem && (
              <div className="p-3 bg-slate-50 rounded-lg border space-y-1">
                <div className="font-bold text-slate-800">Charges Detail:</div>
                <div className="flex justify-between text-slate-600">
                  <span>Standard charges:</span>
                  <span className="font-bold">{formatCurrency(selectedBookingItem.chargeAmount)} ({selectedBookingItem.type})</span>
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setNewBookingOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold">Submit Booking Request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 3: Upload Offline Payment Screenshot */}
      <Dialog open={paymentProofOpen} onOpenChange={setPaymentProofOpen}>
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-600" /> Upload Payment Screenshot
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadPayment} className="space-y-4 pt-2">
            {detailBooking && (
              <div className="p-3 bg-slate-50 border rounded-lg space-y-2">
                <div className="font-bold text-slate-800">Offline Payment Bank/UPI Details:</div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>Bank Name: {detailBooking.bookingItem?.bankDetails?.bankName || "—"}</div>
                  <div>Account: {detailBooking.bookingItem?.bankDetails?.accountNumber || "—"}</div>
                  <div>IFSC: {detailBooking.bookingItem?.bankDetails?.ifscCode || "—"}</div>
                  <div>UPI ID: {detailBooking.bookingItem?.bankDetails?.upiId || "—"}</div>
                </div>
              </div>
            )}

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">Payment Reference Number / UPI UTR *</Label>
              <Input value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} placeholder="e.g. UTR102345564" required className="mt-1" />
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">Payment Screenshot image url (Optional)</Label>
              <Input value={paymentProofUrl} onChange={(e) => setPaymentProofUrl(e.target.value)} placeholder="e.g. /static/payments/proof1.png" className="mt-1" />
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">Payment Notes</Label>
              <Textarea value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} placeholder="e.g. Paid via mobile GPay" className="mt-1" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setPaymentProofOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold">Confirm Payment Submitted</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 4: View / Action Booking Detail Drawer */}
      <Dialog open={detailBooking !== null && !paymentProofOpen} onOpenChange={(o) => { if (!o) setDetailBooking(null); }}>
        <DialogContent className="sm:max-w-md text-xs">
          {detailBooking && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="font-bold text-slate-805">Review Booking ID: {detailBooking.publicId}</DialogTitle>
              </DialogHeader>

              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">Service Item</div>
                    <div className="font-bold text-slate-800 mt-0.5">{detailBooking.bookingItem?.name}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">Devotee</div>
                    <div className="font-bold text-slate-805 mt-0.5">{detailBooking.member?.fullName || "Guest"}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">Dates Timeline</div>
                    <div className="font-semibold text-slate-700 mt-0.5">{formatDate(detailBooking.dateFrom)} {detailBooking.dateTo ? `→ ${formatDate(detailBooking.dateTo)}` : ""}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">Status</div>
                    <div className="mt-0.5"><StatusBadge status={detailBooking.status} /></div>
                  </div>
                </div>

                {detailBooking.paymentReference && (
                  <div className="p-3 border rounded bg-indigo-50/50">
                    <div className="font-bold text-indigo-900">Submitted Payment Details:</div>
                    <div className="mt-1 font-semibold text-slate-700">Reference / UTR: {detailBooking.paymentReference}</div>
                    {detailBooking.paymentNotes && <div className="text-slate-500 mt-0.5">Notes: {detailBooking.paymentNotes}</div>}
                  </div>
                )}
              </div>

              <DialogFooter className="gap-1.5 pt-2 flex flex-wrap">
                <Button variant="ghost" onClick={() => setDetailBooking(null)}>Close</Button>
                
                {/* Admin flow for PENDING_APPROVAL */}
                {detailBooking.status === "PENDING_APPROVAL" && canDo("BOOKINGS", "APPROVE") && (
                  <>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs"
                      onClick={() => handleBookingDecision(detailBooking.id, "APPROVE")}>
                      Approve Booking
                    </Button>
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-9 text-xs"
                      onClick={() => handleBookingDecision(detailBooking.id, "REJECT")}>
                      Reject Request
                    </Button>
                    <Button className="bg-slate-800 hover:bg-slate-900 text-white font-bold h-9 text-xs"
                      onClick={() => setRequestInfoOpen(true)}>
                      Request Info
                    </Button>
                  </>
                )}

                {/* Admin flow for PAYMENT_VERIFICATION */}
                {detailBooking.status === "PAYMENT_VERIFICATION" && canDo("BOOKINGS", "APPROVE") && (
                  <>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs"
                      onClick={() => handlePaymentVerification(detailBooking.id, "APPROVE")}>
                      Approve Payment (Confirm Booking)
                    </Button>
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-9 text-xs"
                      onClick={() => handlePaymentVerification(detailBooking.id, "REJECT")}>
                      Reject Proof
                    </Button>
                  </>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* dialog 5: Internal Reservation Block */}
      <Dialog open={reserveOpen} onOpenChange={setReserveOpen}>
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-orange-600" /> Internal Reservation Block
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddReservation} className="space-y-4 pt-2">
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">Blocked Date *</Label>
              <Input type="date" value={reserveDate} onChange={(e) => setReserveDate(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">Block Reason / Usage *</Label>
              <Input value={reserveReason} onChange={(e) => setReserveReason(e.target.value)} placeholder="e.g. Temple Function / Private Event" required className="mt-1" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setReserveOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold">Apply Block</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 6: Maintenance Dates Block */}
      <Dialog open={blackoutOpen} onOpenChange={setBlackoutOpen}>
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" /> Add Maintenance Blackout Date
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddBlackout} className="space-y-4 pt-2">
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">Maintenance Date *</Label>
              <Input type="date" value={blackoutDate} onChange={(e) => setBlackoutDate(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">Reason Details</Label>
              <Input value={blackoutReason} onChange={(e) => setBlackoutReason(e.target.value)} placeholder="e.g. Painting / Electrical Repairs" className="mt-1" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setBlackoutOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold">Confirm Blackout</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* dialog 7: Request Information Input */}
      <Dialog open={requestInfoOpen} onOpenChange={setRequestInfoOpen}>
        <DialogContent className="sm:max-w-md text-xs">
          <DialogHeader>
            <DialogTitle>Request Additional Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">Information Needed Reason *</Label>
              <Textarea value={requestInfoReason} onChange={(e) => setRequestInfoReason(e.target.value)} placeholder="Describe what details the devotee must supply" required className="mt-1" />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setRequestInfoOpen(false)}>Cancel</Button>
              <Button className="bg-slate-800 hover:bg-slate-900 text-white font-bold"
                onClick={() => { handleBookingDecision(detailBooking.id, "REQUEST_INFO", requestInfoReason); setRequestInfoOpen(false); }}>
                Submit Info Request
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
