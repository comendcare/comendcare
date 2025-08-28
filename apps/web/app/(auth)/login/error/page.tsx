// app/auth/error/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";

const copy: Record<string, string> = {
    Verification:
        "That sign-in link is invalid or has expired. Request a new link below.",
    AccessDenied:
        "You don't have access to sign in with this account.",
    OAuthAccountNotLinked:
        "This email is already linked with a different sign-in method.",
};

export default function AuthErrorPage() {
    const params = useSearchParams();
    const error = params.get("error") ?? "Verification";
    const initialEmail = params.get("email") ?? "";
    const [email, setEmail] = useState(initialEmail);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => setEmail(initialEmail), [initialEmail]);

    const message = copy[error] ?? "Something went wrong while signing you in.";

    const onResend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Redirect so the normal flow continues after email click
            await signIn("email", {
                email,
                callbackUrl: "/",
                redirect: true,
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="mx-auto max-w-md p-6 space-y-4">
            <h1 className="text-xl font-semibold">Can’t sign in</h1>
            <p>{message}</p>

            {error === "Verification" && (
                <form onSubmit={onResend} className="flex gap-2">
                    <input
                        type="email"
                        required
                        className="border p-2 rounded flex-1"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-black text-white px-4 py-2 rounded"
                    >
                        {submitting ? "Sending…" : "Resend link"}
                    </button>
                </form>
            )}

            <a href="/auth/signin" className="text-sm underline">
                Back to sign in
            </a>
        </main>
    );
}
