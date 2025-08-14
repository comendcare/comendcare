export default function EmailPreflightPage({searchParams}: { searchParams: { target?: string } }) {
    const target = searchParams?.target ?? "";
    if (!target) {
        return (
            <main className="mx-auto max-w-md p-6">
                <h1 className="text-xl font-semibold">
                    Link error
                </h1>
                <p className="mt-2">
                    This sign-in link is missing data. Please request a new one.
                </p>
            </main>
        );
    }
    return (
        <main className="mx-auto max-w-md p-6">
            <h1 className="text-xl font-semibold">
                Complete signing in to Comend
            </h1>
            <p className="mt-2">
                Click the button below to complete signing in.
            </p>
            <form method="POST" action="/email-preflight/complete" className="mt-6">
                <input type="hidden" name="target" value={target}/>
                <button type="submit" className="w-full rounded-lg border px-4 py-2">
                    Continue
                </button>
            </form>
        </main>
    );
}
