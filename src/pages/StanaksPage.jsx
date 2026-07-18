import OrgListPage from "./OrgListPage";

export default function StanaksPage() {
  return (
    <OrgListPage
      endpoint="/temples"
      entity="temple"
      label="Stanak"
      pluralLabel="Stanaks"
      moduleKey="TEMPLES"
      testId="stanaks-page"
    />
  );
}
