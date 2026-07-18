"use client";

import { useState } from "react";
import { CheckCircle2, MessageSquareWarning, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { decideApproval } from "@/lib/project/actions";
import type { ProjectApproval } from "@/types/database";

const STATUS_META = {
  pending: { label: "Awaiting your decision", variant: "warning" as const },
  approved: { label: "Approved", variant: "success" as const },
  changes_requested: { label: "Changes requested", variant: "destructive" as const },
};

function ApprovalRow({ approval }: { approval: ProjectApproval }) {
  const [status, setStatus] = useState(approval.status);
  const [decidedAt, setDecidedAt] = useState(approval.decided_at);
  const [pending, setPending] = useState<"approve" | "changes" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDecision(decision: "approved" | "changes_requested") {
    setError(null);
    setPending(decision === "approved" ? "approve" : "changes");
    const result = await decideApproval(approval.id, decision);
    setPending(null);

    if (result.error) {
      setError(result.error);
      return;
    }
    setStatus(decision);
    setDecidedAt(new Date().toISOString());
  }

  const meta = STATUS_META[status];

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{approval.title}</p>
          {approval.description && <p className="text-xs text-muted-foreground">{approval.description}</p>}
        </div>
        <Badge variant={meta.variant}>{meta.label}</Badge>
      </div>

      {status === "pending" ? (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="gap-1.5"
            disabled={pending !== null}
            onClick={() => handleDecision("approved")}
          >
            {pending === "approve" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={pending !== null}
            onClick={() => handleDecision("changes_requested")}
          >
            {pending === "changes" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <MessageSquareWarning className="h-3.5 w-3.5" />
            )}
            Request Changes
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Decided {formatDate(decidedAt)}</p>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function ApprovalsTab({ approvals }: { approvals: ProjectApproval[] }) {
  if (approvals.length === 0) {
    return <p className="text-sm text-muted-foreground">No approvals needed right now.</p>;
  }

  const sorted = [...approvals].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-3">
      {sorted.map((approval) => (
        <ApprovalRow key={approval.id} approval={approval} />
      ))}
    </div>
  );
}
