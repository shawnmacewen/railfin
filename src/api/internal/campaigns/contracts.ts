import { internalContactsList } from "../crm/contacts";
import {
  createCampaignInTable,
  createCampaignSocialPostInTable,
  createSequenceInTable,
  createStepInTable,
  getCampaignByIdFromTable,
  listCampaignCalendarItemsFromTable,
  listCampaignsFromTable,
  listCampaignSocialPostsFromTable,
  listSequencesFromTable,
  listStepsFromTable,
  updateCampaignSocialPostInTable,
  updateSequenceInTable,
  updateStepInTable,
  type CampaignConditionOperator,
  type CampaignSocialPostStatus,
  type CampaignStatus,
} from "../../../lib/supabase/campaigns";

type ValidationError = { field: string; message: string };

const ALLOWED_STATUSES: CampaignStatus[] = ["draft", "active", "paused", "archived"];
const ALLOWED_OPERATORS: CampaignConditionOperator[] = ["if", "or"];
const ALLOWED_SOCIAL_POST_STATUSES: CampaignSocialPostStatus[] = ["draft", "scheduled", "published", "cancelled"];
const ALLOWED_SOCIAL_PLATFORMS = ["linkedin", "x", "facebook", "instagram"] as const;
const ALLOWED_LEAD_STAGES = ["new", "contacted", "qualified", "closed"] as const;

function isPlainObject(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }
function hasOnlyKeys(value: Record<string, unknown>, allowed: string[]): boolean { return Object.keys(value).every((key) => allowed.includes(key)); }
function normalizeString(value: unknown): string { return typeof value === "string" ? value.trim() : ""; }
function isStringArray(value: unknown): value is string[] { return Array.isArray(value) && value.every((item) => typeof item === "string"); }
function dedupeStrings(values: string[]): string[] { return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))); }
function isCampaignStatus(value: unknown): value is CampaignStatus { return typeof value === "string" && ALLOWED_STATUSES.includes(value as CampaignStatus); }
function isConditionOperator(value: unknown): value is CampaignConditionOperator { return typeof value === "string" && ALLOWED_OPERATORS.includes(value as CampaignConditionOperator); }
function isLeadStage(value: string): boolean { return (ALLOWED_LEAD_STAGES as readonly string[]).includes(value); }

function mapBlocked(result: { blocked: { error: string; kind: "BLOCKED"; requiredSql?: string; missingEnv?: string[] } }) {
  return { ok: false as const, error: result.blocked.error, blocked: result.blocked };
}

export async function internalCampaignsList() {
  const items = await listCampaignsFromTable();
  if (!items.ok) return mapBlocked(items);
  return { ok: true as const, data: { items: items.campaigns, total: items.campaigns.length } };
}

export async function internalCampaignsDetail(input: { campaignId: string }) {
  const result = await getCampaignByIdFromTable(input.campaignId);
  if (!result.ok) return mapBlocked(result);
  if (!result.campaign) return { ok: false as const, error: "Not found" as const };
  return { ok: true as const, data: result.campaign };
}

