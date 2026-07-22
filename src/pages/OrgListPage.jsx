import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, extractErrorMessage, STATIC_URL } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, MapPin, Trash2, X, CheckCircle, Coffee, Shield, Building2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  INDIAN_STATE_OPTIONS, ORG_TYPE_OPTIONS,
  toOptions,
} from "@/constants/dropdownOptions";

const FACILITY_OPTIONS = [
  "Parking", "CCTV", "Lift", "AC", "Cafeteria", "Medical", "Library", "Ramp", "Wheelchair Access",
  "Fire Safety", "Solar Power", "Dharamshala", "Bhojanshala", "Upashray", "Event Hall"
];
const TEMPLE_TYPES = ["SHIKHAR_BADDHA", "GHAR_DERASAR", "JAIN_CENTRE"];

const REGIONS_CURRENCIES = {
  "India": "INR (₹)",
  "United Kingdom": "GBP (£)",
  "United States": "USD ($)",
  "Canada": "CAD (C$)",
  "Australia": "AUD (A$)",
  "United Arab Emirates": "AED (د.إ)",
  "Singapore": "SGD (S$)",
  "Kenya": "KES (KSh)",
  "South Africa": "ZAR (R)",
};

const SHWETAMBAR_SUB = ["Murtipujak", "Sthanakvasi", "Terapanth"];
const DIGAMBAR_SUB = ["Bisapantha", "Terapantha", "Taranapantha", "Gumanapantha", "Totapantha", "Kanjipantha", "Other Digambar Traditions"];

const MURTIPUJAK_GACCHAS = [
  "Upkeśa Gaccha", "Achal Gaccha", "Jiravala Gaccha", "Kharatara Gaccha", "Lonka (Richmati) Gaccha",
  "Tapa Gaccha", "Gangeshvara Gaccha", "Korantavala Gaccha", "Anandapura Gaccha", "Bharavali Gaccha",
  "Udhaviya Gaccha", "Gudava Gaccha", "Dekawa Gaccha", "Bhinmala Gaccha", "Mahudiya Gaccha",
  "Gachhapala Gaccha", "Goshavala Gaccha", "Magatragada Gaccha", "Vrihmaniya Gaccha", "Talara Gaccha",
  "Vikadiya Gaccha", "Munjhiya Gaccha", "Chitroda Gaccha", "Sachora Gaccha", "Jachandiya Gaccha",
  "Sidhalava Gaccha", "Miyanniya Gaccha", "Agamiya Gaccha", "Maladhari Gaccha", "Bhavariya Gaccha",
  "Paliwala Gaccha", "Nagadigeshvara Gaccha", "Dharmaghosha Gaccha", "Nagapura Gaccha", "Uchatavala Gaccha",
  "Nannavala Gaccha", "Sadera Gaccha", "Mandovara Gaccha", "Surani Gaccha", "Khambhavati Gaccha",
  "Panchanda Gaccha", "Sopariya Gaccha", "Mandaliya Gaccha", "Kochhipana Gaccha", "Jaganna Gaccha",
  "Laparavala Gaccha", "Vosarada Gaccha", "Duivandaniya Gaccha", "Chitravala Gaccha", "Vegada Gaccha",
  "Vapada Gaccha", "Vijahara Gaccha", "Kapuri Gaccha", "Kachala Gaccha", "Handaliya Gaccha",
  "Mahukara Gaccha", "Putaliya Gaccha", "Kannariseya Gaccha", "Revardiya Gaccha", "Dhandhuka Gaccha",
  "Thambhanipana Gaccha", "Panchivala Gaccha", "Palanpura Gaccha", "Gandhariya Gaccha", "Veliya Gaccha",
  "Sadhapunamiya Gaccha", "Nagarakotiya Gaccha", "Hasora Gaccha", "Bhatanera Gaccha", "Janahara Gaccha",
  "Jagayana Gaccha", "Bhimasena Gaccha", "Takadiya Gaccha", "Kamboja Gaccha", "Senata Gaccha",
  "Vaghera Gaccha", "Vahediya Gaccha", "Siddhapura Gaccha", "Ghoghari Gaccha", "Nigamiya Gaccha"
];
const MemberSelect = ({ label, value, onChange, placeholder = "Select Member..." }) => {
  return (
    <div>
      <Label className="text-xs font-semibold text-slate-600 mb-1 block">{label}</Label>
      <MemberLinkSelect
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        returnValueType="id"
      />
    </div>
  );
};

