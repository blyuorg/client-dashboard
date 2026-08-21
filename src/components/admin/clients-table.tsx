"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { EditClientDialog } from "./edit-client-dialog";
import type { Profile } from "@/types/database";

type AdminOption = Pick<Profile, "id" | "full_name" | "email">;

export function ClientsTable({ clients, admins }: { clients: Profile[]; admins: AdminOption[] }) {
  const [editing, setEditing] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);
  const adminById = new Map(admins.map((admin) => [admin.id, admin]));

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Assigned to</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>{client.company_name || "—"}</TableCell>
              <TableCell>{client.owner_name || client.full_name || "—"}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.phone || "—"}</TableCell>
              <TableCell className="text-muted-foreground">
                {client.assigned_admin_id
                  ? adminById.get(client.assigned_admin_id)?.full_name ||
                    adminById.get(client.assigned_admin_id)?.email ||
                    "—"
                  : "Unassigned"}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(client);
                    setOpen(true);
                  }}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {clients.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                No clients yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <EditClientDialog client={editing} admins={admins} open={open} onOpenChange={setOpen} />
    </>
  );
}
