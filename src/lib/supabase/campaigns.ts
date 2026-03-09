import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export type CampaignStatus = "draft" | "active" | "paused" | "archived";
export type CampaignStepType = "email" | "wait" | "condition";
export type CampaignConditionOperator = "if" | "or";
export type CampaignSocialPostStatus = "draft" | "scheduled" | "published" | "cancelled";
export type CampaignEnrollmentStatus = "pending" | "active" | "paused" | "completed" | "exited";

export type CampaignStepRecord =
  | { id: string; type: "email"; subject: string; body: string }
  | { id: string; type: "wait"; waitMinutes: number }
  | {
      id: string;
      type: "condition";
      operator: CampaignConditionOperator;
      rules: Array<{ field: string; comparator: string; value: string }>;
      yesSequenceId: string;
      noSequenceId: string;
    };

export type CampaignSequenceRecord = {
  id: string;
  name: string;
  sequenceOrder: number;
  steps: CampaignStepRecord[];
};

export type CampaignRecord = {
  id: string;
  name: string;
  objective: string | null;
  status: CampaignStatus;
  targeting: { segmentIds: string[]; contactIds: string[]; leadStages: string[] };
  sequences: CampaignSequenceRecord[];
  createdAt: string;
  updatedAt: string;
};

export type CampaignSocialPostRecord = {
  id: string;
  campaignId: string;
  platform: "linkedin" | "x" | "facebook" | "instagram";
  status: CampaignSocialPostStatus;
  content: string;
  scheduledFor: string | null;
  createdAt: string;
};

export type CampaignCalendarItemRecord = {
  id: string;
  campaignId: string;
  itemType: "social_post" | "email_send" | "event_trigger" | "manual_task";
  startsAt: string;
  endsAt: string | null;
  title: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type CampaignEnrollmentRecord = {
  id: string;
  campaignId: string;
  contactId: string;
  enrollmentStatus: CampaignEnrollmentStatus;
  activeSequenceId: string | null;
  activeStepId: string | null;
  nextEligibleAt: string | null;
  enrolledAt: string;
  lastTransitionAt: string;
};

export type CampaignEnrollmentEventRecord = {
  id: string;
  enrollmentId: string;
  campaignId: string;
  eventType: string;
  actorType: "manual" | "engine" | "system";
  details: Record<string, unknown>;
  createdAt: string;
};

export type CampaignPersistenceBlocked = {
  kind: "BLOCKED";
  error: string;
  missingEnv?: string[];
  requiredSql?: string;
};

const REQUIRED_ENV = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;

export const CAMPAIGNS_REQUIRED_SQL = "See docs/campaigns_bootstrap.sql";

function getClientOrBlocked(): { ok: true; client: SupabaseClient } | { ok: false; blocked: CampaignPersistenceBlocked } {
  const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);
  if (missingEnv.length > 0) {
    return {
      ok: false,
      blocked: {
        kind: "BLOCKED",
        error: `Missing required Supabase environment variables: ${missingEnv.join(", ")}`,
        missingEnv,
        requiredSql: CAMPAIGNS_REQUIRED_SQL,
      },
    };
  }

  return {
    ok: true,
    client: createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  };
}

function blockedFromError(error: { code?: string | null } | null): CampaignPersistenceBlocked {
  return {
    kind: "BLOCKED",
    error: `Campaign persistence blocked.${error?.code ? ` Root cause code: ${error.code}.` : ""}`,
    requiredSql: CAMPAIGNS_REQUIRED_SQL,
  };
}

function mapStep(row: any): CampaignStepRecord {
  if (row.step_type === "email") return { id: row.id, type: "email", subject: row.email_subject, body: row.email_body };
  if (row.step_type === "wait") return { id: row.id, type: "wait", waitMinutes: row.wait_minutes };
  return {
    id: row.id,
    type: "condition",
    operator: row.condition_operator,
    rules: Array.isArray(row.condition_rules_json) ? row.condition_rules_json : [],
    yesSequenceId: row.yes_sequence_id,
    noSequenceId: row.no_sequence_id,
  };
}

