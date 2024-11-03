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

const signinFormSchema = z.object({
    email: z.string({required_error: "Email is required"}).email({message: "Invalid email format"}) // Custom error message is optional
})

export default function LoginForm({callback = "/"}: { callback?: string }) {
    const {data: session} = useSession()
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [canSubmit, setCanSubmit] = useState(false)
    const form = useForm({
        mode: "onChange",
        resolver: zodResolver(signinFormSchema),
        defaultValues: {
            email: ""
        }
    })
    const email = form.watch("email")

    useEffect(() => {
        const result = signinFormSchema.safeParse({email})
        setCanSubmit(result.success)
    }, [email])

    // Get error message added by next/auth in URL.
    const searchParams = useSearchParams()
    const error = searchParams?.get("error")

    useEffect(() => {
        const errorMessage = Array.isArray(error) ? error.pop() : error
        errorMessage && toast.error(errorMessage)
    }, [error])

    return (
        <div className="flex flex-col space-y-8">
            <Form {...form}>
                <form className="space-y-2">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Email address</FormLabel>
                                <FormControl>
                                    <Input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                                        // value={email}
                                        // onChange={handleEmailChange}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        variant="outline"
                        onClick={async (e) => {
                            e.preventDefault();
                            setLoading(true);

                            // Trigger the signIn for email
                            const result = await signIn("email", {
                                email,
                                redirect: false, // Prevent automatic redirect
                                callbackUrl: callback,
                            });

                            // Check if signIn succeeded, then manually route to verify page
                            if (result?.ok) {
                                router.push("/login/verify-request");
                            } else {
                                toast.error("There was an error signing in. Please try again.");
                            }
                            setLoading(false);
                        }}
                        disabled={!canSubmit || !form.formState.isValid}
                        className="w-full"
                    >
                        {`Sign in`}
                    </Button>
                </form>
            </Form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-200"/>
                </div>
                <div className="relative flex justify-center text-sm font-medium leading-6">
                    <span className="bg-white px-6 text-gray-900">Or continue with</span>
                </div>
            </div>

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

                <Button
                    variant="outline"
                    disabled={loading}
                    onClick={() => {
                        setLoading(true)
                        signIn("facebook", {
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
                                    fill="#1877F2"
                                    d="M15 8a7 7 0 00-7-7 7 7 0 00-1.094 13.915v-4.892H5.13V8h1.777V6.458c0-1.754 1.045-2.724 2.644-2.724.766 0 1.567.137 1.567.137v1.723h-.883c-.87 0-1.14.54-1.14 1.093V8h1.941l-.31 2.023H9.094v4.892A7.001 7.001 0 0015 8z"
                                />
                                <path
                                    fill="#ffffff"
                                    d="M10.725 10.023L11.035 8H9.094V6.687c0-.553.27-1.093 1.14-1.093h.883V3.87s-.801-.137-1.567-.137c-1.6 0-2.644.97-2.644 2.724V8H5.13v2.023h1.777v4.892a7.037 7.037 0 002.188 0v-4.892h1.63z"
                                />
                            </svg>
                            <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                                Login with Facebook
                            </p>
                        </>
                    )}
                </Button>

                <Button
                    variant="outline"
                    disabled={loading}
                    onClick={() => {
                        setLoading(true)
                        signIn("linkedin", {
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
                                    fill="#0A66C2"
                                    d="M12.225 12.225h-1.778V9.44c0-.664-.012-1.519-.925-1.519-.926 0-1.068.724-1.068 1.47v2.834H6.676V6.498h1.707v.783h.024c.348-.594.996-.95 1.684-.925 1.802 0 2.135 1.185 2.135 2.728l-.001 3.14zM4.67 5.715a1.037 1.037 0 01-1.032-1.031c0-.566.466-1.032 1.032-1.032.566 0 1.031.466 1.032 1.032 0 .566-.466 1.032-1.032 1.032zm.889 6.51h-1.78V6.498h1.78v5.727zM13.11 2H2.885A.88.88 0 002 2.866v10.268a.88.88 0 00.885.866h10.226a.882.882 0 00.889-.866V2.865a.88.88 0 00-.889-.864z"
                                />
                            </svg>
                            <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                                Login with LinkedIn
                            </p>
                        </>
                    )}
                </Button>

                <Button
                    variant="outline"
                    disabled={loading}
                    onClick={() => {
                        setLoading(true)
                        signIn("github", {
                            callbackUrl: callback
                        })
                    }}
                    className="w-full"
                >
                    {loading ? (
                        <LoadingDots color="#A8A29E"/>
                    ) : (
                        <>
                            <svg
                                className="h-4 w-4 text-black dark:text-white"
                                aria-hidden="true"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                                Login with Github
                            </p>
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
