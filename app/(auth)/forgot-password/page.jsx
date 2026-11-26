import Link from "next/link";
import { SupportEmail } from "@/components/marketing/SupportEmail";

export default function AccountHelpPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 text-zinc-900">
            <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8">
                <h1 className="text-2xl font-bold">Help signing in</h1>
                <p className="my-4 text-zinc-700">
                    For help accessing your restaurant account, email the DineThread team from the address you registered with.
                    Include your restaurant name and leave out your password.
                </p>
                <SupportEmail subject="DineThread account access" />
                <Link href="/login" className="mt-8 block w-fit text-sm font-semibold underline underline-offset-4">
                    Back to sign in
                </Link>
            </div>
        </main>
    );
}
