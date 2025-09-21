"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

const copy: Record<string, string> = {
    Verification:
        "That sign-in link is invalid or has expired. Request a new link below.",
    AccessDenied:
        "You don't have access to sign in with this account.",
    OAuthAccountNotLinked:
        "This email is already linked with a different sign-in method.",
    use_original:
        "This account was created with a different sign-in method. Please continue with that method.",
};

export default function AuthErrorPage() {
    const params = useSearchParams();
    const error = params.get("error");
    const reason = params.get("reason");
    const provider = params.get("provider");
    const initialEmail = params.get("email") ?? "";
    const [email, setEmail] = useState(initialEmail);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => setEmail(initialEmail), [initialEmail]);

    let message =
        copy[error ?? ""] ?? copy[reason ?? ""] ?? "Something went wrong while signing you in.";

    if (reason === "use_original") {
        if (provider === "email") {
            message = "This account was created with Email. Please sign in using Email.";
        } else if (provider === "google") {
            message = "This account was created with Google. Please sign in using Google.";
        } else if (provider === "facebook") {
            message = "This account was created with Facebook. Please sign in using Facebook.";
        } else if (provider === "linkedin") {
            message = "This account was created with LinkedIn. Please sign in using LinkedIn.";
        }
    }

    const onResend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
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

            <Link href="/login" className="underline">
                Back to sign in
            </Link>
        </main>
    );
}
