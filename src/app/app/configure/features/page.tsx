import Link from "next/link";

import { Card } from "../../../../ui/primitives";

const FEATURE_GROUPS = [
  {
    title: "Create and edit content",
    items: [
      {
        label: "Draft faster with guided AI generation",
        detail:
          "Create supports prompt controls for tone, intent, audience, and objective, with clear success/degraded runtime feedback.",
      },
      {
        label: "Edit in a true rich-text workspace",
        detail:
          "The Lexical editor now supports reliable formatting tools (headings, lists, links, alignment, inline styles) plus save/load fidelity.",
      },
      {
        label: "Generate single drafts or campaign packages",
        detail:
          "Operators can create one draft or a coordinated multi-channel package and quickly restore/copy variants from history.",
      },
    ],
  },
  {
    title: "Review, compliance, and remediation",
    items: [
      {
        label: "Run compliance checks before publish steps",
        detail:
          "Findings are grouped by severity with practical hints, protected-zone warnings, and plain-language status messaging.",
      },
      {
        label: "Keep remediation manual and operator-controlled",
        detail:
          "Apply Selected Context, Apply + Regenerate, and Undo Last Apply are explicit actions—no hidden auto-edits.",
      },
      {
        label: "Maintain traceable remediation activity",
        detail:
          "Recent apply/undo actions remain visible in-session with deterministic audit metadata support in backend flows.",
      },
    ],
  },
  {
    title: "CRM and Events operations",
    items: [
      {
        label: "Track leads in a lightweight CRM",
        detail:
          "CRM is live with table-first lead management, search, and inline Add New Lead flow for fast operator updates.",
      },
      {
        label: "Plan events with a practical two-step wizard",
        detail:
          "Events supports create/list APIs and a step-2 communications planner for pre-event touchpoints.",
      },
      {
        label: "Know what is intentionally still in progress",
        detail:
          "Outbound event email delivery/plumbing is intentionally deferred to a later phase while planning and data flows are stabilized.",
      },
    ],
  },
  {
    title: "Navigation, support, and visibility",
    items: [
      {
        label: "Use responsive navigation across desktop and mobile",
        detail:
          "The app shell includes stable left-nav behavior, plus mobile off-canvas menu patterns that keep core pages easy to reach.",
      },
      {
        label: "Get in-product help and release context quickly",
        detail:
          "Help Center, Features, and Change Log pages are available in-app for onboarding, capability checks, and release visibility.",
      },
      {
        label: "Browse Configure information in one place",
        detail:
          "Configure keeps Policy, Features, and Change Log together so operators can review guidance and product updates without context switching.",
      },
    ],
  },
];

export default function ConfigureFeaturesPage() {
  return (
    <Card>
      <h3 className="rf-configure-section-title">Features</h3>
      <p className="rf-status rf-status-muted">
        What Railfin can do today, written for operators first.
      </p>

      <div className="rf-feature-list">
        {FEATURE_GROUPS.map((group) => (
          <section key={group.title} className="rf-feature-section">
            <h4>{group.title}</h4>
            <ul>
              {group.items.map((item) => (
                <li key={item.label}>
                  <strong>{item.label}.</strong> {item.detail}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p>
        Want release-by-release details? Visit the{" "}
        <Link className="rf-inline-link" href="/app/configure/changelog">
          Change Log
        </Link>
        .
      </p>
    </Card>
  );
}
