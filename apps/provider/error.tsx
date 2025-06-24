"use client" // Error components must be Client Components

import { useEffect } from "react"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="min-h-[calc(100vh-136px)] flex flex-grow items-center justify-center">
            <div className="p-8 text-center space-y-4">
                <h1 className="mb-4 text-4xl font-bold">404</h1>
                <blockquote className="text-gray-600">
                    {`Something went wrong...`}
                    <br />
                    {`Whatever it is it's pretty bad, and it's not your fault, it's ours.`}
                </blockquote>
                <Button
                    className={buttonVariants({ variant: "default" })}
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                >
                    Try again
                </Button>
            </div>
        </div>
    )
}
