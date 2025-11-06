"use client"
import {motion, useScroll, useMotionValueEvent} from "framer-motion"
import {useRef, useState} from "react"
import {Button} from "@comend/components/ui/button"
import {Input} from "@comend/components/ui/input"
import {Form, FormField, FormItem, FormControl} from "@comend/components/ui/form"
import {useForm} from "react-hook-form"
import {cn} from "@comend/lib/utils"

function PublicPageBottomBanner() {
    const ref = useRef<HTMLDivElement>(null)
    const {scrollY} = useScroll()
    const [visible, setVisible] = useState(false)

    useMotionValueEvent(scrollY, "change", (latest) => {
        setVisible(latest > 40)
    })

    const form = useForm({
        defaultValues: { email: "" },
    })

    const [loading, setLoading] = useState(false)

    const onSubmit = async (values: { email: string }) => {
        setLoading(true)
        try {
            console.log("Submitted email:", values.email)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            ref={ref}
            // Stick just above the footer; if you expose --footer-height, it will offset cleanly.
            className="fixed inset-x-0 z-50"
            style={{ bottom: "var(--footer-height, 0px)" }}
        >
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{
                    opacity: 1,
                    y: [50, -10, 0],
                    backdropFilter: visible ? "blur(10px)" : "none",
                    boxShadow: visible
                        ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05)"
                        : "none",
                    width: visible ? "90%" : "100%", // mobile-first width
                }}
                transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
                className={cn(
                    "mx-auto px-4 py-2 sm:py-3 flex justify-center sm:justify-start",
                    "lg:w-[40%]", // tighten on large screens (mirrors your header feel)
                )}
            >
                <div
                    className={cn(
                        "bg-white inline-flex flex-wrap items-center text-center rounded-full",
                        "px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base leading-5 sm:leading-6",
                        "text-gray-500 ring-1 ring-gray-900/10 hover:ring-gray-900/20",
                        visible && "bg-white/80 dark:bg-neutral-950/80"
                    )}
                >
                    <span className="mr-3">Sign up for updates on our profile and research</span>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
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
                            <Button type="submit" disabled={loading} size="sm" className="rounded-full">
                                {loading ? "Submitting..." : "Sign up"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default PublicPageBottomBanner
