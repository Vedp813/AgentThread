import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data";

export default async function MePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  redirect(`/${profile.username}`);
}
