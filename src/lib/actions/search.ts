"use server";

import { requireAuth } from "@/lib/auth";
import { searchOrganization, type SearchResult } from "@/lib/services/search";

export async function runSearch(query: string): Promise<SearchResult[]> {
  const user = await requireAuth();
  if (!user.organization_id) return [];
  return searchOrganization(user.organization_id, query);
}
