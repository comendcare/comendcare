"use client"

import LoadingDots from "@comend/components/icons/loading-dots"
import {signIn, signOut, useSession} from "next-auth/react"
import {useRouter, useSearchParams} from "next/navigation"
import {useState, useEffect} from "react"
import {toast} from "sonner"
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@comend/components/ui/form";
import {Input} from "@comend/components/ui/input";
import {Button} from "@comend/components/ui/button";
import {z} from "zod"

const signinFormSchema = z.object({
    email: z.string({required_error: "Email is required"}).email({message: "Invalid email format"}) // Custom error message is optional
})

export default function ProviderLoginForm({callback = "/", isCaptchaVerified = true}: { callback?: string, isCaptchaVerified?: boolean }) {
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
                        disabled={!canSubmit || !form.formState.isValid || !isCaptchaVerified}
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
                    disabled={loading || !isCaptchaVerified}
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
