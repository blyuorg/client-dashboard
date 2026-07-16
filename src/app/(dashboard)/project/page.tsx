import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ProjectPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project</CardTitle>
        <CardDescription>This page is scaffolded and ready to build out.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Wire this up to the `project` table via the Supabase server client.
        </p>
      </CardContent>
    </Card>
  );
}
