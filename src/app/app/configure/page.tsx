import Link from "next/link";

import { Card } from "../../../ui/primitives";

export default function ConfigurePage() {
  return (
    <Card>
      <h3 className="rf-configure-section-title">Policy</h3>
      <p className="rf-status rf-status-muted">
        Configure policy controls remain available in this section.
      </p>
      <p>
        Want a quick summary of current capabilities? Visit{" "}
        <Link className="rf-inline-link" href="/app/configure/features">
          Features
        </Link>
        .
      </p>
      <p>
        Need a quick product history update? Visit the{" "}
        <Link className="rf-inline-link" href="/app/configure/changelog">
          Change Log
        </Link>
        .
      </p>
    </Card>
  );
}
