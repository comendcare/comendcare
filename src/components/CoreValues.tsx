import Image from 'next/image'

import {Button} from '@/components/Button'
import {Container} from '@/components/Container'
import backgroundImage from '@/images/background-call-to-action.jpg'

export function CoreValues() {

    const coreValues = [
        {
            heading: "Designed by and for the people",
            description: "We strive to do everything in partnership with the community. We welcome feedback with open arms. Every decision we make should be towards the benefit of our users, and we believe we can only make those decisions if we build with our users."
        },
        {
            heading: "Build things that last",
            description: "We move with urgency to disrupt the status quo and with the self-awareness to avoid breaking things. We aim to achieve a state of sustainable disruption by building robust products that can be the foundation for future growth."
        },
        {
            heading: "Lead with transparency",
            description: "We endeavour to keep our incentives aligned with the community at all times, and achieve our goals transparently. At every step of the way, we build in public and communicate our progress."
        },
        {
            heading: "Great science can come from you",
            description: "We’re believers in the productive power of citizen science, and that the future of science is in the hands of those that reject rejection. We want to support mission-aligned members of the community and believe these special individuals can come from anywhere."
        },
    ]

    return (
        <section
            id="core-values"
            aria-label="Solutions to help grow patient groups"
            className="flex flex-col items-center mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8"
        >
            <div className="flex flex-col items-center max-w-2xl lg:mx-0">
                <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
                    Our values
                </h2>
                <p className="mt-6 text-lg leading-8 text-gray-600 text-center">
                    {`We follow a few guiding principles.`}
                </p>
            </div>
            <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 text-base leading-7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                {coreValues.map((coreValue) => (
                    <div key={coreValue.heading}>
                        <dt className="font-semibold text-gray-900">{coreValue.heading}</dt>
                        <dd className="mt-1 text-gray-600">{coreValue.description}</dd>
                    </div>
                ))}
            </dl>
        </section>
    )
}
