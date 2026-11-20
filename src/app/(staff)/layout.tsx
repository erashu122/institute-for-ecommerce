import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { currentStaff, signOut } from "../../server/auth";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function StaffLayout({ children }: { children: ReactNode }) {
  const staff = await currentStaff();
  if (!staff?.active) redirect("/admin/login");
  return <div className="min-h-dvh">
    <header className="border-b p-6"><nav aria-label="Staff navigation" className="mx-auto flex max-w-6xl flex-wrap items-center gap-6">
      <Link href="/admin/courses" className="font-semibold">Course management</Link><Link href="/courses">Public courses</Link><Link href="/admin/content">Institutional content</Link>
      <form className="ml-auto" action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}><button className="underline">Sign out</button></form>
    </nav></header><main>{children}</main>
  </div>;
}