export async function internalCampaignsCreate(input: { body?: Record<string, unknown> }) {
  const body = input.body;
  if (!isPlainObject(body)) return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "body", message: "body must be a JSON object." } satisfies ValidationError] };
  if (!hasOnlyKeys(body, ["name", "objective", "status", "targeting", "sequences"])) return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "body", message: "Unsupported fields in request body." } satisfies ValidationError] };

  const name = normalizeString(body.name);
  const objective = body.objective === undefined ? "" : normalizeString(body.objective);
  const statusCandidate = body.status === undefined ? "draft" : body.status;
  const targeting = body.targeting;
  const sequences = body.sequences;
  const fieldErrors: ValidationError[] = [];

  if (!name) fieldErrors.push({ field: "name", message: "name is required." });
  if (name.length > 140) fieldErrors.push({ field: "name", message: "name must be 140 characters or fewer." });
  if (objective.length > 500) fieldErrors.push({ field: "objective", message: "objective must be 500 characters or fewer." });
  if (!isCampaignStatus(statusCandidate)) fieldErrors.push({ field: "status", message: "status must be one of draft, active, paused, archived." });

  if (!isPlainObject(targeting)) fieldErrors.push({ field: "targeting", message: "targeting is required and must be an object." });
  else if (!hasOnlyKeys(targeting, ["segmentIds", "contactIds", "leadStages"])) fieldErrors.push({ field: "targeting", message: "Unsupported fields in targeting." });

  const normalizedTargeting = { segmentIds: [] as string[], contactIds: [] as string[], leadStages: [] as string[] };
  if (isPlainObject(targeting)) {
    if (targeting.segmentIds !== undefined && !isStringArray(targeting.segmentIds)) fieldErrors.push({ field: "targeting.segmentIds", message: "segmentIds must be an array of strings." });
    else if (isStringArray(targeting.segmentIds)) normalizedTargeting.segmentIds = dedupeStrings(targeting.segmentIds);

    if (targeting.contactIds !== undefined && !isStringArray(targeting.contactIds)) fieldErrors.push({ field: "targeting.contactIds", message: "contactIds must be an array of strings." });
    else if (isStringArray(targeting.contactIds)) normalizedTargeting.contactIds = dedupeStrings(targeting.contactIds);

    if (targeting.leadStages !== undefined && !isStringArray(targeting.leadStages)) fieldErrors.push({ field: "targeting.leadStages", message: "leadStages must be an array of strings." });
    else if (isStringArray(targeting.leadStages)) {
      normalizedTargeting.leadStages = dedupeStrings(targeting.leadStages);
      if (normalizedTargeting.leadStages.some((stage) => !isLeadStage(stage))) fieldErrors.push({ field: "targeting.leadStages", message: "leadStages must only include new, contacted, qualified, closed." });
    }
  }

  const normalizedSequences: Array<{ name: string; steps: Array<any> }> = [];
  if (!Array.isArray(sequences) || sequences.length === 0) fieldErrors.push({ field: "sequences", message: "sequences must contain at least one sequence." });
  else {
    sequences.forEach((rawSequence, sequenceIndex) => {
      if (!isPlainObject(rawSequence) || !hasOnlyKeys(rawSequence, ["name", "steps"])) {
        fieldErrors.push({ field: `sequences[${sequenceIndex}]`, message: "Each sequence must be an object with name and steps." });
        return;
      }
      const sequenceName = normalizeString(rawSequence.name);
      const rawSteps = rawSequence.steps;
      if (!sequenceName) fieldErrors.push({ field: `sequences[${sequenceIndex}].name`, message: "Sequence name is required." });
      if (sequenceName.length > 140) fieldErrors.push({ field: `sequences[${sequenceIndex}].name`, message: "Sequence name must be 140 characters or fewer." });
      if (!Array.isArray(rawSteps) || rawSteps.length === 0) {
        fieldErrors.push({ field: `sequences[${sequenceIndex}].steps`, message: "Each sequence must include at least one step." });
        return;
      }

      const steps: any[] = [];
      rawSteps.forEach((rawStep, stepIndex) => {
        if (!isPlainObject(rawStep) || !hasOnlyKeys(rawStep, ["type", "subject", "body", "waitMinutes", "operator", "rules", "yesSequenceId", "noSequenceId"])) {
          fieldErrors.push({ field: `sequences[${sequenceIndex}].steps[${stepIndex}]`, message: "Step contains unsupported fields." });
          return;
        }
        const type = normalizeString(rawStep.type);
        if (type === "email") {
          const subject = normalizeString(rawStep.subject); const emailBody = normalizeString(rawStep.body);
          if (!subject) fieldErrors.push({ field: `sequences[${sequenceIndex}].steps[${stepIndex}].subject`, message: "Email step subject is required." });
          if (!emailBody) fieldErrors.push({ field: `sequences[${sequenceIndex}].steps[${stepIndex}].body`, message: "Email step body is required." });
          if (subject.length > 200) fieldErrors.push({ field: `sequences[${sequenceIndex}].steps[${stepIndex}].subject`, message: "Email step subject must be 200 characters or fewer." });
          if (emailBody.length > 8000) fieldErrors.push({ field: `sequences[${sequenceIndex}].steps[${stepIndex}].body`, message: "Email step body must be 8000 characters or fewer." });
          steps.push({ type: "email", subject, body: emailBody });
          return;
        }
        if (type === "wait") {
          const waitMinutes = typeof rawStep.waitMinutes === "number" ? rawStep.waitMinutes : NaN;
          if (!Number.isInteger(waitMinutes) || waitMinutes < 1 || waitMinutes > 10080) fieldErrors.push({ field: `sequences[${sequenceIndex}].steps[${stepIndex}].waitMinutes`, message: "waitMinutes must be an integer between 1 and 10080." });
          steps.push({ type: "wait", waitMinutes });
          return;
        }
        if (type === "condition") {
          const operator = rawStep.operator; const rules = rawStep.rules;
          const yesSequenceId = normalizeString(rawStep.yesSequenceId); const noSequenceId = normalizeString(rawStep.noSequenceId);
          if (!isConditionOperator(operator)) fieldErrors.push({ field: `sequences[${sequenceIndex}].steps[${stepIndex}].operator`, message: "Condition operator must be if or or." });
          if (!Array.isArray(rules) || rules.length === 0) fieldErrors.push({ field: `sequences[${sequenceIndex}].steps[${stepIndex}].rules`, message: "Condition rules must include at least one rule." });
          const normalizedRules: Array<{ field: string; comparator: string; value: string }> = [];
          if (Array.isArray(rules)) {
            rules.forEach((rule, ruleIndex) => {
              if (!isPlainObject(rule) || !hasOnlyKeys(rule, ["field", "comparator", "value"])) { fieldErrors.push({ field: `sequences[${sequenceIndex}].steps[${stepIndex}].rules[${ruleIndex}]`, message: "Rule must include field, comparator, value." }); return; }
              const field = normalizeString(rule.field); const comparator = normalizeString(rule.comparator); const value = normalizeString(rule.value);
              if (!field) fieldErrors.push({ field: `sequences[${sequenceIndex}].steps[${stepIndex}].rules[${ruleIndex}].field`, message: "Rule field is required." });
              if (!comparator) fieldErrors.push({ field: `sequences[${sequenceIndex}].steps[${stepIndex}].rules[${ruleIndex}].comparator`, message: "Rule comparator is required." });
              if (!value) fieldErrors.push({ field: `sequences[${sequenceIndex}].steps[${stepIndex}].rules[${ruleIndex}].value`, message: "Rule value is required." });
              normalizedRules.push({ field, comparator, value });
            });
          }
          if (!yesSequenceId) fieldErrors.push({ field: `sequences[${sequenceIndex}].steps[${stepIndex}].yesSequenceId`, message: "yesSequenceId is required." });
          if (!noSequenceId) fieldErrors.push({ field: `sequences[${sequenceIndex}].steps[${stepIndex}].noSequenceId`, message: "noSequenceId is required." });
          steps.push({ type: "condition", operator: isConditionOperator(operator) ? operator : "if", rules: normalizedRules, yesSequenceId, noSequenceId });
          return;
        }
        fieldErrors.push({ field: `sequences[${sequenceIndex}].steps[${stepIndex}].type`, message: "Step type must be email, wait, or condition." });
      });
      normalizedSequences.push({ name: sequenceName, steps });
    });
  }

  if (fieldErrors.length > 0) return { ok: false as const, error: "Validation failed", fieldErrors };

  const created = await createCampaignInTable({ name, objective: objective || null, status: statusCandidate as CampaignStatus, targeting: normalizedTargeting, sequences: normalizedSequences });
  if (!created.ok) return mapBlocked(created);
  return { ok: true as const, data: created.campaign };
}

