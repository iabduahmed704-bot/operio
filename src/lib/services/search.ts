import "server-only";
import { createClient } from "@/lib/supabase/server";

export type SearchResult = {
  kind: "task" | "waste" | "incident" | "employee" | "branch";
  id: string;
  title: string;
  subtitle?: string;
  href: string;
};

export async function searchOrganization(organizationId: string, query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const supabase = await createClient();
  const like = `%${query}%`;

  const [tasks, waste, incidents, employees, branches] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title")
      .eq("organization_id", organizationId)
      .ilike("title", like)
      .limit(5),
    supabase
      .from("waste_records")
      .select("id, description")
      .eq("organization_id", organizationId)
      .ilike("description", like)
      .limit(5),
    supabase
      .from("incidents")
      .select("id, description, category")
      .eq("organization_id", organizationId)
      .ilike("description", like)
      .limit(5),
    supabase
      .from("users")
      .select("id, full_name, email")
      .eq("organization_id", organizationId)
      .or(`full_name.ilike.${like},email.ilike.${like}`)
      .limit(5),
    supabase
      .from("branches")
      .select("id, name")
      .eq("organization_id", organizationId)
      .ilike("name", like)
      .limit(5),
  ]);

  const results: SearchResult[] = [
    ...(tasks.data ?? []).map((t) => ({
      kind: "task" as const,
      id: t.id,
      title: t.title,
      href: "/tasks",
    })),
    ...(waste.data ?? []).map((w) => ({
      kind: "waste" as const,
      id: w.id,
      title: w.description,
      subtitle: "Waste report",
      href: "/reports",
    })),
    ...(incidents.data ?? []).map((i) => ({
      kind: "incident" as const,
      id: i.id,
      title: i.description,
      subtitle: i.category,
      href: "/incidents",
    })),
    ...(employees.data ?? []).map((e) => ({
      kind: "employee" as const,
      id: e.id,
      title: e.full_name,
      subtitle: e.email,
      href: "/employees",
    })),
    ...(branches.data ?? []).map((b) => ({
      kind: "branch" as const,
      id: b.id,
      title: b.name,
      subtitle: "Branch",
      href: "/branches",
    })),
  ];

  return results;
}
