import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TeamTab({ team }: { team: string[] }) {
  if (team.length === 0) {
    return <p className="text-sm text-muted-foreground">No team members assigned to this project yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {team.map((name) => (
        <li key={name} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
          <Avatar>
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
          <p className="text-sm font-medium">{name}</p>
        </li>
      ))}
    </ul>
  );
}