function mapCampaignBase(row: any): Omit<CampaignRecord, "sequences"> {
  const targetingJson = row.targeting_json && typeof row.targeting_json === "object" ? row.targeting_json : {};
  return {
    id: row.id,
    name: row.name,
    objective: row.objective,
    status: row.status,
    targeting: {
      segmentIds: Array.isArray(targetingJson.segmentIds) ? targetingJson.segmentIds.filter((x: unknown) => typeof x === "string") : [],
      contactIds: Array.isArray(targetingJson.contactIds) ? targetingJson.contactIds.filter((x: unknown) => typeof x === "string") : [],
      leadStages: Array.isArray(targetingJson.leadStages) ? targetingJson.leadStages.filter((x: unknown) => typeof x === "string") : [],
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function loadSequencesAndSteps(client: SupabaseClient, campaignId: string): Promise<{ ok: true; sequences: CampaignSequenceRecord[] } | { ok: false; blocked: CampaignPersistenceBlocked }> {
  const seqRes = await client.from("campaign_sequences").select("id, campaign_id, name, sequence_order").eq("campaign_id", campaignId).order("sequence_order", { ascending: true });
  if (seqRes.error) return { ok: false, blocked: blockedFromError(seqRes.error) };
  const sequences = (seqRes.data ?? []) as any[];
  if (sequences.length === 0) return { ok: true, sequences: [] };

  const stepRes = await client.from("campaign_steps").select("id, sequence_id, step_order, step_type, email_subject, email_body, wait_minutes, condition_operator, condition_rules_json, yes_sequence_id, no_sequence_id").in("sequence_id", sequences.map((s) => s.id)).order("step_order", { ascending: true });
  if (stepRes.error) return { ok: false, blocked: blockedFromError(stepRes.error) };
  const stepsBySequence = new Map<string, CampaignStepRecord[]>();
  for (const row of (stepRes.data ?? []) as any[]) {
    const existing = stepsBySequence.get(row.sequence_id) ?? [];
    existing.push(mapStep(row));
    stepsBySequence.set(row.sequence_id, existing);
  }

  return {
    ok: true,
    sequences: sequences.map((s) => ({ id: s.id, name: s.name, sequenceOrder: s.sequence_order, steps: stepsBySequence.get(s.id) ?? [] })),
  };
}

export async function listCampaignsFromTable() {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false as const, blocked: client.blocked };

  const res = await client.client.from("campaigns").select("id, name, objective, status, targeting_json, created_at, updated_at").order("created_at", { ascending: false });
  if (res.error) return { ok: false as const, blocked: blockedFromError(res.error) };

  const items: CampaignRecord[] = [];
  for (const row of (res.data ?? []) as any[]) {
    const seq = await loadSequencesAndSteps(client.client, row.id);
    if (!seq.ok) return { ok: false as const, blocked: seq.blocked };
    items.push({ ...mapCampaignBase(row), sequences: seq.sequences });
  }

  return { ok: true as const, campaigns: items };
}

export async function getCampaignByIdFromTable(campaignId: string) {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false as const, blocked: client.blocked };

  const res = await client.client.from("campaigns").select("id, name, objective, status, targeting_json, created_at, updated_at").eq("id", campaignId).maybeSingle();
  if (res.error) return { ok: false as const, blocked: blockedFromError(res.error) };
  if (!res.data) return { ok: true as const, campaign: null };

  const seq = await loadSequencesAndSteps(client.client, campaignId);
  if (!seq.ok) return { ok: false as const, blocked: seq.blocked };

  return { ok: true as const, campaign: { ...mapCampaignBase(res.data), sequences: seq.sequences } };
}

export async function createCampaignInTable(input: {
  name: string;
  objective: string | null;
  status: CampaignStatus;
  targeting: { segmentIds: string[]; contactIds: string[]; leadStages: string[] };
  sequences: Array<{ name: string; steps: Array<Omit<CampaignStepRecord, "id">> }>;
}) {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false as const, blocked: client.blocked };

  const campaignId = randomUUID();
  const now = new Date().toISOString();
  const ins = await client.client.from("campaigns").insert({ id: campaignId, name: input.name, objective: input.objective, status: input.status, targeting_json: input.targeting, created_at: now, updated_at: now });
  if (ins.error) return { ok: false as const, blocked: blockedFromError(ins.error) };

  for (let i = 0; i < input.sequences.length; i++) {
    const sequence = input.sequences[i];
    const sequenceId = randomUUID();
    const seqIns = await client.client.from("campaign_sequences").insert({ id: sequenceId, campaign_id: campaignId, name: sequence.name, sequence_order: i });
    if (seqIns.error) return { ok: false as const, blocked: blockedFromError(seqIns.error) };

    for (let j = 0; j < sequence.steps.length; j++) {
      const step = sequence.steps[j];
      const row: Record<string, unknown> = { id: randomUUID(), sequence_id: sequenceId, step_order: j, step_type: step.type };
      if (step.type === "email") { row.email_subject = (step as any).subject; row.email_body = (step as any).body; }
      else if (step.type === "wait") { row.wait_minutes = (step as any).waitMinutes; }
      else { row.condition_operator = (step as any).operator; row.condition_rules_json = (step as any).rules; row.yes_sequence_id = (step as any).yesSequenceId; row.no_sequence_id = (step as any).noSequenceId; }
      const stepIns = await client.client.from("campaign_steps").insert(row);
      if (stepIns.error) return { ok: false as const, blocked: blockedFromError(stepIns.error) };
    }
  }

  return getCampaignByIdFromTable(campaignId);
}

