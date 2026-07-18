import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Image as BannerIcon, Plus, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM = { title: "", imageUrl: "", redirectUrl: "", displayOrder: "0" };

export default function BannersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/banners");
      setRows(res.data?.data || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setOpenDialog(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      title: row.title,
      imageUrl: row.imageUrl,
      redirectUrl: row.redirectUrl || "",
      displayOrder: String(row.displayOrder ?? 0),
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.imageUrl) {
      toast.error("Title and Image URL are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        imageUrl: form.imageUrl,
        redirectUrl: form.redirectUrl || undefined,
        displayOrder: parseInt(form.displayOrder) || 0,
      };
      if (editing) {
        await api.patch(`/banners/${editing.id}`, payload);
        toast.success("Banner updated.");
      } else {
        await api.post("/banners", payload);
        toast.success("Banner added.");
      }
      setOpenDialog(false);
      load();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/banners/${id}`);
      toast.success("Banner removed.");
      load();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (row) => {
    try {
      await api.patch(`/banners/${row.id}`, { isActive: !row.isActive });
      toast.success(`Banner ${row.isActive ? "deactivated" : "activated"}.`);
      load();
    } catch (e) {
      toast.error(extractErrorMessage(e));
    }
  };

  const columns = [
    {
      key: "imageUrl", header: "Preview", width: 80,
      render: (r) => (
        <div className="h-10 w-16 bg-slate-100 rounded overflow-hidden">
          <img src={r.imageUrl} alt={r.title} className="h-full w-full object-cover" />
        </div>
      ),
    },
    {
      key: "title", header: "Banner Title",
      render: (r) => <span className="font-semibold text-slate-800">{r.title}</span>,
    },
    {
      key: "redirectUrl", header: "Redirects To",
      render: (r) => r.redirectUrl ? (
        <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />{r.redirectUrl}
        </span>
      ) : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      key: "order", header: "Position",
      render: (r) => <Badge variant="secondary">#{r.displayOrder}</Badge>,
    },
    {
      key: "active", header: "Active",
      render: (r) => (
        <Switch checked={r.isActive} onCheckedChange={() => toggleActive(r)} />
      ),
    },
    {
      key: "actions", header: "", width: 80,
      render: (r) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm" variant="ghost"
            disabled={deletingId === r.id}
            onClick={() => handleDelete(r.id)}
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div data-testid="banners-page">
      <PageHeader
        title="Promotional Banners"
        subtitle="Configure hero slideshow banners displayed on the mobile app home screen."
        actions={
          <Button onClick={openCreate} data-testid="banners-create-btn">
            <Plus className="h-4 w-4 mr-2" /> Add Banner
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={BannerIcon}
          title="No banners configured"
          description="Add your first promotional banner to show on the mobile app home screen."
          action={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Banner</Button>}
        />
      ) : (
        <DataTable columns={columns} rows={rows} loading={false} testId="banners-table" />
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Banner" : "Add Home Screen Banner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Paryushan Special Live Streams"
                data-testid="banner-title-input"
              />
            </div>
            <div>
              <Label className="text-xs">Image URL *</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/banner.png"
                data-testid="banner-imageurl-input"
              />
            </div>
            <div>
              <Label className="text-xs">Redirect Link / Route</Label>
              <Input
                value={form.redirectUrl}
                onChange={(e) => setForm({ ...form, redirectUrl: e.target.value })}
                placeholder="/events or website URL"
                data-testid="banner-redirect-input"
              />
            </div>
            <div>
              <Label className="text-xs">Display Order / Position</Label>
              <Input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                placeholder="1"
                data-testid="banner-order-input"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} data-testid="banner-save-btn">
              {saving ? "Saving…" : editing ? "Update Banner" : "Save Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
