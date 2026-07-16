import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminClientsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clients</CardTitle>
        <CardDescription>Admin view — manage all clients across clients.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Query the `clients` table without a client_id filter (RLS allows admins full access).
        </p>
      </CardContent>
    </Card>
  );
}
