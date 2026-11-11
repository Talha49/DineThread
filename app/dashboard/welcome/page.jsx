import Link from "next/link";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export default async function WelcomePage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    const user = token ? await verifyJWT(token) : null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full text-center space-y-6 bg-card p-8 rounded-3xl border shadow-xl">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-4xl text-primary">🎉</span>
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight">
                    Redirection Success!
                </h1>

                <p className="text-muted-foreground">
                    Welcome, <span className="text-foreground font-semibold">{user?.name || "User"}</span>.
                    The authentication system is now stable and correctly routing on Vercel.
                </p>

                <div className="pt-4">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 active:scale-95"
                    >
                        Go to Dashboard
                    </Link>
                </div>

                <p className="text-xs text-muted-foreground pt-4">
                    Diagnostic ID: {Date.now().toString(36)}
                </p>
            </div>
        </div>
    );
}
