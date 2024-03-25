import {Footer} from '@/components/Footer'
import {CallToAction} from "@/components/CallToAction";
import Link from "next/link";

const benefits = [
    {
        title: "Annual retreat",
        description: "At least once a year we'll bring the whole team out to a location for a few days. " +
            "You'll also be given the chance to take a few days to yourself and enjoy the city itself."
    },
    {
        title: "Birthdays off",
        description: "Besides the requisite holidays of your culture/nationality, your birthday is a day for yourself on us." +
            "This comes in addition to paid time off of course."
    },
    {
        title: "Equity and options",
        description: "We believe strongly in aligning incentives, and this is especially true amongst our own team. " +
            "Every full-time employee receives equity in Comend."
    },
]

const jobOpenings = [
    {
        id: 1,
        role: 'Full stack developer',
        href: '#',
        description:
            'We mean FULL stack.',
        salary: '$125,000 USD',
        location: 'Remote | Toronto, CA preferred',
    },
    {
        id: 2,
        role: 'Laravel developer',
        href: '#',
        description:
            'Et veniam et officia dolorum rerum. Et voluptas consequatur magni sapiente amet voluptates dolorum. Ut porro aut eveniet.',
        salary: '$125,000 USD',
        location: 'San Francisco, CA',
    },
    {
        id: 3,
        role: 'React Native developer',
        href: '#',
        description:
            'Veniam ipsam nisi quas architecto eos non voluptatem in nemo. Est occaecati nihil omnis delectus illum est.',
        salary: '$105,000 USD',
        location: 'San Francisco, CA',
    },
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
                                We’re always looking for awesome people to join us
                            </h1>
                            <p className="max-w-5xl mt-6 text-xl leading-8 text-gray-600">
                                This means it doesn't matter what jobs we do or don't have listed bellow.
                                If you want to get involved and you think you have what it takes then <Link
                                href="/contact" className="hover:underline font-semibold text-blue-600">reach
                                out</Link> and we'll carve out a role for you.
                            </p>
                            <img
                                src="https://images.unsplash.com/photo-1606857521015-7f9fcf423740?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1344&h=1104&q=80"
                                alt=""
                                className="mt-16 aspect-[6/5] w-full rounded-2xl bg-gray-50 object-cover lg:aspect-auto lg:h-[34.5rem]"
                            />
                        </div>
                        <div className="w-full lg:flex-auto">
                            <h3 className="sr-only">Job openings</h3>
                            <ul className="-my-8 divide-y divide-gray-100">
                                {jobOpenings.map((opening) => (
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
                                ))}
                            </ul>
                            <div className="mt-8 flex border-t border-gray-100 pt-8">
                                Don't see a role you fit?
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
