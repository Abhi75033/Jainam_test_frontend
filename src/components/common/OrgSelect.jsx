import { SearchableSelect } from "@/components/ui/searchable-select";
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
      <SearchableSelect
        value={value || ""}
        onValueChange={onChange}
        options={orgs.map((o) => ({
          value: o.id,
          label: `${o.name}${o.city ? ` · ${o.city}` : ""}`
        }))}
        placeholder={loading ? "Loading organizations…" : "Select organization"}
        searchPlaceholder="Search organization…"
        className="mt-1 max-w-md"
        data-testid={testId}
      />
    </div>
  );
}
