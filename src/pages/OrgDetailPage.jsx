/**
 * OrgDetailPage — Premium detail view for Temples / Dharamshalas / Jain Centers
 * All tabs: Info · Gallery (bulk upload) · Trustees · Contacts · Notices · Reviews · Dhaja · Chaturmas
 * Every tab has Add + Edit + Delete with confirmation.
 */
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, extractErrorMessage, STATIC_URL, API_BASE } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  ChevronLeft, MapPin, Phone, Globe, Users, Heart, Landmark,
  Pencil, Camera, Upload, Plus, Trash2, Star, BellRing,
  MessageSquare, Flag, X, Loader2, CheckCircle, Image, Printer,
  BookOpen, Coffee, Home, Shield, AlertTriangle, Calendar
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const STATUSES = ["AVAILABLE", "BOOKED", "PENDING"];

/* ─── Small helpers ─────────────────────────────────────────────────────────── */
function Confirm({ open, message, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Confirm Delete</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{message || "This action cannot be undone."}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stars({ rating = 0 }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((n) => (
        <Star key={n} className={`h-3.5 w-3.5 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
      ))}
    </div>
  );
}

/* ─── Gallery Tab ───────────────────────────────────────────────────────────── */
function GalleryTab({ images, apiPrefix, orgId, onRefresh, canEdit }) {
  const [bulkOpen, setBulkOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileRef = useRef();

  const IMAGE_TYPES = {
    "Exterior": "exterior",
    "Interior": "interior",
    "Idol / Murti": "idol",
    "Event": "event",
    "Architecture": "architecture",
    "Other": "other",
  };
  const [imageType, setImageType] = useState("exterior");

  const pickFiles = (fl) => {
    const valid = Array.from(fl).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...valid].slice(0, 20));
  };

  const doUpload = async () => {
    if (!files.length) { toast.error("Select at least one image."); return; }
    setUploading(true);
    try {
      const token = localStorage.getItem("jinanam_access_token");
      const fd = new FormData();
      files.forEach((f) => fd.append("images", f));
      fd.append("type", imageType);
      await fetch(`${API_BASE}${apiPrefix}/${orgId}/gallery/bulk`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      }).then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
      });
      toast.success(`${files.length} image(s) uploaded.`);
      setBulkOpen(false);
      setFiles([]);
      onRefresh();
    } catch (e) { toast.error("Upload failed. " + e.message); }
    finally { setUploading(false); }
  };

  const doDelete = async () => {
    try {
      await api.delete(`${apiPrefix}/${orgId}/gallery/${deleteTarget.id}`);
      toast.success("Image deleted.");
      setDeleteTarget(null);
      onRefresh();
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  return (
    <div>
      {canEdit && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setBulkOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" /> Bulk Upload Images
          </Button>
        </div>
      )}

      {images?.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((g, i) => (
            <div key={g.id || i} className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-slate-100">
              <img
                src={g.url?.startsWith("http") ? g.url : `${STATIC_URL}${g.url}`}
                alt=""
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {g.type && (
                <div className="absolute top-1.5 left-1.5 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider">
                  {g.type}
                </div>
              )}
              {canEdit && (
                <button
                  onClick={() => setDeleteTarget(g)}
                  className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No gallery images" description="Upload photos to showcase this place." icon={Image} />
      )}

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkOpen} onOpenChange={(o) => { setBulkOpen(o); if (!o) setFiles([]); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="h-5 w-5 text-orange-500" /> Bulk Upload Gallery Images
            </DialogTitle>
          </DialogHeader>

          {/* Image type selector */}
          <div>
            <Label className="text-xs">Image Type</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(IMAGE_TYPES).map(([label, val]) => (
                <button key={val} onClick={() => setImageType(val)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                    imageType === val ? "bg-orange-50 text-white border-orange-500" : "border-border text-muted-foreground hover:border-orange-400"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-amber-600 mt-1 font-medium">
              ⚠ All images in this upload will be tagged as "{Object.keys(IMAGE_TYPES).find(k => IMAGE_TYPES[k] === imageType)}"
            </p>
          </div>

          {/* Drop zone */}
          <div
            className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); pickFiles(e.dataTransfer.files); }}>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => pickFiles(e.target.files)} />
            <Upload className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-medium text-slate-500">Drag & drop or click to browse</div>
            <div className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP · Up to 20 images · Max 10 MB each</div>
          </div>

          {/* Selected previews */}
          {files.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-600 mb-2">{files.length} image(s) selected:</div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {files.map((f, i) => (
                  <div key={i} className="relative group">
                    <img src={URL.createObjectURL(f)} alt="" className="h-16 w-16 object-cover rounded-lg border" />
                    <button onClick={() => setFiles(files.filter((_, j) => j !== i))}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setBulkOpen(false); setFiles([]); }}>Cancel</Button>
            <Button onClick={doUpload} disabled={!files.length || uploading}>
              {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading…</> : `Upload ${files.length || ""} Images`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Confirm open={!!deleteTarget} message="Delete this gallery image permanently?" onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

/* ─── Trustees Tab ──────────────────────────────────────────────────────────── */
function TrusteesTab({ trustees, apiPrefix, orgId, onRefresh, canEdit }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ memberId: "", designation: "Trustee" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (open) api.get("/members", { params: { pageSize: 200 } }).then((r) => setMembers(r.data?.data?.items || r.data?.data || [])).catch(() => {});
  }, [open]);

  const save = async () => {
    if (!form.memberId) { toast.error("Select a member."); return; }
    if (!form.designation) { toast.error("Designation is required."); return; }
    setSaving(true);
    try {
      await api.post(`${apiPrefix}/${orgId}/trustees`, { memberId: form.memberId, designation: form.designation });
      toast.success("Trustee added.");
      setOpen(false);
      setForm({ memberId: "", designation: "Trustee" });
      onRefresh();
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    try {
      await api.delete(`${apiPrefix}/${orgId}/trustees/${deleteTarget.id}`);
      toast.success("Trustee removed.");
      setDeleteTarget(null);
      onRefresh();
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  return (
    <div>
      {canEdit && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Trustee</Button>
        </div>
      )}
      {trustees?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {trustees.map((t, i) => (
            <Card key={t.id || i} className="p-4 group relative hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-slate-800">{t.member?.fullName || t.name || "—"}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-mono">Member ID: {t.member?.publicId || "—"}</div>
                  <div className="text-xs text-orange-650 font-bold mt-1.5 uppercase tracking-wide bg-orange-50 px-2 py-0.5 rounded w-max">{t.designation}</div>
                </div>
                {canEdit && (
                  <button onClick={() => setDeleteTarget(t)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-650 transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No trustees added" icon={Users} description="Add trustees to manage this organization." />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Trustee</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Select Member *</Label>
              <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })}>
                <option value="">Select member…</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.fullName} ({m.publicId})</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Designation *</Label>
              <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}>
                {["Chairman", "Secretary", "Treasurer", "Trustee", "Committee Member"].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Add Trustee"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Confirm open={!!deleteTarget} message={`Remove ${deleteTarget?.member?.fullName || "this trustee"}?`} onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

/* ─── Contacts Tab ──────────────────────────────────────────────────────────── */
function ContactsTab({ contacts, apiPrefix, orgId, onRefresh, canEdit }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ memberId: "", role: "Contact Person" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (open) api.get("/members", { params: { pageSize: 200 } }).then((r) => setMembers(r.data?.data?.items || r.data?.data || [])).catch(() => {});
  }, [open]);

  const save = async () => {
    if (!form.memberId) { toast.error("Select a member."); return; }
    setSaving(true);
    try {
      await api.post(`${apiPrefix}/${orgId}/contacts`, { memberId: form.memberId, role: form.role });
      toast.success("Contact added.");
      setOpen(false);
      setForm({ memberId: "", role: "Contact Person" });
      onRefresh();
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    try {
      await api.delete(`${apiPrefix}/${orgId}/contacts/${deleteTarget.id}`);
      toast.success("Contact removed.");
      setDeleteTarget(null);
      onRefresh();
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  return (
    <div>
      {canEdit && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Contact</Button>
        </div>
      )}
      {contacts?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contacts.map((c, i) => (
            <Card key={c.id || i} className="p-4 group relative hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-slate-800">{c.member?.fullName || c.name || "—"}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {c.member?.publicId || "—"}</div>
                  <div className="text-xs font-mono mt-1.5 flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-slate-600"><Phone className="h-3.5 w-3.5 text-orange-500" /> {c.member?.mobile || c.mobile || "—"}</span>
                    <span className="flex items-center gap-1.5 text-slate-600"><Mail className="h-3.5 w-3.5 text-orange-500" /> {c.member?.email || c.email || "—"}</span>
                  </div>
                </div>
                {canEdit && (
                  <button onClick={() => setDeleteTarget(c)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-650 transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No contacts added" icon={Phone} description="Add primary contact persons for visitors." />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Contact Person</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Member *</Label>
              <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })}>
                <option value="">Select member…</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.fullName} ({m.mobile})</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Role / Description</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Manager, Priest" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Add Contact"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Confirm open={!!deleteTarget} message={`Remove contact ${deleteTarget?.member?.fullName || "this contact"}?`} onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

/* ─── Notices Tab ───────────────────────────────────────────────────────────── */
function NoticesTab({ notices, apiPrefix, orgId, onRefresh, canEdit }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const save = async () => {
    if (!form.title || !form.content) { toast.error("Fill in title and notice text."); return; }
    setSaving(true);
    try {
      await api.post(`${apiPrefix}/${orgId}/notices`, form);
      toast.success("Notice published.");
      setOpen(false);
      setForm({ title: "", content: "" });
      onRefresh();
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    try {
      await api.delete(`${apiPrefix}/${orgId}/notices/${deleteTarget.id}`);
      toast.success("Notice deleted.");
      setDeleteTarget(null);
      onRefresh();
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  return (
    <div>
      {canEdit && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Publish Notice</Button>
        </div>
      )}
      {notices?.length > 0 ? (
        <div className="space-y-3">
          {notices.map((n, i) => (
            <Card key={n.id || i} className="p-4 group relative border-l-4 border-l-orange-500 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">{n.title}</h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{n.content}</p>
                  <span className="text-[10px] text-slate-400 block mt-2 font-mono-num">{formatDate(n.createdAt)}</span>
                </div>
                {canEdit && (
                  <button onClick={() => setDeleteTarget(n)} className="opacity-0 group-hover:opacity-100 text-red-455 hover:text-red-650 shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No notices published" icon={BellRing} description="Notice board updates appear here." />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Publish Important Notice</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Notice Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Paryushan Parv Schedule" />
            </div>
            <div>
              <Label className="text-xs">Notice Content *</Label>
              <textarea rows={4} className="w-full mt-1 rounded-md border border-slate-205 bg-white px-3 py-2 text-sm focus:outline-none"
                value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write notice details…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Publishing…" : "Publish notice"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Confirm open={!!deleteTarget} message="Delete this notice permanently?" onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

/* ─── Reviews Tab ───────────────────────────────────────────────────────────── */
function ReviewsTab({ reviews, apiPrefix, orgId, onRefresh, isSuperAdmin }) {
  const [deleteTarget, setDeleteTarget] = useState(null);

  const doDelete = async () => {
    try {
      await api.delete(`${apiPrefix}/${orgId}/reviews/${deleteTarget.id}`);
      toast.success("Review deleted.");
      setDeleteTarget(null);
      onRefresh();
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  return (
    <div>
      {reviews?.length > 0 ? (
        <div className="space-y-3 divide-y divide-slate-100">
          {reviews.map((r, i) => (
            <div key={r.id || i} className="pt-3 first:pt-0 flex items-start justify-between group">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-800">{r.member?.fullName || "Verified Visitor"}</span>
                  <Stars rating={r.rating} />
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{r.comment}</p>
                <span className="text-[10px] text-slate-400 block mt-1 font-mono-num">{formatDate(r.createdAt)}</span>
              </div>
              {isSuperAdmin && (
                <button onClick={() => setDeleteTarget(r)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-655">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No reviews yet" icon={Star} description="Be the first to rate and share review." />
      )}

      <Confirm open={!!deleteTarget} message="Remove this user review?" onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

/* ─── Dhaja Tab ─────────────────────────────────────────────────────────────── */
function DhajaTab({ dhajaRecords, apiPrefix, orgId, onRefresh, canEdit }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ year: new Date().getFullYear(), status: "AVAILABLE", dhajaDate: "", descriptionEn: "", descriptionHi: "" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const save = async () => {
    if (!form.year) { toast.error("Year is required."); return; }
    setSaving(true);
    try {
      await api.post(`${apiPrefix}/${orgId}/dhaja`, {
        year: Number(form.year),
        status: form.status,
        dhajaDate: form.dhajaDate ? new Date(form.dhajaDate).toISOString() : undefined,
        descriptionEn: form.descriptionEn,
        descriptionHi: form.descriptionHi,
      });
      toast.success("Dhaja record saved.");
      setOpen(false);
      setForm({ year: new Date().getFullYear(), status: "AVAILABLE", dhajaDate: "", descriptionEn: "", descriptionHi: "" });
      onRefresh();
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    try {
      await api.delete(`${apiPrefix}/${orgId}/dhaja/${deleteTarget.id}`);
      toast.success("Dhaja record deleted.");
      setDeleteTarget(null);
      onRefresh();
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  return (
    <div>
      {canEdit && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Configure Dhaja Year</Button>
        </div>
      )}

      {dhajaRecords?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dhajaRecords.map((d, i) => (
            <Card key={d.id || i} className="p-4 group relative border hover:shadow bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-800">🚩 Year {d.year}</span>
                    <Badge variant={d.status === "BOOKED" ? "default" : "outline"} className="text-[9px]">
                      {d.status || "AVAILABLE"}
                    </Badge>
                  </div>
                  {d.dhajaDate && <div className="text-xs text-slate-500 font-mono-num mt-1">Date: {formatDate(d.dhajaDate)}</div>}
                  {d.descriptionEn && <div className="text-xs text-slate-655 mt-1.5 font-medium">{d.descriptionEn}</div>}
                </div>
                {canEdit && (
                  <button onClick={() => setDeleteTarget(d)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-650">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No Dhaja records" description="Add Dhaja records for this organization." icon={Flag} />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Dhaja Record</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Year *</Label>
                <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} min={1900} max={2100} />
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                  value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Dhaja Date</Label>
              <Input type="date" value={form.dhajaDate} onChange={(e) => setForm({ ...form, dhajaDate: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Description (English)</Label>
              <textarea rows={2} className="w-full mt-1 rounded-md border border-slate-205 bg-white px-3 py-2 text-sm focus:outline-none"
                value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} placeholder="Description in English…" />
            </div>
            <div>
              <Label className="text-xs">Description (Hindi/Gujarati)</Label>
              <textarea rows={2} className="w-full mt-1 rounded-md border border-slate-205 bg-white px-3 py-2 text-sm focus:outline-none"
                value={form.descriptionHi} onChange={(e) => setForm({ ...form, descriptionHi: e.target.value })} placeholder="हिंदी/गुजराती में विवरण…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Record"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Confirm open={!!deleteTarget} message={`Delete Dhaja record for ${deleteTarget?.year}?`} onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

/* ─── Chaturmas Tab ─────────────────────────────────────────────────────────── */
function ChaturmasTab({ chaturmasStays = [], apiPrefix, orgId, onRefresh, canEdit }) {
  const [open, setOpen] = useState(false);
  const [monks, setMonks] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    startDate: "",
    endDate: "",
    monkIds: [],
    sponsorIds: [],
    notes: ""
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (open) {
      api.get("/monks").then((r) => setMonks(r.data?.data?.items || r.data?.data || [])).catch(() => {});
      api.get("/members", { params: { pageSize: 200 } }).then((r) => setMembers(r.data?.data?.items || r.data?.data || [])).catch(() => {});
    }
  }, [open]);

  const save = async () => {
    if (!form.year || !form.startDate || !form.endDate) {
      toast.error("Year, Start Date, and End Date are required.");
      return;
    }
    setSaving(true);
    try {
      await api.post(`${apiPrefix}/${orgId}/chaturmas`, {
        year: Number(form.year),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        monkIds: form.monkIds,
        sponsorIds: form.sponsorIds,
        notes: form.notes
      });
      toast.success("Chaturmas stay record configured successfully.");
      setOpen(false);
      setForm({ year: new Date().getFullYear(), startDate: "", endDate: "", monkIds: [], sponsorIds: [], notes: "" });
      onRefresh();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const getStatus = (start, end) => {
    const today = new Date();
    const sDate = new Date(start);
    const eDate = new Date(end);
    if (today < sDate) return "Upcoming";
    if (today > eDate) return "Completed";
    return "Ongoing";
  };

  const doDelete = async () => {
    try {
      await api.delete(`${apiPrefix}/${orgId}/chaturmas/${deleteTarget.id}`);
      toast.success("Chaturmas stay removed.");
      setDeleteTarget(null);
      onRefresh();
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  return (
    <div>
      {canEdit && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Chaturmas Entry
          </Button>
        </div>
      )}

      {chaturmasStays.length > 0 ? (
        <div className="space-y-4">
          {chaturmasStays.map((c, i) => {
            const status = getStatus(c.startDate, c.endDate);
            return (
              <Card key={c.id || i} className="p-5 group relative border hover:shadow bg-white">
                <div className="flex items-start justify-between border-b pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-800">❄️ Chaturmas Stay Year {c.year}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        status === "Ongoing" ? "bg-orange-500 text-white" : status === "Completed" ? "bg-slate-200 text-slate-600" : "bg-blue-500 text-white"
                      }`}>{status}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono-num mt-1">Period: {formatDate(c.startDate)} to {formatDate(c.endDate)}</div>
                  </div>
                  {canEdit && (status !== "Completed" || isSuperAdmin) && (
                    <button onClick={() => setDeleteTarget(c)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="mt-3.5 space-y-3 text-xs">
                  {/* Monks */}
                  <div>
                    <span className="font-bold text-slate-700 block mb-1">🛕 Linked Monks & Sadhvis</span>
                    {c.monks?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {c.monks.map((m) => (
                          <Badge key={m.id} variant="secondary" className="text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-100">
                            {m.name || m.fullName} ({m.monkId || "JFMS108"})
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No monks linked to this Chaturmas.</span>
                    )}
                  </div>

                  {/* Sponsors */}
                  {c.sponsors?.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">💰 Chaturmas Sponsors</span>
                      <div className="flex flex-wrap gap-1.5">
                        {c.sponsors.map((sp) => (
                          <Badge key={sp.id} variant="outline" className="text-[10px] font-mono bg-slate-50">
                            {sp.fullName} ({sp.city || "Mumbai"}, {sp.state || "Maharashtra"})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {c.notes && (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600 italic">
                      Notes: {c.notes}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No Chaturmas stays configured" icon={Calendar} description="Onboard seasonal Chaturmas stay schedules." />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Configure Chaturmas Entry</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <Label className="text-xs">Chaturmas Year</Label>
                <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} min={2000} max={2100} />
              </div>
              <div>
                <Label className="text-xs">Start Date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">End Date</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>

            <div>
              <Label className="text-xs block mb-1.5">Link Monks & Sadhvis (Multiple Selection)</Label>
              <div className="max-h-28 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-white space-y-1 text-xs">
                {monks.map((m) => {
                  const checked = form.monkIds.includes(m.id);
                  return (
                    <label key={m.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                      <input type="checkbox" checked={checked} onChange={() => {
                        const next = checked ? form.monkIds.filter(x => x !== m.id) : [...form.monkIds, m.id];
                        setForm({ ...form, monkIds: next });
                      }} className="h-3.5 w-3.5 text-orange-500 rounded" />
                      <span>{m.fullName || m.name} ({m.publicId})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-xs block mb-1.5">Link Chaturmas Sponsors (Multiple Selection)</Label>
              <div className="max-h-28 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-white space-y-1 text-xs">
                {members.map((m) => {
                  const checked = form.sponsorIds.includes(m.id);
                  return (
                    <label key={m.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                      <input type="checkbox" checked={checked} onChange={() => {
                        const next = checked ? form.sponsorIds.filter(x => x !== m.id) : [...form.sponsorIds, m.id];
                        setForm({ ...form, sponsorIds: next });
                      }} className="h-3.5 w-3.5 text-orange-500 rounded" />
                      <span>{m.fullName} ({m.city}, {m.state})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-xs">Notes / Description (Optional)</Label>
              <textarea rows={2} className="w-full mt-1 rounded-md border border-slate-205 bg-white px-3 py-2 text-sm focus:outline-none"
                value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Chaturmas details..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Chaturmas Stays"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Confirm open={!!deleteTarget} message="Delete this Chaturmas stay?" onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

/* ─── Edit Org Dialog — all fields ─────────────────────────────────────────── */
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
  "Vaghera Gaccha", "Vahediya Gaccha", "Siddhapura Gaccha", "Ghoghari Gaccha", "Nigamiya Gaccha",
  "Punamiya Gaccha", "Varhadiya Gaccha", "Namila Gaccha"
];

const MemberSelect = ({ label, value, onChange, placeholder = "Select Member..." }) => {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  useEffect(() => {
    api.get("/members", { params: { pageSize: 500 } })
      .then((r) => setMembers(r.data?.data?.items || r.data?.data || []))
      .catch(() => {});
  }, []);
  const filtered = members.filter(m => 
    m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    m.mobile?.includes(search) ||
    m.publicId?.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div>
      <Label className="text-xs font-semibold text-slate-600">{label}</Label>
      <div className="mt-1 space-y-1">
        <Input placeholder="Type name / mobile / Member ID to search..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 text-xs bg-white" />
        <select className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
          value={value || ""} onChange={e => onChange(e.target.value)}>
          <option value="">{placeholder}</option>
          {filtered.map(m => (
            <option key={m.id} value={m.id}>
              {m.fullName} ({m.publicId || "No ID"}) - {m.mobile || "No phone"}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

function EditOrgDialog({ open, onClose, org, apiPrefix, onSaved, entityLabel }) {
  const [tab, setTab] = useState("basic");
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [bhagwans, setBhagwans] = useState([]);
  const { isSuperAdmin } = useAuth();

  // Custom deity creation states
  const [createDeityOpen, setCreateDeityOpen] = useState(false);
  const [deityName, setDeityName] = useState("");
  const [deityCategory, setDeityCategory] = useState("24 Tirthankars");
  const [deitySaving, setDeitySaving] = useState(false);

  useEffect(() => {
    api.get("/master-data/bhagwans").then((r) => setBhagwans(r.data?.data || [])).catch(() => {});
  }, []);

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

  useEffect(() => {
    if (org && open) {
      setForm({
        name: org.name || "",
        shortName: org.shortName || "",
        trustName: org.trustName || "",
        trustRegistrationNumber: org.trustRegistrationNumber || "",
        history: org.history || "",
        addressLine: org.addressLine || "",
        city: org.city || "",
        state: org.state || "",
        country: org.country || "India",
        pincode: org.pincode || "",
        phone: org.phone || "",
        website: org.website || "",
        googleMapsLink: org.googleMapsLink || "",
        establishedDate: org.establishedDate ? org.establishedDate.slice(0, 10) : "",
        templeType: org.templeType || "SHIKHAR_BADDHA",
        sect: org.sect || "Shwetambar",
        subSect: org.subSect || "Murtipujak",
        gacchaName: org.gacchaName || "",
        mulNayakBhagwanId: org.mulNayakBhagwanId || "",
        muritCount: org.muritCount || "",
        tithiCalendar: org.tithiCalendar || "Gujarati",
        upiId: org.upiId || "",
        bankAccount: org.bankAccount || "",
        bankIfsc: org.bankIfsc || "",
        hasBhojanshala: org.hasBhojanshala ?? false,
        hasUpashray: org.hasUpashray ?? false,
        hasEventHall: org.hasEventHall ?? false,
        hasDharamshala: org.hasDharamshala ?? false,
        hasPathshala: org.hasPathshala ?? false,
        upashrayLocation: org.upashrayLocation || "Within Property",
        eventHallPurpose: org.eventHallPurpose || "Available for Booking",
        eventHallBookingLink: org.eventHallBookingLink || "",
        bhojanshalaBreakfast: org.bhojanshalaBreakfast || "07:00 AM - 08:30 AM",
        bhojanshalaLunch: org.bhojanshalaLunch || "11:30 AM - 01:00 PM",
        bhojanshalaDinner: org.bhojanshalaDinner || "05:00 PM - 06:00 PM",
        bhojanshalaMealType: org.bhojanshalaMealType || "Free",
        bhojanshalaAvailability: org.bhojanshalaAvailability || "Daily",
        bhojanshalaContact: org.bhojanshalaContact || "",
        dharamshalaRooms: org.dharamshalaRooms || "Both",
        dharamshalaOffice: org.dharamshalaOffice || "09:00 AM - 08:00 PM",
        dharamshalaPhone: org.dharamshalaPhone || "",
        dharamshalaContact: org.dharamshalaContact || "",
        dharamshalaOnline: org.dharamshalaOnline || "No",
        pathshalaTimings: org.pathshalaTimings || "04:30 PM - 06:00 PM",
        pathshalaDays: org.pathshalaDays || "Sat, Sun",
        pathshalaTeacher: org.pathshalaTeacher || "",
        morningStart: org.morningStart || "06:00 AM",
        morningEnd: org.morningEnd || "12:00 PM",
        eveningStart: org.eveningStart || "05:30 PM",
        eveningEnd: org.eveningEnd || "09:00 PM",
        pakshalStart: org.pakshalStart || "06:30 AM",
        pakshalEnd: org.pakshalEnd || "08:00 AM",
        poojaStart: org.poojaStart || "07:00 AM",
        poojaEnd: org.poojaEnd || "08:30 AM",
        aartiMorning: org.aartiMorning || "08:30 AM",
        aartiEvening: org.aartiEvening || "07:30 PM",
        is80gEligible: org.is80gEligible ?? false,
        csrEligible: org.csrEligible ?? false,
        facilities: org.facilities || [],
        preferredCurrency: org.preferredCurrency || "INR (₹)",
        // New Dharamshala fields
        landmark: org.landmark || "",
        railwayStation: org.railwayStation || "",
        district: org.district || "",
        hasTempleInside: org.hasTempleInside ?? false,
        templeMulNayakName: org.templeMulNayakName || "",
        templeMulNayakImageUrl: org.templeMulNayakImageUrl || "",
        templeTithiCalendar: org.templeTithiCalendar || "Gujarati",
        templeOpeningHours: org.templeOpeningHours || "",
        templePakshalStart: org.templePakshalStart || "",
        templePoojaStart: org.templePoojaStart || "",
        templeAartiEvening: org.templeAartiEvening || "",
        buildings: org.buildings || [],
        checkInTime: org.checkInTime || "12:00 PM",
        checkOutTime: org.checkOutTime || "11:00 AM",
        advanceBookingRequired: org.advanceBookingRequired ?? false,
        onlineBookingAvailable: org.onlineBookingAvailable ?? false,
        dharamshalaStatus: org.dharamshalaStatus || "High Availability",
        adminBlockedRooms: org.adminBlockedRooms || "",
        emergencyContact: org.emergencyContact || "",
        caretakerDetails: org.caretakerDetails || "",
        rulesText: org.rulesText || "",
        primaryContactMemberId: org.primaryContactMemberId || "",
        secondaryContactNumber: org.secondaryContactNumber || "",
        contactMobileVerified: org.contactMobileVerified ?? false,
        contactWhatsAppVerified: org.contactWhatsAppVerified ?? false,
        contactEmailVerified: org.contactEmailVerified ?? false,
        primaryContactPreference: org.primaryContactPreference || "Mobile",
        trusteesList: org.trusteesList || [],
        volunteersList: org.volunteersList || [],
        instaLink: org.instaLink || "",
        facebookLink: org.facebookLink || "",
        youtubeLink: org.youtubeLink || "",
        donationQrCodeUrl: org.donationQrCodeUrl || "",
        bankName: org.bankName || "",
        bankBranch: org.bankBranch || ""
      });
    }
  }, [org, open]);

  // Sync currency automatically on country change
  useEffect(() => {
    if (form.country) {
      const defaultCur = REGIONS_CURRENCIES[form.country] || "USD ($)";
      setForm((f) => ({ ...f, preferredCurrency: defaultCur }));
    }
  }, [form.country]);

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

  const field = (label, key, type = "text", placeholder = "") => (
    <div>
      <Label className="text-xs font-semibold text-slate-655">{label}</Label>
      <Input className="mt-1 bg-white h-9" type={type} value={form[key] || ""} placeholder={placeholder}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
    </div>
  );

  const toggle = (label, key) => (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input type="checkbox" className="h-4.5 w-4.5 text-orange-500 rounded border-slate-350" checked={!!form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.checked })} />
      <span className="text-sm font-bold text-slate-700">{label}</span>
    </label>
  );

  const save = async () => {
    setLoading(true);
    try {
      await api.patch(`${apiPrefix}/${org.id}`, {
        ...form,
        muritCount: form.muritCount ? Number(form.muritCount) : undefined,
        establishedDate: form.establishedDate ? new Date(form.establishedDate).toISOString() : undefined,
      });
      toast.success("Details updated successfully.");
      onSaved?.();
      onClose();
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setLoading(false); }
  };

  const isDharamshala = entityLabel === "Dharamshala";

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl shadow-2xl bg-white border border-slate-100 h-[75vh] flex flex-col">
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Left panel tabs selector */}
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

          {/* Form Content body */}
          <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-24">
              
              {tab === "basic" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">
                    {isDharamshala ? "🏨 Basic Dharamshala Info" : "🛕 Basic & Trust Details"}
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
                      <div>
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
                      </div>
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
                    <p className="text-[10px] text-slate-400 italic">
                      * Note: Rooms blocked or put on hold by the Admin will be displayed as "booked" to members, but remain flagged as Admin Blocked in backend control layers.
                    </p>
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
                  <p className="text-[10px] text-slate-400 italic">
                    * Linking members as volunteers will automatically display "Volunteer at this Dharamshala" on their public member profile card.
                  </p>
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
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={save} disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">{loading ? "Saving…" : "Save Changes"}</Button>
            </div>
          </div>
        </div>
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
                <Label className="text-[10px] uppercase font-bold text-slate-400">Category *</Label>
                <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                  value={deityCategory} onChange={(e) => setDeityCategory(e.target.value)}>
                  <option value="24 Tirthankars">24 Tirthankars</option>
                  <option value="Others">Others</option>
                </select>
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
      </DialogContent>
    </Dialog>
  );
}

/* ─── Main OrgDetailPage ────────────────────────────────────────────────────── */
export default function OrgDetailPage({ basePath, entityLabel, apiPrefix }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const [org, setOrg]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr]       = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const logoFileRef = useRef();
  const [logoUploading, setLogoUploading] = useState(false);

  // Incorrect Info Ticket dialog state
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketField, setTicketField] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketSaving, setTicketSaving] = useState(false);

  const loadOrg = () => {
    setLoading(true);
    api.get(`${apiPrefix}/${id}`)
      .then((res) => setOrg(res.data?.data || null))
      .catch((e) => setErr(extractErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrg();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, apiPrefix]);

  const follow = async () => {
    try { await api.post(`${apiPrefix}/${id}/follow`); toast.success(`Following this ${entityLabel.toLowerCase()}.`); }
    catch (e) { toast.error(extractErrorMessage(e)); }
  };

  const uploadLogo = async (file) => {
    setLogoUploading(true);
    try {
      const token = localStorage.getItem("jinanam_access_token");
      const fd = new FormData(); fd.append("logo", file);
      const res = await fetch(`${API_BASE}${apiPrefix}/${id}/logo`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      if (!res.ok) throw new Error();
      toast.success("Logo updated.");
      loadOrg();
    } catch { toast.error("Logo upload failed."); }
    finally { setLogoUploading(false); }
  };

  const submitIncorrectInfoTicket = async () => {
    if (!ticketField || !ticketDesc) {
      toast.error("Please provide the incorrect field and a description.");
      return;
    }
    setTicketSaving(true);
    try {
      const payload = {
        title: `Incorrect Info: ${entityLabel} (${org?.publicId})`,
        category: "INCORRECT_INFO_REPORT",
        description: `Field: ${ticketField}\nDetails: ${ticketDesc}`,
        priority: "MEDIUM"
      };
      await api.post("/tickets", payload);
      toast.success("Support ticket registered successfully. You can track status in the app.");
      setTicketOpen(false);
      setTicketField("");
      setTicketDesc("");
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setTicketSaving(false);
    }
  };

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );

  if (err) return <EmptyState title="Unable to load" description={err} />;
  if (!org) return <EmptyState title="Not found" />;

  const isTemple = entityLabel === "Temple";
  const isDharamshala = entityLabel === "Dharamshala";
  const accentClass = isTemple ? "from-orange-500 to-amber-400" : isDharamshala ? "from-teal-600 to-emerald-500" : "from-blue-600 to-indigo-500";
  const accentColor = isTemple ? "#E64E0A" : isDharamshala ? "#0D9488" : "#2563EB";
  const canEdit = isSuperAdmin;

  return (
    <div data-testid="org-detail-page">
      {/* Back */}
      <button onClick={() => navigate(basePath)}
        className="flex items-center text-xs text-muted-foreground hover:text-foreground mb-5 group">
        <ChevronLeft className="h-3.5 w-3.5 mr-1 group-hover:-translate-x-0.5 transition-transform" />
        Back to {entityLabel}s
      </button>

      {/* Hero Card — premium */}
      <div className={`relative rounded-2xl overflow-hidden mb-6 shadow-xl`}>
        {/* Gradient top banner */}
        <div className={`h-28 w-full bg-gradient-to-r ${accentClass} relative`}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="absolute inset-0 flex items-center justify-end px-6 gap-3">
            <Button variant="outline" onClick={() => setTicketOpen(true)} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <Flag className="h-4 w-4 mr-2" /> Report Error
            </Button>
            {!isSuperAdmin && (
              <Button variant="outline" onClick={follow} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                <Heart className="h-4 w-4 mr-2" /> Follow
              </Button>
            )}
            {canEdit && (
              <Button onClick={() => setEditOpen(true)} className="bg-white text-slate-800 hover:bg-white/90">
                <Pencil className="h-4 w-4 mr-2" /> Edit Details
              </Button>
            )}
          </div>
        </div>

        {/* Content below banner */}
        <div className="bg-white px-6 pb-6">
          <div className="flex gap-5 -mt-12">
            {/* Logo */}
            <div className="relative shrink-0">
              <div className="h-24 w-24 rounded-2xl border-4 border-white shadow-lg bg-slate-100 overflow-hidden flex items-center justify-center cursor-pointer"
                onClick={() => canEdit && logoFileRef.current?.click()}>
                {logoUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                ) : org.logoUrl ? (
                  <img src={org.logoUrl.startsWith("http") ? org.logoUrl : `${STATIC_URL}${org.logoUrl}`}
                    alt="" className="h-full w-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; }} />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Landmark className="h-8 w-8 text-slate-400" />
                    {canEdit && <span className="text-[9px] text-slate-400">Upload logo</span>}
                  </div>
                )}
              </div>
              {canEdit && (
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center shadow cursor-pointer"
                  onClick={() => logoFileRef.current?.click()}>
                  <Camera className="h-3 w-3 text-white" />
                </div>
              )}
              <input ref={logoFileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f); }} />
            </div>

            {/* Info */}
            <div className="pt-14">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-800 leading-tight">{org.name}</h2>
                <Badge variant="secondary" className="font-mono text-xs text-orange-655 tracking-wider bg-orange-50 font-bold border border-orange-100">
                  {org.publicId}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-orange-500" /> {org.addressLine || [org.city, org.state].filter(Boolean).join(", ")}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-5 border-slate-100">
            {[
              ["Followers",      org.followerCount || 0, "❤️"],
              ["Dhaja Records", org.dhajaRecords?.length || 0, "🚩"],
              ["Average Rating", org.averageRating || "—", "⭐"],
              ["Volunteers",     org.volunteerCount || 0, "🤝"]
            ].map(([label, count, emoji]) => (
              <div key={label} className="text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-lg font-black text-slate-800">{emoji} {count}</div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-extrabold mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList className="mb-5 flex-wrap h-auto gap-1 bg-slate-100/80 p-1 rounded-xl">
          {(isDharamshala
            ? ["info", "accommodations", "food", "trustees", "volunteers", "rules", "bank", "gallery", "reviews"]
            : ["info", "gallery", "trustees", "contacts", "notices", "reviews", "dhaja", "chaturmas"]
          ).map((tab) => {
            if ((entityLabel !== "Temple" && entityLabel !== "Jain Center") && tab === "chaturmas") return null;
            return (
              <TabsTrigger key={tab} value={tab} data-testid={`tab-${tab}`}
                className="capitalize rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-bold py-2 px-3">
                {tab === "dhaja" ? "🚩 Dhaja" : tab === "gallery" ? "🖼 Gallery" : tab === "trustees" ? "👥 Trustees" :
                 tab === "contacts" ? "📞 Contacts" : tab === "notices" ? "📢 Notices" : tab === "reviews" ? "⭐ Reviews" :
                 tab === "chaturmas" ? "❄️ Chaturmas" : tab === "accommodations" ? "🏨 Rooms & Rates" :
                 tab === "food" ? "🥗 Bhojanalay" : tab === "volunteers" ? "🤝 Volunteers" :
                 tab === "rules" ? "📋 Safety & Rules" : tab === "bank" ? "💰 Banking" : "ℹ Info"}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* INFO */}
        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Primary metadata list */}
            <Card className="p-6 rounded-2xl border-border">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-4">
                {isDharamshala ? "🏨 Dharamshala Basic Details" : "Basic Information"}
              </h3>
              <div className="grid grid-cols-2 gap-x-10 gap-y-3.5">
                {isDharamshala ? (
                  [
                    ["Public ID",       org.publicId],
                    ["Community",       org.sect || "Shwetambar"],
                    ["Sub-Community",   org.subSect || "—"],
                    ["Gaccha Name",     org.gacchaName || "—"],
                    ["Trust Name",      org.trustName],
                    ["Trust Reg. No.",  org.trustRegistrationNumber],
                    ["Established",     formatDate(org.establishedDate)],
                    ["City",            org.city],
                    ["State",           org.state],
                    ["Country",         org.country],
                    ["Pincode",         org.pincode],
                    ["General Phone",   org.phone],
                    ["Website",         org.website],
                    ["Landmark",        org.landmark],
                    ["Railway Station", org.railwayStation],
                    ["District",        org.district],
                  ].filter(([, v]) => v != null && v !== "").map(([k, v]) => (
                    <div key={k} className="flex flex-col">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">{k}</div>
                      <div className="text-sm mt-0.5 font-medium text-slate-800">{v}</div>
                    </div>
                  ))
                ) : (
                  [
                    ["Public ID",       org.publicId],
                    ["Sect",            org.sect || "Shwetambar"],
                    ["Sub-Sect",        org.subSect || "Murtipujak"],
                    ["Gaccha Name",     org.gacchaName || "—"],
                    ["Mul Nayak",       org.mulNayakBhagwan?.name || "—"],
                    ["Established",     formatDate(org.establishedDate)],
                    ["City",            org.city],
                    ["State",           org.state],
                    ["Country",         org.country],
                    ["Pincode",         org.pincode],
                    ["Phone",           org.phone],
                    ["Website",         org.website],
                    ["Bhojanshala",     org.hasBhojanshala ? "Yes ✓" : "No"],
                    ["Upashray",        org.hasUpashray ? "Yes ✓" : "No"],
                    ["Event Hall",      org.hasEventHall ? "Yes ✓" : "No"],
                    ["80G Tax-Exempt",  org.is80gEligible ? "Yes ✓" : "No"],
                    ["CSR Eligible",    org.csrEligible ? "Yes ✓" : "No"],
                    ["Trust Name",      org.trustName],
                    ["Trust Reg. No.",  org.trustRegistrationNumber],
                    ["UPI ID",          org.upiId],
                    ["Display Currency", org.preferredCurrency || "INR (₹)"],
                    ["Temple Type",     org.templeType?.replace(/_/g, " ")],
                  ].filter(([, v]) => v != null && v !== "").map(([k, v]) => (
                    <div key={k} className="flex flex-col">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">{k}</div>
                      <div className="text-sm mt-0.5 font-medium text-slate-800">{v}</div>
                    </div>
                  ))
                )}
              </div>

              {org.facilities?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-3">Additional Facilities</div>
                  <div className="flex flex-wrap gap-2">
                    {org.facilities.map((f) => (
                      <Badge key={f} variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" /> {f}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {org.history && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-2">History & Background</div>
                  <p className="text-sm leading-relaxed text-slate-700 font-medium">{org.history}</p>
                </div>
              )}
            </Card>

            {/* Timing Slots or Directions Card */}
            <Card className="p-6 rounded-2xl border-border space-y-4">
              {isDharamshala ? (
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">📍 Directions & Map</h3>
                  {org.googleMapsLink ? (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">Find us on Google Maps for step-by-step directions to our property:</p>
                      <Button onClick={() => window.open(org.googleMapsLink, "_blank")} className="bg-teal-655 hover:bg-teal-700 text-white font-bold text-xs gap-2">
                        <MapPin className="h-4 w-4" /> Open in Maps
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No GPS coordinates or Maps link registered yet.</p>
                  )}
                  {org.hasTempleInside && (
                    <div className="border-t pt-4 space-y-2">
                      <h4 className="text-xs font-bold text-slate-750 flex items-center gap-1.5">🛕 Inside Temple Available</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="font-semibold text-slate-500 block">Bhagwan</span> <span className="font-bold text-slate-800">{org.templeMulNayakName || "—"}</span></div>
                        <div><span className="font-semibold text-slate-500 block">Type</span> <span className="font-bold text-slate-800">{org.templeType || "—"}</span></div>
                        <div><span className="font-semibold text-slate-500 block">Pakshal Timings</span> <span className="font-bold text-slate-800">{org.templePakshalStart || "—"}</span></div>
                        <div><span className="font-semibold text-slate-500 block">Morning Pooja</span> <span className="font-bold text-slate-800">{org.templePoojaStart || "—"}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">🕒 Standard Temple Timings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Morning Timing</span>
                      <span className="text-sm font-semibold text-slate-800 block mt-1">{org.morningStart || "06:00 AM"} – {org.morningEnd || "12:00 PM"}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Evening Timing</span>
                      <span className="text-sm font-semibold text-slate-800 block mt-1">{org.eveningStart || "05:30 PM"} – {org.eveningEnd || "09:00 PM"}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Pakshal Timing</span>
                      <span className="text-sm font-semibold text-slate-800 block mt-1">{org.pakshalStart || "06:30 AM"} – {org.pakshalEnd || "08:00 AM"}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Morning Aarti</span>
                      <span className="text-sm font-semibold text-slate-800 block mt-1">{org.aartiMorning || "08:30 AM"}</span>
                    </div>
                  </div>

                  {org.hasBhojanshala && (
                    <div className="bg-orange-50/50 p-4 border border-orange-100 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-orange-850 flex items-center gap-1.5"><Coffee className="h-4 w-4" /> Bhojanshala Stay details</span>
                      <div className="text-xs text-orange-700 leading-relaxed space-y-1">
                        <p>• Lunch: {org.bhojanshalaLunch || "11:30 AM to 01:30 PM"}</p>
                        <p>• Navkarsi Dinner: {org.bhojanshalaDinner || "Up to 20 minutes before Sunset"}</p>
                        <p className="font-bold text-[10px] uppercase tracking-wider text-orange-600 mt-2">✓ Rule: "Please call and confirm your visit at least one day prior."</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>

          </div>

          {/* Disclaimer at bottom */}
          <div className="bg-slate-100 p-4 rounded-xl border text-[11px] text-slate-500 leading-relaxed font-semibold italic text-center">
            {isDharamshala ? (
              <span>
                📌 Disclaimer: “All the above timings, charges, and availability are subject to change. Kindly contact the {org.name} directly to confirm before planning your stay.”
              </span>
            ) : (
              <span>
                📌 Disclaimers: "All the above timings, facilities, contact details, and other information are subject to change. Visitors are advised to contact the respective Temple / Jain Centre directly to confirm the latest information before planning their visit."
              </span>
            )}
          </div>
        </TabsContent>

        {isDharamshala && (
          <>
            <TabsContent value="accommodations" className="space-y-4">
              <Card className="p-6 rounded-2xl border-border space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">🏢 Accommodations & Availability</h3>
                  <Badge className="bg-teal-655 text-white">{org.dharamshalaStatus || "High Availability"}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Check-in Time</span>
                    <span className="text-sm font-semibold text-slate-800 block mt-1">{org.checkInTime || "12:00 PM"}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Check-out Time</span>
                    <span className="text-sm font-semibold text-slate-800 block mt-1">{org.checkOutTime || "11:00 AM"}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Advance Booking</span>
                    <span className="text-sm font-semibold text-slate-800 block mt-1">{org.advanceBookingRequired ? "Yes ✓" : "No"}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Online Booking</span>
                    <span className="text-sm font-semibold text-slate-800 block mt-1">{org.onlineBookingAvailable ? "Available ✓" : "Off-line Only"}</span>
                  </div>
                </div>

                {org.adminBlockedRooms > 0 && (
                  <div className="bg-slate-100 p-3.5 border rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-500" /> Admin blocked or put on hold: {org.adminBlockedRooms} rooms. (Visible only in admin dashboard panel)
                  </div>
                )}

                {/* Buildings List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">🏢 Buildings & Rooms Registry</h4>
                  {org.buildings && org.buildings.length > 0 ? (
                    org.buildings.map((b, bIdx) => (
                      <div key={b.id || bIdx} className="bg-white border rounded-xl p-4 space-y-3 shadow-sm">
                        <div className="flex justify-between items-center border-b pb-2">
                          <span className="font-bold text-sm text-slate-850">🏢 {b.name}</span>
                          {b.imageUrl && <span className="text-[10px] text-teal-600 font-semibold">Image Uploaded ✓</span>}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {(b.roomTypes || []).map((r, rIdx) => (
                            <div key={r.id || rIdx} className="bg-slate-50 p-3 rounded-lg border text-xs space-y-1.5">
                              <div className="flex justify-between font-bold text-slate-800">
                                <span>{r.name}</span>
                                <Badge variant="outline" className="text-[9px] scale-90 origin-right">{r.category} | {r.type}</Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-500 font-medium pt-1">
                                <div>Rooms: <span className="font-bold text-slate-800">{r.roomCount}</span></div>
                                <div>Capacity: <span className="font-bold text-slate-800">{r.bedCapacity} beds</span></div>
                                <div>Rate: <span className="font-bold text-slate-800">₹{r.charges} / {r.chargesType}</span></div>
                                <div>Attached Bath: <span className="font-bold text-slate-800">{r.attachedBathroom}</span></div>
                              </div>
                              {r.amenities?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2 pt-1 border-t border-slate-100">
                                  {r.amenities.map(a => <Badge key={a} variant="outline" className="text-[9px] bg-white">{a}</Badge>)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-xs text-slate-400 py-6">No building accommodation records configured.</div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="food" className="space-y-4">
              <Card className="p-6 rounded-2xl border-border space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b pb-2">🥗 Bhojanalay Details</h3>
                {org.hasBhojanshala ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Breakfast</span>
                        <span className="text-sm font-semibold text-slate-800 block mt-1">{org.bhojanshalaBreakfast || "—"}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Lunch</span>
                        <span className="text-sm font-semibold text-slate-800 block mt-1">{org.bhojanshalaLunch || "—"}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Dinner</span>
                        <span className="text-sm font-semibold text-slate-800 block mt-1">{org.bhojanshalaDinner || "—"}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs border-t pt-4">
                      <div><span className="text-slate-500 font-semibold block">Availability Status</span> <span className="font-bold text-slate-800 text-sm">{org.bhojanshalaAvailability || "Daily"}</span></div>
                      <div><span className="text-slate-500 font-semibold block">Food Contact / Manager</span> <span className="font-bold text-slate-800 text-sm">{org.bhojanshalaContact || "Caretaker / Office Manager"}</span></div>
                    </div>
                    <div className="bg-orange-50 p-4 border border-orange-100 rounded-xl text-xs text-orange-850 font-semibold text-center italic">
                      📢 Auto-Message Warning Rule: "Please call and confirm one day prior."
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-6 text-center">Bhojanshala facility is not available inside the property.</p>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="volunteers" className="space-y-4">
              <Card className="p-6 rounded-2xl border-border space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b pb-2">🤝 Volunteer Members Registry</h3>
                {org.volunteersList && org.volunteersList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {org.volunteersList.map((v, i) => (
                      <Card key={i} className="p-3 bg-slate-50 border rounded-xl flex flex-col">
                        <span className="text-xs font-bold text-slate-800">{v.member?.fullName || "Linked Volunteer"}</span>
                        <span className="text-[10px] text-slate-400 mt-1 uppercase font-mono">ID: {v.member?.publicId || "—"}</span>
                        <span className="text-[10px] text-teal-655 font-bold mt-1 bg-teal-50 px-2 py-0.5 rounded w-max">Active Volunteer</span>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-6 text-center">No volunteer members associated with this Dharamshala.</p>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="rules" className="space-y-4">
              <Card className="p-6 rounded-2xl border-border space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b pb-2">📋 Stay Guidelines & Rules</h3>
                {org.rulesText ? (
                  <p className="text-xs text-slate-655 font-medium whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border">
                    {org.rulesText}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic py-6 text-center">No rules or guidelines defined yet.</p>
                )}
                <div className="grid grid-cols-2 gap-4 border-t pt-4 text-xs">
                  <div><span className="text-slate-500 font-semibold block">🚨 Emergency Contact Number</span> <span className="font-bold text-slate-800">{org.emergencyContact || "—"}</span></div>
                  <div><span className="text-slate-500 font-semibold block">Caretaker / Manager Details</span> <span className="font-bold text-slate-800">{org.caretakerDetails || "—"}</span></div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="bank" className="space-y-4">
              <Card className="p-6 rounded-2xl border-border space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b pb-2">💰 Banking & Tax Exemption Details</h3>
                <div className="grid grid-cols-2 gap-x-10 gap-y-3.5 text-xs">
                  <div><span className="text-[10px] uppercase font-bold text-slate-400 block">Bank Account Number</span> <span className="font-bold text-slate-800 text-sm">{org.bankAccount || "—"}</span></div>
                  <div><span className="text-[10px] uppercase font-bold text-slate-400 block">Bank Name</span> <span className="font-bold text-slate-800 text-sm">{org.bankName || "—"}</span></div>
                  <div><span className="text-[10px] uppercase font-bold text-slate-400 block">Branch Name</span> <span className="font-bold text-slate-800 text-sm">{org.bankBranch || "—"}</span></div>
                  <div><span className="text-[10px] uppercase font-bold text-slate-400 block">IFSC Code</span> <span className="font-bold text-slate-800 text-sm">{org.bankIfsc || "—"}</span></div>
                  <div><span className="text-[10px] uppercase font-bold text-slate-400 block">UPI ID</span> <span className="font-bold text-slate-800 text-sm">{org.upiId || "—"}</span></div>
                  <div><span className="text-[10px] uppercase font-bold text-slate-400 block">Preferred display Currency</span> <span className="font-bold text-slate-800 text-sm">{org.preferredCurrency || "INR (₹)"}</span></div>
                </div>
                <div className="flex flex-wrap gap-4 mt-2 bg-slate-50 p-3.5 border rounded-xl text-xs font-semibold">
                  <div>80G Tax-Exempt Status: <Badge variant="outline" className={org.is80gEligible ? "text-green-600 bg-green-50" : "text-slate-400"}>{org.is80gEligible ? "Eligible ✓" : "No"}</Badge></div>
                  <div>CSR Charity Funding: <Badge variant="outline" className={org.csrEligible ? "text-green-600 bg-green-50" : "text-slate-400"}>{org.csrEligible ? "Eligible ✓" : "No"}</Badge></div>
                </div>
                {org.donationQrCodeUrl && (
                  <div className="border-t pt-4 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Scan to Donate UPI QR Code</span>
                    <img src={org.donationQrCodeUrl} className="mx-auto h-32 w-32 border p-1 bg-white rounded-lg shadow-sm" alt="Donation QR Code" />
                  </div>
                )}
              </Card>
            </TabsContent>
          </>
        )}

        <TabsContent value="gallery">
          <GalleryTab images={org.gallery} apiPrefix={apiPrefix} orgId={org.id} onRefresh={loadOrg} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="trustees">
          <TrusteesTab trustees={org.trustees} apiPrefix={apiPrefix} orgId={org.id} onRefresh={loadOrg} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="contacts">
          <ContactsTab contacts={org.contacts} apiPrefix={apiPrefix} orgId={org.id} onRefresh={loadOrg} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="notices">
          <NoticesTab notices={org.notices} apiPrefix={apiPrefix} orgId={org.id} onRefresh={loadOrg} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewsTab reviews={org.reviews} apiPrefix={apiPrefix} orgId={org.id} onRefresh={loadOrg} isSuperAdmin={isSuperAdmin} />
        </TabsContent>

        <TabsContent value="dhaja">
          <DhajaTab dhajaRecords={org.dhajaRecords} apiPrefix={apiPrefix} orgId={org.id} onRefresh={loadOrg} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="chaturmas">
          <ChaturmasTab chaturmasStays={org.chaturmasStays} apiPrefix={apiPrefix} orgId={org.id} onRefresh={loadOrg} canEdit={canEdit} />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <EditOrgDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        org={org}
        apiPrefix={apiPrefix}
        onSaved={loadOrg}
        entityLabel={entityLabel}
      />

      {/* Report Incorrect Info Dialog */}
      <Dialog open={ticketOpen} onOpenChange={setTicketOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <AlertTriangle className="h-5 w-5 text-orange-500" /> Report Incorrect Information
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs">Which field/section is incorrect?</Label>
              <select className="w-full mt-1 h-9 rounded-md border border-slate-205 bg-white px-3 text-sm focus:outline-none"
                value={ticketField} onChange={(e) => setTicketField(e.target.value)}>
                <option value="">Select section...</option>
                <option value="Timings">Temple timings</option>
                <option value="Facilities">Facilities list</option>
                <option value="Bhojanshala">Bhojanshala details</option>
                <option value="Trustees">Trustees roster</option>
                <option value="Address/Maps">Address or Maps location</option>
                <option value="Other">Other details</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Correct Information Details</Label>
              <textarea rows={4} className="w-full mt-1 rounded-md border border-slate-205 bg-white px-3 py-2 text-sm focus:outline-none"
                value={ticketDesc} onChange={(e) => setTicketDesc(e.target.value)} placeholder="Please describe the correct details..." />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setTicketOpen(false)}>Cancel</Button>
            <Button onClick={submitIncorrectInfoTicket} disabled={ticketSaving} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">{ticketSaving ? "Submitting…" : "Report Error"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
