import { listLeadsFromTable, type LeadStatus } from "../../../lib/supabase/leads";

export type ContactLeadStage = LeadStatus;

export type ContactRecord = {
  id: string;
  fullName: string;
  primaryEmail: string;
  primaryPhone: string | null;
  source: string | null;
  lead: {
    stage: ContactLeadStage;
    isConverted: boolean;
  };
  createdAt: string;
};

function toContact(input: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: string | null;
  status: LeadStatus;
  createdAt: string;
}): ContactRecord {
  return {
    id: input.id,
    fullName: input.name,
    primaryEmail: input.email,
    primaryPhone: input.phone,
    source: input.source,
    lead: {
      stage: input.status,
      isConverted: input.status === "closed",
    },
    createdAt: input.createdAt,
  };
}

export async function internalContactsList() {
  const listed = await listLeadsFromTable();
  if (!listed.ok) {
    return { ok: false as const, error: listed.blocked.error, blocked: listed.blocked };
  }

  const contacts = listed.leads.map((lead) => toContact(lead));
  return { ok: true as const, data: { items: contacts, total: contacts.length } };
}
