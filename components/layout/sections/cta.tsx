import React from "react"
import { BetaSignup } from "@/components/beta-signup"

export default function CTASection({
    isSubscribedCallback,
    isSubscribed
}: {
    isSubscribedCallback: () => Promise<void>
    isSubscribed: boolean
}) {
    return (
        <section className="py-16" aria-labelledby="cta-section-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="lg:py-14 lg:px-20 p-8 rounded-2xl bg-gradient-to-r from-[#87EBA4]/70 to-[#87CEEB]/70 flex items-center justify-between flex-col lg:flex-row">
                    <div className="block text-center mb-5 lg:text-left lg:mb-0">
                        {/* Heading with aria-labelledby */}
                        <h2
                            id="cta-section-heading"
                            className="text-black text-3xl md:text-4xl font-bold mb-4"
                        >
                            🎉&nbsp;&nbsp;Become a beta tester
                        </h2>
                        <p className="text-xl text-gray-900">
                            Be the first to access features that can help you
                            push new treatments forward.
                        </p>
                    </div>

                    <div
                        className="w-fit flex flex-col space-y-2"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        <BetaSignup
                            inline={true}
                            isSubscribed={isSubscribed}
                            isSubscribedCallback={isSubscribedCallback}
                            aria-label="Beta signup form"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
