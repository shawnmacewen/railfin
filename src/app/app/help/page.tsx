import Link from "next/link";

import { Card } from "../../../ui/primitives";

type HelpTopic = {
  title: string;
  description: string;
  href: string;
  tag: string;
};

const HELP_TOPICS: HelpTopic[] = [
  {
    title: "Getting started (Create flow)",
    description:
      "Learn the basic Create workflow: prompt setup, generation, review, remediation, and save.",
    href: "/app/help/getting-started",
    tag: "Create",
  },
  {
    title: "Saving and Library",
    description:
      "Understand draft save behavior and how to reopen/edit content from the Library.",
    href: "/app/help/getting-started",
    tag: "Library",
  },
  {
    title: "AI generation controls",
    description:
      "Use content type, prompt controls, and generation history restore tools effectively.",
    href: "/app/help/getting-started",
    tag: "AI",
  },
  {
    title: "Compliance review + remediation basics",
    description:
      "Run compliance checks, select findings, apply remediation context, and use undo safely.",
    href: "/app/help/compliance-basics",
    tag: "Compliance",
  },
  {
    title: "Configure + Change Log + Features pages",
    description:
      "Find policy settings and track product updates through Configure subpages.",
    href: "/app/help/compliance-basics",
    tag: "Configure",
  },
];

export default function HelpCenterPage() {
  return (
    <div className="rf-help-page">
      <Card className="rf-help-hero">
        <p className="rf-help-kicker">Help Center</p>
        <h2 className="rf-page-title">Welcome to Railfin Help</h2>
        <p className="rf-page-subtitle">How can we help?</p>
        <label className="rf-help-search-label" htmlFor="help-search">
          Search help topics
        </label>
        <input
          id="help-search"
          name="helpSearch"
          type="search"
          placeholder="Search articles, workflows, and tools"
          disabled
          aria-disabled="true"
        />
        <p className="rf-status rf-status-muted">
          Search UI is available now; keyword search behavior is coming in a later pass.
        </p>
      </Card>

      <section>
        <h3 className="rf-library-section-title">Popular topics</h3>
        <div className="rf-help-grid">
          {HELP_TOPICS.map((topic) => (
            <Card key={topic.title} className="rf-help-card">
              <p className="rf-help-topic-tag">{topic.tag}</p>
              <h4>{topic.title}</h4>
              <p>{topic.description}</p>
              <Link className="rf-inline-link" href={topic.href}>
                Read article
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
