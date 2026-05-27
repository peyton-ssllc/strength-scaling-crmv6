import { createSupabaseAdminClient } from "@/lib/admin";

type CsvRow = Record<string, string>;

export type ImportResult = {
  imported: number;
  skipped: number;
  unmatchedOwners: string[];
};

const ownerEmailColumns = [
  "assigned_to_email",
  "owner_email",
  "rep_email",
  "sdr_email",
  "contact_owner_email",
];

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/\s+/g, "_");
}

function get(row: CsvRow, keys: string[]) {
  for (const key of keys) {
    const value = row[normalizeHeader(key)];
    if (value) return clean(value);
  }

  return "";
}

function parseNumber(value: string, fallback = 0) {
  const cleaned = clean(value).replace(/[$,]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"' && nextCharacter === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (character === "," && !insideQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !insideQuotes) {
      if (character === "\r" && nextCharacter === "\n") index += 1;

      row.push(current);
      current = "";

      if (row.some((cell) => cell.trim())) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    current += character;
  }

  row.push(current);

  if (row.some((cell) => cell.trim())) {
    rows.push(row);
  }

  const headers = rows[0]?.map(normalizeHeader) ?? [];

  return rows.slice(1).map((cells) => {
    const output: CsvRow = {};

    headers.forEach((header, index) => {
      output[header] = clean(cells[index]);
    });

    return output;
  });
}

function normalizeLeadStatus(value: string) {
  const status = value.toLowerCase().replace(/\s+/g, "_");

  const map: Record<string, string> = {
    new: "new",
    queued: "queued",
    working: "working",
    called: "contacted",
    contacted: "contacted",
    follow_up: "follow_up_scheduled",
    follow_up_scheduled: "follow_up_scheduled",
    booked: "meeting_booked",
    meeting_booked: "meeting_booked",
    interested: "qualified",
    qualified: "qualified",
    unqualified: "unqualified",
    bad_data: "bad_data",
    dnc: "do_not_contact",
    do_not_contact: "do_not_contact",
    converted: "converted",
    lost: "lost",
  };

  return map[status] ?? "new";
}

function normalizePipelineStatus(value: string) {
  const status = value.toLowerCase().replace(/\s+/g, "_");

  const map: Record<string, string> = {
    active: "active",
    booked: "active",
    hot: "next_up",
    next_up: "next_up",
    next: "next_up",
    warm: "follow_up",
    follow_up: "follow_up",
    cold: "cold",
    paused: "paused",
    former: "former",
    lost: "former",
  };

  return map[status] ?? "next_up";
}

function normalizePipelineRank(value: string) {
  const rank = value.toLowerCase().replace(/\s+/g, "_");

  if (["hot", "warm", "cold"].includes(rank)) return rank;
  if (["active", "booked"].includes(rank)) return "hot";

  return "warm";
}

export async function importLeadsFromCsv(csvText: string): Promise<ImportResult> {
  const supabase = createSupabaseAdminClient();
  const rows = parseCsv(csvText);

  if (rows.length === 0) {
    return {
      imported: 0,
      skipped: 0,
      unmatchedOwners: [],
    };
  }

  const ownerEmails = Array.from(
    new Set(
      rows
        .map((row) => get(row, ownerEmailColumns).toLowerCase())
        .filter(Boolean)
    )
  );

  const ownerMap = new Map<string, string>();
  const unmatchedOwners = new Set<string>();

  if (ownerEmails.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("email", ownerEmails);

    for (const profile of profiles ?? []) {
      if (profile.email && profile.id) {
        ownerMap.set(profile.email.toLowerCase(), profile.id);
      }
    }

    for (const email of ownerEmails) {
      if (!ownerMap.has(email)) unmatchedOwners.add(email);
    }
  }

  const leads = rows
    .map((row) => {
      const businessName = get(row, [
        "business_name",
        "business",
        "gym_name",
        "gym",
        "company",
        "account",
      ]);

      if (!businessName) return null;

      const ownerEmail = get(row, ownerEmailColumns).toLowerCase();
      const assignedTo = ownerEmail ? ownerMap.get(ownerEmail) ?? null : null;

      const notes = get(row, ["notes", "note", "current_notes", "pipeline_notes"]);
      const retainer = parseNumber(
        get(row, ["monthly_retainer", "retainer", "monthly_revenue", "potential_revenue"]),
        0
      );

      const profit = parseNumber(
        get(row, ["estimated_monthly_profit", "monthly_profit", "profit"]),
        retainer
      );

      return {
        business_name: businessName,
        contact_name: get(row, ["contact_name", "contact", "primary_contact"]),
        owner_name: get(row, ["owner_name", "owner", "gym_owner"]),
        phone: get(row, ["phone", "phone_number", "mobile"]),
        email: get(row, ["email", "contact_email"]),
        website: get(row, ["website", "url", "site"]),
        instagram_url: get(row, ["instagram", "instagram_url", "ig"]),
        city: get(row, ["city"]),
        state: get(row, ["state"]),
        country: get(row, ["country"]) || "US",
        lead_source: get(row, ["lead_source", "source"]) || "CSV Import",
        status: normalizeLeadStatus(get(row, ["status", "lead_status"])),
        score: parseNumber(get(row, ["score", "lead_score"]), 75),
        assigned_to: assignedTo,
        notes,
        notes_summary: notes,
        pipeline_status: normalizePipelineStatus(
          get(row, ["pipeline_status", "pipeline_stage", "stage"])
        ),
        pipeline_rank: normalizePipelineRank(
          get(row, ["pipeline_rank", "lead_ranking", "ranking", "rank"])
        ),
        monthly_retainer: retainer,
        estimated_monthly_profit: profit,
        pipeline_notes: notes,
      };
    })
    .filter(Boolean);

  if (leads.length === 0) {
    return {
      imported: 0,
      skipped: rows.length,
      unmatchedOwners: Array.from(unmatchedOwners),
    };
  }

  const { error } = await supabase.from("leads").insert(leads);

  if (error) {
    throw new Error(error.message);
  }

  return {
    imported: leads.length,
    skipped: rows.length - leads.length,
    unmatchedOwners: Array.from(unmatchedOwners),
  };
}

export async function importLeadsFromFile(file: File): Promise<ImportResult> {
  const text = await file.text();
  return importLeadsFromCsv(text);
}
export const importCsvLeads = importLeadsFromCsv;
