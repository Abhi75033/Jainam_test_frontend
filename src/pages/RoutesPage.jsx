import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MapPin } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function RoutesPage() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [monks, setMonks] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name: "", startLoc: "", endLoc: "", distance: "", stopsCount: "", monkId: "", journeyDate: "" });

  const loadRoutesAndMonks = async () => {
    setLoading(true);
    try {
      const [routesRes, monksRes] = await Promise.all([
        api.get("/tracking/routes"),
        api.get("/monks")
      ]);
      setRows(routesRes.data.data || []);
      setMonks(monksRes.data.data || []);
    } catch (e) {
      toast.error("Failed to load routes and monks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutesAndMonks();
  }, []);

  const openAdd = () => {
    setForm({ name: "", startLoc: "", endLoc: "", distance: "", stopsCount: "", monkId: "", journeyDate: "" });
    setOpen(true);
  };

  const addRoute = async () => {
    if (!form.name || !form.startLoc || !form.endLoc || !form.monkId || !form.journeyDate) {
      toast.error("Please fill in Route Name, Start/End Locations, Monk, and Vihar Start Date.");
      return;
    }

    const payload = {
      name: form.name,
      monkId: form.monkId,
      journeyDate: new Date(form.journeyDate).toISOString(),
      stops: [
        { order: 0, templeId: null, templeName: form.startLoc, expectedArrival: null, status: "PENDING" },
        { order: 1, templeId: null, templeName: form.endLoc, expectedArrival: null, status: "PENDING" }
      ]
    };

    setSaving(true);
    try {
      await api.post("/tracking/routes", payload);
      toast.success("New Vihar route created successfully.");
      setOpen(false);
      loadRoutesAndMonks();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to save route.");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "name", header: "Route Name", render: (r) => <span className="font-semibold text-slate-800">{r.name}</span> },
    { key: "monk", header: "Monk", render: (r) => <span className="text-slate-700 font-medium">{r.monk?.dikshaName || "Unknown"}</span> },
    { key: "span", header: "Route Span", render: (r) => {
      const stops = r.stops || [];
      const start = stops[0]?.templeName || "Start";
      const end = stops[stops.length - 1]?.templeName || "End";
      return (
        <span className="text-sm text-slate-600 flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-orange-500" /> {start} to {end}
        </span>
      );
    }},
    { key: "journeyDate", header: "Vihar Date", render: (r) => <span className="text-sm font-mono">{r.journeyDate ? r.journeyDate.slice(0, 10) : "—"}</span> },
    { key: "stops", header: "Defined Rest Stops", render: (r) => <Badge className="bg-orange-500 text-white">{(r.stops || []).length} Stops</Badge> }
  ];

  return (
    <div data-testid="routes-page">
      <PageHeader
        title="Vihar Routes Master"
        subtitle="Pre-define, configure and inspect standard Vihar highway transit pathways."
        actions={
          <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Add Route Definition</Button>
        }
      />

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        testId="routes-table"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Vihar Route</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-xs">Monk / Sadhvi *</Label>
              <SearchableSelect
                value={form.monkId}
                onValueChange={(val) => setForm({ ...form, monkId: val })}
                options={monks.map((m) => ({ value: m.id, label: `${m.dikshaName} (${m.publicId})` }))}
                placeholder="Select a monk"
                searchPlaceholder="Search monks…"
                className="mt-1"
              />
            </div>
            <div><Label className="text-xs">Route Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mumbai-Pune Highway Route" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Start Location *</Label><Input value={form.startLoc} onChange={(e) => setForm({ ...form, startLoc: e.target.value })} placeholder="Mumbai" /></div>
              <div><Label className="text-xs">End Location *</Label><Input value={form.endLoc} onChange={(e) => setForm({ ...form, endLoc: e.target.value })} placeholder="Pune" /></div>
            </div>
            <div><Label className="text-xs">Vihar Date *</Label><Input type="date" value={form.journeyDate} onChange={(e) => setForm({ ...form, journeyDate: e.target.value })} /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={addRoute} disabled={saving}>{saving ? "Saving..." : "Save Route"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
