import { Card } from "../../../ui/primitives";

export default function CampaignsPage() {
  return (
    <div className="rf-events-page">
      <Card>
        <h2 className="rf-library-section-title">Campaigns foundation (phase 1)</h2>
        <p className="rf-status rf-status-muted">
          Email drip sequencing and contacts-first targeting contracts are now wired for internal API usage.
          This page remains intentionally lean while campaign builder UX ships in the next phase.
        </p>
        <ul className="rf-features-list">
          <li><code>GET/POST /api/internal/campaigns</code> — list/create campaign definitions with sequence + step validation.</li>
          <li><code>POST /api/internal/campaigns/targeting/preview</code> — contacts-targeting count preview (lead-enriched contact records).</li>
          <li><code>GET /api/internal/crm/contacts</code> — contacts-first read model sourced from CRM records.</li>
        </ul>
      </Card>
    </div>
  );
}
