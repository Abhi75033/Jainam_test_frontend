import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, extractErrorMessage, API_BASE } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  CalendarDays, MapPin, Users, Heart, Share2, AlertTriangle, ArrowLeft,
  BookOpen, Star, Compass, Phone, FileText, CheckCircle2, ShieldAlert,
  Sparkles, Award, User, HelpCircle, EyeOff, Check, X, Pencil, Camera,
  Video, Music, Globe, HelpCircle as HelpIcon, ArrowRight, Info, Loader2, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { toOptions } from "@/constants/dropdownOptions";
import { useAuth } from "@/contexts/AuthContext";

// Constant arrays for community subsects and gacchas
const DIGAMBAR_SUB = [
  "Bisapantha",
  "Terapanthi",
  "Taranapantha or Samaiyapantha",
  "Gumanapantha",
  "Totapanthi",
  "Kanjipanthi",
  "Other Digambar Traditions"
];

const SHWETAMBAR_SUB = [
  "Murtipujak (Deravasi/Mandirmargi)",
  "Sthanakvasi",
  "Terapanth"
];

const MURTIPUJAK_GACCHAS = [
  "Upkeśa Gaccha",
  "Achal Gaccha",
  "Jiravala Gaccha",
  "Kharatara Gaccha",
  "Lonka (Richmati) Gaccha",
  "Tapa Gaccha",
  "Gangeshvara Gaccha",
  "Korantavala Gaccha",
  "Anandapura Gaccha",
  "Bharavali Gaccha",
  "Udhaviya Gaccha",
  "Gudava Gaccha"
];

// Reuse MemberSelect and MonkSelect helpers
const MemberSelect = ({ label, value, onChange, placeholder = "Select Member..." }) => {
  const [members, setMembers] = useState([]);
  useEffect(() => {
    api.get("/members", { params: { pageSize: 500 } })
      .then((r) => setMembers(r.data?.data?.items || r.data?.data || []))
      .catch(() => {});
  }, []);

  return (
    <div>
      <Label className="text-xs font-semibold text-slate-600">{label}</Label>
      <SearchableSelect
        value={value || ""}
        onValueChange={onChange}
        options={members.map(m => ({
          value: m.id,
          label: `${m.fullName} (${m.publicId || "No ID"})`
        }))}
        placeholder={placeholder}
        searchPlaceholder="Search members…"
        className="mt-1"
      />
    </div>
  );
};

const MonkSelect = ({ label, value, onChange, placeholder = "Select Sadhuji / Sadhviji..." }) => {
  const [monks, setMonks] = useState([]);
  useEffect(() => {
    api.get("/monks")
      .then((r) => setMonks(r.data?.data || []))
      .catch(() => {});
  }, []);

  return (
    <div>
      <Label className="text-xs font-semibold text-slate-600">{label}</Label>
      <SearchableSelect
        value={value || ""}
        onValueChange={onChange}
        options={monks.map(m => ({
          value: m.id,
          label: `${m.dikshaName} (${m.publicId || "No ID"})`
        }))}
        placeholder={placeholder}
        searchPlaceholder="Search MS by name/ID…"
      />
    </div>
  );
};

// Lotus bead initials generator
function ini(name = "") {
  return (name || "").trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "MS";
}

/* ─────────────────────────────────────────────────────────────────────
 * Monk ID Card Visual Component
 * ───────────────────────────────────────────────────────────────────── */
