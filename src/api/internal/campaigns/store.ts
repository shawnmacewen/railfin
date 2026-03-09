import { randomUUID } from "crypto";

export type CampaignStatus = "draft" | "active" | "paused" | "archived";
export type CampaignStepType = "email" | "wait" | "condition";
export type CampaignConditionOperator = "if" | "or";

export type CampaignStepRecord =
  | {
      id: string;
      type: "email";
      subject: string;
      body: string;
    }
  | {
      id: string;
      type: "wait";
      waitMinutes: number;
    }
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
  steps: CampaignStepRecord[];
};

export type CampaignRecord = {
  id: string;
  name: string;
  objective: string | null;
  status: CampaignStatus;
  targeting: {
    segmentIds: string[];
    contactIds: string[];
    leadStages: string[];
  };
  sequences: CampaignSequenceRecord[];
  createdAt: string;
};

const campaignStore = new Map<string, CampaignRecord>();

export function createCampaignRecord(input: {
  name: string;
  objective: string | null;
  status: CampaignStatus;
  targeting: { segmentIds: string[]; contactIds: string[]; leadStages: string[] };
  sequences: Array<{
    name: string;
    steps: Array<
      | { type: "email"; subject: string; body: string }
      | { type: "wait"; waitMinutes: number }
      | {
          type: "condition";
          operator: CampaignConditionOperator;
          rules: Array<{ field: string; comparator: string; value: string }>;
          yesSequenceId: string;
          noSequenceId: string;
        }
    >;
  }>;
}): CampaignRecord {
  const sequences: CampaignSequenceRecord[] = input.sequences.map((sequence) => ({
    id: randomUUID(),
    name: sequence.name,
    steps: sequence.steps.map((step) => {
      if (step.type === "email") {
        return { id: randomUUID(), type: "email", subject: step.subject, body: step.body } satisfies CampaignStepRecord;
      }

      if (step.type === "wait") {
        return { id: randomUUID(), type: "wait", waitMinutes: step.waitMinutes } satisfies CampaignStepRecord;
      }

      return {
        id: randomUUID(),
        type: "condition",
        operator: step.operator,
        rules: step.rules,
        yesSequenceId: step.yesSequenceId,
        noSequenceId: step.noSequenceId,
      } satisfies CampaignStepRecord;
    }),
  }));

  const record: CampaignRecord = {
    id: randomUUID(),
    name: input.name,
    objective: input.objective,
    status: input.status,
    targeting: input.targeting,
    sequences,
    createdAt: new Date().toISOString(),
  };

  campaignStore.set(record.id, record);
  return record;
}

export function listCampaignRecords(): CampaignRecord[] {
  return Array.from(campaignStore.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
