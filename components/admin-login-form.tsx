"use client"

import LoadingDots from "@/components/icons/loading-dots"
import {signIn, signOut, useSession} from "next-auth/react"
import {useRouter, useSearchParams} from "next/navigation"
import {useState, useEffect} from "react"
import {toast} from "sonner"
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {z} from "zod"

export default function AdminLoginForm({callback = "/"}: { callback?: string }) {
    const [loading, setLoading] = useState(false)

    // Get error message added by next/auth in URL.
    const searchParams = useSearchParams()
    const error = searchParams?.get("error")

    useEffect(() => {
        const errorMessage = Array.isArray(error) ? error.pop() : error
        errorMessage && toast.error(errorMessage)
    }, [error])

    return (
        <div className="flex flex-col space-y-8">

            <div className="flex flex-col space-y-2">
                <Button
                    variant="outline"
                    disabled={loading}
                    onClick={() => {
                        setLoading(true)
                        signIn("google", {
                            callbackUrl: callback
                        })
                    }}
                    className="w-full"
                >
                    {loading ? (
                        <LoadingDots color="#A8A29E"/>
                    ) : (
                        <>
                            <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 16 16">
                                <path
                                    fill="#4285F4"
                                    d="M14.9 8.161c0-.476-.039-.954-.121-1.422h-6.64v2.695h3.802a3.24 3.24 0 01-1.407 2.127v1.75h2.269c1.332-1.22 2.097-3.02 2.097-5.15z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M8.14 15c1.898 0 3.499-.62 4.665-1.69l-2.268-1.749c-.631.427-1.446.669-2.395.669-1.836 0-3.393-1.232-3.952-2.888H1.85v1.803A7.044 7.044 0 008.14 15z"
                                />
                                <path
                                    fill="#FBBC04"
                                    d="M4.187 9.342a4.17 4.17 0 010-2.68V4.859H1.849a6.97 6.97 0 000 6.286l2.338-1.803z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M8.14 3.77a3.837 3.837 0 012.7 1.05l2.01-1.999a6.786 6.786 0 00-4.71-1.82 7.042 7.042 0 00-6.29 3.858L4.186 6.66c.556-1.658 2.116-2.89 3.952-2.89z"
                                />
                            </svg>
                            <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                                Login with Google
                            </p>
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
