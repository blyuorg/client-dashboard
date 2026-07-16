import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminProjectsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>Admin view — manage all projects across clients.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Query the `projects` table without a client_id filter (RLS allows admins full access).
        </p>
      </CardContent>
    </Card>
  );
}
