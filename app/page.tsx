import { Dashboard } from "@/components/Dashboard";
import { getPmContent } from "@/lib/content";

// ISR: content edited in Supabase Studio shows up within a minute, with no
// redeploy and no webhook plumbing. Tune or replace with on-demand
// revalidation later if instant updates matter.
export const revalidate = 60;

export default async function HomePage() {
  const content = await getPmContent();
  return <Dashboard content={content} />;
}
