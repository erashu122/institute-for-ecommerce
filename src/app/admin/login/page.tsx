import { authConfigured, signIn } from "../../../server/auth";

export const metadata = { title: "Staff login", robots: { index: false, follow: false } };
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <main className="mx-auto max-w-lg px-6 py-20">
      <h1 className="font-serif text-4xl">Staff sign-in</h1>
      <p className="my-5">Use the approved Google account registered with the institute.</p>
      {params.error && <p role="alert" className="my-5">Sign-in could not be completed. Check that your account is approved and try again.</p>}
      {authConfigured ? <form action={async () => { "use server"; await signIn("google", { redirectTo: "/admin/courses" }); }}>
        <button className="rounded-full bg-forest px-6 py-3 text-white">Continue with Google</button>
      </form> : <p role="status">Staff sign-in is awaiting configuration by the institute administrator.</p>}
    </main>
  );
}
