import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Blyu Client Portal</h1>
      <p className="max-w-md text-muted-foreground">
        Track your project, invoices, and communication with Blyu — all in one place.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/login">Log in</Link>
        </Button>
      </div>
    </main>
  );
}