export async function listSequencesFromTable(campaignId: string) {
  const loaded = await getCampaignByIdFromTable(campaignId);
  if (!loaded.ok) return loaded;
  if (!loaded.campaign) return { ok: true as const, sequences: null };
  return { ok: true as const, sequences: loaded.campaign.sequences };
}

export async function createSequenceInTable(input: { campaignId: string; name: string; sequenceOrder?: number }) {
  const client = getClientOrBlocked(); if (!client.ok) return { ok: false as const, blocked: client.blocked };
  const current = await client.client.from("campaign_sequences").select("id, sequence_order").eq("campaign_id", input.campaignId).order("sequence_order", { ascending: true });
  if (current.error) return { ok: false as const, blocked: blockedFromError(current.error) };
  const order = input.sequenceOrder === undefined ? (current.data?.length ?? 0) : input.sequenceOrder;
  const id = randomUUID();
  const ins = await client.client.from("campaign_sequences").insert({ id, campaign_id: input.campaignId, name: input.name, sequence_order: order });
  if (ins.error) return { ok: false as const, blocked: blockedFromError(ins.error) };
  const row = await client.client.from("campaign_sequences").select("id, name, sequence_order").eq("id", id).single();
  if (row.error || !row.data) return { ok: false as const, blocked: blockedFromError(row.error) };
  return { ok: true as const, sequence: { id: row.data.id, name: row.data.name, sequenceOrder: row.data.sequence_order, steps: [] } as CampaignSequenceRecord };
}

export async function updateSequenceInTable(input: { campaignId: string; sequenceId: string; name?: string; sequenceOrder?: number }) {
  const client = getClientOrBlocked(); if (!client.ok) return { ok: false as const, blocked: client.blocked };
  const update: Record<string, unknown> = {};
  if (input.name !== undefined) update.name = input.name;
  if (input.sequenceOrder !== undefined) update.sequence_order = input.sequenceOrder;
  const upd = await client.client.from("campaign_sequences").update(update).eq("id", input.sequenceId).eq("campaign_id", input.campaignId);
  if (upd.error) return { ok: false as const, blocked: blockedFromError(upd.error) };
  const row = await client.client.from("campaign_sequences").select("id, name, sequence_order").eq("id", input.sequenceId).eq("campaign_id", input.campaignId).maybeSingle();
  if (row.error) return { ok: false as const, blocked: blockedFromError(row.error) };
  if (!row.data) return { ok: true as const, sequence: null };
  const steps = await client.client.from("campaign_steps").select("id, step_type, email_subject, email_body, wait_minutes, condition_operator, condition_rules_json, yes_sequence_id, no_sequence_id").eq("sequence_id", input.sequenceId).order("step_order", { ascending: true });
  if (steps.error) return { ok: false as const, blocked: blockedFromError(steps.error) };
  return { ok: true as const, sequence: { id: row.data.id, name: row.data.name, sequenceOrder: row.data.sequence_order, steps: (steps.data ?? []).map((s: any) => mapStep(s)) } as CampaignSequenceRecord };
}

export async function listStepsFromTable(sequenceId: string) {
  const client = getClientOrBlocked(); if (!client.ok) return { ok: false as const, blocked: client.blocked };
  const res = await client.client.from("campaign_steps").select("id, step_type, email_subject, email_body, wait_minutes, condition_operator, condition_rules_json, yes_sequence_id, no_sequence_id").eq("sequence_id", sequenceId).order("step_order", { ascending: true });
  if (res.error) return { ok: false as const, blocked: blockedFromError(res.error) };
  return { ok: true as const, steps: (res.data ?? []).map((row: any) => mapStep(row)) };
}