export default function OrgListPage({
  endpoint,
  entity,
  label,
  pluralLabel,
  moduleKey,
  testId,
}) {
  const { canDo, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Wizard tab
  const [tab, setTab] = useState("basic");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [bhagwans, setBhagwans] = useState([]);

  // Custom deity creation states
  const [createDeityOpen, setCreateDeityOpen] = useState(false);
  const [deityName, setDeityName] = useState("");
  const [deityCategory, setDeityCategory] = useState("24 Tirthankars");
  const [deitySaving, setDeitySaving] = useState(false);

  const [form, setForm] = useState({
    name: "", shortName: "", trustName: "", trustRegistrationNumber: "", history: "",
    addressLine: "", city: "", state: "", country: "India", pincode: "",
    phone: "", website: "", googleMapsLink: "", establishedDate: "",
    templeType: "SHIKHAR_BADDHA", sect: "Shwetambar", subSect: "Murtipujak",
    gacchaName: "", mulNayakBhagwanId: "", muritCount: "", tithiCalendar: "Gujarati",
    upiId: "", bankAccount: "", bankIfsc: "", hasBhojanshala: false,
    hasUpashray: false, hasEventHall: false, hasDharamshala: false, hasPathshala: false,
    upashrayLocation: "Within Property", eventHallPurpose: "Available for Booking",
    eventHallBookingLink: "", bhojanshalaBreakfast: "07:00 AM - 08:30 AM",
    bhojanshalaLunch: "11:30 AM - 01:00 PM", bhojanshalaDinner: "05:00 PM - 06:00 PM",
    bhojanshalaMealType: "Free", bhojanshalaAvailability: "Daily", bhojanshalaContact: "",
    dharamshalaRooms: "Both", dharamshalaOffice: "09:00 AM - 08:00 PM", dharamshalaPhone: "",
    dharamshalaContact: "", dharamshalaOnline: "No", pathshalaTimings: "04:30 PM - 06:00 PM",
    pathshalaDays: "Sat, Sun", pathshalaTeacher: "", morningStart: "06:00 AM",
    morningEnd: "12:00 PM", eveningStart: "05:30 PM", eveningEnd: "09:00 PM",
    pakshalStart: "06:30 AM", pakshalEnd: "08:00 AM", poojaStart: "07:00 AM",
    poojaEnd: "08:30 AM", aartiMorning: "08:30 AM", aartiEvening: "07:30 PM",
    is80gEligible: false, csrEligible: false, facilities: [], preferredCurrency: "INR (₹)",
    // Dharamshala properties
    landmark: "", railwayStation: "", district: "", hasTempleInside: false,
    templeMulNayakName: "", templeMulNayakImageUrl: "", templeTithiCalendar: "Gujarati",
    templeOpeningHours: "", templePakshalStart: "", templePoojaStart: "", templeAartiEvening: "",
    buildings: [], checkInTime: "12:00 PM", checkOutTime: "11:00 AM",
    advanceBookingRequired: false, onlineBookingAvailable: false,
    dharamshalaStatus: "High Availability", adminBlockedRooms: "",
    emergencyContact: "", caretakerDetails: "", rulesText: "",
    primaryContactMemberId: "", secondaryContactNumber: "",
    contactMobileVerified: false, contactWhatsAppVerified: false, contactEmailVerified: false,
    primaryContactPreference: "Mobile", trusteesList: [], volunteersList: [],
    instaLink: "", facebookLink: "", youtubeLink: "", donationQrCodeUrl: "", bankName: "", bankBranch: ""
  });

  useEffect(() => {
    api.get("/master-data/bhagwans").then((r) => setBhagwans(r.data?.data || [])).catch(() => {});
  }, [open]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get(endpoint)
      .then((res) => {
        const list = res.data?.data?.items || res.data?.data || [];
        if (mounted) setRows(list);
      })
      .catch(() => mounted && setRows([]))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [endpoint, reloadKey]);

  // Sync currency automatically on country change
  useEffect(() => {
    if (form.country) {
      const defaultCur = REGIONS_CURRENCIES[form.country] || "USD ($)";
      setForm((f) => ({ ...f, preferredCurrency: defaultCur }));
    }
  }, [form.country]);

  const handleCreateDeitySubmit = async (e) => {
    e.preventDefault();
    if (!deityName.trim()) { toast.error("Deity name is required."); return; }
    setDeitySaving(true);
    try {
      const res = await api.post("/master-data/bhagwans", { name: deityName.trim(), category: deityCategory });
      toast.success("Deity created successfully!");
      const r = await api.get("/master-data/bhagwans");
      const updatedBhagwans = r.data?.data || [];
      setBhagwans(updatedBhagwans);
      const newDeity = updatedBhagwans.find(b => b.name === deityName.trim());
      if (newDeity) {
        setForm(prev => ({ ...prev, mulNayakBhagwanId: newDeity.id }));
      }
      setDeityName("");
      setCreateDeityOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setDeitySaving(false);
    }
  };

  const ORG_TYPE = { temple: "TEMPLE", dharamshala: "DHARAMSHALA", "jain-center": "JAIN_CENTER" };

  const create = async () => {
    setCreating(true);
    try {
      await api.post(endpoint, { 
        ...form, 
        type: ORG_TYPE[entity] || "TEMPLE",
        muritCount: form.muritCount ? Number(form.muritCount) : undefined,
        establishedDate: form.establishedDate ? new Date(form.establishedDate).toISOString() : undefined
      });
      toast.success(`${label} created successfully.`);
      setOpen(false);
      setForm({
        name: "", shortName: "", trustName: "", trustRegistrationNumber: "", history: "",
        addressLine: "", city: "", state: "", country: "India", pincode: "",
        phone: "", website: "", googleMapsLink: "", establishedDate: "",
        templeType: "SHIKHAR_BADDHA", sect: "Shwetambar", subSect: "Murtipujak",
        gacchaName: "", mulNayakBhagwanId: "", muritCount: "", tithiCalendar: "Gujarati",
        upiId: "", bankAccount: "", bankIfsc: "", hasBhojanshala: false,
        hasUpashray: false, hasEventHall: false, hasDharamshala: false, hasPathshala: false,
        upashrayLocation: "Within Property", eventHallPurpose: "Available for Booking",
        eventHallBookingLink: "", bhojanshalaBreakfast: "07:00 AM - 08:30 AM",
        bhojanshalaLunch: "11:30 AM - 01:00 PM", bhojanshalaDinner: "05:00 PM - 06:00 PM",
        bhojanshalaMealType: "Free", bhojanshalaAvailability: "Daily", bhojanshalaContact: "",
        dharamshalaRooms: "Both", dharamshalaOffice: "09:00 AM - 08:00 PM", dharamshalaPhone: "",
        dharamshalaContact: "", dharamshalaOnline: "No", pathshalaTimings: "04:30 PM - 06:00 PM",
        pathshalaDays: "Sat, Sun", pathshalaTeacher: "", morningStart: "06:00 AM",
        morningEnd: "12:00 PM", eveningStart: "05:30 PM", eveningEnd: "09:00 PM",
        pakshalStart: "06:30 AM", pakshalEnd: "08:00 AM", poojaStart: "07:00 AM",
        poojaEnd: "08:30 AM", aartiMorning: "08:30 AM", aartiEvening: "07:30 PM",
        is80gEligible: false, csrEligible: false, facilities: [], preferredCurrency: "INR (₹)",
        // Dharamshala properties
        landmark: "", railwayStation: "", district: "", hasTempleInside: false,
        templeMulNayakName: "", templeMulNayakImageUrl: "", templeTithiCalendar: "Gujarati",
        templeOpeningHours: "", templePakshalStart: "", templePoojaStart: "", templeAartiEvening: "",
        buildings: [], checkInTime: "12:00 PM", checkOutTime: "11:00 AM",
        advanceBookingRequired: false, onlineBookingAvailable: false,
        dharamshalaStatus: "High Availability", adminBlockedRooms: "",
        emergencyContact: "", caretakerDetails: "", rulesText: "",
        primaryContactMemberId: "", secondaryContactNumber: "",
        contactMobileVerified: false, contactWhatsAppVerified: false, contactEmailVerified: false,
        primaryContactPreference: "Mobile", trusteesList: [], volunteersList: [],
        instaLink: "", facebookLink: "", youtubeLink: "", donationQrCodeUrl: "", bankName: "", bankBranch: ""
      });
      setReloadKey((k) => k + 1);
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setCreating(false);
    }
  };

  const toggleFacility = (f) => setForm((prev) => ({
    ...prev,
    facilities: prev.facilities.includes(f)
      ? prev.facilities.filter((x) => x !== f)
      : [...prev.facilities, f],
  }));

  const addBuilding = () => {
    const newB = {
      id: Date.now().toString(),
      name: `Building ${String.fromCharCode(65 + (form.buildings?.length || 0))}`,
      imageUrl: "",
      roomTypes: []
    };
    setForm(prev => ({ ...prev, buildings: [...(prev.buildings || []), newB] }));
  };

  const removeBuilding = (bid) => {
    setForm(prev => ({ ...prev, buildings: (prev.buildings || []).filter(b => b.id !== bid) }));
  };

  const updateBuildingName = (bid, name) => {
    setForm(prev => ({
      ...prev,
      buildings: (prev.buildings || []).map(b => b.id === bid ? { ...b, name } : b)
    }));
  };

  const addRoomType = (bid) => {
    const newRoom = {
      id: Date.now().toString(),
      name: "Standard AC Room",
      category: "AC",
      type: "Private",
      roomCount: "10",
      bedCapacity: "2",
      charges: "1200",
      chargesType: "Per Room",
      deposit: "500",
      attachedBathroom: "Yes",
      amenities: ["Fan", "AC", "Geyser"]
    };
    setForm(prev => ({
      ...prev,
      buildings: (prev.buildings || []).map(b => b.id === bid ? { ...b, roomTypes: [...(b.roomTypes || []), newRoom] } : b)
    }));
  };

  const updateRoomType = (bid, rid, key, value) => {
    setForm(prev => ({
      ...prev,
      buildings: (prev.buildings || []).map(b => b.id === bid ? {
        ...b,
        roomTypes: (b.roomTypes || []).map(r => r.id === rid ? { ...r, [key]: value } : r)
      } : b)
    }));
  };

  const removeRoomType = (bid, rid) => {
    setForm(prev => ({
      ...prev,
      buildings: (prev.buildings || []).map(b => b.id === bid ? {
        ...b,
        roomTypes: (b.roomTypes || []).filter(r => r.id !== rid)
      } : b)
    }));
  };

  const addTrusteeRow = () => {
    const newT = { id: Date.now().toString(), memberId: "", designation: "Trustee" };
    setForm(prev => ({ ...prev, trusteesList: [...(prev.trusteesList || []), newT] }));
  };
  const removeTrusteeRow = (id) => {
    setForm(prev => ({ ...prev, trusteesList: (prev.trusteesList || []).filter(t => t.id !== id) }));
  };
  const updateTrusteeRow = (id, key, value) => {
    setForm(prev => ({
      ...prev,
      trusteesList: (prev.trusteesList || []).map(t => t.id === id ? { ...t, [key]: value } : t)
    }));
  };

  const addVolunteerRow = () => {
    const newV = { id: Date.now().toString(), memberId: "" };
    setForm(prev => ({ ...prev, volunteersList: [...(prev.volunteersList || []), newV] }));
  };
  const removeVolunteerRow = (id) => {
    setForm(prev => ({ ...prev, volunteersList: (prev.volunteersList || []).filter(v => v.id !== id) }));
  };
  const updateVolunteerRow = (id, value) => {
    setForm(prev => ({
      ...prev,
      volunteersList: (prev.volunteersList || []).map(v => v.id === id ? { ...v, memberId: value } : v)
    }));
  };

  const field = (lbl, key, type = "text", placeholder = "") => (
    <div>
      <Label className="text-xs font-semibold text-slate-655">{lbl}</Label>
      <Input className="mt-1 bg-white h-9" type={type} value={form[key] || ""} placeholder={placeholder}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
    </div>
  );

  const toggle = (lbl, key) => (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input type="checkbox" className="h-4.5 w-4.5 text-orange-500 rounded border-slate-350" checked={!!form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.checked })} />
      <span className="text-sm font-bold text-slate-700">{lbl}</span>
    </label>
  );

  const columns = [
    {
      key: "cover", header: "", width: 60,
      render: (r) => (
        <div className="h-10 w-10 rounded bg-primary/10 overflow-hidden flex items-center justify-center">
          {r.coverImageUrl || r.logoUrl ? (
            <img
              src={r.coverImageUrl?.startsWith("http") ? r.coverImageUrl : `${STATIC_URL}${r.coverImageUrl || r.logoUrl}`}
              alt="" className="h-full w-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <Building2 className="h-5 w-5 text-primary/65" />
          )}
        </div>
      ),
    },
    {
      key: "publicId", header: "ID", width: 110,
      render: (r) => (
        <Badge variant="outline" className="font-mono text-[10px] tracking-wider">{r.publicId || "—"}</Badge>
      ),
    },
    {
      key: "name", header: "Name",
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-800">{r.name || "—"}</div>
          {r.trustName && <div className="text-xs text-slate-400">{r.trustName}</div>}
        </div>
      ),
    },
    {
      key: "location", header: "Location",
      render: (r) => (
        <span className="text-slate-600 text-xs font-semibold">
          {[r.city, r.state].filter(Boolean).join(", ") || "—"}
        </span>
      ),
    },
    { key: "templeType", header: "Type", render: (r) => <span className="text-xs font-bold text-slate-655 bg-slate-50 border px-2 py-0.5 rounded">{r.templeType || r.type || "—"}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status || "ACTIVE"} /> },
  ];

  const filtered = q
    ? rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()))
    : rows;

  const isDharamshala = entity === "dharamshala";

  const configTabs = isDharamshala ? [
    { id: "basic", label: "🏨 Basic Info" },
    { id: "temple", label: "🛕 Inside Temple" },
    { id: "location", label: "📍 Location & Contact" },
    { id: "accommodations", label: "🏢 Accommodations" },
    { id: "facilities", label: "✨ Facilities" },
    { id: "food", label: "🥗 Bhojanalay" },
    { id: "contacts", label: "👥 Contacts & Management" },
    { id: "trustees", label: "📜 Trustees & Committee" },
    { id: "volunteers", label: "🤝 Volunteers" },
    { id: "rules", label: "📋 Rules & Safety" },
    { id: "bank", label: "💰 Banking Details" },
    { id: "links", label: "🔗 Social & UX Links" }
  ] : [
    { id: "basic", label: "🛕 Basic & Trust" },
    { id: "location", label: "📍 Location & Maps" },
    { id: "facilities", label: "🏢 Facilities & Units" },
    { id: "timings", label: "🕒 Slot Timings" },
    { id: "finance", label: "💰 Banking Details" }
  ];

  return (
    <div data-testid={testId} className="space-y-4">
      <PageHeader
        title={pluralLabel}
        subtitle={`Centralized directory of all ${pluralLabel.toLowerCase()} managed across the network platform.`}
        actions={
          isSuperAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button data-testid={`${testId}-add-button`} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">
                  <Plus className="h-4 w-4 mr-2" /> New {label}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl shadow-2xl bg-white border border-slate-100 h-[75vh] flex flex-col">
                <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
                  
                  {/* Left panel selector */}
                  <div className="w-full md:w-60 bg-slate-900 text-slate-350 p-5 flex flex-col gap-1 shrink-0 border-r border-slate-800 h-full">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 px-2">Setup Sections</div>
                    {configTabs.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all ${
                          tab === t.id
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-850/50"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Form Content */}
                  <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-24">
                      
                      {tab === "basic" && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">
                            {isDharamshala ? "🏨 Create New Dharamshala" : `🛕 Create New ${label}`}
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">{field(isDharamshala ? "Dharamshala Name *" : "Name *", "name")}</div>
                            {field("Short Name", "shortName")}
                            {field("Established Date", "establishedDate", "date")}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Community</Label>
                              <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                value={form.sect || ""} onChange={(e) => setForm({ ...form, sect: e.target.value, subSect: e.target.value === "Digambar" ? "Bisapantha" : "Murtipujak" })}>
                                <option value="Shwetambar">Shwetambar</option>
                                <option value="Digambar">Digambar</option>
                              </select>
                            </div>
                            <div>
                              <Label className="text-xs">Sub-Sect / Tradition</Label>
                              <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                value={form.subSect || ""} onChange={(e) => setForm({ ...form, subSect: e.target.value })}>
                                {form.sect === "Digambar" ? (
                                  DIGAMBAR_SUB.map(s => <option key={s} value={s}>{s}</option>)
                                ) : (
                                  SHWETAMBAR_SUB.map(s => <option key={s} value={s}>{s}</option>)
                                )}
                              </select>
                            </div>
                          </div>

                          {form.sect === "Shwetambar" && form.subSect === "Murtipujak" && (
                            <div>
                              <Label className="text-xs">Gaccha</Label>
                              <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                                value={form.gacchaName || ""} onChange={(e) => setForm({ ...form, gacchaName: e.target.value })}>
                                <option value="">Select Gaccha...</option>
                                {MURTIPUJAK_GACCHAS.map(g => <option key={g} value={g}>{g}</option>)}
                              </select>
                            </div>
                          )}

                          {!isDharamshala && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs">Mul Nayak Bhagwan</Label>
                                  {isSuperAdmin && (
                                    <button type="button" onClick={() => setCreateDeityOpen(true)}
                                      className="text-[10px] text-purple-700 hover:text-purple-900 font-bold transition-all">
                                      + Create Deity
                                    </button>
                                  )}
                                </div>
                                <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                                  value={form.mulNayakBhagwanId || ""} onChange={(e) => setForm({ ...form, mulNayakBhagwanId: e.target.value })}>
                                  <option value="">Select Bhagwan...</option>
                                  {bhagwans.filter(b => b.category === "24 Tirthankars").length > 0 && (
                                    <optgroup label="24 Tirthankars">
                                      {bhagwans.filter(b => b.category === "24 Tirthankars").map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                      ))}
                                    </optgroup>
                                  )}
                                  {bhagwans.filter(b => b.category !== "24 Tirthankars").length > 0 && (
                                    <optgroup label="Others">
                                      {bhagwans.filter(b => b.category !== "24 Tirthankars").map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                      ))}
                                    </optgroup>
                                  )}
                                </select>
                              {field("Murti Count", "muritCount", "number")}
                            </div>
                          )}

                          {!isDharamshala && (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Temple / JC Type</Label>
                                <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                                  value={form.templeType || ""} onChange={(e) => setForm({ ...form, templeType: e.target.value })}>
                                  {TEMPLE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                                </select>
                              </div>
                              <div>
                                <Label className="text-xs">Tithi Calendar Type</Label>
                                <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                                  value={form.tithiCalendar || ""} onChange={(e) => setForm({ ...form, tithiCalendar: e.target.value })}>
                                  {["Gujarati", "Hindi", "Kutchi", "Marathi", "Marwari", "Other"].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            {field("Trust Name", "trustName")}
                            {field("Trust Registration Number", "trustRegistrationNumber")}
                          </div>

                          <div>
                            <Label className="text-xs">History / Background Details</Label>
                            <textarea rows={2} className="w-full mt-1 rounded-md border border-slate-205 bg-white px-3 py-2 text-sm focus:outline-none"
                              value={form.history || ""} onChange={(e) => setForm({ ...form, history: e.target.value })} placeholder="Historical background..." />
                          </div>
                        </div>
                      )}

                      {isDharamshala && tab === "temple" && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">🛕 Temple Inside Dharamshala Premises</h3>
                          {toggle("Temple Available Inside?", "hasTempleInside")}
                          {form.hasTempleInside && (
                            <div className="space-y-3 pl-6 border-l-2 border-l-orange-500">
                              {field("Mul Nayak Bhagwan Name", "templeMulNayakName")}
                              {field("Mul Nayak Image URL", "templeMulNayakImageUrl", "text", "https://...")}
                              <div>
                                <Label className="text-xs">Temple Type</Label>
                                <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                  value={form.templeType || "Griha Chaityalaya"} onChange={(e) => setForm({ ...form, templeType: e.target.value })}>
                                  <option value="Shikhar-baddha">Shikhar-baddha</option>
                                  <option value="Griha Chaityalaya">Griha Chaityalaya</option>
                                </select>
                              </div>
                              <div>
                                <Label className="text-xs">Select Tithi Calendar</Label>
                                <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                  value={form.templeTithiCalendar || "Gujarati"} onChange={(e) => setForm({ ...form, templeTithiCalendar: e.target.value })}>
                                  <option value="Gujarati">Gujarati</option>
                                  <option value="Hindi">Hindi</option>
                                  <option value="Marwari">Marwari</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              {field("Temple Opening Days & Hours", "templeOpeningHours", "text", "Daily 06:00 AM - 08:30 PM")}
                              <div className="grid grid-cols-3 gap-3">
                                {field("Pakshal Timings", "templePakshalStart", "text", "06:30 AM")}
                                {field("Morning Pooja Timings", "templePoojaStart", "text", "07:30 AM")}
                                {field("Evening Pooja / Aarti Timings", "templeAartiEvening", "text", "07:15 PM")}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {tab === "location" && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">📍 Address & Contact Details</h3>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">{field("Full Address", "addressLine")}</div>
                            {isDharamshala && field("Nearest Landmark", "landmark")}
                            {isDharamshala && field("Nearest Railway Station / Bus Stop", "railwayStation")}
                            {isDharamshala && field("District", "district")}
                            {field("City", "city")}
                            {field("State", "state")}
                            {field("Country", "country")}
                            {field("Pin Code", "pincode")}
                            <div className="col-span-2">{field("Google Maps Link", "googleMapsLink")}</div>
                            <div className="col-span-2">{field("General Contact Number", "phone", "tel")}</div>
                          </div>
                        </div>
                      )}

                      {isDharamshala && tab === "accommodations" && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">🏢 Accommodations & Building Management</h3>
                          
                          {/* Building List */}
                          <div className="space-y-4">
                            <div className="flex justify-between items-center bg-slate-105 p-3 rounded-xl border">
                              <span className="text-xs font-bold text-slate-700">🏢 Buildings: {form.buildings?.length || 0}</span>
                              <Button type="button" size="sm" onClick={addBuilding} className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-7 text-xs">
                                + Add Building
                              </Button>
                            </div>

                            {(form.buildings || []).map((b, bIdx) => (
                              <div key={b.id || bIdx} className="border p-4 rounded-xl bg-white space-y-3 relative shadow-sm">
                                <button type="button" onClick={() => removeBuilding(b.id)} className="absolute top-3 right-3 text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                                
                                <div className="grid grid-cols-2 gap-3 pr-8">
                                  <div>
                                    <Label className="text-xs font-bold">Building Name / Identifier</Label>
                                    <Input value={b.name} onChange={(e) => updateBuildingName(b.id, e.target.value)} className="mt-1 h-9" placeholder="e.g. Building A" />
                                  </div>
                                  <div>
                                    <Label className="text-xs font-bold">Building Image URL (Optional)</Label>
                                    <Input value={b.imageUrl} onChange={(e) => {
                                      setForm(prev => ({
                                        ...prev,
                                        buildings: prev.buildings.map(x => x.id === b.id ? { ...x, imageUrl: e.target.value } : x)
                                      }));
                                    }} className="mt-1 h-9" placeholder="https://..." />
                                  </div>
                                </div>

                                {/* Room Types in this Building */}
                                <div className="mt-3 space-y-2">
                                  <div className="flex justify-between items-center border-t pt-2">
                                    <span className="text-xs font-bold text-slate-600">🛏 Room Types inside {b.name}</span>
                                    <Button type="button" size="sm" variant="outline" onClick={() => addRoomType(b.id)} className="h-6 text-[10px] font-bold">
                                      + Add Room Type
                                    </Button>
                                  </div>

                                  {(b.roomTypes || []).map((r, rIdx) => (
                                    <div key={r.id || rIdx} className="bg-slate-50 border p-3 rounded-lg space-y-2.5 relative">
                                      <button type="button" onClick={() => removeRoomType(b.id, r.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                                        <X className="h-3.5 w-3.5" />
                                      </button>

                                      <div className="grid grid-cols-3 gap-2">
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">Room Type Name</Label>
                                          <Input value={r.name} onChange={(e) => updateRoomType(b.id, r.id, "name", e.target.value)} className="h-8 text-xs mt-0.5 bg-white" placeholder="e.g. AC Deluxe Room" />
                                        </div>
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">Category</Label>
                                          <select className="w-full mt-0.5 h-8 rounded border bg-white px-2 text-xs focus:outline-none"
                                            value={r.category} onChange={(e) => updateRoomType(b.id, r.id, "category", e.target.value)}>
                                            <option value="AC">AC Room</option>
                                            <option value="Non-AC">Non-AC Room</option>
                                          </select>
                                        </div>
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">Category Type</Label>
                                          <select className="w-full mt-0.5 h-8 rounded border bg-white px-2 text-xs focus:outline-none"
                                            value={r.type} onChange={(e) => updateRoomType(b.id, r.id, "type", e.target.value)}>
                                            <option value="Private">Private</option>
                                            <option value="Dormitory">Dormitory</option>
                                          </select>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-4 gap-2">
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">No. of Rooms</Label>
                                          <Input type="number" value={r.roomCount} onChange={(e) => updateRoomType(b.id, r.id, "roomCount", e.target.value)} className="h-8 text-xs mt-0.5 bg-white" />
                                        </div>
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">Bed Capacity</Label>
                                          <Input type="number" value={r.bedCapacity} onChange={(e) => updateRoomType(b.id, r.id, "bedCapacity", e.target.value)} className="h-8 text-xs mt-0.5 bg-white" />
                                        </div>
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">Charges</Label>
                                          <Input type="number" value={r.charges} onChange={(e) => updateRoomType(b.id, r.id, "charges", e.target.value)} className="h-8 text-xs mt-0.5 bg-white" />
                                        </div>
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">Charge Basis</Label>
                                          <select className="w-full mt-0.5 h-8 rounded border bg-white px-2 text-xs focus:outline-none"
                                            value={r.chargesType} onChange={(e) => updateRoomType(b.id, r.id, "chargesType", e.target.value)}>
                                            <option value="Per Room">Per Room</option>
                                            <option value="Per Bed">Per Bed</option>
                                          </select>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-3 gap-2">
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">Security Deposit</Label>
                                          <Input type="number" value={r.deposit} onChange={(e) => updateRoomType(b.id, r.id, "deposit", e.target.value)} className="h-8 text-xs mt-0.5 bg-white" />
                                        </div>
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">Attached Bathroom?</Label>
                                          <select className="w-full mt-0.5 h-8 rounded border bg-white px-2 text-xs focus:outline-none"
                                            value={r.attachedBathroom} onChange={(e) => updateRoomType(b.id, r.id, "attachedBathroom", e.target.value)}>
                                            <option value="Yes">Yes</option>
                                            <option value="No">No</option>
                                          </select>
                                        </div>
                                        <div>
                                          <Label className="text-[10px] font-bold text-slate-500">Amenities (comma-separated)</Label>
                                          <Input value={r.amenities?.join(", ") || ""} onChange={(e) => updateRoomType(b.id, r.id, "amenities", e.target.value.split(",").map(x => x.trim()))} className="h-8 text-xs mt-0.5 bg-white" placeholder="Fan, Geyser, Cupboard" />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Stay details */}
                          <div className="border p-4 rounded-xl bg-white space-y-3">
                            <h4 className="text-xs font-bold text-slate-700 border-b pb-1">⏱ Stay & Booking Configuration</h4>
                            <div className="grid grid-cols-2 gap-3">
                              {field("Check-in Time", "checkInTime", "text", "12:00 PM")}
                              {field("Check-out Time", "checkOutTime", "text", "11:00 AM")}
                            </div>
                            <div className="flex gap-4 mt-2">
                              {toggle("Advance Booking Required?", "advanceBookingRequired")}
                              {toggle("Online Booking Available?", "onlineBookingAvailable")}
                            </div>
                          </div>

                          {/* Feature Status */}
                          <div className="border p-4 rounded-xl bg-white space-y-3">
                            <h4 className="text-xs font-bold text-slate-700 border-b pb-1">📊 Availability & Block Control</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Live Availability Status</Label>
                                <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                                  value={form.dharamshalaStatus || "High Availability"} onChange={(e) => setForm({ ...form, dharamshalaStatus: e.target.value })}>
                                  <option value="High Availability">High Availability</option>
                                  <option value="Limited">Limited Availability</option>
                                  <option value="Full">Full (Sold Out)</option>
                                </select>
                              </div>
                              {field("Admin Hold / Block Rooms Count", "adminBlockedRooms", "number", "0")}
                            </div>
                          </div>

                        </div>
                      )}

                      {tab === "facilities" && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">🏢 Facilities & Units</h3>
                          
                          {/* General Amenities */}
                          <div>
                            <Label className="text-xs block mb-2 font-semibold">Select Additional Facilities Available</Label>
                            <div className="flex flex-wrap gap-2">
                              {FACILITY_OPTIONS.map((f) => (
                                <button key={f} type="button" onClick={() => toggleFacility(f)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                    form.facilities?.includes(f)
                                      ? "bg-orange-500 text-white border-orange-500"
                                      : "bg-white text-slate-700 border-slate-200 hover:border-orange-400"
                                  }`}>
                                  {f}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Upashray Unit */}
                          <div className="border p-4 rounded-xl bg-white space-y-3">
                            {toggle("Upashray Available", "hasUpashray")}
                            {form.hasUpashray && (
                              <div className="grid grid-cols-2 gap-3 pl-6 border-l-2 border-l-orange-500">
                                <div>
                                  <Label className="text-xs">Upashray Location</Label>
                                  <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                    value={form.upashrayLocation || "Within Property"} onChange={(e) => setForm({ ...form, upashrayLocation: e.target.value })}>
                                    <option value="Within Property">Within Property</option>
                                    <option value="Nearby Location">Nearby Location</option>
                                  </select>
                                </div>
                              </div>
                            )}
                          </div>

                          {!isDharamshala && (
                            /* Event Hall Unit */
                            <div className="border p-4 rounded-xl bg-white space-y-3">
                              {toggle("Event Hall Available", "hasEventHall")}
                              {form.hasEventHall && (
                                <div className="grid grid-cols-2 gap-3 pl-6 border-l-2 border-l-orange-500">
                                  <div>
                                    <Label className="text-xs">Event Hall Purpose</Label>
                                    <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                      value={form.eventHallPurpose || "Available for Booking"} onChange={(e) => setForm({ ...form, eventHallPurpose: e.target.value })}>
                                      <option value="Available for Booking">Available for Booking</option>
                                      <option value="Temple Use Only">Temple Use Only</option>
                                    </select>
                                  </div>
                                  {form.eventHallPurpose === "Available for Booking" && (
                                    field("Event Hall Booking Link", "eventHallBookingLink", "url", "https://...")
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {!isDharamshala && (
                            /* Bhojanshala (Food) Unit */
                            <div className="border p-4 rounded-xl bg-white space-y-3">
                              {toggle("Bhojanshala (Food) Available", "hasBhojanshala")}
                              {form.hasBhojanshala && (
                                <div className="space-y-3 pl-6 border-l-2 border-l-orange-500">
                                  <div className="grid grid-cols-3 gap-3">
                                    {field("Breakfast Timing", "bhojanshalaBreakfast", "text", "07:00 AM - 08:30 AM")}
                                    {field("Lunch Timing", "bhojanshalaLunch", "text", "11:30 AM - 01:00 PM")}
                                    {field("Dinner Timing", "bhojanshalaDinner", "text", "05:00 PM - 06:00 PM")}
                                  </div>
                                  <div className="grid grid-cols-3 gap-3">
                                    <div>
                                      <Label className="text-xs">Meal Type</Label>
                                      <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                        value={form.bhojanshalaMealType || "Free"} onChange={(e) => setForm({ ...form, bhojanshalaMealType: e.target.value })}>
                                        <option value="Free">Free (Gochari / Sadharmik)</option>
                                        <option value="Paid">Paid (Token System)</option>
                                      </select>
                                    </div>
                                    <div>
                                      <Label className="text-xs">Availability</Label>
                                      <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                        value={form.bhojanshalaAvailability || "Daily"} onChange={(e) => setForm({ ...form, bhojanshalaAvailability: e.target.value })}>
                                        <option value="Daily">Daily</option>
                                        <option value="Available on Request">Available on Request</option>
                                      </select>
                                    </div>
                                    {field("Contact Person", "bhojanshalaContact", "text", "Manager Name")}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {!isDharamshala && (
                            /* Dharamshala Unit */
                            <div className="border p-4 rounded-xl bg-white space-y-3">
                              {toggle("Dharamshala Available", "hasDharamshala")}
                              {form.hasDharamshala && (
                                <div className="space-y-3 pl-6 border-l-2 border-l-orange-500">
                                  <div className="grid grid-cols-3 gap-3">
                                    <div>
                                      <Label className="text-xs">Room Configuration</Label>
                                      <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                        value={form.dharamshalaRooms || "Both"} onChange={(e) => setForm({ ...form, dharamshalaRooms: e.target.value })}>
                                        <option value="AC">AC Rooms only</option>
                                        <option value="Non-AC">Non-AC Rooms only</option>
                                        <option value="Both">Both AC and Non-AC</option>
                                      </select>
                                    </div>
                                    {field("Office Timings", "dharamshalaOffice", "text", "09:00 AM - 08:00 PM")}
                                    {field("Contact Phone", "dharamshalaPhone", "tel", "+91...")}
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    {field("Contact Person / Manager", "dharamshalaContact", "text", "Manager Name")}
                                    <div>
                                      <Label className="text-xs">Online Booking Available?</Label>
                                      <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                                        value={form.dharamshalaOnline || "No"} onChange={(e) => setForm({ ...form, dharamshalaOnline: e.target.value })}>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {!isDharamshala && (
                            /* Pathshala Unit */
                            <div className="border p-4 rounded-xl bg-white space-y-3">
                              {toggle("Pathshala Available", "hasPathshala")}
                              {form.hasPathshala && (
                                <div className="grid grid-cols-3 gap-3 pl-6 border-l-2 border-l-orange-500">
                                  {field("Pathshala Timings", "pathshalaTimings", "text", "04:30 PM - 06:00 PM")}
                                  {field("Pathshala Days", "pathshalaDays", "text", "Sat, Sun")}
                                  {field("Teacher Name", "pathshalaTeacher", "text", "Shastriji / Teacher")}
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      )}

                      {isDharamshala && tab === "food" && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">🥗 Bhojanalay / Food Facility</h3>
                          {toggle("Bhojanalay Available Inside?", "hasBhojanshala")}
                          {form.hasBhojanshala && (
                            <div className="space-y-3 pl-6 border-l-2 border-l-orange-500">
                              <div className="grid grid-cols-2 gap-3">
                                {field("Breakfast Charges & Timings", "bhojanshalaBreakfast", "text", "Rs. 50 | 07:30 AM - 09:00 AM")}
                                {field("Lunch Charges & Timings", "bhojanshalaLunch", "text", "Rs. 100 | 11:30 AM - 01:00 PM")}
                                {field("Dinner Charges & Timings", "bhojanshalaDinner", "text", "Rs. 80 | 05:00 PM - 06:00 PM")}
                                {field("Contact Person / Manager", "bhojanshalaContact", "text", "Caretaker Name")}
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs">Availability</Label>
                                  <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                                    value={form.bhojanshalaAvailability || "Daily"} onChange={(e) => setForm({ ...form, bhojanshalaAvailability: e.target.value })}>
                                    <option value="Daily">Available Daily</option>
                                    <option value="Available on Request">Available on Request</option>
                                  </select>
                                </div>
                              </div>
                              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 mt-2 text-xs text-orange-850 font-semibold italic">
                                📢 Auto-Message Warning Rule: "Please call and confirm one day prior."
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {isDharamshala && tab === "contacts" && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">👥 Contacts & Verification</h3>
                          <div className="space-y-3">
                            <MemberSelect label="Primary Contact Person (Jain / Non-Jain)" value={form.primaryContactMemberId} onChange={(val) => setForm({ ...form, primaryContactMemberId: val })} placeholder="Link primary member..." />
                            {field("Secondary Contact Number", "secondaryContactNumber", "tel", "+91...")}
                            
                            <div className="border-t pt-3 space-y-2">
                              <Label className="text-xs block font-semibold mb-1">Contact Details Verification Flags</Label>
                              <div className="flex flex-wrap gap-4 bg-white p-3 rounded-xl border">
                                {toggle("Primary Mobile Number OTP Verified (Mandatory)", "contactMobileVerified")}
                                {toggle("WhatsApp Number OTP Verified (Optional)", "contactWhatsAppVerified")}
                                {toggle("Email ID OTP Verified (Optional)", "contactEmailVerified")}
                              </div>
                            </div>

                            <div>
                              <Label className="text-xs">Primary Contact Preference</Label>
                              <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                                value={form.primaryContactPreference || "Mobile"} onChange={(e) => setForm({ ...form, primaryContactPreference: e.target.value })}>
                                <option value="Mobile">Mobile</option>
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="Email">Email</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {isDharamshala && tab === "trustees" && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b pb-1.5">
                            <h3 className="text-sm font-bold text-slate-800">👥 Trustees & Committee Members (Max 20)</h3>
                            <Button type="button" size="sm" onClick={addTrusteeRow} className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-7 text-xs" disabled={(form.trusteesList || []).length >= 20}>
                              + Link Trustee
                            </Button>
                          </div>
                          
                          <div className="space-y-3">
                            {(form.trusteesList || []).map((t, idx) => (
                              <div key={t.id || idx} className="flex items-end gap-3 bg-white p-3 rounded-xl border relative">
                                <button type="button" onClick={() => removeTrusteeRow(t.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                                  <X className="h-4 w-4" />
                                </button>
                                <div className="flex-1">
                                  <MemberSelect label={`Trustee #${idx+1} Member`} value={t.memberId} onChange={(val) => updateTrusteeRow(t.id, "memberId", val)} placeholder="Link trustee member..." />
                                </div>
                                <div className="w-48">
                                  {field("Designation", "designation", "text", "e.g. Trustee / President")}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {isDharamshala && tab === "volunteers" && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b pb-1.5">
                            <h3 className="text-sm font-bold text-slate-800">🤝 Volunteer Members</h3>
                            <Button type="button" size="sm" onClick={addVolunteerRow} className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-7 text-xs">
                              + Link Volunteer
                            </Button>
                          </div>
                          
                          <div className="space-y-3">
                            {(form.volunteersList || []).map((v, idx) => (
                              <div key={v.id || idx} className="flex items-end gap-3 bg-white p-3 rounded-xl border relative">
                                <button type="button" onClick={() => removeVolunteerRow(v.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                                  <X className="h-4 w-4" />
                                </button>
                                <div className="flex-1">
                                  <MemberSelect label={`Volunteer #${idx+1} Member`} value={v.memberId} onChange={(val) => updateVolunteerRow(v.id, val)} placeholder="Link volunteer member..." />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {isDharamshala && tab === "rules" && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">📜 Guidelines & Safety Controls</h3>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs font-bold">Rules & Guidelines Section</Label>
                              <textarea rows={4} className="w-full mt-1 rounded-md border border-slate-205 bg-white px-3 py-2 text-sm focus:outline-none"
                                value={form.rulesText} onChange={(e) => setForm({ ...form, rulesText: e.target.value })}
                                placeholder="Define Dharamshala rules, ID requirements, stay limits, cleanliness instructions, and discipline guidelines..." />
                            </div>
                            <div className="grid grid-cols-2 gap-3 border-t pt-3">
                              {field("Emergency Contact Number", "emergencyContact", "tel")}
                              {field("Caretaker / Manager Details", "caretakerDetails", "text", "Name & Designation")}
                            </div>
                          </div>
                        </div>
                      )}

                      {isDharamshala && tab === "bank" && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">💰 Bank & Donation Details</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {field("Account Number", "bankAccount")}
                            {field("Bank Name", "bankName")}
                            {field("Branch Name", "bankBranch")}
                            {field("IFSC Code", "bankIfsc")}
                            {field("UPI ID", "upiId", "text", "name@upi")}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {field("Donation QR Code Image URL", "donationQrCodeUrl", "text", "https://...")}
                            <div>
                              <Label className="text-xs">Preferred display Currency</Label>
                              <Input className="mt-1 bg-white h-9" value={form.preferredCurrency || "INR (₹)"}
                                onChange={(e) => setForm({ ...form, preferredCurrency: e.target.value })} />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4 mt-2 bg-white p-3.5 border rounded-xl">
                            {toggle("Eligible for 80G Tax Deductions", "is80gEligible")}
                            {toggle("Eligible for CSR Charity Funding", "csrEligible")}
                          </div>
                        </div>
                      )}

                      {isDharamshala && tab === "links" && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">🔗 Social Media & UX Links</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {field("Instagram Link", "instaLink", "url", "https://instagram.com/...")}
                            {field("Facebook Link", "facebookLink", "url", "https://facebook.com/...")}
                            {field("YouTube Link", "youtubeLink", "url", "https://youtube.com/...")}
                            {field("Website Link", "website", "url", "https://...")}
                          </div>
                          <div className="border-t pt-3">
                            <Label className="text-xs font-bold block mb-1">Live Availability Indicator Option</Label>
                            {toggle("Activate Live Bookings Dashboard?", "onlineBookingAvailable")}
                          </div>
                        </div>
                      )}

                      {!isDharamshala && tab === "timings" && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">🕒 Slot & Ritual Timings</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {field("Morning Timing Start", "morningStart", "text", "06:00 AM")}
                            {field("Morning Timing End", "morningEnd", "text", "12:00 PM")}
                            {field("Evening Timing Start", "eveningStart", "text", "05:30 PM")}
                            {field("Evening Timing End", "eveningEnd", "text", "09:00 PM")}
                          </div>
                          <div className="grid grid-cols-2 gap-3 border-t pt-3">
                            {field("Pakshal Timing Start", "pakshalStart", "text", "06:30 AM")}
                            {field("Pakshal Timing End", "pakshalEnd", "text", "08:00 AM")}
                            {field("Morning Pooja Start", "poojaStart", "text", "07:00 AM")}
                            {field("Morning Pooja End", "poojaEnd", "text", "08:30 AM")}
                          </div>
                          <div className="grid grid-cols-2 gap-3 border-t pt-3">
                            {field("Morning Aarti Start", "aartiMorning", "text", "08:30 AM")}
                            {field("Evening Aarti Start", "aartiEvening", "text", "07:30 PM")}
                          </div>
                        </div>
                      )}

                      {!isDharamshala && tab === "finance" && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">💰 Bank & Donation Details</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {field("UPI ID", "upiId", "text", "name@upi")}
                            {field("Preferred display Currency", "preferredCurrency")}
                            {field("Bank Account Number", "bankAccount")}
                            {field("Bank IFSC Code", "bankIfsc")}
                          </div>
                          <div className="flex flex-wrap gap-4 mt-2 bg-white p-3.5 border rounded-xl">
                            {toggle("Eligible for 80G Tax Deductions", "is80gEligible")}
                            {toggle("Eligible for CSR Charity Funding", "csrEligible")}
                          </div>
                        </div>
                      )}

                    </div>

                    <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-2 shrink-0">
                      <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                      <Button onClick={create} disabled={creating || !form.name} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">
                        {creating ? "Creating..." : "Create"}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${pluralLabel.toLowerCase()}…`}
            className="pl-9 bg-white"
            data-testid={`${testId}-search`}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        loading={loading}
        testId={`${testId}-table`}
        onRowClick={(r) => navigate(`/${entity}s/${r.id || r.publicId}`)}
        emptyTitle={`No ${pluralLabel.toLowerCase()} yet`}
        emptyDescription={
          canDo(moduleKey, "CREATE") || isSuperAdmin
            ? `Add your first ${label.toLowerCase()} to begin managing it.`
            : "No records available."
        }
      />
      {/* Inline Deity Creation Dialog */}
      <Dialog open={createDeityOpen} onOpenChange={setCreateDeityOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateDeitySubmit}>
            <DialogHeader>
              <DialogTitle className="text-slate-800 flex items-center gap-2">
                🪷 Create Deity (Bhagwan / Deva)
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 text-xs">
              <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400">Deity Name *</Label>
                <Input value={deityName} onChange={(e) => setDeityName(e.target.value)} placeholder="e.g. Shri Nakoda Parshvanath" className="mt-1 h-9 bg-white" required />
              </div>
              <div>
                <SearchableSelect
                  value={deityCategory}
                  onValueChange={setDeityCategory}
                  options={[
                    { value: "24 Tirthankars", label: "24 Tirthankars" },
                    { value: "Others", label: "Others" },
                  ]}
                  placeholder="Select Category"
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setCreateDeityOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={deitySaving} className="bg-purple-700 hover:bg-purple-800 text-white font-bold">
                {deitySaving ? "Creating..." : "Create Deity"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
