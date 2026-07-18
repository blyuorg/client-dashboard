import { ListChecks } from "lucide-react";
import { parseDeliverables } from "@/lib/project/compute";

export function DeliverablesTab({ deliverables }: { deliverables: string | null }) {
  const items = parseDeliverables(deliverables);

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No deliverables listed for this project yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-sm">
          <ListChecks className="h-4 w-4 shrink-0 text-primary" />
          {item}
        </li>
      ))}
    </ul>
  );
}