export async function createStepInTable(input: { sequenceId: string; stepOrder?: number; step: Omit<CampaignStepRecord, "id"> }) {
  const client = getClientOrBlocked(); if (!client.ok) return { ok: false as const, blocked: client.blocked };
  const existing = await client.client.from("campaign_steps").select("id").eq("sequence_id", input.sequenceId);
  if (existing.error) return { ok: false as const, blocked: blockedFromError(existing.error) };
  const row: Record<string, unknown> = { id: randomUUID(), sequence_id: input.sequenceId, step_order: input.stepOrder ?? (existing.data?.length ?? 0), step_type: input.step.type };
  if (input.step.type === "email") { row.email_subject = (input.step as any).subject; row.email_body = (input.step as any).body; }
  else if (input.step.type === "wait") row.wait_minutes = (input.step as any).waitMinutes;
  else { row.condition_operator = (input.step as any).operator; row.condition_rules_json = (input.step as any).rules; row.yes_sequence_id = (input.step as any).yesSequenceId; row.no_sequence_id = (input.step as any).noSequenceId; }
  const ins = await client.client.from("campaign_steps").insert(row);
  if (ins.error) return { ok: false as const, blocked: blockedFromError(ins.error) };
  return { ok: true as const, step: { ...(input.step as any), id: row.id } as CampaignStepRecord };
}

export async function updateStepInTable(input: { sequenceId: string; stepId: string; stepOrder?: number; step: Omit<CampaignStepRecord, "id"> }) {
  const client = getClientOrBlocked(); if (!client.ok) return { ok: false as const, blocked: client.blocked };
  const row: Record<string, unknown> = { sequence_id: input.sequenceId, step_type: input.step.type };
  if (input.stepOrder !== undefined) row.step_order = input.stepOrder;
  row.email_subject = null; row.email_body = null; row.wait_minutes = null; row.condition_operator = null; row.condition_rules_json = null; row.yes_sequence_id = null; row.no_sequence_id = null;
  if (input.step.type === "email") { row.email_subject = (input.step as any).subject; row.email_body = (input.step as any).body; }
  else if (input.step.type === "wait") row.wait_minutes = (input.step as any).waitMinutes;
  else { row.condition_operator = (input.step as any).operator; row.condition_rules_json = (input.step as any).rules; row.yes_sequence_id = (input.step as any).yesSequenceId; row.no_sequence_id = (input.step as any).noSequenceId; }
  const upd = await client.client.from("campaign_steps").update(row).eq("id", input.stepId).eq("sequence_id", input.sequenceId);
  if (upd.error) return { ok: false as const, blocked: blockedFromError(upd.error) };
  const check = await client.client.from("campaign_steps").select("id").eq("id", input.stepId).eq("sequence_id", input.sequenceId).maybeSingle();
  if (check.error) return { ok: false as const, blocked: blockedFromError(check.error) };
  if (!check.data) return { ok: true as const, step: null };
  return { ok: true as const, step: { ...(input.step as any), id: input.stepId } as CampaignStepRecord };
}

export async function listCampaignSocialPostsFromTable(campaignId: string) {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false as const, blocked: client.blocked };
  const res = await client.client.from("campaign_social_posts").select("id, campaign_id, platform, status, content, scheduled_for, created_at").eq("campaign_id", campaignId).order("created_at", { ascending: false });
  if (res.error) return { ok: false as const, blocked: blockedFromError(res.error) };
  const items = ((res.data ?? []) as any[]).map((row) => ({ id: row.id, campaignId: row.campaign_id, platform: row.platform, status: row.status, content: row.content, scheduledFor: row.scheduled_for, createdAt: row.created_at } as CampaignSocialPostRecord));
  return { ok: true as const, posts: items };
}

export async function createCampaignSocialPostInTable(input: { campaignId: string; platform: "linkedin" | "x" | "facebook" | "instagram"; status: CampaignSocialPostStatus; content: string; scheduledFor: string | null }) {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false as const, blocked: client.blocked };
  const id = randomUUID();
  const ins = await client.client.from("campaign_social_posts").insert({ id, campaign_id: input.campaignId, platform: input.platform, status: input.status, content: input.content, scheduled_for: input.scheduledFor });
  if (ins.error) return { ok: false as const, blocked: blockedFromError(ins.error) };
  const row = await client.client.from("campaign_social_posts").select("id, campaign_id, platform, status, content, scheduled_for, created_at").eq("id", id).single();
  if (row.error || !row.data) return { ok: false as const, blocked: blockedFromError(row.error) };
  return { ok: true as const, post: { id: row.data.id, campaignId: row.data.campaign_id, platform: row.data.platform, status: row.data.status, content: row.data.content, scheduledFor: row.data.scheduled_for, createdAt: row.data.created_at } as CampaignSocialPostRecord };
}