export async function internalCampaignTargetingPreview(input: { body?: Record<string, unknown> }) {
  const body = input.body;
  if (!isPlainObject(body)) return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "body", message: "body must be a JSON object." } satisfies ValidationError] };
  if (!hasOnlyKeys(body, ["contactIds", "segmentIds", "leadStages"])) return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "body", message: "Unsupported fields in request body." } satisfies ValidationError] };
  if (body.contactIds !== undefined && !isStringArray(body.contactIds)) return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "contactIds", message: "contactIds must be an array of strings." } satisfies ValidationError] };
  if (body.segmentIds !== undefined && !isStringArray(body.segmentIds)) return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "segmentIds", message: "segmentIds must be an array of strings." } satisfies ValidationError] };
  if (body.leadStages !== undefined && !isStringArray(body.leadStages)) return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "leadStages", message: "leadStages must be an array of strings." } satisfies ValidationError] };

  const contactIds = isStringArray(body.contactIds) ? dedupeStrings(body.contactIds) : [];
  const segmentIds = isStringArray(body.segmentIds) ? dedupeStrings(body.segmentIds) : [];
  const leadStages = isStringArray(body.leadStages) ? dedupeStrings(body.leadStages) : [];
  if (leadStages.some((stage) => !isLeadStage(stage))) return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "leadStages", message: "leadStages must only include new, contacted, qualified, closed." } satisfies ValidationError] };

  const contacts = await internalContactsList();
  if (!contacts.ok) return { ok: false as const, error: contacts.error, blocked: contacts.blocked };

  const scoped = contacts.data.items
    .filter((contact) => (contactIds.length === 0 || contactIds.includes(contact.id)) && (leadStages.length === 0 || leadStages.includes(contact.lead.stage)))
    .sort((a, b) => a.id.localeCompare(b.id));

  return {
    ok: true as const,
    data: {
      segmentIds,
      applied: { contactIds, leadStages },
      counts: { matchedContacts: scoped.length, totalContacts: contacts.data.total },
      sampleContactIds: scoped.slice(0, 10).map((contact) => contact.id),
      note: "Deterministic preview against Contacts. segmentIds are accepted for forward-compatibility and currently non-executing.",
    },
  };
}

