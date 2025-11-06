"use client"
import {motion} from "framer-motion"
import {useState} from "react"
import {Button} from "@comend/components/ui/button"
import {Input} from "@comend/components/ui/input"
import {Form, FormField, FormItem, FormControl} from "@comend/components/ui/form"
import {useForm} from "react-hook-form"

function PublicPageBottomBanner() {
    const form = useForm({
        defaultValues: {
            email: "",
        },
    })

    const [loading, setLoading] = useState(false)

    const onSubmit = async (values: {email: string}) => {
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
            initial={{opacity: 0, y: 50}} // More pronounced drop effect
            animate={{opacity: 1, y: [50, -10, 0]}}
            transition={{duration: 0.8, ease: [0.4, 0.0, 0.2, 1]}}
            className="sticky bottom-2 z-40 w-full mt-8 flex justify-center sm:justify-start"
        >
            <div
                className="mx-auto bg-white inline-flex flex-wrap items-center text-center rounded-full px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base leading-5 sm:leading-6 text-gray-500 ring-1 ring-gray-900/10 hover:ring-gray-900/20"
            >
                <span className="mr-3">Sign up for updates on our profile and research</span>
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
                        <Button type="submit" disabled={loading} size="sm" className="rounded-full">
                            {loading ? "Submitting..." : "Sign up"}
                        </Button>
                    </form>
                </Form>
            </div>
        </motion.div>
    )
}

export default PublicPageBottomBanner
