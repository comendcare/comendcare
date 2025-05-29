"use client"

import Image from "next/image";
import LoginForm from "@/components/login-form";
import {Suspense, useEffect, useState, useRef} from "react";
import fullLogo from "@/public/logos/affiliations/comend-full-logo.svg"
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";


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
            // Redirect to /app/marketplace/cro if the user is signed in
            router.push("/app/marketplace/service-providers")
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
                className="bg-neutral-50 dark:bg-neutral-700 no-underline group relative md:shadow-2xl shadow-zinc-900 rounded-full p-px text-[10px] sm:text-xs font-semibold leading-6  text-neutral-700 dark:text-neutral-300 inline-block w-fit mx-auto"
            >
                <span className="absolute inset-0 overflow-hidden rounded-full">
                    <span
                        className="absolute inset-0 rounded-full  opacity-0 transition-opacity duration-500 group-hover:opacity-100"/>
                </span>
                <div
                    className="relative flex space-x-2 items-center z-10 rounded-full bg-neutral-100 dark:bg-neutral-800 py-1.5 px-4 ring-1 ring-white/10 ">
                    <span>🎉 &nbsp;
                        {`We're currently in closed beta. To access the platform your email must be whitelisted.`}
                    </span>
                </div>
                <span
                    className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-neutral-400/0 via-neutral-400/90 to-neutral-400/0 transition-opacity duration-500 group-hover:opacity-40"/>
            </div>

            <div
                className="mx-4 space-y-8 border border-stone-200 py-10 dark:border-stone-700 sm:mx-auto sm:w-full sm:max-w-md sm:rounded-lg sm:shadow-md">


                <div className="sm:mx-auto sm:w-full sm:max-w-xs space-y-4">
                    <Image
                        alt="Comend"
                        width={100}
                        height={100}
                        className="relative mx-auto h-12 w-auto dark:scale-110 dark:rounded-full dark:border dark:border-stone-400"
                        src={fullLogo}
                        quality={100}
                    />
                    <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
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

                <div className="mx-auto w-11/12 max-w-xs sm:w-full">
                    <Suspense
                        fallback={
                            <div
                                className="my-2 h-10 w-full rounded-md border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800"/>
                        }
                    >
                        <LoginForm
                            callback="/app/marketplace/service-providers"
                            isCaptchaVerified={isVerified}
                        />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
