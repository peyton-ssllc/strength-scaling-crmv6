export function readableStatus(status: string | null | undefined) {
  const value = String(status || "new").replaceAll("-", "_").toLowerCase();
  const map: Record<string, string> = {
    new: "New",
    callback: "Callback",
    follow_up: "Follow Up",
    due_follow_up: "Follow Up",
    interested: "Interested",
    booked: "Booked",
    called: "Called",
    dnc: "DNC",
    lost: "Lost"
  };
  return map[value] || value.split("_").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
}

export function normalizeStatus(status: string) {
  return status.trim().toLowerCase().replaceAll(" ", "_").replaceAll("-", "_");
}

export function clean(value: unknown) {
  return String(value || "").trim();
}

export function todayIso() {
  return new Date().toISOString();
}
