import {Footer} from '@/components/Footer'
import {CallToAction} from "@/components/CallToAction";
import Link from "next/link";
import {FaChartLine, FaCakeCandles, FaSeedling, FaMoneyBill, FaPlane} from "react-icons/fa6";

const benefits = [
    {
        title: "Annual retreat",
        description: "At least once a year we'll bring the whole team out to a location for a few days. " +
            "You'll also be given the chance to take a few days to yourself and enjoy the city itself.",
        icon: FaPlane
    },
    {
        title: "Birthdays off",
        description: "Besides the requisite holidays of your culture/nationality, your birthday is a day for yourself on us. " +
            "This comes in addition to paid time off of course.",
        icon: FaCakeCandles
    },
    {
        title: "Equity and options",
        description: "We believe strongly in aligning incentives, and this is especially true amongst our own team. " +
            "Every full-time employee receives equity in Comend.",
        icon: FaChartLine
    },
    {
        title: "Internal growth",
        description: "All team members are subject to annual raises, improved benefits, and opportunities to be promoted from within. " +
            "This is non-negotiable.",
        icon: FaSeedling
    },
    {
        title: "Signing bonus",
        description: "Every filled opening comes with a little thank you and welcome to the team.",
        icon: FaMoneyBill
    },
    {
        title: "Flexible work environment",
        description: "This means flexible hours, remote and hybrid work options, and generally relaxed policies around work. " +
            "We trust our team members.",
        icon: FaMoneyBill
    },
]

const jobOpenings: any[] = [
    // {
    //     id: 1,
    //     role: 'Full Stack Founding Engineer',
    //     href: 'https://comend.notion.site/Full-Stack-Engineer-9ef3214c9f0246f5a89d0cdd07a534d2?pvs=4',
    //     description:
    //         'Partner closely with the CTO to build product. Particular emphasis on DevOps and backend engineering.',
    //     salary: '$80,000 - $150,000',
    //     location: 'Remote | Toronto, CA preferred',
    // },
    // {
    //     id: 1,
    //     role: 'Frontend Engineer',
    //     href: 'https://comend.notion.site/Full-Stack-Engineer-9ef3214c9f0246f5a89d0cdd07a534d2?pvs=4',
    //     description:
    //         `Partner closely with the CTO to build product. We're looking for someone with some product design experience.`,
    //     salary: '$80,000 - $150,000',
    //     location: 'Remote | Toronto, CA preferred',
    // },
    // {
    //     id: 2,
    //     role: 'Social Media and Community Coordinator',
    //     href: 'https://comend.notion.site/Comend-Social-Media-and-Community-Coordinator-9f30311cb0134109a5c0abd3aaf32830?pvs=74',
    //     description:
    //         'Drive brand awareness, foster meaningful connections, and support our mission by partnering closely with our Product team.',
    //     salary: 'Contractor',
    //     location: 'Remote',
    // },
]

export default function Careers() {

    return (
        <>
            <main>
                <div className="mx-auto max-w-7xl px-6 py-32 sm:py-20 lg:px-8">
                    <div
                        className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-16 lg:mx-0 lg:max-w-none">
                        <div className="flex flex-col items-center w-full text-center lg:flex-auto">
                            <h1 className="max-w-4xl text-4xl font-display font-medium tracking-tight text-gray-900 sm:text-6xl lg:col-span-2 xl:col-auto">
                                {`We’re always looking for awesome people to join us`}
                            </h1>
                            <p className="max-w-5xl mt-6 text-xl leading-8 text-gray-600">
                                {`This means it doesn't matter what jobs we do or don't have listed bellow.
                                If you want to get involved and you think you have what it takes then `}
                                <Link
                                    href="/contact" className="hover:underline font-semibold text-blue-600">
                                    reach out
                                </Link>
                                {` and we'll carve out a role for you.`}
                            </p>
                            <img
                                src="https://images.unsplash.com/photo-1606857521015-7f9fcf423740?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1344&h=1104&q=80"
                                alt=""
                                className="mt-16 aspect-[6/5] w-full rounded-2xl bg-gray-50 object-cover lg:aspect-auto lg:h-[34.5rem]"
                            />
                        </div>

                        <div className="bg-white py-24 sm:py-32">
                            <div className="flex flex-col justify-center items-center mx-auto max-w-7xl px-6 lg:px-8">
                                <div className="text-center mx-auto max-w-2xl lg:mx-0">
                                    <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
                                        {`We're a growing startup`}
                                    </h2>
                                    <p className="mt-6 text-lg leading-8 text-gray-600">
                                        {`We're lean and agile, and we care a lot about attracting the best talent.
                                        That means doing our best to offer some perks.`}
                                    </p>
                                </div>
                                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                                        {benefits.map((feature) => (
                                            <div key={feature.title} className="flex flex-col">
                                                <dt className="text-base font-semibold leading-7 text-gray-900">
                                                    <div
                                                        className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                                                        <feature.icon className="h-6 w-6 text-white"
                                                                      aria-hidden="true"/>
                                                    </div>
                                                    {feature.title}
                                                </dt>
                                                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                                    <p className="flex-auto">{feature.description}</p>
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div
                            className="flex flex-col items-center justify-center w-full text-center mx-auto max-w-2xl lg:mx-0">
                            <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
                                {`Our openings`}
                            </h2>
                        </div>
                        <div className="w-full lg:flex-auto mb-24">
                            <ul className="-my-8 divide-y divide-gray-100">
                                {jobOpenings.length > 0 ? jobOpenings.map((opening) => (
                                    <li key={opening.id} className="py-8">
                                        <dl className="relative flex flex-wrap gap-x-3">
                                            <dt className="sr-only">Role</dt>
                                            <dd className="w-full flex-none text-lg font-semibold tracking-tight text-gray-900 hover:text-blue-600">
                                                <a href={opening.href}>
                                                    {opening.role}
                                                    <span className="absolute inset-0" aria-hidden="true"/>
                                                </a>
                                            </dd>
                                            <dt className="sr-only">Description</dt>
                                            <dd className="mt-2 w-full flex-none text-base leading-7 text-gray-600">{opening.description}</dd>
                                            <dt className="sr-only">Salary</dt>
                                            <dd className="mt-4 text-base font-semibold leading-7 text-gray-900">{opening.salary}</dd>
                                            <dt className="sr-only">Location</dt>
                                            <dd className="mt-4 flex items-center gap-x-3 text-base leading-7 text-gray-500">
                                                <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 flex-none fill-gray-300"
                                                     aria-hidden="true">
                                                    <circle cx={1} cy={1} r={1}/>
                                                </svg>
                                                {opening.location}
                                            </dd>
                                        </dl>
                                    </li>
                                )) : <div className="py-8">
                                    {`We're not hiring right now, but we welcome you to check back soon for future opportunities!`}
                                </div>
                                }
                            </ul>
                            <div className="mt-8 flex border-t border-gray-100 pt-8">
                                {`Don't see a role you fit?`}
                                <Link href="/contact"
                                      className="hover:underline font-semibold leading-6 text-blue-600 hover:text-blue-500">
                                    &nbsp;Get in touch <span aria-hidden="true">&rarr;</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <CallToAction/>

            </main>
            <Footer/>
        </>
    )
}