export async function internalCampaignSocialPostsList(input: { campaignId: string }) {
  const result = await listCampaignSocialPostsFromTable(input.campaignId);
  if (!result.ok) return mapBlocked(result);
  return { ok: true as const, data: { items: result.posts, total: result.posts.length } };
}

export async function internalCampaignSocialPostsCreate(input: { campaignId: string; body?: Record<string, unknown> }) {
  const body = input.body;
  if (!isPlainObject(body) || !hasOnlyKeys(body, ["platform", "status", "content", "scheduledFor"])) return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "body", message: "Unsupported or invalid body." } satisfies ValidationError] };
  const platform = normalizeString(body.platform);
  const status = body.status === undefined ? "draft" : body.status;
  const content = normalizeString(body.content);
  const scheduledFor = body.scheduledFor === null || body.scheduledFor === undefined ? null : normalizeString(body.scheduledFor);
  const fieldErrors: ValidationError[] = [];
  if (!(ALLOWED_SOCIAL_PLATFORMS as readonly string[]).includes(platform)) fieldErrors.push({ field: "platform", message: "platform must be linkedin, x, facebook, or instagram." });
  if (!(typeof status === "string" && ALLOWED_SOCIAL_POST_STATUSES.includes(status as CampaignSocialPostStatus))) fieldErrors.push({ field: "status", message: "status must be draft, scheduled, published, or cancelled." });
  if (!content) fieldErrors.push({ field: "content", message: "content is required." });
  if (content.length > 5000) fieldErrors.push({ field: "content", message: "content must be 5000 characters or fewer." });
  if (scheduledFor !== null && Number.isNaN(Date.parse(scheduledFor))) fieldErrors.push({ field: "scheduledFor", message: "scheduledFor must be an ISO-8601 date-time or null." });
  if (fieldErrors.length > 0) return { ok: false as const, error: "Validation failed", fieldErrors };

  const created = await createCampaignSocialPostInTable({ campaignId: input.campaignId, platform: platform as any, status: status as CampaignSocialPostStatus, content, scheduledFor });
  if (!created.ok) return mapBlocked(created);
  return { ok: true as const, data: created.post };
}

