/* eslint-disable camelcase */
"use client"
import React, { useState } from "react"
import { usePathname } from "next/navigation"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import mixpanel from "mixpanel-browser"
import { articles } from "@/lib/articles"
import FAQFeedbackRadioButtons, {
    FeedbackTypes
} from "./faq-feedback-radio-buttons"
import FAQFeedbackThumbs from "./faq-feedback-thumbs"
import FAQFeedbackForm from "./faq-feedback-form"
import { toast } from "sonner"
import { customerIOTrack } from "@/lib/customer-io"
// import { useMixpanelContext } from "@/app/AnalyticsScrips"
// import { createFAQFeedbackTicket } from "@/lib/notion"

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

export default function FAQFeedback() {
    const pathWithoutAnchor = usePathname().split("#")[0]
    const [submitted, setSubmitted] = useState(false)
    // const { mixpanelContext } = useMixpanelContext()

    // thumbs up/down, radio buttons (for more details), feedback text form, for even more details
    const [feedback, setFeedback] = useState<FAQFeedbackType>({})

    const getArticleData = (): {
        prompt: string | undefined
        description: string | undefined
        href: string
    } => {
        const articleData = articles.find(
            article => article.href === pathWithoutAnchor
        )
        return {
            prompt: articleData?.prompt,
            description: articleData?.description,
            href: window.location.toString()
        }
    }

    const handleSubmitFeedback = async (feedback: FAQFeedbackType) => {
        try {
            const article = getArticleData()
            mixpanel.track("FAQ Feedback", {
                helpful: feedback.helpful,
                ...(feedback.issueType
                    ? { issueType: feedback.issueType }
                    : undefined),
                ...(feedback.name ? { name: feedback.name } : undefined),
                ...(feedback.email ? { email: feedback.email } : undefined),
                ...(feedback.issueDescription
                    ? { issueDescription: feedback.issueDescription }
                    : undefined),
                article_prompt: article.prompt,
                article_description: article.description,
                article_path: article.href
            })

            // await customerIOTrack({
            //     userId: mixpanelContext?.distinctId,
            //     event: "faq_feedback_sent",
            //     properties: {
            //         helpful: feedback.helpful ? "true" : "false",
            //         name: feedback.name,
            //         email: feedback.email,
            //         issue_type: feedback.issueType,
            //         issue_description: feedback.issueDescription,
            //         article_prompt: article.prompt,
            //         article_description: article.description,
            //         article_path: article.href
            //     }
            // })

            // if (feedback.issueDescription) {
            //     await createFAQFeedbackTicket({
            //         name: feedback.name || "",
            //         email: feedback.email || "",
            //         helpful: feedback.helpful ? true : false,
            //         issue_type: feedback.issueType || "",
            //         issue_description: feedback.issueDescription || "",
            //         article_prompt: article.prompt || "",
            //         article_path: article.href || "",
            //         article_description: article.description || ""
            //     })
            // }

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
                            // console.log(`Canceled...`)
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
