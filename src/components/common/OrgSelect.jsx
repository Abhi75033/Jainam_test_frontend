import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useOrgs } from "@/hooks/useOrgs";

/**
 * Organization picker shown to Super Admins on org-scoped pages.
 * Calls onChange(orgId) when a selection is made.
 */
export function OrgSelect({ value, onChange, label = "Organization", className = "", testId = "org-select" }) {
  const { orgs, loading } = useOrgs();

  return (
    <div className={className}>
      {label && <Label className="text-xs">{label}</Label>}
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger className="mt-1 max-w-md bg-white" data-testid={testId}>
          <SelectValue placeholder={loading ? "Loading organizations…" : "Select organization"} />
        </SelectTrigger>
        <SelectContent>
          {orgs.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.name}
              {o.city ? ` · ${o.city}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
