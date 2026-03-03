import Link from "next/link";

import { Card } from "../../../../ui/primitives";

const FEATURE_GROUPS = [
  {
    title: "Create and generate",
    items: [
      {
        label: "Generate fresh content drafts quickly",
        detail:
          "Use guided controls (mode, tone, intent, audience, objective) to produce first-pass copy with clear runtime status.",
      },
      {
        label: "Build campaign packages in one flow",
        detail:
          "Package mode can generate coordinated multi-channel variants (for example email, LinkedIn, and X-thread) from one prompt.",
      },
      {
        label: "Choose a primary output format",
        detail:
          "Single-draft generation supports common content targets such as blog, newsletter, LinkedIn, and X-thread.",
      },
    ],
  },
  {
    title: "Review, compliance, and remediation",
    items: [
      {
        label: "Run compliance checks before saving or sharing",
        detail:
          "Findings are grouped by severity and include practical remediation hints plus protected-zone warnings.",
      },
      {
        label: "Apply remediation actions manually (with control)",
        detail:
          "Operators can apply selected context, apply + regenerate, and undo the latest apply action without auto-triggered edits.",
      },
      {
        label: "Keep an audit-friendly remediation trail",
        detail:
          "Recent apply/undo actions are visible in-session, with backend support for deterministic remediation event tracking.",
      },
    ],
  },
  {
    title: "Drafts, history, and recovery",
    items: [
      {
        label: "Save drafts and continue work later",
        detail:
          "Drafts are available in Library with search and quick handoff back into Create for editing.",
      },
      {
        label: "Use generation history as a safety net",
        detail:
          "Restore prior generated outputs, compare package variants side-by-side, and copy/restore specific variants as needed.",
      },
      {
        label: "Carry policy context into compliance checks",
        detail:
          "Latest Configure policy metadata is surfaced in Create so reviewers can see policy freshness while working.",
      },
    ],
  },
  {
    title: "Visibility and product updates",
    items: [
      {
        label: "Read human-friendly product updates",
        detail:
          "The Configure Change Log page presents dated release highlights for non-technical stakeholders.",
      },
      {
        label: "Browse policy, features, and change notes in one place",
        detail:
          "Configure now includes dedicated subpages for Policy, Features, and Change Log.",
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
