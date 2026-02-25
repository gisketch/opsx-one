import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">OPSX One Starter Kit</CardTitle>
          <CardDescription className="text-center">
            Next.js + Prisma + Neon + TanStack + shadcn/ui
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-primary">Step 1: Initialize Context</h3>
              <p className="text-sm text-muted-foreground">
                Open Copilot Chat and type <code className="bg-muted px-1 py-0.5 rounded">/opsx-one-starter</code> to start the interview. Tell it what you are building (e.g., "Inventory App", "POS System").
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-primary">Step 2: Build Features</h3>
              <p className="text-sm text-muted-foreground">
                Use the <strong>OPSX One</strong> agent to start creating features. It will automatically follow the hardened stack and architecture rules.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-primary">Step 3: Theme your App (Optional)</h3>
              <p className="text-sm text-muted-foreground">
                Apply a beautiful theme instantly using <a href="https://tweakcn.com" target="_blank" className="underline hover:text-primary">tweakCN</a>. Run <code className="bg-muted px-1 py-0.5 rounded">bunx --bun shadcn@latest add https://tweakcn.com/r/themes/amethyst-haze.json</code> to auto-apply.
              </p>
            </div>
          </div>
          <Button className="w-full" asChild>
            <a href="https://github.com/gisketch/opsx-one" target="_blank" rel="noreferrer">
              View Documentation
            </a>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
