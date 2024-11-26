"use client"

import Image from "next/image";
import LoginForm from "@/components/login-form";
import {Suspense, useEffect} from "react";
import fullLogo from "@/public/logos/comend-full-logo.svg"
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";

export default function LoginPage() {
    const {data: session} = useSession()
    const router = useRouter();

    useEffect(() => {
        if (session) {
            // Redirect to /app/profile if the user is signed in
            router.push("/app/profile")
        }
    }, [session])

    return (
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
                <p className="text-center text-sm">
                    {`Create an account by email, logging in for the first time to access Comend's marketplace and research planner.`}
                </p>
            </div>

            <div className="mx-auto w-11/12 max-w-xs sm:w-full">
                <Suspense
                    fallback={
                        <div
                            className="my-2 h-10 w-full rounded-md border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800"/>
                    }
                >
                    <LoginForm
                        callback="/app/profile"
                    />
                </Suspense>
            </div>
        </div>
    )
}
