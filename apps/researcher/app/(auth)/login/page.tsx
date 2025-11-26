"use client"

import {Suspense, useEffect, useRef, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import {useSession} from "next-auth/react";
import ResearcherLoginForm from "~researcher/components/login-form";

export default function LoginPage() {
    const {data: session} = useSession()
    const router = useRouter();
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const [requireCaptcha, setRequireCaptcha] = useState(false)
    const [isVerified, setIsVerified] = useState(false);

    async function handleCaptchaSubmission(token: string | null) {
        try {
            if (token) {
                await fetch("/api/recaptcha", {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({token}),
                })

                setIsVerified(true)
                setRequireCaptcha(true)
            }
        } catch (e) {
            setIsVerified(false)
        }
    }

    const handleChange = (token: string | null) => {
        handleCaptchaSubmission(token);
    };

    function handleExpired() {
        setIsVerified(false);
    }

    useEffect(() => {
        if (session) {
            // Redirect to /profile if the user is signed in
            router.push("/profile")
        }

        // Check cookie manually
        const cookieValue = document.cookie
            .split("; ")
            .find(row => row.startsWith("require_captcha="))
            ?.split("=")[1]

        const needsCaptcha = cookieValue === "true";
        setRequireCaptcha(needsCaptcha);
        setIsVerified(!needsCaptcha)

    }, [session])

    return (
        <div className="flex flex-col items-center justify-center space-y-4">

            <div
                className="mx-4 space-y-8 border border-stone-200 py-10 dark:border-stone-700 sm:mx-auto sm:w-full sm:max-w-lg sm:rounded-lg sm:shadow-md">


                <div className="sm:mx-auto sm:w-full sm:max-w-xs space-y-4">
                    {/* <Image
                        alt="Comend"
                        width={100}
                        height={100}
                        className="relative mx-auto h-12 w-auto dark:scale-110 dark:rounded-full dark:border dark:border-stone-400"
                        src={fullLogo}
                        quality={100}
                    /> */}
                    <h1 className="text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
                        {`Comend Researcher Hub`}
                    </h1>
                    <h2 className="text-center text-xl font-bold leading-9 tracking-tight text-gray-900">
                        {`Sign in or create account`}
                    </h2>
                </div>

                <div className="mx-auto w-11/12 max-w-xs sm:w-full">
                    {requireCaptcha &&
                        <ReCAPTCHA
                            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                            ref={recaptchaRef}
                            onChange={handleChange}
                            onExpired={handleExpired}
                        />
                    }
                </div>

                <div className="mx-auto w-11/12 max-w-md sm:w-full">
                    <Suspense
                        fallback={
                            <div
                                className="my-2 h-10 w-full rounded-md border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800"/>
                        }
                    >
                        <ResearcherLoginForm
                            callback="/profile"
                            isCaptchaVerified={isVerified}
                        />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
