import { createSupabaseAdminClient } from "@/lib/admin";

type CsvRow = Record<string, string>;

export type ImportResult = {
  imported: number;
  inserted: number;
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
  if (["active", "booked"].includes(rank)) return "
