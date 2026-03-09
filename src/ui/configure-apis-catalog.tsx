"use client";

import { useMemo, useState } from "react";

type ApiCatalogEntry = {
  id: string;
  scope: "internal" | "external";
  path: string;
  methods: string;
  description: string;
  keyFields: string;
  auth: string;
  source: string;
};

const API_CATALOG: ApiCatalogEntry[] = [
  {
    id: "internal-content-generate",
    scope: "internal",
    path: "/api/internal/content/generate",
    methods: "POST",
    description: "Generate a single draft or package output from operator prompt + controls.",
    keyFields: "body: prompt, mode, contentType/package.assets, template, preset, controls, topics, purposes",
    auth: "Internal API auth/session required",
    source: "src/app/api/internal/content/generate/route.ts + docs/API_BOUNDARY.md",
  },
  {
    id: "internal-content-draft",
    scope: "internal",
    path: "/api/internal/content/draft",
    methods: "GET, POST",
    description: "Create/read/list draft content with search and pagination support.",
    keyFields: "query: id|q|limit|offset; body: title, body",
    auth: "Internal API auth/session required",
    source: "src/app/api/internal/content/draft/route.ts + docs/API_BOUNDARY.md",
  },
  {
    id: "internal-content-list",
    scope: "internal",
    path: "/api/internal/content/list",
    methods: "GET",
    description: "List/search drafts for Library surface.",
    keyFields: "query: q, limit, offset",
    auth: "Internal API auth/session required",
    source: "src/app/api/internal/content/list/route.ts + docs/API_BOUNDARY.md",
  },
  {
    id: "internal-compliance-check",
    scope: "internal",
    path: "/api/internal/compliance/check",
    methods: "POST",
    description: "Run AI-backed compliance evaluation and return normalized findings.",
    keyFields: "body: content, contentType?, policySet?",
    auth: "Internal API auth/session required",
    source: "src/app/api/internal/compliance/check/route.ts + docs/API_BOUNDARY.md",
  },
  {
    id: "internal-remediation-apply",
    scope: "internal",
    path: "/api/internal/compliance/remediation/apply",
    methods: "POST",
    description: "Apply one selected remediation context block to current draft content.",
    keyFields: "body: currentContent, findingId, finding, draftContextId, activeDraftContextId",
    auth: "Internal API auth/session required",
    source: "src/app/api/internal/compliance/remediation/apply/route.ts + docs/API_BOUNDARY.md",
  },
  {
    id: "internal-remediation-undo",
    scope: "internal",
    path: "/api/internal/compliance/remediation/undo",
    methods: "POST",
    description: "Undo last successful remediation apply in current session scope.",
    keyFields: "body: undoToken, currentContent",
    auth: "Internal API auth/session required",
    source: "src/app/api/internal/compliance/remediation/undo/route.ts + docs/API_BOUNDARY.md",
  },
  {
    id: "internal-configure-policy",
    scope: "internal",
    path: "/api/internal/configure/policy",
    methods: "GET, POST",
    description: "Read/persist Configure policy text and metadata.",
    keyFields: "body: policyText (POST)",
    auth: "Internal API auth/session required",
    source: "src/app/api/internal/configure/policy/route.ts + docs/API_BOUNDARY.md",
  },
  {
    id: "internal-campaigns",
    scope: "internal",
    path: "/api/internal/campaigns",
    methods: "GET, POST",
    description: "List and create campaigns.",
    keyFields: "body: name, objective?, status?, targeting, sequences (POST)",
    auth: "Internal API auth/session required",
    source: "src/app/api/internal/campaigns/route.ts + docs/API_BOUNDARY.md",
  },
  {
    id: "internal-campaign-detail",
    scope: "internal",
    path: "/api/internal/campaigns/[campaignId]",
    methods: "GET",
    description: "Fetch one campaign with canonical contract shape.",
    keyFields: "path: campaignId",
    auth: "Internal API auth/session required",
    source: "src/app/api/internal/campaigns/[campaignId]/route.ts",
  },
  {
    id: "internal-campaign-targeting-preview",
    scope: "internal",
    path: "/api/internal/campaigns/targeting/preview",
    methods: "POST",
    description: "Return deterministic targeting preview counts and sample contact IDs.",
    keyFields: "body: contactIds?, segmentIds?, leadStages?",
    auth: "Internal API auth/session required",
    source: "src/app/api/internal/campaigns/targeting/preview/route.ts + docs/API_BOUNDARY.md",
  },
  {
    id: "internal-campaign-sequences",
    scope: "internal",
    path: "/api/internal/campaigns/[campaignId]/sequences",
    methods: "GET, POST",
    description: "List and create sequences for a campaign.",
    keyFields: "path: campaignId; body: name, sequenceOrder",
    auth: "Internal API auth/session required",
    source: "src/app/api/internal/campaigns/[campaignId]/sequences/route.ts",
  },
  {
    id: "internal-campaign-sequence-update",
    scope: "internal",
    path: "/api/internal/campaigns/[campaignId]/sequences/[sequenceId]",
    methods: "PATCH",
    description: "Update sequence fields (name/order).",
    keyFields: "path: campaignId, sequenceId; body: name?, sequenceOrder?",
    auth: "Internal API auth/session required",
    source: "src/app/api/internal/campaigns/[campaignId]/sequences/[sequenceId]/route.ts",
  },
  {
    id: "internal-campaign-steps",
    scope: "internal",
    path: "/api/internal/campaigns/sequences/[sequenceId]/steps",
    methods: "GET, POST",
    description: "List and create campaign steps for a sequence.",
    keyFields: "path: sequenceId; body: stepType-specific payload",
    auth: "Internal API auth/session required",
    source: "src/app/api/internal/campaigns/sequences/[sequenceId]/steps/route.ts",
  },
  {
    id: "internal-campaign-step-update",
    scope: "internal",
    path: "/api/internal/campaigns/sequences/[sequenceId]/steps/[stepId]",
    methods: "PATCH",
    description: "Update an existing campaign step.",
    keyFields: "path: sequenceId, stepId; body: stepType-specific updatable fields",
    auth: "Internal API auth/session required",
    source: "src/app/api/internal/campaigns/sequences/[sequenceId]/steps/[stepId]/route.ts",
  },
  {
    id: "internal-campaign-social-posts",
    scope: "internal",
    path: "/api/internal/campaigns/[campaignId]/social-posts",
    methods: "GET, POST",
    description: "List and schedule campaign social posts.",
    keyFields: "path: campaignId; body: platform, content, scheduledFor",
    auth: "Internal API auth/session required",
    source: "src/app/api/internal/campaigns/[campaignId]/social-posts/route.ts",
  },
  {
    id: "internal-campaign-social-post-update",
    scope: "internal",
    path: "/api/internal/campaigns/[campaignId]/social-posts/[postId]",
    methods: "PATCH",
    description: "Update scheduled social post details/status.",
    keyFields: "path: campaignId, postId; body: content?, scheduledFor?, status?",
    auth: "Internal API auth/session required",
    source: "src/app/api/internal/campaigns/[campaignId]/social-posts/[postId]/route.ts",
  },
  {
    id: "internal-campaign-calendar",
    scope: "internal",
    path: "/api/internal/campaigns/[campaignId]/calendar",
    methods: "GET",
    description: "Fetch campaign calendar items for timeline/calendar surfaces.",
    keyFields: "path: campaignId",
    auth: "Internal API auth/session required",
    source: "src/app/api/internal/campaigns/[campaignId]/calendar/route.ts",
  },
  {
    id: "internal-crm-contacts",
    scope: "internal",
    path: "/api/internal/crm/contacts",
    methods: "GET, POST",
    description: "List/create contacts in contacts-first CRM model.",
    keyFields: "query: search, stage, source; body: fullName, primaryEmail, primaryPhone?, source?, stage",
    auth: "Internal API auth/session required",
    source: "src/app/api/internal/crm/contacts/route.ts + docs/API_BOUNDARY.md",
  },
  {
    id: "internal-crm-contact-update",
    scope: "internal",
    path: "/api/internal/crm/contacts/[contactId]",
    methods: "PATCH",
    description: "Update one contact record.",
    keyFields: "path: contactId; body: fullName?, primaryEmail?, primaryPhone?, source?, stage?",
    auth: "Internal API auth/session required",
    source: "src/app/api/internal/crm/contacts/[contactId]/route.ts",
  },
  {
    id: "internal-crm-leads",
    scope: "internal",
    path: "/api/internal/crm/leads",
    methods: "GET, POST",
    description: "Compatibility bridge for lead-shaped CRM read/write.",
    keyFields: "body: name, email, phone?, source?, status",
    auth: "Internal API auth/session required",
    source: "src/app/api/internal/crm/leads/route.ts + docs/API_BOUNDARY.md",
  },
  {
    id: "internal-events",
    scope: "internal",
    path: "/api/internal/events",
    methods: "GET, POST",
    description: "List and create event records.",
    keyFields: "body: title, date, summary, location, status",
    auth: "Internal API auth/session required",
    source: "src/app/api/internal/events/route.ts + docs/API_BOUNDARY.md",
  },
  {
    id: "internal-event-registrations",
    scope: "internal",
    path: "/api/internal/events/registrations",
    methods: "POST",
    description: "Submit event registration intent data.",
    keyFields: "body: eventId, name, email, phone?, attendanceIntent",
    auth: "Internal API auth/session required",
    source: "src/app/api/internal/events/registrations/route.ts + docs/API_BOUNDARY.md",
  },
  {
    id: "external-auth-login",
    scope: "external",
    path: "/auth/login",
    methods: "POST",
    description: "Login action contract endpoint used by UI integration flow.",
    keyFields: "body: email, password, next?",
    auth: "Public route; issues/sanitizes redirect contract",
    source: "src/app/auth/login/route.ts + docs/API_BOUNDARY.md",
  },
  {
    id: "external-openai-runtime-planned",
    scope: "external",
    path: "OpenAI Responses/Chat API (planned integration surface)",
    methods: "POST (planned)",
    description: "Provider callout used by internal generate/compliance routes.",
    keyFields: "API key + model/runtime payload handled server-side only",
    auth: "Server-to-server credential auth (OPENAI_API_KEY)",
    source: "docs/API_BOUNDARY.md provider notes",
  },
  {
    id: "external-email-provider-planned",
    scope: "external",
    path: "Transactional email provider (planned)",
    methods: "POST (planned)",
    description: "Future outbound delivery for events/campaign automations.",
    keyFields: "Templated recipient + campaign/event metadata (TBD)",
    auth: "Server API key (provider TBD)",
    source: "docs/UI_FOUNDATIONS.md + docs/CHANGELOG.md deferred notes",
  },
];

