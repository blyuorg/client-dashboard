"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import { ProjectFormDialog } from "./project-form-dialog";
import { formatCurrency } from "@/lib/utils";
import type { Profile, Project } from "@/types/database";

export function ProjectsTable({
  projects,
  clients,
}: {
  projects: (Project & { clientLabel: string })[];
  clients: Profile[];
}) {
  const [editing, setEditing] = useState<Project | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add project
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>{project.title}</TableCell>
              <TableCell>{project.clientLabel}</TableCell>
              <TableCell className="capitalize">{project.status.replace("_", " ")}</TableCell>
              <TableCell className="capitalize">{project.priority}</TableCell>
              <TableCell>{project.progress_percent}%</TableCell>
              <TableCell>{project.budget != null ? formatCurrency(project.budget) : "—"}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(project);
                    setOpen(true);
                  }}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {projects.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                No projects yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ProjectFormDialog clients={clients} project={editing} open={open} onOpenChange={setOpen} />
    </>
  );
}
