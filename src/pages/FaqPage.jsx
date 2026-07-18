import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { HelpCircle, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export default function FaqPage() {
  const { user, isSuperAdmin } = useAuth();
  const orgId = user?.organizationIds?.[0];

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ question: "", answer: "", category: "General", displayOrder: 0 });

  const loadFaqs = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await api.get(`/faqs/org/${orgId}`);
      setRows(res.data.data || []);
    } catch (e) {
      toast.error("Failed to load FAQs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFaqs(); }, [orgId]);

  const openAdd = () => {
    setEditing(null);
    setForm({ question: "", answer: "", category: "General", displayOrder: 0 });
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ question: row.question, answer: row.answer, category: row.category, displayOrder: row.displayOrder ?? 0 });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.question || !form.answer) {
      toast.error("Please fill in both Question and Answer fields.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/faqs/${editing.id}`, form);
        toast.success("FAQ updated successfully.");
      } else {
        await api.post("/faqs", { ...form, organizationId: orgId });
        toast.success("FAQ added successfully.");
      }
      setOpen(false);
      loadFaqs();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to save FAQ.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!confirm(`Delete FAQ: "${row.question}"?`)) return;
    try {
      await api.delete(`/faqs/${row.id}`);
      toast.success("FAQ deleted.");
      loadFaqs();
    } catch (e) {
      toast.error("Failed to delete FAQ.");
    }
  };

  const columns = [
    { key: "question", header: "Question", render: (r) => <span className="font-semibold text-slate-800">{r.question}</span> },
    { key: "answer", header: "Answer", render: (r) => <span className="text-slate-600 text-xs block max-w-lg truncate">{r.answer}</span> },
    { key: "category", header: "Category", render: (r) => <Badge variant="secondary">{r.category}</Badge> },
    { key: "isActive", header: "Status", render: (r) => <Badge variant={r.isActive ? "default" : "outline"}>{r.isActive ? "Active" : "Inactive"}</Badge> },
    {
      key: "actions", header: "", render: (r) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(r)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      )
    }
  ];

  return (
    <div data-testid="faq-page">
      <PageHeader
        title="FAQ Management"
        subtitle="Manage frequently asked questions displayed in the mobile and portal guides."
        actions={
          <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Add FAQ</Button>
        }
      />

      <DataTable columns={columns} rows={rows} loading={loading} testId="faq-table" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div><Label className="text-xs">Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="General / Tracking / Donations" /></div>
            <div><Label className="text-xs">Question *</Label><Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="e.g. How do I request a receipt?" /></div>
            <div><Label className="text-xs">Answer *</Label><Textarea rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} placeholder="Type the answer here..." /></div>
            <div><Label className="text-xs">Display Order</Label><Input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editing ? "Update FAQ" : "Save FAQ"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
