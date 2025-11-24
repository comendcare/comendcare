import React from "react"
import {Button} from "@comend/components/ui/button";
import Link from "next/link";

export default function ContactSection() {
    return (
        <section className="py-16" aria-labelledby="contact">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="lg:py-12 lg:px-16 p-8 rounded-2xl bg-gradient-to-r from-[#87EBA4]/70 to-[#87CEEB]/70 flex items-center justify-between flex-col lg:flex-row">
                    <div className="block text-center mb-5 lg:text-left lg:mb-0">
                        {/* Heading with aria-labelledby */}
                        <h2
                            id="contact"
                            className="text-black text-2xl md:text-3xl font-bold mb-4"
                        >
                            🧑🏻‍💻&nbsp;&nbsp;Want to see what we can do for you?
                        </h2>
                        <p className="text-xl text-gray-900">
                            Schedule a personalized 30 minute demo to see how we can help your organization plan, partner, and broadcast your research.
                        </p>
                    </div>

                    <div
                        className="w-fit flex flex-col space-y-2"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {/*<BetaSignup*/}
                        {/*    inline={true}*/}
                        {/*    isSubscribed={isSubscribed}*/}
                        {/*    isSubscribedCallback={isSubscribedCallback}*/}
                        {/*    aria-label="Beta signup form"*/}
                        {/*/>*/}
                        {/*<SimpleContactForm />*/}
                        <Button
                            variant="cta"
                            className="w-fit"
                            asChild
                        >
                            <Link href={"https://calendly.com/albertatcomend/onboarding"}>
                                Sign up
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