export async function internalCampaignSocialPostsUpdate(input: { campaignId: string; postId: string; body?: Record<string, unknown> }) {
  const body = input.body;
  if (!isPlainObject(body) || !hasOnlyKeys(body, ["status", "content", "scheduledFor"])) return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "body", message: "Unsupported or invalid body." } satisfies ValidationError] };

  const status = body.status === undefined ? undefined : normalizeString(body.status);
  const content = body.content === undefined ? undefined : normalizeString(body.content);
  const scheduledFor = body.scheduledFor === undefined ? undefined : body.scheduledFor === null ? null : normalizeString(body.scheduledFor);
  const fieldErrors: ValidationError[] = [];

  if (status !== undefined && !ALLOWED_SOCIAL_POST_STATUSES.includes(status as CampaignSocialPostStatus)) fieldErrors.push({ field: "status", message: "status must be draft, scheduled, published, or cancelled." });
  if (content !== undefined && !content) fieldErrors.push({ field: "content", message: "content cannot be empty when provided." });
  if (content !== undefined && content.length > 5000) fieldErrors.push({ field: "content", message: "content must be 5000 characters or fewer." });
  if (scheduledFor !== undefined && scheduledFor !== null && Number.isNaN(Date.parse(scheduledFor))) fieldErrors.push({ field: "scheduledFor", message: "scheduledFor must be an ISO-8601 date-time or null." });
  if (status === undefined && content === undefined && scheduledFor === undefined) fieldErrors.push({ field: "body", message: "At least one updatable field is required." });

  if (fieldErrors.length > 0) return { ok: false as const, error: "Validation failed", fieldErrors };

  const updated = await updateCampaignSocialPostInTable({ campaignId: input.campaignId, postId: input.postId, status: status as CampaignSocialPostStatus | undefined, content, scheduledFor });
  if (!updated.ok) return mapBlocked(updated);
  if (!updated.post) return { ok: false as const, error: "Not found" as const };
  return { ok: true as const, data: updated.post };
}

export async function internalCampaignCalendarList(input: { campaignId: string }) {
  const result = await listCampaignCalendarItemsFromTable(input.campaignId);
  if (!result.ok) return mapBlocked(result);
  return { ok: true as const, data: { items: result.items, total: result.items.length } };
}

