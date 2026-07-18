import { useState } from "react";
import GenericListPage from "@/components/common/GenericListPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntityFormDialog } from "@/components/common/EntityFormDialog";
import { formatDateTime } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrgs, orgOptions } from "@/hooks/useOrgs";

export default function CommunicationPage() {
  const { user, canDo } = useAuth();
  const { orgs } = useOrgs();
  const orgId = user?.organizationIds?.[0];
  const [openCreate, setOpenCreate] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const columns = [
    { key: "from", header: "From", render: (r) => r.fromOrg?.name || "—" },
    { key: "to", header: "To", render: (r) => r.toOrg?.name || <Badge variant="outline" className="text-[10px]">BROADCAST</Badge> },
    { key: "message", header: "Message", render: (r) => <div className="font-medium max-w-md truncate">{r.message}</div> },
    { key: "sentAt", header: "Sent", render: (r) => formatDateTime(r.createdAt) },
  ];
  return (
    <>
      <GenericListPage
        key={reloadKey}
        title="Communication"
        subtitle="Org-to-org messages, notices, and coordination."
        endpoint={orgId ? `/communication/org/${orgId}` : `/communication`}
        columns={columns}
        testId="communication-page"
        extraActions={canDo("COMMUNICATION", "CREATE") && (
          <Button onClick={() => setOpenCreate(true)} data-testid="comm-create-btn">
            <Plus className="h-4 w-4 mr-2" /> New Message
          </Button>
        )}
      />
      <EntityFormDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        title="New Message"
        endpoint="/communication/messages"
        onSaved={() => setReloadKey((k) => k + 1)}
        testId="comm-form"
        fields={[
          { name: "organizationId", label: "From organization", type: "select", required: true, options: orgOptions(orgs) },
          { name: "toOrgId", label: "To organization (leave empty to broadcast)", type: "select", options: orgOptions(orgs) },
          { name: "message", label: "Message", type: "textarea", required: true },
        ]}
        initial={{ organizationId: orgId }}
      />
    </>
  );
}
