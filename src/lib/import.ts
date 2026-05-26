import { createSupabaseAdminClient } from "@/lib/supabase";
import { clean } from "@/lib/format";

function splitCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && quoted && next === '"') { current += '"'; i++; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (char === "," && !quoted) { result.push(current); current = ""; continue; }
    current += char;
  }
  result.push(current);
  return result.map(clean);
}

function keyName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function pick(row: Record<string, string>, names: string[]) {
  for (const name of names) if (row[name]) return row[name];
  return "";
}

export function parseCsv(text: string) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map(keyName);
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => { row[header] = clean(values[index]); });
    const business = pick(row, ["business_name", "business", "company", "gym", "gym_name", "name"]);
    return {
      business_name: business || "Unnamed Business",
      contact_name: pick(row, ["contact_name", "contact", "full_name", "person", "first_name"]),
      owner_name: pick(row, ["owner_name", "owner"]),
      phone: pick(row, ["phone", "phone_number", "mobile", "cell"]),
      email: pick(row, ["email", "email_address"]),
      city: pick(row, ["city", "town"]),
      state: pick(row, ["state", "province", "region"]),
      lead_source: pick(row, ["lead_source", "source"]) || "CRM CSV Import",
      status: "new",
      score: Number(pick(row, ["score", "lead_score"])) || 50,
      notes: pick(row, ["notes", "note", "comments"])
    };
  }).filter((row) => row.business_name || row.phone || row.email);
}

export async function importCsvLeads(text: string, fileName: string) {
  const rows = parseCsv(text).map((row) => ({ ...row, lead_source: row.lead_source || fileName }));
  if (!rows.length) return { inserted: 0 };
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("leads").insert(rows);
  if (error) throw new Error(error.message);
  return { inserted: rows.length };
}
