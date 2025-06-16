"use client"

import Image from "next/image";
import {Suspense, useEffect, useRef, useState} from "react";
import logo from "@/public/logos/comend-logo.png"
import {useRouter, useSearchParams} from "next/navigation";
import {toast} from "sonner";
import AdminLoginForm from "@/components/admin-login-form";
import ReCAPTCHA from "react-google-recaptcha";
import {useSession} from "next-auth/react";

export default function AdminLoginPage() {
    const {data: session} = useSession()
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
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
            router.push("/app/admin")
        }

        // Check cookie manually
        const cookieValue = document.cookie
            .split("; ")
            .find(row => row.startsWith("require_captcha="))
            ?.split("=")[1]

        const needsCaptcha = cookieValue === "true";
        setRequireCaptcha(needsCaptcha);
        setIsVerified(!needsCaptcha)

    }, [router, session])

    useEffect(() => {
        // Show toast based on the error parameter
        if (error === "unauthenticated") {
            toast.info("Please sign in", {
                description: "You need to sign in to access this area.",
            });
        } else if (error === "notAdmin") {
            toast.info("Access restricted", {
                description: "You don't have permission to access this area.",
            });
        }
    }, [error])

    return (
        <div
            className="mx-5 border border-stone-200 py-10 dark:border-stone-700 sm:mx-auto sm:w-full sm:max-w-md sm:rounded-lg sm:shadow-md">
            <Image
                alt="Comend"
                width={100}
                height={100}
                className="relative mx-auto h-12 w-auto dark:scale-110 dark:rounded-full dark:border dark:border-stone-400"
                src={logo}
            />
            <h1 className="mt-6 text-center font-cal text-3xl dark:text-white">
                Comend Admin
            </h1>

            <div className="mx-auto mt-4 w-11/12 max-w-xs sm:w-full">
                <Suspense
                    fallback={
                        <div
                            className="my-2 h-10 w-full rounded-md border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800"/>
                    }
                >
                    <AdminLoginForm callback="/admin" />
                </Suspense>
            </div>
        </div>
    );
}