export async function updateCampaignSocialPostInTable(input: { campaignId: string; postId: string; status?: CampaignSocialPostStatus; scheduledFor?: string | null; content?: string }) {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false as const, blocked: client.blocked };
  const update: Record<string, unknown> = {};
  if (input.status !== undefined) update.status = input.status;
  if (input.scheduledFor !== undefined) update.scheduled_for = input.scheduledFor;
  if (input.content !== undefined) update.content = input.content;
  const upd = await client.client.from("campaign_social_posts").update(update).eq("id", input.postId).eq("campaign_id", input.campaignId);
  if (upd.error) return { ok: false as const, blocked: blockedFromError(upd.error) };
  const row = await client.client.from("campaign_social_posts").select("id, campaign_id, platform, status, content, scheduled_for, created_at").eq("id", input.postId).eq("campaign_id", input.campaignId).maybeSingle();
  if (row.error) return { ok: false as const, blocked: blockedFromError(row.error) };
  if (!row.data) return { ok: true as const, post: null };
  return { ok: true as const, post: { id: row.data.id, campaignId: row.data.campaign_id, platform: row.data.platform, status: row.data.status, content: row.data.content, scheduledFor: row.data.scheduled_for, createdAt: row.data.created_at } as CampaignSocialPostRecord };
}

export async function listCampaignCalendarItemsFromTable(campaignId: string) {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false as const, blocked: client.blocked };
  const res = await client.client.from("campaign_calendar_items").select("id, campaign_id, item_type, starts_at, ends_at, title, metadata_json, created_at").eq("campaign_id", campaignId).order("starts_at", { ascending: true });
  if (res.error) return { ok: false as const, blocked: blockedFromError(res.error) };
  const items = ((res.data ?? []) as any[]).map((row) => ({ id: row.id, campaignId: row.campaign_id, itemType: row.item_type, startsAt: row.starts_at, endsAt: row.ends_at, title: row.title, metadata: typeof row.metadata_json === "object" && row.metadata_json ? row.metadata_json : {}, createdAt: row.created_at } as CampaignCalendarItemRecord));
  return { ok: true as const, items };
}

function mapEnrollment(row: any): CampaignEnrollmentRecord {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    contactId: row.contact_id,
    enrollmentStatus: row.enrollment_status,
    activeSequenceId: row.active_sequence_id,
    activeStepId: row.active_step_id,
    nextEligibleAt: row.next_eligible_at ?? null,
    enrolledAt: row.enrolled_at,
    lastTransitionAt: row.last_transition_at,
  };
}

function mapEnrollmentEvent(row: any): CampaignEnrollmentEventRecord {
  return {
    id: row.id,
    enrollmentId: row.enrollment_id,
    campaignId: row.campaign_id,
    eventType: row.event_type,
    actorType: row.actor_type,
    details: typeof row.details_json === "object" && row.details_json ? row.details_json : {},
    createdAt: row.created_at,
  };
}

export async function createCampaignEnrollmentInTable(input: {
  campaignId: string;
  contactId: string;
  enrollmentStatus: CampaignEnrollmentStatus;
  activeSequenceId: string | null;
  activeStepId: string | null;
  nextEligibleAt: string | null;
  event: { eventType: string; actorType: "manual" | "engine" | "system"; details: Record<string, unknown> };
}) {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false as const, blocked: client.blocked };
  const now = new Date().toISOString();
  const id = randomUUID();
  const ins = await client.client.from("campaign_enrollments").insert({
    id,
    campaign_id: input.campaignId,
    contact_id: input.contactId,
    enrollment_status: input.enrollmentStatus,
    active_sequence_id: input.activeSequenceId,
    active_step_id: input.activeStepId,
    next_eligible_at: input.nextEligibleAt,
    enrolled_at: now,
    last_transition_at: now,
  });
  if (ins.error) return { ok: false as const, blocked: blockedFromError(ins.error) };

  const evIns = await client.client.from("campaign_enrollment_events").insert({
    id: randomUUID(),
    enrollment_id: id,
    campaign_id: input.campaignId,
    event_type: input.event.eventType,
    actor_type: input.event.actorType,
    details_json: input.event.details,
    created_at: now,
  });
  if (evIns.error) return { ok: false as const, blocked: blockedFromError(evIns.error) };

  return getCampaignEnrollmentByIdFromTable(id);
}

