"use server";

import { revalidatePath } from "next/cache";
import { importCsvLeads } from "@/lib/import";

export async function uploadLeads(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Choose a CSV file first");
  const text = await file.text();
  const result = await importCsvLeads(text, file.name);
  revalidatePath("/contacts");
  revalidatePath("/queue");
  revalidatePath("/dashboard");
  return result;
}
