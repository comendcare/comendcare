"use client"

import {ContactForm} from "@/components/contact-form"

export default function ContactPage() {

    return (
        <div
            className="container max-w-7xl mx-auto flex flex-col justify-center items-center space-y-16 px-8 py-16 md:py-24 mt-16"
        >
            <ContactForm/>
        </div>
    )
}