function matchesSearch(entry: ApiCatalogEntry, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return [
    entry.path,
    entry.methods,
    entry.description,
    entry.keyFields,
    entry.auth,
    entry.source,
  ].some((value) => value.toLowerCase().includes(normalized));
}

function CatalogTable({ rows }: { rows: ApiCatalogEntry[] }) {
  return (
    <div className="rf-crm-table-scroll">
      <table className="rf-crm-table">
        <thead>
          <tr>
            <th>Endpoint / Surface</th>
            <th>Method(s)</th>
            <th>Description</th>
            <th>Key params/body fields</th>
            <th>Auth expectation</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <code>{row.path}</code>
                <div className="rf-status rf-status-muted">Source: {row.source}</div>
              </td>
              <td>{row.methods}</td>
              <td>{row.description}</td>
              <td>{row.keyFields}</td>
              <td>{row.auth}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ConfigureApisCatalog() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(
    () => API_CATALOG.filter((entry) => matchesSearch(entry, searchQuery)),
    [searchQuery],
  );

  const internalApis = filtered.filter((entry) => entry.scope === "internal");
  const externalApis = filtered.filter((entry) => entry.scope === "external");

  return (
    <div className="rf-feature-list">
      <section className="rf-feature-section">
        <h4>Catalog Search</h4>
        <div className="rf-crm-table-toolbar">
          <div className="rf-crm-search-wrap">
            <label htmlFor="configure-apis-search" className="rf-sr-only">Search API catalog</label>
            <input
              id="configure-apis-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search endpoint, method, params, or auth expectation"
            />
          </div>
          <p className="rf-status rf-status-muted">
            Showing {filtered.length} of {API_CATALOG.length} catalog entries.
          </p>
        </div>
      </section>

      <section className="rf-feature-section">
        <h4>Internal APIs</h4>
        <p className="rf-status rf-status-muted">
          Canonical internal route inventory sourced from current `src/app/api/internal/*` handlers and API boundary docs.
        </p>
        <CatalogTable rows={internalApis} />
      </section>

      <section className="rf-feature-section">
        <h4>External APIs</h4>
        <p className="rf-status rf-status-muted">
          External contract surfaces are intentionally minimal right now; planned integrations are listed as placeholders.
        </p>
        <CatalogTable rows={externalApis} />
      </section>
    </div>
  );
}
