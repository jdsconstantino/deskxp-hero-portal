import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession();
  const email = session?.user?.email;

  // Not logged in → always go to your custom login page
  if (!email) redirect("/signin");

  // Logged in → go to dashboard
  redirect("/dashboard");
}
