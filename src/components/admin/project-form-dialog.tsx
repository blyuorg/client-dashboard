"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createProject, updateProject, type ProjectInput } from "@/lib/admin/actions";
import { toast } from "@/hooks/use-toast";
import type { Profile, Project, ProjectPriority, ProjectStatus } from "@/types/database";

const STATUSES: ProjectStatus[] = ["not_started", "in_progress", "on_hold", "completed", "cancelled"];
const PRIORITIES: ProjectPriority[] = ["low", "medium", "high", "urgent"];

export function ProjectFormDialog({
  clients,
  project,
  open,
  onOpenChange,
}: {
  clients: Profile[];
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm<ProjectInput>();
  const isEditing = Boolean(project);

  function handleOpenChange(next: boolean) {
    if (next) {
      reset(
        project
          ? {
              client_id: project.client_id,
              title: project.title,
              category: project.category ?? "",
              description: project.description ?? "",
              status: project.status,
              priority: project.priority,
              progress_percent: project.progress_percent,
              start_date: project.start_date ?? "",
              deadline: project.deadline ?? "",
              estimated_completion: project.estimated_completion ?? "",
              budget: project.budget ?? undefined,
              deliverables: project.deliverables ?? "",
              requirements: project.requirements ?? "",
              project_notes: project.project_notes ?? "",
            }
          : {
              client_id: clients[0]?.id ?? "",
              title: "",
              status: "not_started",
              priority: "medium",
              progress_percent: 0,
            }
      );
    }
    onOpenChange(next);
  }

  async function onSubmit(values: ProjectInput) {
    setSaving(true);
    const payload: ProjectInput = {
      ...values,
      progress_percent: Number(values.progress_percent) || 0,
      budget: values.budget ? Number(values.budget) : null,
    };

    const { error } = isEditing
      ? await updateProject(project!.id, payload)
      : await createProject(payload);
    setSaving(false);

    if (error) {
      toast({ variant: "destructive", title: "Couldn't save project", description: error });
      return;
    }
    toast({ title: isEditing ? "Project updated" : "Project created" });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit project" : "Add project"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update project details." : "Create a new project for a client."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" required {...register("title")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="client_id">Client</Label>
              <select
                id="client_id"
                required
                {...register("client_id")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name || c.owner_name || c.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input id="category" {...register("category")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                {...register("status")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                {...register("priority")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="progress_percent">Progress (%)</Label>
              <Input
                id="progress_percent"
                type="number"
                min={0}
                max={100}
                {...register("progress_percent")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="budget">Budget</Label>
              <Input id="budget" type="number" step="0.01" {...register("budget")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="start_date">Start date</Label>
              <Input id="start_date" type="date" {...register("start_date")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="date" {...register("deadline")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="estimated_completion">Est. completion</Label>
              <Input id="estimated_completion" type="date" {...register("estimated_completion")} />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...register("description")} />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="deliverables">Deliverables</Label>
              <Input id="deliverables" {...register("deliverables")} />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="requirements">Requirements</Label>
              <Input id="requirements" {...register("requirements")} />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="project_notes">Notes</Label>
              <Input id="project_notes" {...register("project_notes")} />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save changes" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
