import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name || "User"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Getting Started</CardTitle>
            <CardDescription>Your app is ready to build</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use <code className="bg-muted px-1 py-0.5 rounded text-xs">/opsx-one</code> in
              Copilot Chat to start adding features with the spec-driven workflow.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Auth ✓</CardTitle>
            <CardDescription>Better Auth is configured</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Email/password auth with session management. Add social providers or 2FA
              via Better Auth plugins.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Database ✓</CardTitle>
            <CardDescription>Prisma + Neon Postgres</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add models to <code className="bg-muted px-1 py-0.5 rounded text-xs">prisma/schema.prisma</code>{" "}
              then run <code className="bg-muted px-1 py-0.5 rounded text-xs">bunx prisma migrate dev</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