export async function getCampaignEnrollmentByIdFromTable(enrollmentId: string) {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false as const, blocked: client.blocked };
  const row = await client.client
    .from("campaign_enrollments")
    .select("id, campaign_id, contact_id, enrollment_status, active_sequence_id, active_step_id, next_eligible_at, enrolled_at, last_transition_at")
    .eq("id", enrollmentId)
    .maybeSingle();
  if (row.error) return { ok: false as const, blocked: blockedFromError(row.error) };
  if (!row.data) return { ok: true as const, enrollment: null };
  return { ok: true as const, enrollment: mapEnrollment(row.data) };
}

export async function listCampaignEnrollmentsFromTable(campaignId: string) {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false as const, blocked: client.blocked };
  const res = await client.client
    .from("campaign_enrollments")
    .select("id, campaign_id, contact_id, enrollment_status, active_sequence_id, active_step_id, next_eligible_at, enrolled_at, last_transition_at")
    .eq("campaign_id", campaignId)
    .order("enrolled_at", { ascending: false });
  if (res.error) return { ok: false as const, blocked: blockedFromError(res.error) };
  return { ok: true as const, enrollments: ((res.data ?? []) as any[]).map(mapEnrollment) };
}

export async function transitionCampaignEnrollmentInTable(input: {
  enrollmentId: string;
  enrollmentStatus: CampaignEnrollmentStatus;
  activeSequenceId: string | null;
  activeStepId: string | null;
  nextEligibleAt: string | null;
  event: { eventType: string; actorType: "manual" | "engine" | "system"; details: Record<string, unknown> };
}) {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false as const, blocked: client.blocked };
  const now = new Date().toISOString();
  const upd = await client.client
    .from("campaign_enrollments")
    .update({
      enrollment_status: input.enrollmentStatus,
      active_sequence_id: input.activeSequenceId,
      active_step_id: input.activeStepId,
      next_eligible_at: input.nextEligibleAt,
      last_transition_at: now,
    })
    .eq("id", input.enrollmentId);
  if (upd.error) return { ok: false as const, blocked: blockedFromError(upd.error) };

  const check = await getCampaignEnrollmentByIdFromTable(input.enrollmentId);
  if (!check.ok) return check;
  if (!check.enrollment) return { ok: true as const, enrollment: null };

  const evIns = await client.client.from("campaign_enrollment_events").insert({
    id: randomUUID(),
    enrollment_id: input.enrollmentId,
    campaign_id: check.enrollment.campaignId,
    event_type: input.event.eventType,
    actor_type: input.event.actorType,
    details_json: input.event.details,
    created_at: now,
  });
  if (evIns.error) return { ok: false as const, blocked: blockedFromError(evIns.error) };

  return { ok: true as const, enrollment: check.enrollment };
}

export async function listCampaignEnrollmentEventsFromTable(enrollmentId: string) {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false as const, blocked: client.blocked };
  const res = await client.client
    .from("campaign_enrollment_events")
    .select("id, enrollment_id, campaign_id, event_type, actor_type, details_json, created_at")
    .eq("enrollment_id", enrollmentId)
    .order("created_at", { ascending: true });
  if (res.error) return { ok: false as const, blocked: blockedFromError(res.error) };
  return { ok: true as const, events: ((res.data ?? []) as any[]).map(mapEnrollmentEvent) };
}

export async function findCampaignEnrollmentEventByTriggerContext(input: {
  campaignId: string;
  contactId: string;
  eventId: string;
  triggerType: string;
}) {
  const client = getClientOrBlocked();
  if (!client.ok) return { ok: false as const, blocked: client.blocked };

  const res = await client.client
    .from("campaign_enrollment_events")
    .select("id, enrollment_id, campaign_id, event_type, actor_type, details_json, created_at")
    .eq("campaign_id", input.campaignId)
    .eq("event_type", "enrollment_trigger_received")
    .contains("details_json", { triggerType: input.triggerType, eventId: input.eventId, contactId: input.contactId })
    .order("created_at", { ascending: false })
    .limit(1);

  if (res.error) return { ok: false as const, blocked: blockedFromError(res.error) };
  const row = ((res.data ?? []) as any[])[0] ?? null;
  return { ok: true as const, event: row ? mapEnrollmentEvent(row) : null };
}
