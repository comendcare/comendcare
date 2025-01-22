"use client"

import Image from "next/image";
import LoginForm from "@/components/login-form";
import {Suspense, useEffect} from "react";
import fullLogo from "@/public/logos/comend-full-logo.svg"
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {cn} from "@/lib/utils";
import {ChevronRight} from "lucide-react";

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
        </div>
    )
}
