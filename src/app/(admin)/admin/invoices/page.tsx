import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminInvoicesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>Admin view — manage all invoices across clients.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Query the `invoices` table without a client_id filter (RLS allows admins full access).
        </p>
      </CardContent>
    </Card>
  );
}
