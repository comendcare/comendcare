import {Footer} from '@/components/Footer'
import {Header} from '@/components/Header'
import Flawnson from "@/images/profiles/Flawnson.jpg"
import Sierra from "@/images/profiles/Sierra.jpeg"

const people = [
    {
        name: 'Albert Wang',
        role: 'Co-founder and CEO',
        imageUrl:
            Flawnson,
        bio: 'I went to school for biomedical engineering, have worked with deep tech startups and in life sciences research, and spent a past life volunteering with kids. On the weekend, I try to catch up with the happenings in genomics.',
    },
    {
        name: 'Flawnson Tong',
        role: 'Co-founder and CTO',
        imageUrl:
            Flawnson,
        bio: 'Hi there! I’m the guy behind the screen building what you see here. My background is in machine learning engineering and these days I do a lot of full stack development. I love playing piano, travelling, and working out.',
    },
    {
        name: 'Sierra Phillips',
        role: 'Advisor',
        imageUrl:
            Sierra,
        bio: 'Quia illum aut in beatae. Possimus dolores aliquid accusantium aut in ut non assumenda. Enim iusto molestias aut deleniti eos aliquid magnam molestiae. At et non possimus ab. Magni labore molestiae nulla qui.',
    },
]

const timeline = [
    {
        name: 'Comend is founded',
        description:
            'We re-united to fix broken areas of healthcare after working in drug development and biomedical engineering.',
        date: 'Jan 2023',
        dateTime: '2023-01',
    },
    {
        name: 'First investment',
        description:
            'We received investment from Character Labs to build solutions for rare families. We met Sierra in one of our early user tests.',
        date: 'Apr 2023',
        dateTime: '2023-04',
    },
    {
        name: 'Launched Librarey',
        description:
            `With Sierra's help, we launched a free search platform for rare resources and attended rare disease conferences to gather feedback.` ,
        date: 'Sep 2023',
        dateTime: '2023-09',
    },
    {
        name: 'Launching 2 products',
        description:
            `We're currently working with several patient groups to build a new scientific communicator and patient data platform.`,
        date: 'Jan 2024',
        dateTime: '2024-01',
    },
]

export default function About() {
    return (
        <>
            <main>
                <div className="mx-auto max-w-7xl px-6 py-32 sm:py-20 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6 xl:grid-cols-1 xl:grid-rows-1 xl:gap-x-8">
                        <h1 className="max-w-2xl text-4xl font-display font-medium tracking-tight text-gray-900 sm:text-6xl lg:col-span-2 xl:col-auto">
                            We’re a passionate group working to empower a patient-led future for research and development.
                        </h1>
                        <div className="mt-6 max-w-xl lg:mt-0 xl:col-end-1 xl:row-start-1">
                            <p className="text-lg leading-8 text-gray-600">
                                We’re a team of tech enthusiasts and advocates who see that institutions lack incentives to build infrastructure for rare diseases.
                                We believe the way to foster new treatments is to amplify the grassroots work of patient groups who fight for what patients need.
                            </p>
                        </div>
                        <img
                            src="https://images.unsplash.com/photo-1567532900872-f4e906cbf06a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1280&q=80"
                            alt=""
                            className="aspect-[6/5] w-full max-w-lg rounded-2xl object-cover lg:max-w-none xl:row-span-2 xl:row-end-2"
                        />
                    </div>
                </div>

                {/* Timeline section */}
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 overflow-hidden lg:mx-0 lg:max-w-none lg:grid-cols-4">
                        {timeline.map((item) => (
                            <div key={item.name}>
                                <time
                                    dateTime={item.dateTime}
                                    className="flex items-center text-sm font-semibold leading-6 text-blue-600"
                                >
                                    <svg viewBox="0 0 4 4" className="mr-4 h-1 w-1 flex-none" aria-hidden="true">
                                        <circle cx={2} cy={2} r={2} fill="currentColor" />
                                    </svg>
                                    {item.date}
                                    <div
                                        className="absolute -ml-2 h-px w-screen -translate-x-full bg-gray-900/10 sm:-ml-4 lg:static lg:-mr-6 lg:ml-8 lg:w-auto lg:flex-auto lg:translate-x-0"
                                        aria-hidden="true"
                                    />
                                </time>
                                <p className="mt-6 text-lg font-semibold leading-8 tracking-tight text-gray-900">{item.name}</p>
                                <p className="mt-1 text-base leading-7 text-gray-600">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white py-24 sm:py-32">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl sm:text-center">
                            <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">Meet the team</h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                {`Want to chat or collaborate? We're all ears! Contact us.`}
                            </p>
                        </div>
                        <ul
                            role="list"
                            className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-6 gap-y-20 sm:grid-cols-2 lg:max-w-4xl lg:gap-x-8 xl:max-w-none"
                        >
                            {people.map((person) => (
                                <li key={person.name} className="flex flex-col gap-6 xl:flex-row">
                                    <img className="aspect-[4/5] w-52 flex-none rounded-2xl object-cover" src={person.imageUrl.src} alt="" />
                                    <div className="flex-auto">
                                        <h3 className="text-lg font-semibold leading-8 tracking-tight text-gray-900">{person.name}</h3>
                                        <p className="text-base leading-7 text-gray-600">{person.role}</p>
                                        <p className="mt-6 text-base leading-7 text-gray-600">{person.bio}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </main>
            <Footer/>
        </>
    )
}