function MonkIdCardVisual({ monk }) {
  const isSadhvi = monk?.gender === "SADHVI";
  const accent = isSadhvi ? "#9B2D7F" : "#4A1D6B";
  const light = isSadhvi ? "#F5E6FF" : "#EDE0FF";

  return (
    <div className="flex flex-col items-center select-none bg-slate-900 p-6 rounded-2xl border border-slate-800">
      <div className="flex gap-1 mb-1" aria-hidden>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-2 w-2 rounded-full animate-pulse"
            style={{ background: i === 4 ? "#FFD700" : i % 2 === 0 ? accent : light }} />
        ))}
      </div>
      <div className="w-0.5 h-6 bg-gradient-to-b" style={{ background: `linear-gradient(${accent},${light})` }} />

      <div className="relative w-64 rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-100">
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-700 via-pink-600 to-purple-800" />
        
        <div className="px-4 pt-3 pb-4 relative overflow-hidden text-white"
          style={{ background: `linear-gradient(145deg, ${accent} 0%, #7B3FA0 100%)` }}>
          <div className="absolute inset-0 flex items-center justify-center opacity-10 text-white text-7xl font-serif">
            ॐ
          </div>
          <div className="relative flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black tracking-widest text-white/90">JiNANAM</span>
            </div>
            <Badge className="bg-white/20 text-white border-0 text-[8px]">{monk?.status || "ACTIVE"}</Badge>
          </div>

          <div className="relative flex justify-center">
            <div className="h-20 w-20 rounded-full overflow-hidden border-4 border-white/30 shadow-lg bg-purple-900">
              {monk?.photoUrl ? (
                <img src={`${API_BASE}${monk.photoUrl}`} alt={monk.dikshaName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl font-black text-white">{ini(monk?.dikshaName)}</span>
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 text-yellow-300 text-xs">🪷</div>
          </div>

          <div className="text-center mt-3">
            <div className="font-bold text-white text-sm leading-tight line-clamp-1">{monk?.dikshaName || "—"}</div>
            <div className="text-[9px] text-white/80 mt-0.5 font-semibold">
              {monk?.gender === "SADHVI" ? "🌸 Sadhvi" : "🧘 Sadhu"} {monk?.gacchaName && `· ${monk.gacchaName}`}
            </div>
          </div>
        </div>

        <div className="px-4 pb-3 pt-3 space-y-1.5 bg-white text-slate-700">
          <div className="flex items-center gap-2 text-[10px]">
            <CalendarDays className="h-3.5 w-3.5 text-purple-600 shrink-0" />
            <span>Diksha: <strong>{monk?.dikshaDate ? new Date(monk.dikshaDate).toLocaleDateString() : "—"}</strong></span>
          </div>
          {monk?.dikshaPlace && (
            <div className="flex items-center gap-2 text-[10px]">
              <MapPin className="h-3.5 w-3.5 text-purple-600 shrink-0" />
              <span className="truncate">Place: <strong>{monk.dikshaPlace}</strong></span>
            </div>
          )}
          <div className="flex items-center gap-2 text-[10px]">
            <Compass className="h-3.5 w-3.5 text-purple-600 shrink-0" />
            <span>Sect: <strong>{monk?.sect || "Shwetambar"}</strong></span>
          </div>
        </div>

        <div className="px-4 py-1.5 flex items-center justify-between text-white" style={{ background: accent }}>
          <span className="text-[9px] text-white/80">FOLLOWERS: {monk?._count?.follows || 0}</span>
          <span className="text-[10px] font-black font-mono tracking-widest">{monk?.publicId}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * Main MonkDetailPage Component
 * ───────────────────────────────────────────────────────────────────── */
export default function MonkDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  
  const [monk, setMonk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [idCardOpen, setIdCardOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Report incorrect info state
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketSaving, setTicketSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({});
  const [editTab, setEditTab] = useState("basic");
  const [temples, setTemples] = useState([]);

  const loadMonk = () => {
    setLoading(true);
    api.get(`/monks/${id}`)
      .then((r) => {
        setMonk(r.data?.data);
        setFollowing(r.data?.data?.follows?.length > 0 || false);
      })
      .catch((e) => {
        toast.error("Failed to load Maharaj Saheb profile.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMonk();
    api.get("/temples").then((r) => setTemples(r.data?.data?.items || r.data?.data || [])).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleFollow = async () => {
    try {
      if (following) {
        await api.post(`/monks/${id}/unfollow`);
        toast.success("Unfollowed Maharaj Saheb.");
        setFollowing(false);
      } else {
        await api.post(`/monks/${id}/follow`);
        toast.success("Following Maharaj Saheb!");
        setFollowing(true);
      }
      loadMonk();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    }
  };

  const handleCreateSupportTicket = async () => {
    if (!ticketDescription) {
      toast.error("Please describe the incorrect information.");
      return;
    }
    setTicketSaving(true);
    try {
      await api.post("/support-tickets", {
        subject: `Incorrect Information Report for Monk ${monk?.dikshaName} (${monk?.publicId})`,
        description: ticketDescription,
        category: "MONK_PROFILE",
        priority: "MEDIUM",
      });
      toast.success("Support ticket created. Admin will review the corrections.");
      setReportOpen(false);
      setTicketDescription("");
    } catch (e) {
      toast.error("Failed to submit support ticket.");
    } finally {
      setTicketSaving(false);
    }
  };

  const openEditDialog = () => {
    if (!monk) return;
    setEditForm({
      dikshaName: monk.dikshaName || "",
      shortName: monk.shortName || "",
      gender: monk.gender || "SADHU",
      nameBeforeDiksha: monk.nameBeforeDiksha || "",
      bio: monk.bio || "",
      dob: monk.dob ? monk.dob.slice(0, 10) : "",
      dobPlace: monk.dobPlace || "",
      status: monk.status || "ACTIVE",
      nirvanaDate: monk.nirvanaDate ? monk.nirvanaDate.slice(0, 10) : "",
      nirvanaPlace: monk.nirvanaPlace || "",
      
      dikshaDate: monk.dikshaDate ? monk.dikshaDate.slice(0, 10) : "",
      dikshaPlace: monk.dikshaPlace || "",
      dikshaGuruId: monk.dikshaGuruId || "",
      sect: monk.sect || "Shwetambar",
      subSect: monk.subSect || "Murtipujak",
      gacchaName: monk.gacchaName || "",
      
      acharyaGuruId: monk.acharyaGuruId || "",
      currentSangh: monk.currentSangh || "",
      
      fatherMemberId: monk.preDikshaFather?.memberId || "",
      fatherNameText: monk.preDikshaFather?.name || "",
      motherMemberId: monk.preDikshaMother?.memberId || "",
      motherNameText: monk.preDikshaMother?.name || "",
      siblings: monk.siblings || [],
      preDikshaAddress: monk.preDikshaLocation?.address || "",
      preDikshaCity: monk.preDikshaLocation?.city || "",
      preDikshaState: monk.preDikshaLocation?.state || "",
      preDikshaCountry: monk.preDikshaLocation?.country || "India",
      preDikshaPincode: monk.preDikshaLocation?.pincode || "",
      
      timeline: monk.timeline || [],
      tapasya: monk.tapasya || [],
      
      currentLocation: monk.tracking?.currentLocation || "",
      currentTempleId: monk.currentTempleId || "",
      trackingStatus: monk.tracking?.trackingStatus || "Staying",
      vihaarHistory: monk.tracking?.vihaarHistory || [],
      
      chaturmasHistory: monk.chaturmasHistory || [],
      
      pravachanMorning: monk.routine?.pravachanTimings?.morning || "",
      pravachanAfternoon: monk.routine?.pravachanTimings?.afternoon || "",
      pravachanEvening: monk.routine?.pravachanTimings?.evening || "",
      darshanMorning: monk.routine?.darshanTimings?.morning || "",
      darshanAfternoon: monk.routine?.darshanTimings?.afternoon || "",
      darshanEvening: monk.routine?.darshanTimings?.evening || "",
      maryadaGuidelines: monk.routine?.maryada || "",
      specialInstructions: monk.routine?.specialInstructions || [],
      
      languagesSpoken: monk.languages || ["Hindi", "Gujarati"],
      
      healthStatus: monk.health?.status || "Stable",
      healthNotes: monk.health?.notes || "",
      isHealthSensitive: monk.health?.isSensitive || false,
      
      lifeStory: monk.media?.lifeStory || "",
      galleryImages: monk.media?.galleryImages || [],
      videoLinks: monk.media?.videoLinks || [],
      audioLinks: monk.media?.audioLinks || [],
      publications: monk.media?.publications || [],
      
      jainContacts: monk.sanghContacts?.jainContacts || [],
      nonJainContacts: monk.sanghContacts?.nonJainContacts || [],
      directCallingNumber: monk.sanghContacts?.directCallingNumber || "",
      directWhatsAppNumber: monk.sanghContacts?.directWhatsAppNumber || "",
      
      titlesHonors: monk.recognitions?.titlesHonors || [],
      knownFor: monk.recognitions?.knownFor || [],
      tags: monk.recognitions?.tags || [],
      awards: monk.recognitions?.awards || [],
      
      assignedAdminId: monk.assignedAdminId || "",
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        dikshaName: editForm.dikshaName,
        shortName: editForm.shortName || undefined,
        gender: editForm.gender,
        dob: editForm.dob ? new Date(editForm.dob).toISOString() : undefined,
        dobPlace: editForm.dobPlace || undefined,
        nameBeforeDiksha: editForm.nameBeforeDiksha || undefined,
        bio: editForm.bio || undefined,
        dikshaDate: editForm.dikshaDate ? new Date(editForm.dikshaDate).toISOString() : undefined,
        dikshaPlace: editForm.dikshaPlace || undefined,
        dikshaGuruId: editForm.dikshaGuruId || undefined,
        currentTempleId: editForm.currentTempleId || undefined,
        status: editForm.status,
        nirvanaDate: editForm.nirvanaDate ? new Date(editForm.nirvanaDate).toISOString() : undefined,
        nirvanaPlace: editForm.nirvanaPlace || undefined,
        assignedAdminId: editForm.assignedAdminId || undefined,

        preDikshaFather: { memberId: editForm.fatherMemberId || undefined, name: editForm.fatherNameText || undefined },
        preDikshaMother: { memberId: editForm.motherMemberId || undefined, name: editForm.motherNameText || undefined },
        siblings: editForm.siblings,
        preDikshaLocation: {
          address: editForm.preDikshaAddress,
          city: editForm.preDikshaCity,
          state: editForm.preDikshaState,
          country: editForm.preDikshaCountry,
          pincode: editForm.preDikshaPincode,
        },
        timeline: editForm.timeline,
        tapasya: editForm.tapasya,
        tracking: {
          currentLocation: editForm.currentLocation,
          trackingStatus: editForm.trackingStatus,
          vihaarHistory: editForm.vihaarHistory,
        },
        chaturmasHistory: editForm.chaturmasHistory,
        routine: {
          pravachanTimings: {
            morning: editForm.pravachanMorning,
            afternoon: editForm.pravachanAfternoon,
            evening: editForm.pravachanEvening,
          },
          darshanTimings: {
            morning: editForm.darshanMorning,
            afternoon: editForm.darshanAfternoon,
            evening: editForm.darshanEvening,
          },
          maryada: editForm.maryadaGuidelines,
          specialInstructions: editForm.specialInstructions,
        },
        languages: editForm.languagesSpoken,
        health: {
          status: editForm.healthStatus,
          notes: editForm.healthNotes,
          isSensitive: editForm.isHealthSensitive,
        },
        media: {
          lifeStory: editForm.lifeStory,
          galleryImages: editForm.galleryImages,
          videoLinks: editForm.videoLinks,
          audioLinks: editForm.audioLinks,
          publications: editForm.publications,
        },
        sanghContacts: {
          jainContacts: editForm.jainContacts,
          nonJainContacts: editForm.nonJainContacts,
          directCallingNumber: editForm.directCallingNumber,
          directWhatsAppNumber: editForm.directWhatsAppNumber,
        },
        recognitions: {
          titlesHonors: editForm.titlesHonors,
          knownFor: editForm.knownFor,
          tags: editForm.tags,
          awards: editForm.awards,
        },
        socialLinks: {
          website: editForm.website,
          facebook: editForm.facebook,
          instagram: editForm.instagram,
          youtube: editForm.youtube,
          twitter: editForm.twitter,
        },
      };

      await api.post(`/monks/${id}`, payload);
      toast.success("MS Profile updated successfully.");
      setEditOpen(false);
      loadMonk();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const eField = (lbl, key, type = "text", placeholder = "") => (
    <div>
      <Label className="text-xs font-semibold text-slate-600">{lbl}</Label>
      <Input
        type={type}
        className="mt-1 h-9 bg-white"
        placeholder={placeholder}
        value={editForm[key] || ""}
        onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
      />
    </div>
  );

  const eToggle = (lbl, key) => (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
        checked={!!editForm[key]}
        onChange={(e) => setEditForm({ ...editForm, [key]: e.target.checked })}
      />
      <span className="text-xs font-semibold text-slate-700">{lbl}</span>
    </label>
  );

  // Edit list mutations
  const eAddSibling = () => setEditForm(p => ({ ...p, siblings: [...(p.siblings || []), { name: "", relationship: "Brother", memberId: "" }] }));
  const eRemoveSibling = (idx) => setEditForm(p => ({ ...p, siblings: p.siblings.filter((_, i) => i !== idx) }));
  const eUpdateSibling = (idx, k, v) => setEditForm(p => ({ ...p, siblings: p.siblings.map((s, i) => i === idx ? { ...s, [k]: v } : s) }));

  const eAddTimeline = () => setEditForm(p => ({ ...p, timeline: [...(p.timeline || []), { eventName: "", date: "", place: "", description: "" }] }));
  const eRemoveTimeline = (idx) => setEditForm(p => ({ ...p, timeline: p.timeline.filter((_, i) => i !== idx) }));
  const eUpdateTimeline = (idx, k, v) => setEditForm(p => ({ ...p, timeline: p.timeline.map((e, i) => i === idx ? { ...e, [k]: v } : e) }));

  const eAddTapasya = () => setEditForm(p => ({ ...p, tapasya: [...(p.tapasya || []), { name: "Upvas", count: 1, date: "", place: "", description: "", status: "Completed" }] }));
  const eRemoveTapasya = (idx) => setEditForm(p => ({ ...p, tapasya: p.tapasya.filter((_, i) => i !== idx) }));
  const eUpdateTapasya = (idx, k, v) => setEditForm(p => ({ ...p, tapasya: p.tapasya.map((t, i) => i === idx ? { ...t, [k]: v } : t) }));

  const eAddVihaar = () => setEditForm(p => ({ ...p, vihaarHistory: [...(p.vihaarHistory || []), { from: "", to: "", startDate: "", endDate: "" }] }));
  const eRemoveVihaar = (idx) => setEditForm(p => ({ ...p, vihaarHistory: p.vihaarHistory.filter((_, i) => i !== idx) }));
  const eUpdateVihaar = (idx, k, v) => setEditForm(p => ({ ...p, vihaarHistory: p.vihaarHistory.map((h, i) => i === idx ? { ...h, [k]: v } : h) }));

  const eAddChaturmas = () => setEditForm(p => ({ ...p, chaturmasHistory: [...(p.chaturmasHistory || []), { year: new Date().getFullYear().toString(), startDate: "", endDate: "", status: "Completed", orgId: "", city: "", state: "" }] }));
  const eRemoveChaturmas = (idx) => setEditForm(p => ({ ...p, chaturmasHistory: p.chaturmasHistory.filter((_, i) => i !== idx) }));
  const eUpdateChaturmas = (idx, k, v) => setEditForm(p => ({ ...p, chaturmasHistory: p.chaturmasHistory.map((c, i) => i === idx ? { ...c, [k]: v } : c) }));

  const eAddJainContact = () => setEditForm(p => ({ ...p, jainContacts: [...(p.jainContacts || []), { memberId: "", designation: "Sangh Trustee" }] }));
  const eRemoveJainContact = (idx) => setEditForm(p => ({ ...p, jainContacts: p.jainContacts.filter((_, i) => i !== idx) }));
  const eUpdateJainContact = (idx, k, v) => setEditForm(p => ({ ...p, jainContacts: p.jainContacts.map((c, i) => i === idx ? { ...c, [k]: v } : c) }));

  const eAddNonJainContact = () => setEditForm(p => ({ ...p, nonJainContacts: [...(p.nonJainContacts || []), { memberId: "", designation: "Coordinator" }] }));
  const eRemoveNonJainContact = (idx) => setEditForm(p => ({ ...p, nonJainContacts: p.nonJainContacts.filter((_, i) => i !== idx) }));
  const eUpdateNonJainContact = (idx, k, v) => setEditForm(p => ({ ...p, nonJainContacts: p.nonJainContacts.map((c, i) => i === idx ? { ...c, [k]: v } : c) }));

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 text-purple-700 animate-spin" />
      </div>
    );
  }

  if (!monk) return null;

  return (
    <div className="pb-16 max-w-7xl mx-auto space-y-6">
      
      {/* Top action bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">
        <Button variant="ghost" onClick={() => navigate("/monks")} className="text-slate-600">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Maharaj Saheb List
        </Button>
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <Button onClick={openEditDialog} className="bg-purple-700 hover:bg-purple-800 text-white font-bold">
              <Pencil className="h-4 w-4 mr-2" /> Edit MS Profile
            </Button>
          )}
          <Button variant="outline" onClick={() => setIdCardOpen(true)} className="border-purple-200 text-purple-700 hover:bg-purple-50">
            🪷 View ID Card
          </Button>
        </div>
      </div>

      {/* Header Profile Banner Card */}
      <Card className="overflow-hidden border-purple-100 bg-white relative shadow-md rounded-2xl">
        <div className="h-40 w-full bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-900 relative">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-300 via-purple-900 to-indigo-950" />
        </div>
        
        <div className="px-6 pb-6 relative flex flex-col md:flex-row gap-6 items-start md:-mt-12">
          <div className="relative shrink-0">
            <Avatar className="h-32 w-32 rounded-full border-4 border-white shadow-xl bg-purple-950 overflow-hidden">
              {monk.photoUrl ? (
                <img src={`${API_BASE}${monk.photoUrl}`} alt={monk.dikshaName} className="object-cover w-full h-full" />
              ) : (
                <AvatarFallback className="text-3xl font-black text-white bg-purple-900">
                  {ini(monk.dikshaName)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="absolute bottom-1 right-1 bg-yellow-400 text-slate-900 h-6 w-6 rounded-full border-2 border-white flex items-center justify-center text-xs shadow">🪷</div>
          </div>

          <div className="flex-1 space-y-2 mt-2 md:mt-14">
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-2xl font-bold font-heading text-slate-800">{monk.dikshaName}</h1>
              {monk.verified && <Badge className="bg-emerald-500 text-white border-0"><Check className="h-3 w-3 mr-1" /> Verified Profile</Badge>}
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">{monk.gender === "SADHVI" ? "🌸 Sadhvi" : "🧘 Sadhu"}</Badge>
              <Badge className="bg-slate-100 text-slate-600 border-slate-200">{monk.status}</Badge>
            </div>

            <div className="text-sm font-semibold text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
              {monk.shortName && <span>🌟 Popular: {monk.shortName}</span>}
              <span>🔢 ID: <strong>{monk.publicId}</strong></span>
              <span>🪷 Sect: {monk.sect || "Shwetambar"}</span>
              {monk.gacchaName && <span>📍 Gaccha: {monk.gacchaName}</span>}
            </div>

            <div className="flex items-center gap-4 flex-wrap pt-2">
              <Button onClick={handleFollow} variant={following ? "outline" : "default"}
                className={following ? "border-purple-300 text-purple-700" : "bg-purple-700 hover:bg-purple-800 text-white font-bold"}>
                <Heart className={`h-4 w-4 mr-2 ${following ? "fill-purple-600 text-purple-600" : ""}`} />
                {following ? "Following" : "Follow MS"}
              </Button>
              <Button variant="ghost" onClick={() => setReportOpen(true)} className="text-amber-600 hover:text-amber-800">
                <AlertTriangle className="h-4 w-4 mr-2" /> Report Incorrect Information
              </Button>
            </div>
          </div>

          <div className="md:mt-14 shrink-0 flex gap-4 text-center text-xs bg-purple-50/60 p-4 border border-purple-100 rounded-2xl">
            <div>
              <div className="text-lg font-bold text-purple-950">{monk._count?.follows || 0}</div>
              <div className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Followers</div>
            </div>
            <div className="border-l border-purple-200 pl-4">
              <div className="text-lg font-bold text-purple-950">{monk.chaturmasHistory?.length || 0}</div>
              <div className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Chaturmas</div>
            </div>
            <div className="border-l border-purple-200 pl-4">
              <div className="text-lg font-bold text-purple-950">{monk.tapasya?.length || 0}</div>
              <div className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Tapasyas</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column info cards */}
        <div className="space-y-6">
          
          <Card className="p-6 rounded-2xl border-purple-100 shadow-sm bg-white space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2 flex items-center gap-2">🪷 Biography & Summary</h3>
            <p className="text-xs text-slate-600 italic leading-relaxed">
              "{monk.bio || "No summary biography defined yet."}"
            </p>
            {monk.recognitions?.titlesHonors?.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t">
                <span className="text-[10px] uppercase font-black text-slate-400">Honors & Titles</span>
                <div className="flex flex-wrap gap-1">
                  {monk.recognitions.titlesHonors.map((t) => (
                    <Badge key={t} className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold">{t}</Badge>
                  ))}
                </div>
              </div>
            )}
            {monk.recognitions?.tags?.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] uppercase font-black text-slate-400">Spiritual Tags</span>
                <div className="flex flex-wrap gap-1">
                  {monk.recognitions.tags.map((tag) => (
                    <Badge key={tag} className="bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-semibold">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 rounded-2xl border-purple-100 shadow-sm bg-white space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2 flex items-center gap-2">📍 Live Tracking</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Active status</span>
                <Badge className={
                  monk.tracking?.trackingStatus === "Moving"
                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                    : monk.tracking?.trackingStatus === "Chaturmas"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }>
                  {monk.tracking?.trackingStatus || "Staying"}
                </Badge>
              </div>
              
              <div>
                <span className="text-[10px] uppercase font-black text-slate-400">Current Location Description</span>
                <span className="text-xs font-bold text-slate-800 block mt-0.5">{monk.tracking?.currentLocation || "Not Configured"}</span>
              </div>

              {monk.currentTemple && (
                <div>
                  <span className="text-[10px] uppercase font-black text-slate-400">Staying Organization / Temple</span>
                  <span className="text-xs font-bold text-purple-700 block mt-0.5">{monk.currentTemple.name} ({monk.currentTemple.city})</span>
                </div>
              )}
            </div>
          </Card>

        </div>

        {/* Right column detailed tabs card */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-purple-100 bg-white shadow-sm overflow-hidden min-h-[500px]">
            <Tabs defaultValue="journey" className="w-full">
              <TabsList className="bg-slate-50 p-2 w-full justify-start overflow-x-auto h-auto rounded-none border-b flex gap-1">
                <TabsTrigger value="journey" className="text-xs font-bold px-4 py-2 rounded-lg data-[state=active]:bg-purple-700 data-[state=active]:text-white">🧘 Spiritual Journey</TabsTrigger>
                <TabsTrigger value="vihaar" className="text-xs font-bold px-4 py-2 rounded-lg data-[state=active]:bg-purple-700 data-[state=active]:text-white">🚶 Movement & Group</TabsTrigger>
                <TabsTrigger value="tapasya" className="text-xs font-bold px-4 py-2 rounded-lg data-[state=active]:bg-purple-700 data-[state=active]:text-white">🪷 Tapasya</TabsTrigger>
                <TabsTrigger value="family" className="text-xs font-bold px-4 py-2 rounded-lg data-[state=active]:bg-purple-700 data-[state=active]:text-white">🏠 Pre-Diksha Family</TabsTrigger>
                <TabsTrigger value="routine" className="text-xs font-bold px-4 py-2 rounded-lg data-[state=active]:bg-purple-700 data-[state=active]:text-white">🕒 Daily Routine</TabsTrigger>
                <TabsTrigger value="contacts" className="text-xs font-bold px-4 py-2 rounded-lg data-[state=active]:bg-purple-700 data-[state=active]:text-white">📞 Contacts & Links</TabsTrigger>
              </TabsList>

              {/* TABS CONTENT */}

              {/* 1. Journey Tab */}
              <TabsContent value="journey" className="p-6 space-y-6">
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">🧘 Diksha Details</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b pb-1.5"><span className="text-slate-500">Diksha Date:</span><strong className="text-slate-800">{monk.dikshaDate ? new Date(monk.dikshaDate).toLocaleDateString() : "—"}</strong></div>
                      <div className="flex justify-between border-b pb-1.5"><span className="text-slate-500">Diksha Place:</span><strong className="text-slate-800">{monk.dikshaPlace || "—"}</strong></div>
                      <div className="flex justify-between border-b pb-1.5"><span className="text-slate-500">Diksha Guru:</span><strong className="text-purple-700">{monk.dikshaGuru?.dikshaName || "—"}</strong></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">🪷 Sect Details</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b pb-1.5"><span className="text-slate-500">Community:</span><strong className="text-slate-800">{monk.sect || "Shwetambar"}</strong></div>
                      <div className="flex justify-between border-b pb-1.5"><span className="text-slate-500">Sub-Sect / Tradition:</span><strong className="text-slate-800">{monk.subSect || "—"}</strong></div>
                      {monk.gacchaName && <div className="flex justify-between border-b pb-1.5"><span className="text-slate-500">Gaccha:</span><strong className="text-slate-800">{monk.gacchaName}</strong></div>}
                    </div>
                  </div>
                </div>

                {/* Guru Parampara visual tree */}
                <div className="border border-purple-100 bg-purple-50/30 p-5 rounded-2xl space-y-4 mt-4">
                  <h4 className="text-xs font-black text-purple-900 uppercase tracking-widest flex items-center gap-1.5">
                    <Compass className="h-4 w-4 text-purple-600" /> Guru Parampara (Lineage Tree)
                  </h4>
                  
                  <div className="flex flex-col items-center gap-2 text-center text-xs">
                    {/* Ancestor Guru */}
                    {monk.dikshaGuru && (
                      <div className="bg-purple-100 text-purple-900 font-semibold p-3.5 border border-purple-200 rounded-xl w-60 shadow-sm">
                        <span className="text-[9px] text-purple-600 uppercase font-black tracking-widest block">Acharya Guru</span>
                        <span className="text-xs mt-0.5 block">{monk.dikshaGuru.dikshaName}</span>
                        <span className="text-[9px] font-mono block opacity-60 mt-0.5">{monk.dikshaGuru.publicId}</span>
                      </div>
                    )}
                    
                    {monk.dikshaGuru && <div className="w-0.5 h-6 bg-purple-200" />}

                    {/* Current Monk */}
                    <div className="bg-purple-700 text-white font-bold p-4 rounded-xl w-64 shadow-md">
                      <span className="text-[9px] text-purple-200 uppercase font-black tracking-widest block">Current MS Profile</span>
                      <span className="text-sm mt-0.5 block">{monk.dikshaName}</span>
                      <span className="text-[9px] font-mono block opacity-70 mt-0.5">{monk.publicId}</span>
                    </div>

                    {monk.discipleOf?.length > 0 && <div className="w-0.5 h-6 bg-purple-200" />}

                    {/* Disciples */}
                    {monk.discipleOf?.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                        {monk.discipleOf.map((disciple) => (
                          <div key={disciple.id} className="bg-white text-slate-800 font-semibold p-3 border rounded-xl shadow-sm text-center">
                            <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest block">Dikshit Disciple</span>
                            <span className="text-xs mt-0.5 block truncate">{disciple.dikshaName}</span>
                            <span className="text-[9px] font-mono block text-slate-500 opacity-60">{disciple.publicId}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Biography Detailed Text */}
                {monk.media?.lifeStory && (
                  <div className="space-y-3 mt-4 border-t pt-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">📖 Detailed Spiritual Biography</h4>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 border rounded-xl">
                      {monk.media.lifeStory}
                    </p>
                  </div>
                )}

              </TabsContent>

              {/* 2. Movement & Group Tab */}
              <TabsContent value="vihaar" className="p-6 space-y-6">
                
                {/* Vihaar Group */}
                {monk.group && (
                  <div className="border border-purple-100 bg-purple-50/20 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800">👥 Group: {monk.group.name}</span>
                        <span className="text-[9px] font-mono text-purple-600 block">🔢 Number: {monk.group.groupNumber || "JFMSV108"}</span>
                      </div>
                      <Badge className="bg-purple-700 text-white font-bold">{monk.group.members?.length || 0} Members</Badge>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] uppercase font-black text-slate-400">Linked MS Profiles in Group</span>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {(monk.group.members || []).map((m) => (
                          <div key={m.id} className="flex items-center gap-2 p-2 border rounded-xl bg-white cursor-pointer hover:bg-slate-50"
                            onClick={() => navigate(`/monks/${m.id}`)}>
                            <Avatar className="h-7 w-7 bg-purple-900 text-white text-[10px] font-bold flex items-center justify-center">
                              {ini(m.dikshaName)}
                            </Avatar>
                            <span className="font-semibold text-slate-700 truncate">{m.dikshaName}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {monk.group.jainMembers?.length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <span className="text-[10px] uppercase font-black text-slate-400">Jain lay-devotees in Group</span>
                        <div className="flex flex-wrap gap-1">
                          {monk.group.jainMembers.map((jm, i) => (
                            <Badge key={i} className="bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200">
                              {jm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {monk.group.nonJainMembers?.length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <span className="text-[10px] uppercase font-black text-slate-400">Non-Jain Helpers</span>
                        <div className="flex flex-wrap gap-1">
                          {monk.group.nonJainMembers.map((njm, i) => (
                            <Badge key={i} className="bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200">
                              {njm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Vihar Movement History */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">🚗 Vihar Journey Logs (Past Travels)</h4>
                  
                  {monk.tracking?.vihaarHistory?.length > 0 ? (
                    <div className="space-y-3">
                      {monk.tracking.vihaarHistory.map((v, i) => (
                        <div key={i} className="flex gap-4 items-center bg-slate-55 border p-3.5 rounded-xl text-xs bg-slate-50/50">
                          <div className="flex flex-col text-center bg-purple-100 border border-purple-200 rounded-lg p-2 w-28 text-[10px] font-bold text-purple-900">
                            <span>{v.startDate ? new Date(v.startDate).toLocaleDateString() : "—"}</span>
                            <span className="text-[8px] font-semibold block text-purple-500 mt-0.5">Start Date</span>
                          </div>
                          
                          <div className="flex-1 flex items-center justify-between pr-4 font-bold text-slate-800">
                            <span>{v.from}</span>
                            <ArrowRight className="h-4 w-4 text-purple-400" />
                            <span>{v.to}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-400 border border-dashed rounded-xl">
                      No vihaar history logs recorded.
                    </div>
                  )}
                </div>

              </TabsContent>

              {/* 3. Tapasya Tab */}
              <TabsContent value="tapasya" className="p-6 space-y-6">
                
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">🪷 Completed Tapasya Milestones</h4>
                
                {monk.tapasya?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {monk.tapasya.map((t, idx) => (
                      <div key={idx} className="border p-4 rounded-xl bg-slate-50/50 shadow-sm space-y-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 h-1.5 w-16 bg-purple-500" />
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-purple-950">{t.name}</span>
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-black">{t.count} Completed</Badge>
                        </div>
                        <div className="text-xs space-y-1 mt-1 text-slate-600">
                          <div>📍 Place: <strong>{t.place || "—"}</strong></div>
                          <div>📅 Date: <strong>{t.date ? new Date(t.date).toLocaleDateString() : "—"}</strong></div>
                          {t.description && <div className="italic text-slate-500 mt-1">"{t.description}"</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400 border border-dashed rounded-xl">
                    No tapasya records linked.
                  </div>
                )}

              </TabsContent>

              {/* 4. Pre-diksha Family Tab */}
              <TabsContent value="family" className="p-6 space-y-6">
                
                <div className="bg-amber-50 p-4 border border-amber-100 text-xs text-amber-800 rounded-xl flex gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    🔒 Privacy Guard: Pre-diksha family credentials are viewable only by verified community members. Sensitive fields remain protected.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">👨 Parents</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b pb-1.5"><span className="text-slate-500">Father:</span><strong className="text-slate-800">{monk.preDikshaFather?.name || "—"}</strong></div>
                      <div className="flex justify-between border-b pb-1.5"><span className="text-slate-500">Mother:</span><strong className="text-slate-800">{monk.preDikshaMother?.name || "—"}</strong></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">📍 Family Location Address</h4>
                    <div className="space-y-2 text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {monk.preDikshaLocation?.address || "Address not defined."}
                      {(monk.preDikshaLocation?.city || monk.preDikshaLocation?.state) && (
                        <div className="font-semibold text-slate-800 mt-1">
                          {monk.preDikshaLocation.city}, {monk.preDikshaLocation.state} {monk.preDikshaLocation.pincode}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">👦 Siblings</h4>
                  {monk.siblings?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {monk.siblings.map((s, idx) => (
                        <div key={idx} className="p-3 border bg-slate-50/30 rounded-xl flex items-center justify-between">
                          <span className="font-semibold text-slate-800">{s.name}</span>
                          <Badge className="bg-slate-100 text-slate-600 font-semibold">{s.relationship}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs text-slate-400">No sibling credentials recorded.</div>
                  )}
                </div>

              </TabsContent>

              {/* 5. Daily Routine Tab */}
              <TabsContent value="routine" className="p-6 space-y-6">
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">🗣 Pravachan Timings</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b pb-1"><span className="text-slate-500">Morning Pravachan:</span><strong className="text-slate-800">{monk.routine?.pravachanTimings?.morning || "—"}</strong></div>
                      <div className="flex justify-between border-b pb-1"><span className="text-slate-500">Afternoon Pravachan:</span><strong className="text-slate-800">{monk.routine?.pravachanTimings?.afternoon || "—"}</strong></div>
                      <div className="flex justify-between border-b pb-1"><span className="text-slate-500">Evening Pravachan:</span><strong className="text-slate-800">{monk.routine?.pravachanTimings?.evening || "—"}</strong></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">🧘 Darshan / Interaction</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b pb-1"><span className="text-slate-500">Morning Slot:</span><strong className="text-slate-800">{monk.routine?.darshanTimings?.morning || "—"}</strong></div>
                      <div className="flex justify-between border-b pb-1"><span className="text-slate-500">Afternoon Slot:</span><strong className="text-slate-800">{monk.routine?.darshanTimings?.afternoon || "—"}</strong></div>
                      <div className="flex justify-between border-b pb-1"><span className="text-slate-500">Evening Slot:</span><strong className="text-slate-800">{monk.routine?.darshanTimings?.evening || "—"}</strong></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-4 border-t pt-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">🕒 Languages Spoken</h4>
                  <div className="flex flex-wrap gap-1">
                    {(monk.languages || ["Hindi", "Gujarati"]).map((l) => (
                      <Badge key={l} className="bg-purple-50 text-purple-700 border border-purple-100 text-xs font-semibold px-3 py-1 rounded-full">{l}</Badge>
                    ))}
                  </div>
                </div>

                {monk.routine?.maryada && (
                  <div className="space-y-3 mt-4 border-t pt-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">📜 Maryada & Guidelines</h4>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 border rounded-xl">
                      {monk.routine.maryada}
                    </p>
                  </div>
                )}

              </TabsContent>

              {/* 6. Contacts & Links Tab */}
              <TabsContent value="contacts" className="p-6 space-y-6">
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Sangh Contact List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">👳 Jain Sangh Representatives</h4>
                    {monk.sanghContacts?.jainContacts?.length > 0 ? (
                      <div className="space-y-2">
                        {monk.sanghContacts.jainContacts.map((jc, i) => (
                          <div key={i} className="bg-slate-50 p-2.5 rounded-xl border text-xs flex justify-between items-center">
                            <span className="font-bold text-slate-700">{jc.memberId}</span>
                            <Badge className="bg-purple-100 text-purple-800 font-semibold">{jc.designation}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400">No Sangh representatives linked.</div>
                    )}
                  </div>

                  {/* Non-Jain Contacts */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">👥 Coordinators / Helpers</h4>
                    {monk.sanghContacts?.nonJainContacts?.length > 0 ? (
                      <div className="space-y-2">
                        {monk.sanghContacts.nonJainContacts.map((njc, i) => (
                          <div key={i} className="bg-slate-50 p-2.5 rounded-xl border text-xs flex justify-between items-center">
                            <span className="font-bold text-slate-700">{njc.memberId}</span>
                            <Badge className="bg-purple-100 text-purple-800 font-semibold">{njc.designation}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400">No helpers linked.</div>
                    )}
                  </div>
                </div>

                {/* Direct Communications */}
                <div className="border-t pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-black text-slate-400 block">📞 Direct Calling Number</span>
                    <span className="text-xs font-bold text-slate-800 block mt-1">{monk.sanghContacts?.directCallingNumber || "Not Available"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black text-slate-400 block">💬 WhatsApp Direct link</span>
                    {monk.sanghContacts?.directWhatsAppNumber ? (
                      <span className="text-xs font-bold text-purple-700 block mt-1 underline cursor-pointer">
                        {monk.sanghContacts.directWhatsAppNumber}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 block mt-1">Not Available</span>
                    )}
                  </div>
                </div>

                {/* Official presence */}
                <div className="border-t pt-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">🔗 Official Digital Presence</h4>
                  <div className="flex gap-4">
                    {monk.socialLinks?.website && <a href={monk.socialLinks.website} target="_blank" className="text-xs text-purple-700 hover:underline flex items-center gap-1"><Globe className="h-4 w-4" /> Website</a>}
                    {monk.socialLinks?.facebook && <a href={monk.socialLinks.facebook} target="_blank" className="text-xs text-purple-700 hover:underline flex items-center gap-1"><Info className="h-4 w-4" /> Facebook</a>}
                    {monk.socialLinks?.instagram && <a href={monk.socialLinks.instagram} target="_blank" className="text-xs text-purple-700 hover:underline flex items-center gap-1"><Info className="h-4 w-4" /> Instagram</a>}
                    {monk.socialLinks?.youtube && <a href={monk.socialLinks.youtube} target="_blank" className="text-xs text-purple-700 hover:underline flex items-center gap-1"><Video className="h-4 w-4" /> YouTube</a>}
                  </div>
                </div>

              </TabsContent>

            </Tabs>
          </Card>
        </div>
      </div>

      {/* ─── ID Card Preview Dialog ─────────────────────────────────────── */}
      <Dialog open={idCardOpen} onOpenChange={setIdCardOpen}>
        <DialogContent className="max-w-sm p-0 border-0 bg-transparent shadow-none overflow-visible">
          <div className="flex justify-end p-2 absolute -top-10 right-0">
            <button onClick={() => setIdCardOpen(false)} className="text-white hover:text-red-400"><X className="h-6 w-6" /></button>
          </div>
          <MonkIdCardVisual monk={monk} />
        </DialogContent>
      </Dialog>

      {/* ─── Report Incorrect Info Dialog ─────────────────────────────────── */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <AlertTriangle className="h-5 w-5 text-amber-600 animate-bounce" /> Report Incorrect Information
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2 text-xs">
            <p className="text-slate-500">
              Please specify the incorrect information. Submitting this form will automatically register a Support Ticket for verification.
            </p>
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-400">Corrections details</Label>
              <textarea rows={4} className="w-full mt-1.5 rounded-lg border bg-white px-3 py-2 text-xs focus:outline-none"
                value={ticketDescription} onChange={(e) => setTicketDescription(e.target.value)}
                placeholder="e.g. Sibling names are wrong, Diksha date should be 2018 instead of 2019..." />
            </div>
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="ghost" onClick={() => setReportOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSupportTicket} disabled={ticketSaving} className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
              {ticketSaving ? "Submitting..." : "Submit Corrections Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit MS Profile Dialog (Admins Only) ────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[92vh] p-0 overflow-hidden flex flex-col bg-slate-50 border-0 rounded-2xl shadow-2xl">
          <DialogHeader className="p-4 bg-white border-b shrink-0 flex flex-row items-center justify-between">
            <DialogTitle className="font-heading text-lg text-purple-950 flex items-center gap-2">
              🧘 Edit Maharaj Saheb Profile - {monk.dikshaName}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Sidebar navigation */}
            <div className="w-56 bg-purple-950/5 border-r border-slate-200 shrink-0 p-3 overflow-y-auto space-y-1">
              {[
                { id: "basic", label: "👤 Basic Information" },
                { id: "journey", label: "🧘 Journey & Sect" },
                { id: "hierarchy", label: "🌳 Guru Parampara" },
                { id: "family", label: "🏠 Family Details" },
                { id: "tapasya", label: "🪷 timeline & Tapasya" },
                { id: "movement", label: "📍 Location & Chaturmas" },
                { id: "routine", label: "🕒 Routine & Guidelines" },
                { id: "contacts", label: "📞 representatives" },
                { id: "media", label: "🔗 Media & Links" },
              ].map(s => {
                const active = editTab === s.id;
                return (
                  <button key={s.id} onClick={() => setEditTab(s.id)} type="button"
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center ${
                      active
                        ? "bg-purple-700 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-200/50"
                    }`}>
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Form scroll pane */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
              <form onSubmit={handleEditSubmit} className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-5 pb-24">
                  
                  {editTab === "basic" && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">👤 Personal & Basic Details</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">{eField("Full Name (Diksha Name) *", "dikshaName")}</div>
                        {eField("Short / Popular Name (Optional)", "shortName")}
                        <div>
                          <Label className="text-xs font-semibold">Gender *</Label>
                          <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                            value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}>
                            <option value="SADHU">🧘 Sadhu (Male)</option>
                            <option value="SADHVI">🌸 Sadhvi (Female)</option>
                          </select>
                        </div>
                        {eField("Name Before Diksha", "nameBeforeDiksha")}
                        {eField("Date of Birth", "dob", "date")}
                        {eField("Place of Birth", "dobPlace")}
                        <div>
                          <Label className="text-xs font-semibold">Current Spiritual Status</Label>
                          <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                            value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                            <option value="ACTIVE">Active (Vihaar / Darshan)</option>
                            <option value="SAMADHI">Samadhi (Devlok / Nirvana)</option>
                          </select>
                        </div>
                      </div>
                      
                      {editForm.status === "SAMADHI" && (
                        <div className="grid grid-cols-2 gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                          {eField("Date of Nirvana / Samadhi", "nirvanaDate", "date")}
                          {eField("Place of Nirvana / Samadhi", "nirvanaPlace")}
                        </div>
                      )}

                      <div>
                        <Label className="text-xs font-semibold">Short Bio (3-5 Lines Summary)</Label>
                        <textarea rows={3} className="w-full mt-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none"
                          value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} />
                      </div>
                    </div>
                  )}

                  {editTab === "journey" && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">🧘 Diksha & Sect Details</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {eField("Diksha Date", "dikshaDate", "date")}
                        {eField("Diksha Place", "dikshaPlace")}
                        <div className="col-span-2">
                          <MonkSelect label="Diksha Guru" value={editForm.dikshaGuruId} onChange={(val) => setEditForm({ ...editForm, dikshaGuruId: val })} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 border-t pt-3">
                        <div>
                          <Label className="text-xs font-semibold">Community</Label>
                          <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                            value={editForm.sect} onChange={(e) => setEditForm({ ...editForm, sect: e.target.value, subSect: e.target.value === "Digambar" ? "Bisapantha" : "Murtipujak" })}>
                            <option value="Shwetambar">Shwetambar</option>
                            <option value="Digambar">Digambar</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs font-semibold">Sub-Sect / Tradition</Label>
                          <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                            value={editForm.subSect} onChange={(e) => setEditForm({ ...editForm, subSect: e.target.value })}>
                            {editForm.sect === "Digambar" ? (
                              DIGAMBAR_SUB.map(s => <option key={s} value={s}>{s}</option>)
                            ) : (
                              SHWETAMBAR_SUB.map(s => <option key={s} value={s}>{s}</option>)
                            )}
                          </select>
                        </div>
                      </div>

                      {editForm.sect === "Shwetambar" && editForm.subSect === "Murtipujak" && (
                        <div>
                          <Label className="text-xs font-semibold">Gaccha</Label>
                          <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                            value={editForm.gacchaName} onChange={(e) => setEditForm({ ...editForm, gacchaName: e.target.value })}>
                            <option value="">Select Gaccha...</option>
                            {MURTIPUJAK_GACCHAS.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {editTab === "hierarchy" && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">🌳 Guru-Disciple Lineage</h3>
                      <div className="space-y-3">
                        <MonkSelect label="Acharya Guru (Parent Guru)" value={editForm.acharyaGuruId} onChange={(val) => setEditForm({ ...editForm, acharyaGuruId: val })} />
                        {eField("Current Sangh / Acharya Name (Optional)", "currentSangh")}
                      </div>
                    </div>
                  )}

                  {editTab === "family" && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">🏠 Pre-Diksha Family Details</h3>
                      
                      <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                        <span className="text-xs font-bold text-slate-700 block border-b pb-1">👨 Father</span>
                        <MemberSelect label="Link Father's JiNANAM Member Profile" value={editForm.fatherMemberId} onChange={(val) => setEditForm({ ...editForm, fatherMemberId: val })} />
                        {!editForm.fatherMemberId && eField("Father's Name (Text)", "fatherNameText")}
                      </div>

                      <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                        <span className="text-xs font-bold text-slate-700 block border-b pb-1">👩 Mother</span>
                        <MemberSelect label="Link Mother's JiNANAM Member Profile" value={editForm.motherMemberId} onChange={(val) => setEditForm({ ...editForm, motherMemberId: val })} />
                        {!editForm.motherMemberId && eField("Mother's Name (Text)", "motherNameText")}
                      </div>

                      <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-xs font-bold text-slate-700">👦 Siblings</span>
                          <Button type="button" size="sm" variant="outline" onClick={eAddSibling} className="h-6 text-[10px] font-bold">
                            + Add Sibling
                          </Button>
                        </div>
                        {(editForm.siblings || []).map((s, idx) => (
                          <div key={idx} className="flex items-end gap-3 bg-white p-3 rounded-lg border relative">
                            <button type="button" onClick={() => eRemoveSibling(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                              <X className="h-4 w-4" />
                            </button>
                            <div className="flex-1">
                              <Label className="text-[10px] font-bold">Sibling Name</Label>
                              <Input className="h-8 mt-1" value={s.name} onChange={(e) => eUpdateSibling(idx, "name", e.target.value)} />
                            </div>
                            <div className="w-32">
                              <Label className="text-[10px] font-bold">Relationship</Label>
                              <select className="w-full mt-1 h-8 rounded border bg-white px-2 text-xs focus:outline-none"
                                value={s.relationship} onChange={(e) => eUpdateSibling(idx, "relationship", e.target.value)}>
                                <option value="Brother">Brother</option>
                                <option value="Sister">Sister</option>
                              </select>
                            </div>
                            <div className="flex-1">
                              <MemberSelect label="Link Profile" value={s.memberId} onChange={(val) => eUpdateSibling(idx, "memberId", val)} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                        <span className="text-xs font-bold text-slate-700 block border-b pb-1">📍 Family Location Address</span>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">{eField("Full Address", "preDikshaAddress")}</div>
                          {eField("City", "preDikshaCity")}
                          {eField("State", "preDikshaState")}
                          {eField("Country", "preDikshaCountry")}
                          {eField("Pin Code", "preDikshaPincode")}
                        </div>
                      </div>
                    </div>
                  )}

                  {editTab === "tapasya" && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b pb-1.5">
                        <h3 className="text-sm font-bold text-slate-800">🪷 Tapasya & Milestones</h3>
                        <Button type="button" size="sm" onClick={eAddTapasya} className="bg-purple-700 hover:bg-purple-800 text-white font-bold h-7 text-xs">
                          + Add Tapasya
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {(editForm.tapasya || []).map((t, idx) => (
                          <div key={idx} className="border p-4 rounded-xl bg-white space-y-3 relative shadow-sm">
                            <button type="button" onClick={() => eRemoveTapasya(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <Label className="text-xs font-semibold">Tapasya Name</Label>
                                <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                                  value={t.name} onChange={(e) => eUpdateTapasya(idx, "name", e.target.value)}>
                                  <option value="Upvas">Upvas</option>
                                  <option value="Ayambil">Ayambil</option>
                                  <option value="Varsitap">Varsitap</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              <div>
                                <Label className="text-xs font-semibold">Number Completed</Label>
                                <Input type="number" className="mt-1 h-9" value={t.count} onChange={(e) => eUpdateTapasya(idx, "count", e.target.value)} />
                              </div>
                              <div>
                                <Label className="text-xs font-semibold">Status</Label>
                                <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                                  value={t.status} onChange={(e) => eUpdateTapasya(idx, "status", e.target.value)}>
                                  <option value="Completed">Completed</option>
                                  <option value="Ongoing">Ongoing</option>
                                </select>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs font-semibold">Date Completed</Label>
                                <Input type="date" className="mt-1 h-9" value={t.date ? t.date.slice(0,10) : ""} onChange={(e) => eUpdateTapasya(idx, "date", e.target.value)} />
                              </div>
                              <div>
                                <Label className="text-xs font-semibold">Place Completed</Label>
                                <Input className="mt-1 h-9" value={t.place} onChange={(e) => eUpdateTapasya(idx, "place", e.target.value)} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Timeline Events */}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center border-b pb-1.5 mb-3">
                          <h4 className="text-xs font-bold text-slate-800">📜 Milestones & Timeline Events</h4>
                          <Button type="button" size="sm" variant="outline" onClick={eAddTimeline} className="h-6 text-[10px] font-bold">
                            + Add Event
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {(editForm.timeline || []).map((e, idx) => (
                            <div key={idx} className="bg-slate-50 border p-3 rounded-lg space-y-2 relative">
                              <button type="button" onClick={() => eRemoveTimeline(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                                <X className="h-3.5 w-3.5" />
                              </button>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <Label className="text-[10px] font-bold">Event Name</Label>
                                  <Input className="h-8 mt-0.5 bg-white text-xs" value={e.eventName} onChange={(val) => eUpdateTimeline(idx, "eventName", val.target.value)} />
                                </div>
                                <div>
                                  <Label className="text-[10px] font-bold">Event Date</Label>
                                  <Input type="date" className="h-8 mt-0.5 bg-white text-xs" value={e.date ? e.date.slice(0,10) : ""} onChange={(val) => eUpdateTimeline(idx, "date", val.target.value)} />
                                </div>
                                <div>
                                  <Label className="text-[10px] font-bold">Place</Label>
                                  <Input className="h-8 mt-0.5 bg-white text-xs" value={e.place} onChange={(val) => eUpdateTimeline(idx, "place", val.target.value)} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {editTab === "movement" && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">📍 Current Location & Chaturmas History</h3>
                      
                      <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                        <span className="text-xs font-bold text-slate-700 block border-b pb-1">📍 Live Status Details</span>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs font-semibold">Current Movement status</Label>
                            <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                              value={editForm.trackingStatus} onChange={(e) => setEditForm({ ...editForm, trackingStatus: e.target.value })}>
                              <option value="Staying">Staying (Sthirata)</option>
                              <option value="Moving">Moving (Viharing)</option>
                              <option value="Chaturmas">Chaturmas</option>
                            </select>
                          </div>
                          {eField("Current Location Description", "currentLocation")}
                          <div className="col-span-2">
                            <Label className="text-xs font-semibold">Current Temple / Jain Centre / Upashray</Label>
                            <select className="w-full mt-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                              value={editForm.currentTempleId || ""} onChange={(e) => setEditForm({ ...editForm, currentTempleId: e.target.value })}>
                              <option value="">Select Temple...</option>
                              {temples.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.city})</option>)}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Vihaar History */}
                      <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-xs font-bold text-slate-700">🚗 Vihar Journey History</span>
                          <Button type="button" size="sm" variant="outline" onClick={eAddVihaar} className="h-6 text-[10px] font-bold">
                            + Add Vihar
                          </Button>
                        </div>
                        {(editForm.vihaarHistory || []).map((v, idx) => (
                          <div key={idx} className="flex items-end gap-3 bg-white p-3 rounded-lg border relative">
                            <button type="button" onClick={() => eRemoveVihaar(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                              <X className="h-4 w-4" />
                            </button>
                            <div className="flex-1">
                              <Label className="text-[10px] font-bold">From Location</Label>
                              <Input className="h-8 mt-1" value={v.from} onChange={(e) => eUpdateVihaar(idx, "from", e.target.value)} />
                            </div>
                            <div className="flex-1">
                              <Label className="text-[10px] font-bold">To Location</Label>
                              <Input className="h-8 mt-1" value={v.to} onChange={(e) => eUpdateVihaar(idx, "to", e.target.value)} />
                            </div>
                            <div className="w-32">
                              <Label className="text-[10px] font-bold">Start Date</Label>
                              <Input type="date" className="h-8 mt-1" value={v.startDate ? v.startDate.slice(0,10) : ""} onChange={(e) => eUpdateVihaar(idx, "startDate", e.target.value)} />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Chaturmas History */}
                      <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-xs font-bold text-slate-700">🍁 Chaturmas History</span>
                          <Button type="button" size="sm" variant="outline" onClick={eAddChaturmas} className="h-6 text-[10px] font-bold">
                            + Add Chaturmas
                          </Button>
                        </div>
                        {(editForm.chaturmasHistory || []).map((c, idx) => (
                          <div key={idx} className="border p-3 rounded-lg bg-white space-y-2.5 relative shadow-sm">
                            <button type="button" onClick={() => eRemoveChaturmas(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                              <X className="h-4 w-4" />
                            </button>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label className="text-[10px] font-bold">Year</Label>
                                <Input className="h-8 mt-0.5" value={c.year} onChange={(e) => eUpdateChaturmas(idx, "year", e.target.value)} />
                              </div>
                              <div>
                                <Label className="text-[10px] font-bold">City</Label>
                                <Input className="h-8 mt-0.5" value={c.city} onChange={(e) => eUpdateChaturmas(idx, "city", e.target.value)} />
                              </div>
                              <div>
                                <Label className="text-[10px] font-bold">State</Label>
                                <Input className="h-8 mt-0.5" value={c.state} onChange={(e) => eUpdateChaturmas(idx, "state", e.target.value)} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}

                  {editTab === "routine" && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">🕒 Daily Routine & Guidelines</h3>
                      
                      <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                        <span className="text-xs font-bold text-slate-700 block border-b pb-1">🗣 Pravachan Timings</span>
                        <div className="grid grid-cols-3 gap-3">
                          {eField("Morning Pravachan", "pravachanMorning")}
                          {eField("Afternoon Pravachan", "pravachanAfternoon")}
                          {eField("Evening Pravachan", "pravachanEvening")}
                        </div>
                      </div>

                      <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                        <span className="text-xs font-bold text-slate-700 block border-b pb-1">🧘 Darshan & Interaction Slots</span>
                        <div className="grid grid-cols-3 gap-3">
                          {eField("Morning Interaction", "darshanMorning")}
                          {eField("Afternoon Interaction", "darshanAfternoon")}
                          {eField("Evening Interaction", "darshanEvening")}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold">Maryada / Guidelines</Label>
                        <textarea rows={3} className="w-full mt-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none"
                          value={editForm.maryadaGuidelines} onChange={(e) => setEditForm({ ...editForm, maryadaGuidelines: e.target.value })} />
                      </div>
                    </div>
                  )}

                  {editTab === "contacts" && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">👥 Sangh Contact Representatives</h3>
                      
                      <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-xs font-bold text-slate-700">👳 Jain Sangh Representatives</span>
                          <Button type="button" size="sm" variant="outline" onClick={eAddJainContact} className="h-6 text-[10px] font-bold">
                            + Add Representative
                          </Button>
                        </div>
                        {(editForm.jainContacts || []).map((jc, idx) => (
                          <div key={idx} className="flex items-end gap-3 bg-white p-3 rounded-lg border relative">
                            <button type="button" onClick={() => eRemoveJainContact(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                              <X className="h-4 w-4" />
                            </button>
                            <div className="flex-1">
                              <MemberSelect label="Link Jain Member Profile" value={jc.memberId} onChange={(val) => eUpdateJainContact(idx, "memberId", val)} />
                            </div>
                            <div className="w-48">
                              <Label className="text-[10px] font-bold">Designation</Label>
                              <Input className="h-8 mt-1" value={jc.designation} onChange={(e) => eUpdateJainContact(idx, "designation", e.target.value)} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border p-3.5 rounded-xl bg-slate-50 space-y-3">
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="text-xs font-bold text-slate-700">👥 Non-Jain Representatives</span>
                          <Button type="button" size="sm" variant="outline" onClick={eAddNonJainContact} className="h-6 text-[10px] font-bold">
                            + Add Representative
                          </Button>
                        </div>
                        {(editForm.nonJainContacts || []).map((nj, idx) => (
                          <div key={idx} className="flex items-end gap-3 bg-white p-3 rounded-lg border relative">
                            <button type="button" onClick={() => eRemoveNonJainContact(idx)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                              <X className="h-4 w-4" />
                            </button>
                            <div className="flex-1">
                              <MemberSelect label="Link Non-Jain Member Profile" value={nj.memberId} onChange={(val) => eUpdateNonJainContact(idx, "memberId", val)} />
                            </div>
                            <div className="w-48">
                              <Label className="text-[10px] font-bold">Designation</Label>
                              <Input className="h-8 mt-1" value={nj.designation} onChange={(e) => eUpdateNonJainContact(idx, "designation", e.target.value)} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3 border-t pt-3">
                        {eField("Direct Calling Number (Optional)", "directCallingNumber")}
                        {eField("Direct WhatsApp Number (Optional)", "directWhatsAppNumber")}
                      </div>
                    </div>
                  )}

                  {editTab === "media" && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">🔗 Media & Biography</h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {eField("Website Link", "website")}
                        {eField("Facebook Link", "facebook")}
                        {eField("Instagram Link", "instagram")}
                        {eField("YouTube Link", "youtube")}
                        {eField("Twitter Link", "twitter")}
                      </div>

                      <div>
                        <Label className="text-xs font-semibold">Detailed Life Biography Story</Label>
                        <textarea rows={4} className="w-full mt-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none"
                          value={editForm.lifeStory} onChange={(e) => setEditForm({ ...editForm, lifeStory: e.target.value })} />
                      </div>
                    </div>
                  )}

                </div>

                <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-2 shrink-0 absolute bottom-0 left-56 right-0">
                  <Button variant="outline" type="button" onClick={() => setEditOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving} className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-6">
                    {saving ? "Saving Changes..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
