export type LeadStatus = "new" | "callback" | "follow_up" | "interested" | "booked" | "dnc" | "lost" | "called";

export type Lead = {
  id: string;
  business: string;
  contact: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  status: string;
  score: number;
  source: string;
  notes: string;
  lastContacted: string;
  createdAt: string;
};

export type Activity = {
  id: string;
  leadId: string;
  type: string;
  outcome: string;
  note: string;
  createdAt: string;
};
