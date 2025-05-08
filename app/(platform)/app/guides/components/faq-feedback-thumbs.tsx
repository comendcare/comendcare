/* eslint-disable camelcase */
"use client"
import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThumbsDown, ThumbsUp } from "lucide-react"

export default function FAQFeedbackThumbs({
    feedbackCallback
}: {
    feedbackCallback: (helpful: boolean) => void
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{`Was this article helpful?`}</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-8 flex-col md:flex-row">
                <Button
                    onClick={() => {
                        feedbackCallback(true)
                    }}
                    variant="outline"
                    className="p-8 grow flex flex-row items-center space-x-4"
                >
                    <div className="flex flex-row items-center space-x-4">
                        <ThumbsUp className="w-8 h-8" />
                        <h3 className="text-base font-semibold leading-6 text-gray-900 m-0">
                            Yes
                        </h3>
                    </div>
                </Button>
                <Button
                    onClick={() => {
                        feedbackCallback(false)
                    }}
                    variant="outline"
                    className="p-8 grow flex flex-row items-center space-x-4"
                >
                    <div className="flex flex-row items-center space-x-4">
                        <ThumbsDown className="w-8 h-8" />
                        <h3 className="text-base font-semibold leading-6 text-gray-900 m-0">
                            No
                        </h3>
                    </div>
                </Button>
            </CardContent>
        </Card>
    )
}
