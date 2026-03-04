import Link from "next/link";

import { Card } from "../../../../ui/primitives";

export default function HelpComplianceBasicsPage() {
  return (
    <Card>
      <h2 className="rf-page-title">Compliance review and remediation basics</h2>
      <p className="rf-page-subtitle">
        Compliance insights are guidance. You stay in control of what changes in the draft.
      </p>

      <ul className="rf-help-detail-list">
        <li>Run Compliance Check after generation or major edits.</li>
        <li>Select one finding at a time to keep remediation context focused.</li>
        <li>Use Apply Selected Context for manual remediation guidance insertion.</li>
        <li>Use Apply + Regenerate Draft when you want AI to regenerate with selected context.</li>
        <li>Use Undo Last Apply for quick session-level rollback of the latest remediation apply.</li>
      </ul>

      <p>
        Configure page provides policy guidance settings, while Configure → Change Log and Features pages provide release history and capability overview.
      </p>

      <Link className="rf-inline-link" href="/app/help">
        Back to Help Center
      </Link>
    </Card>
  );
}
