import { User, Building2, Mail, Phone, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Profile } from "@/types/database";

const FIELDS: { key: keyof Pick<Profile, "full_name" | "company_name" | "email" | "phone">; label: string; icon: LucideIcon }[] = [
  { key: "full_name", label: "Full Name", icon: User },
  { key: "company_name", label: "Company Name", icon: Building2 },
  { key: "email", label: "Email Address", icon: Mail },
  { key: "phone", label: "Phone Number", icon: Phone },
];

export function ProfileCard({ profile = null }: { profile?: Profile | null }) {
  return (
    <Card className="overflow-hidden rounded-2xl">
      <div className="flex flex-col items-center gap-4 border-b border-border p-8 text-center">
        <Avatar className="h-24 w-24 border border-border">
          {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? "Profile picture"} />}
          <AvatarFallback className="bg-secondary">
            <User className="h-9 w-9 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>

        {profile ? (
          <div>
            <p className="text-lg font-semibold">{profile.full_name ?? "Not provided"}</p>
            <p className="text-sm text-muted-foreground">{profile.company_name ?? "Not provided"}</p>
          </div>
        ) : (
          <div className="w-full max-w-[220px] space-y-2">
            <Skeleton className="mx-auto h-5 w-36" />
            <Skeleton className="mx-auto h-4 w-24" />
          </div>
        )}
      </div>

      <div className="space-y-3 p-6">
        {FIELDS.map((field) => {
          const value = profile?.[field.key];
          return (
            <div
              key={field.key}
              className="flex items-center gap-3 rounded-xl border border-border bg-secondary/20 p-4 transition-colors hover:border-primary/30 hover:bg-secondary/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <field.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{field.label}</p>
                {profile ? (
                  <p className="truncate text-sm font-medium">{value ?? "Not provided"}</p>
                ) : (
                  <Skeleton className="mt-1.5 h-4 w-32" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border p-6">
        <Button variant="ghost" disabled title="Coming soon">
          Cancel
        </Button>
        <Button variant="outline" disabled title="Coming soon">
          Save Changes
        </Button>
        <Button disabled title="Coming soon">
          Edit Profile
        </Button>
      </div>
    </Card>
  );
}
