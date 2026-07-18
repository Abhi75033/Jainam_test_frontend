import { useEffect, useState } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/EmptyState";

const LISTS = [
  { key: "communities", label: "Communities" },
  { key: "tithi-calendar-types", label: "Tithi Calendar Types" },
  { key: "bhagwans", label: "Bhagwans (Tirthankaras)" },
  { key: "booking-categories", label: "Booking Categories" },
  { key: "event-categories", label: "Event Categories" },
  { key: "feed-categories", label: "Feed Categories" },
  { key: "offer-categories", label: "Offer Categories" },
  { key: "news-categories", label: "News Categories" },
  { key: "community-page-categories", label: "Community Page Categories" },
  { key: "sponsor-categories", label: "Sponsor Categories" },
  { key: "staff-departments", label: "Staff Departments" },
  { key: "volunteer-areas", label: "Volunteer Areas" },
  { key: "donation-categories", label: "Donation Categories" },
  { key: "relationship-types", label: "Relationship Types" },
  { key: "facilities", label: "Facilities" },
  { key: "counter-types", label: "Counter Types" },
  { key: "tour-categories", label: "Tour Categories" },
];

function ListEditor({ listKey }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("24 Tirthankars");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/master-data/${listKey}`).then((res) => {
      setItems(res.data?.data || []);
    }).catch(() => setItems([])).finally(() => setLoading(false));
  };

  useEffect(load, [listKey]);

  const add = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const payload = { name: newName.trim() };
      if (listKey === "bhagwans") {
        payload.category = newCategory;
      }
      await api.post(`/master-data/${listKey}`, payload);
      toast.success("Item added.");
      setNewName("");
      load();
    } catch (e) { toast.error(extractErrorMessage(e)); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/master-data/${listKey}/${id}`);
      toast.success("Item removed.");
      load();
    } catch (e) { toast.error(extractErrorMessage(e)); }
  };

  return (
    <Card className="p-5 rounded-md border-border">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-4">
        <Input className="flex-1" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Add new item…" data-testid="master-data-name-input" />
        {listKey === "bhagwans" && (
          <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-48"
            value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
            <option value="24 Tirthankars">24 Tirthankars</option>
            <option value="Others">Others</option>
          </select>
        )}
        <Button onClick={add} disabled={saving || !newName.trim()} data-testid="master-data-add-button" className="shrink-0 bg-purple-700 hover:bg-purple-800 text-white font-bold">
          <Plus className="h-4 w-4 mr-2" /> Add
        </Button>
      </div>
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState title="No items yet" description="Add your first item using the input above." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between px-3 py-2 border border-border rounded-md bg-white">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">{it.name}</div>
                {listKey === "bhagwans" && (
                  <Badge className={it.category === "24 Tirthankars" ? "bg-amber-100 text-amber-800 border border-amber-200 text-[10px]" : "bg-slate-100 text-slate-700 border border-slate-200 text-[10px]"}>
                    {it.category || "Others"}
                  </Badge>
                )}
                {it.code && <Badge variant="outline" className="text-[10px] mt-0.5">{it.code}</Badge>}
              </div>
              <Button size="sm" variant="ghost" onClick={() => remove(it.id)} data-testid={`master-data-delete-${it.id}`}>
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function MasterDataPage() {
  const [active, setActive] = useState(LISTS[0].key);

  return (
    <div data-testid="master-data-page">
      <PageHeader title="Master Data" subtitle="Manage platform-wide lookup lists used across all modules." />

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 md:col-span-4 lg:col-span-3 p-2 rounded-md border-border max-h-[70vh] overflow-y-auto">
          <div className="space-y-0.5">
            {LISTS.map((l) => (
              <button
                key={l.key}
                onClick={() => setActive(l.key)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  active === l.key
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground/70 hover:bg-accent hover:text-foreground"
                }`}
                data-testid={`master-data-list-${l.key}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </Card>
        <div className="col-span-12 md:col-span-8 lg:col-span-9">
          <ListEditor listKey={active} />
        </div>
      </div>
    </div>
  );
}
