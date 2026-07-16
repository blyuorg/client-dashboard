import { createClient } from "@/lib/supabase/server";
import { ProjectStatusDonut } from "@/components/dashboard/project-status-donut";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", user!.id)
    .order("created_at", { ascending: false });

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("client_id", user!.id);

  const activeCount = projects?.filter((p) => p.status !== "completed").length ?? 0;
  const outstanding =
    invoices
      ?.filter((i) => i.status !== "paid")
      .reduce((sum, i) => sum + Number(i.total ?? 0), 0) ?? 0;

  const statusCounts = {
    in_progress: projects?.filter((p) => p.status === "in_progress").length ?? 0,
    completed: projects?.filter((p) => p.status === "completed").length ?? 0,
    on_hold: projects?.filter((p) => p.status === "on_hold").length ?? 0,
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Overview Dashboard</h1>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-[#F3F1EA] p-6 text-neutral-900">
          <h2 className="font-display text-xl">KPI Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Active Projects</dt>
              <dd className="font-medium">{activeCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Outstanding Balance</dt>
              <dd className="font-medium">₹{outstanding.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Pending Approvals</dt>
              <dd className="font-medium">—</dd>
            </div>
            <div className="flex justify-between">
              <dt>Completed Deliverables</dt>
              <dd className="font-medium">—</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl bg-[#C4B8E8] p-6 text-neutral-900">
          <h2 className="font-display text-xl">Quick Actions</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Upload Assets · Review Designs</li>
            <li>Pay Invoice · Message Team</li>
            <li>Book Meeting · Create Request</li>
          </ul>
          <p className="mt-4 text-xs text-neutral-700">All actions available instantly</p>
        </div>

        <div className="rounded-2xl bg-[#B9EEDD] p-6 text-neutral-900">
          <h2 className="font-display text-xl">Projects</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {(projects ?? []).slice(0, 3).map((p) => (
              <li key={p.id}>
                <p className="font-medium">{p.title}</p>
                <p className="text-xs capitalize text-neutral-700">
                  ● {p.status.replace("_", " ")} · {p.progress_percent}%
                </p>
              </li>
            ))}
            {(!projects || projects.length === 0) && (
              <li className="text-xs text-neutral-700">No projects assigned yet</li>
            )}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-card p-6">
        <ProjectStatusDonut data={statusCounts} />
      </div>
    </div>
  );
}
