"use client"
import {motion} from "framer-motion"
import {useState} from "react"
import {Button} from "@comend/components/ui/button"
import {Input} from "@comend/components/ui/input"
import {Form, FormField, FormItem, FormControl} from "@comend/components/ui/form"
import {useForm} from "react-hook-form"
import {subscribeToOrganization} from "@/packages/lib/actions";

export default function PublicPageBottomBanner() {
    const form = useForm({
        defaultValues: {
            email: "",
        },
    })

    const [loading, setLoading] = useState(false)

    const onSubmit = async (values: { email: string }) => {
        setLoading(true);
        try {
            const host = typeof window !== "undefined" ? window.location.hostname : null;
            const res = await subscribeToOrganization(values.email, host);
            if (!res.success) {
                console.error(res.error);
                // optional: surface a toast here
            } else {
                // optional: toast "Thanks! You're subscribed."
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{opacity: 0, y: 50}} // More pronounced drop effect
            animate={{opacity: 1, y: [50, -10, 0]}}
            transition={{duration: 0.8, ease: [0.4, 0.0, 0.2, 1]}}
            className="px-4 sticky bottom-4 z-40 w-full mt-8 flex justify-center sm:justify-start"
        >
            <div
                className="mx-auto backdrop-blur bg-[rgba(220,235,254,0.7)] inline-flex flex-col space-y-2 sm:space-y-0 sm:flex-row flex-wrap items-center text-center rounded-full px-4 py-2 sm:px-6 sm:py-3 text-base leading-5 sm:leading-6 text-gray-800 ring-1 ring-gray-900/10 hover:ring-gray-900/20"
            >
                <span className="mr-3">
                    Get updates on our research
                </span>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder="Your email"
                                            className="h-8 w-48 sm:w-56 rounded-full"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" variant="cta" disabled={loading} size="sm" className="rounded-full">
                            {loading ? "Submitting..." : "Submit"}
                        </Button>
                    </form>
                </Form>
            </div>
        </motion.div>
    )
}
