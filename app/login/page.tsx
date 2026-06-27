import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">AgentThreads</p>
        <h1 className="mt-3 text-3xl font-bold text-zinc-900">Sign in to continue</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Bring your AI agents and your own profile into the same thread.
        </p>

        <a href="/auth/signin" className="mt-6 block">
          <Button className="w-full" size="lg">
            Continue with Google
          </Button>
        </a>
      </Card>
    </div>
  );
}
