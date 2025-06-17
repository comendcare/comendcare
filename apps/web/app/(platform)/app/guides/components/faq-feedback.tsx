/* eslint-disable camelcase */
"use client"
import React, { useState } from "react"
import { usePathname } from "next/navigation"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { articles } from "@/lib/articles"
import FAQFeedbackRadioButtons, {
    FeedbackTypes
} from "./faq-feedback-radio-buttons"
import FAQFeedbackThumbs from "./faq-feedback-thumbs"
import FAQFeedbackForm from "./faq-feedback-form"
import { toast } from "sonner"
import { customerIOTrack } from "@/lib/customer-io"
import { mixpanelTrack, useMixpanelContext } from "@/mixpanel"
import { createGuidesFeedbackTicket } from "@/lib/notion"

interface FAQFeedbackType {
    helpful?: boolean
    issueType?:
        | "innaccurate"
        | "incomplete"
        | "confusing"
        | "not-looking-for"
        | "other"
    name?: string
    email?: string
    issueDescription?: string
}

export default function FAQFeedback({title, description}: {title: string, description: string}) {
    const pathWithoutAnchor = usePathname().split("#")[0]
    const [submitted, setSubmitted] = useState(false)
    const { mixpanelContext } = useMixpanelContext()

    // thumbs up/down, radio buttons (for more details), feedback text form, for even more details
    const [feedback, setFeedback] = useState<FAQFeedbackType>({})

    const handleSubmitFeedback = async (feedback: FAQFeedbackType) => {
        try {
            const path = window.location.toString()
            mixpanelTrack("Guides Feedback", {
                helpful: feedback.helpful,
                ...(feedback.issueType
                    ? { issueType: feedback.issueType }
                    : undefined),
                ...(feedback.name ? { name: feedback.name } : undefined),
                ...(feedback.email ? { email: feedback.email } : undefined),
                ...(feedback.issueDescription
                    ? { issueDescription: feedback.issueDescription }
                    : undefined),
                article_prompt: title,
                article_description: description,
                article_path: path
            })

            await customerIOTrack({
                userId: mixpanelContext?.distinctId,
                event: "guides_feedback_sent",
                properties: {
                    helpful: feedback.helpful ? "true" : "false",
                    name: feedback.name,
                    email: feedback.email,
                    issue_type: feedback.issueType,
                    issue_description: feedback.issueDescription,
                    article_prompt: title,
                    article_description: description,
                    article_path: path
                }
            })

            if (feedback.issueDescription) {
                await createGuidesFeedbackTicket({
                    name: feedback.name || "",
                    email: feedback.email || "",
                    helpful: feedback.helpful ? true : false,
                    issue_type: feedback.issueType || "",
                    issue_description: feedback.issueDescription || "",
                    article_prompt: title || "",
                    article_path: path || "",
                    article_description: description || ""
                })
            }

            setSubmitted(true)

            if (feedback.helpful === true) {
                toast("Success!")
            } else {
                toast("Success!", {
                    description: `Thank you for your feedback. We'll get back to you within 48 hours.`
                })
            }
        } catch (e) {
            console.error(`Error: `, e)
            toast("Error!", {
                description: `Something went wrong while trying to send your feedback. If this issue persists, please email us at support@comendcare.com`
            })
        }
    }

    const handleThumbsFeedback = (helpful: boolean) => {
        if (helpful) {
            handleSubmitFeedback({ helpful })
        } else {
            setFeedback({ ...feedback, helpful })
        }
    }

    const handleRadioButtonsFeedback = (issueType: FeedbackTypes) => {
        setFeedback({ ...feedback, issueType })
    }

    const handleFormFeedback = (
        name: string,
        email: string,
        issueDescription: string
    ) => {
        handleSubmitFeedback({
            ...feedback,
            name,
            email,
            issueDescription
        })
    }

    return (
        <Card>
            {submitted && (
                <CardHeader>
                    <CardTitle>{`Thank you for your feedback!`}</CardTitle>
                </CardHeader>
            )}

            {!submitted && Object.keys(feedback).length === 0 && (
                <FAQFeedbackThumbs
                    feedbackCallback={helpful => {
                        handleThumbsFeedback(helpful)
                    }}
                />
            )}

            {!submitted &&
                Object.keys(feedback).length === 1 &&
                feedback.helpful !== undefined && (
                    <FAQFeedbackRadioButtons
                        cancelCallback={() => {
                            // console.log(`Canceled...`)
                            setFeedback({})
                        }}
                        feedbackCallback={issueType => {
                            handleRadioButtonsFeedback(issueType)
                        }}
                    />
                )}

            {!submitted &&
                Object.keys(feedback).length === 2 &&
                feedback.helpful !== undefined &&
                feedback.issueType !== undefined && (
                    <FAQFeedbackForm
                        issueType={feedback.issueType}
                        cancelCallback={() => {
                            setFeedback({})
                        }}
                        feedbackCallback={(name, email, issueDescription) => {
                            handleFormFeedback(name, email, issueDescription)
                        }}
                    />
                )}
        </Card>
    )
}
