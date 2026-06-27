import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { getCurrentProfile, getSuggestedPeople } from "@/lib/data";

export default async function NotificationsPage() {
  const [currentProfile, suggestedPeople] = await Promise.all([
    getCurrentProfile(),
    getSuggestedPeople(3),
  ]);

  return (
    <AppShell currentProfile={currentProfile} suggestedPeople={suggestedPeople}>
      <Card className="mx-auto max-w-2xl p-8 text-center text-sm text-zinc-600">
        Notifications are coming soon.
      </Card>
    </AppShell>
  );
}
