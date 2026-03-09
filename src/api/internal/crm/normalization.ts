import type { Lead, LeadStatus } from "../../../lib/supabase/leads";
import type { Contact } from "../../../lib/supabase/contacts";

export type ContactRecord = {
  id: string;
  fullName: string;
  primaryEmail: string;
  primaryPhone: string | null;
  source: string | null;
  lead: {
    stage: LeadStatus;
    isConverted: boolean;
  };
  createdAt: string;
};

export function contactFromLead(lead: Lead): ContactRecord {
  return {
    id: lead.id,
    fullName: lead.name,
    primaryEmail: lead.email,
    primaryPhone: lead.phone,
    source: lead.source,
    lead: {
      stage: lead.status,
      isConverted: lead.status === "closed",
    },
    createdAt: lead.createdAt,
  };
}

export function contactFromContactTable(contact: Contact): ContactRecord {
  return {
    id: contact.id,
    fullName: contact.fullName,
    primaryEmail: contact.primaryEmail,
    primaryPhone: contact.primaryPhone,
    source: contact.source,
    lead: {
      stage: contact.stage,
      isConverted: contact.stage === "closed",
    },
    createdAt: contact.createdAt,
  };
}

export function leadFromContactRecord(contact: ContactRecord): Lead {
  return {
    id: contact.id,
    name: contact.fullName,
    email: contact.primaryEmail,
    phone: contact.primaryPhone,
    source: contact.source,
    status: contact.lead.stage,
    createdAt: contact.createdAt,
  };
}
