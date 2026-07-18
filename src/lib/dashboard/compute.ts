import type { Invoice, Milestone, Payment, Project, Task, TaskStatus } from "@/types/database";

export type ProjectSummary = {
  project: Project;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  budget: number;
  totalInvoiced: number;
  amountPaid: number;
  outstandingBalance: number;
  assignedEmployee: string;
  employeeCount: number;
  currentPhase: string;
};

function currentPhaseFor(projectId: string, milestones: Milestone[]): string {
  const projectMilestones = milestones
    .filter((m) => m.project_id === projectId)
    .sort((a, b) => a.order_index - b.order_index);

  const active = projectMilestones.find((m) => m.status === "in_progress");
  if (active) return active.title;

  const nextPending = projectMilestones.find((m) => m.status === "pending");
  if (nextPending) return nextPending.title;

  const lastCompleted = [...projectMilestones].reverse().find((m) => m.status === "completed");
  if (lastCompleted) return lastCompleted.title;

  return "—";
}

function sumByProject(invoices: Invoice[], payments: Payment[]) {
  const invoiceToProject = new Map(invoices.map((i) => [i.id, i.project_id]));
  const invoicedByProject = new Map<string, number>();
  for (const invoice of invoices) {
    if (invoice.status === "cancelled" || invoice.status === "draft") continue;
    invoicedByProject.set(
      invoice.project_id,
      (invoicedByProject.get(invoice.project_id) ?? 0) + Number(invoice.total)
    );
  }

  const paidByProject = new Map<string, number>();
  for (const payment of payments) {
    if (payment.status !== "success") continue;
    const projectId = invoiceToProject.get(payment.invoice_id);
    if (!projectId) continue;
    paidByProject.set(projectId, (paidByProject.get(projectId) ?? 0) + Number(payment.amount));
  }

  return { invoicedByProject, paidByProject };
}

export function buildProjectSummaries(
  projects: Project[],
  tasks: Task[],
  invoices: Invoice[],
  payments: Payment[],
  milestones: Milestone[]
): ProjectSummary[] {
  const { invoicedByProject, paidByProject } = sumByProject(invoices, payments);

  return projects.map((project) => {
    const projectTasks = tasks.filter((t) => t.project_id === project.id);
    const budget = Number(project.budget ?? 0);
    const amountPaid = paidByProject.get(project.id) ?? 0;
    const team = project.assigned_team ?? [];

    return {
      project,
      totalTasks: projectTasks.length,
      completedTasks: projectTasks.filter((t) => t.status === "completed").length,
      pendingTasks: projectTasks.filter((t) => t.status === "pending").length,
      budget,
      totalInvoiced: invoicedByProject.get(project.id) ?? 0,
      amountPaid,
      outstandingBalance: Math.max(budget - amountPaid, 0),
      assignedEmployee: team[0] ?? "Unassigned",
      employeeCount: team.length,
      currentPhase: currentPhaseFor(project.id, milestones),
    };
  });
}

export type DashboardKpis = {
  totalProjects: number;
  totalProjectValue: number;
  outstandingBalance: number;
  overallCompletion: number;
  pendingApprovals: number;
  completedDeliverables: number;
};

export function computeKpis(
  projects: Project[],
  milestones: Milestone[],
  summaries: ProjectSummary[]
): DashboardKpis {
  const totalProjectValue = summaries.reduce((sum, s) => sum + s.budget, 0);
  const outstandingBalance = summaries.reduce((sum, s) => sum + s.outstandingBalance, 0);
  const overallCompletion = projects.length
    ? Math.round(projects.reduce((sum, p) => sum + p.progress_percent, 0) / projects.length)
    : 0;

  return {
    totalProjects: projects.length,
    totalProjectValue,
    outstandingBalance,
    overallCompletion,
    pendingApprovals: milestones.filter((m) => m.status === "pending").length,
    completedDeliverables: milestones.filter((m) => m.status === "completed").length,
  };
}

const TASK_STATUSES: TaskStatus[] = ["pending", "in_progress", "completed", "delayed", "cancelled", "blocked"];

export type TaskOverview = Record<TaskStatus, number> & { total: number };

export function computeTaskOverview(tasks: Task[]): TaskOverview {
  const counts = Object.fromEntries(TASK_STATUSES.map((s) => [s, 0])) as Record<TaskStatus, number>;
  for (const task of tasks) counts[task.status]++;
  return { total: tasks.length, ...counts };
}

export type BillingChartRow = {
  name: string;
  paid: number;
  pending: number;
  remaining: number;
};

export function computeBillingChartData(summaries: ProjectSummary[]): BillingChartRow[] {
  return summaries
    .filter((s) => s.budget > 0)
    .map((s) => ({
      name: s.project.title,
      paid: s.amountPaid,
      pending: Math.max(s.totalInvoiced - s.amountPaid, 0),
      remaining: Math.max(s.budget - s.totalInvoiced, 0),
    }));
}

export type TimelinePoint = { date: string } & Record<string, string | number>;

/**
 * "Progress over time" has no historical snapshot table — the only real,
 * time-indexed signal available is milestone completion. Each point is the
 * cumulative % of a project's milestones completed as of that date, carried
 * forward across all projects (step chart), not a fabricated trend.
 */
export function computeProjectTimeline(projects: Project[], milestones: Milestone[]): TimelinePoint[] {
  const completed = milestones
    .filter((m): m is Milestone & { completed_at: string } => m.status === "completed" && !!m.completed_at)
    .sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime());

  if (completed.length === 0) return [];

  const totalsByProject = new Map<string, number>();
  for (const m of milestones) {
    totalsByProject.set(m.project_id, (totalsByProject.get(m.project_id) ?? 0) + 1);
  }

  const titleById = new Map(projects.map((p) => [p.id, p.title]));
  const runningCount = new Map<string, number>();
  const points: TimelinePoint[] = [];

  for (const milestone of completed) {
    runningCount.set(milestone.project_id, (runningCount.get(milestone.project_id) ?? 0) + 1);

    const point: TimelinePoint = {
      date: new Date(milestone.completed_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    };
    for (const [projectId, count] of runningCount.entries()) {
      const total = totalsByProject.get(projectId) ?? 1;
      const title = titleById.get(projectId) ?? "Project";
      point[title] = Math.round((count / total) * 100);
    }
    points.push(point);
  }

  return points;
}
