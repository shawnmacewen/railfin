import Link from "next/link";

import { Card } from "../../../../ui/primitives";

export default function HelpGettingStartedPage() {
  return (
    <Card>
      <h2 className="rf-page-title">Getting started with Create</h2>
      <p className="rf-page-subtitle">
        Use this quick path to draft, review, and save content in Railfin.
      </p>

      <ol className="rf-help-detail-list">
        <li>Open Create and add your AI instructions.</li>
        <li>Select the content type (Blog, Social Post, Article, or Newsletter).</li>
        <li>Click Generate Content and review the result in the editor.</li>
        <li>Run Compliance Check and apply only the remediation context you want.</li>
        <li>Save Draft, then open it later from Library when needed.</li>
      </ol>

      <p>
        Tip: Use Generation History restore actions when you want to compare drafts without losing your current version.
      </p>

      <Link className="rf-inline-link" href="/app/help">
        Back to Help Center
      </Link>
    </Card>
  );
}
