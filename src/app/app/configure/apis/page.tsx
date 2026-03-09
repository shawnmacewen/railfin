import { Card } from "../../../../ui/primitives";
import { ConfigureApisCatalog } from "../../../../ui/configure-apis-catalog";

export default function ConfigureApisPage() {
  return (
    <Card>
      <h3 className="rf-configure-section-title">APIs</h3>
      <p className="rf-status rf-status-muted">
        Operator-facing API contract catalog for currently implemented internal routes and planned external integrations.
      </p>

      <ConfigureApisCatalog />
    </Card>
  );
}