function validateStepBody(path: string, body: Record<string, unknown>) {
  const fieldErrors: ValidationError[] = [];
  const type = normalizeString(body.type);
  if (type === "email") {
    const subject = normalizeString(body.subject);
    const emailBody = normalizeString(body.body);
    if (!subject) fieldErrors.push({ field: `${path}.subject`, message: "Email step subject is required." });
    if (!emailBody) fieldErrors.push({ field: `${path}.body`, message: "Email step body is required." });
    if (fieldErrors.length > 0) return { fieldErrors };
    return { step: { type: "email" as const, subject, body: emailBody } };
  }
  if (type === "wait") {
    const waitMinutes = typeof body.waitMinutes === "number" ? body.waitMinutes : NaN;
    if (!Number.isInteger(waitMinutes) || waitMinutes < 1 || waitMinutes > 10080) fieldErrors.push({ field: `${path}.waitMinutes`, message: "waitMinutes must be an integer between 1 and 10080." });
    if (fieldErrors.length > 0) return { fieldErrors };
    return { step: { type: "wait" as const, waitMinutes } };
  }
  if (type === "condition") {
    const operator = body.operator;
    const rules = body.rules;
    const yesSequenceId = normalizeString(body.yesSequenceId);
    const noSequenceId = normalizeString(body.noSequenceId);
    if (!isConditionOperator(operator)) fieldErrors.push({ field: `${path}.operator`, message: "Condition operator must be if or or." });
    if (!Array.isArray(rules) || rules.length === 0) fieldErrors.push({ field: `${path}.rules`, message: "Condition rules must include at least one rule." });
    const normalizedRules: Array<{ field: string; comparator: string; value: string }> = [];
    if (Array.isArray(rules)) {
      rules.forEach((rule, i) => {
        if (!isPlainObject(rule) || !hasOnlyKeys(rule, ["field", "comparator", "value"])) {
          fieldErrors.push({ field: `${path}.rules[${i}]`, message: "Rule must include field, comparator, value." });
          return;
        }
        const field = normalizeString(rule.field);
        const comparator = normalizeString(rule.comparator);
        const value = normalizeString(rule.value);
        if (!field) fieldErrors.push({ field: `${path}.rules[${i}].field`, message: "Rule field is required." });
        if (!comparator) fieldErrors.push({ field: `${path}.rules[${i}].comparator`, message: "Rule comparator is required." });
        if (!value) fieldErrors.push({ field: `${path}.rules[${i}].value`, message: "Rule value is required." });
        normalizedRules.push({ field, comparator, value });
      });
    }
    if (!yesSequenceId) fieldErrors.push({ field: `${path}.yesSequenceId`, message: "yesSequenceId is required." });
    if (!noSequenceId) fieldErrors.push({ field: `${path}.noSequenceId`, message: "noSequenceId is required." });
    if (fieldErrors.length > 0) return { fieldErrors };
    return { step: { type: "condition" as const, operator: operator as CampaignConditionOperator, rules: normalizedRules, yesSequenceId, noSequenceId } };
  }
  return { fieldErrors: [{ field: `${path}.type`, message: "Step type must be email, wait, or condition." }] };
}

export async function internalCampaignSequencesList(input: { campaignId: string }) {
  const result = await listSequencesFromTable(input.campaignId);
  if (!result.ok) return mapBlocked(result);
  if (result.sequences === null) return { ok: false as const, error: "Not found" as const };
  return { ok: true as const, data: { items: result.sequences, total: result.sequences.length } };
}

export async function internalCampaignSequencesCreate(input: { campaignId: string; body?: Record<string, unknown> }) {
  const body = input.body;
  if (!isPlainObject(body) || !hasOnlyKeys(body, ["name", "sequenceOrder"])) return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "body", message: "Unsupported or invalid body." }] };
  const name = normalizeString(body.name);
  const sequenceOrder = body.sequenceOrder === undefined ? undefined : Number(body.sequenceOrder);
  const fieldErrors: ValidationError[] = [];
  if (!name) fieldErrors.push({ field: "name", message: "Sequence name is required." });
  if (!Number.isInteger(sequenceOrder) && sequenceOrder !== undefined) fieldErrors.push({ field: "sequenceOrder", message: "sequenceOrder must be an integer when provided." });
  if (fieldErrors.length) return { ok: false as const, error: "Validation failed", fieldErrors };
  const created = await createSequenceInTable({ campaignId: input.campaignId, name, sequenceOrder });
  if (!created.ok) return mapBlocked(created);
  return { ok: true as const, data: created.sequence };
}

