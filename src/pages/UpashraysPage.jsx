import OrgListPage from "./OrgListPage";

export default function UpashraysPage() {
  return (
    <OrgListPage
      endpoint="/temples"
      entity="temple"
      label="Upashray"
      pluralLabel="Upashrays"
      moduleKey="TEMPLES"
      testId="upashrays-page"
    />
  );
}