export async function internalCampaignSequencesUpdate(input: { campaignId: string; sequenceId: string; body?: Record<string, unknown> }) {
  const body = input.body;
  if (!isPlainObject(body) || !hasOnlyKeys(body, ["name", "sequenceOrder"])) return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "body", message: "Unsupported or invalid body." }] };
  const name = body.name === undefined ? undefined : normalizeString(body.name);
  const sequenceOrder = body.sequenceOrder === undefined ? undefined : Number(body.sequenceOrder);
  const fieldErrors: ValidationError[] = [];
  if (name !== undefined && !name) fieldErrors.push({ field: "name", message: "name cannot be empty when provided." });
  if (sequenceOrder !== undefined && !Number.isInteger(sequenceOrder)) fieldErrors.push({ field: "sequenceOrder", message: "sequenceOrder must be an integer when provided." });
  if (name === undefined && sequenceOrder === undefined) fieldErrors.push({ field: "body", message: "At least one updatable field is required." });
  if (fieldErrors.length) return { ok: false as const, error: "Validation failed", fieldErrors };
  const updated = await updateSequenceInTable({ campaignId: input.campaignId, sequenceId: input.sequenceId, name, sequenceOrder });
  if (!updated.ok) return mapBlocked(updated);
  if (!updated.sequence) return { ok: false as const, error: "Not found" as const };
  return { ok: true as const, data: updated.sequence };
}

export async function internalCampaignStepsList(input: { sequenceId: string }) {
  const result = await listStepsFromTable(input.sequenceId);
  if (!result.ok) return mapBlocked(result);
  return { ok: true as const, data: { items: result.steps, total: result.steps.length } };
}

export async function internalCampaignStepsCreate(input: { sequenceId: string; body?: Record<string, unknown> }) {
  const body = input.body;
  if (!isPlainObject(body) || !hasOnlyKeys(body, ["stepOrder", "type", "subject", "body", "waitMinutes", "operator", "rules", "yesSequenceId", "noSequenceId"])) return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "body", message: "Unsupported or invalid body." }] };
  const stepOrder = body.stepOrder === undefined ? undefined : Number(body.stepOrder);
  const parsed = validateStepBody("body", body);
  const parsedFieldErrors = "fieldErrors" in parsed ? (parsed.fieldErrors ?? []) : [];
  const fieldErrors = [...parsedFieldErrors, ...(stepOrder !== undefined && !Number.isInteger(stepOrder) ? [{ field: "stepOrder", message: "stepOrder must be an integer when provided." }] : [])];
  if (fieldErrors.length) return { ok: false as const, error: "Validation failed", fieldErrors };
  const created = await createStepInTable({ sequenceId: input.sequenceId, stepOrder, step: parsed.step! });
  if (!created.ok) return mapBlocked(created);
  return { ok: true as const, data: created.step };
}

export async function internalCampaignStepsUpdate(input: { sequenceId: string; stepId: string; body?: Record<string, unknown> }) {
  const body = input.body;
  if (!isPlainObject(body) || !hasOnlyKeys(body, ["stepOrder", "type", "subject", "body", "waitMinutes", "operator", "rules", "yesSequenceId", "noSequenceId"])) return { ok: false as const, error: "Validation failed", fieldErrors: [{ field: "body", message: "Unsupported or invalid body." }] };
  const stepOrder = body.stepOrder === undefined ? undefined : Number(body.stepOrder);
  const parsed = validateStepBody("body", body);
  const parsedFieldErrors = "fieldErrors" in parsed ? (parsed.fieldErrors ?? []) : [];
  const fieldErrors = [...parsedFieldErrors, ...(stepOrder !== undefined && !Number.isInteger(stepOrder) ? [{ field: "stepOrder", message: "stepOrder must be an integer when provided." }] : [])];
  if (fieldErrors.length) return { ok: false as const, error: "Validation failed", fieldErrors };
  const updated = await updateStepInTable({ sequenceId: input.sequenceId, stepId: input.stepId, stepOrder, step: parsed.step! });
  if (!updated.ok) return mapBlocked(updated);
  if (!updated.step) return { ok: false as const, error: "Not found" as const };
  return { ok: true as const, data: updated.step };
}
