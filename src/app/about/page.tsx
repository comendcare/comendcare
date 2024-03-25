import {Footer} from '@/components/Footer'
import TeamPhoto from "@/images/profiles/comend-team.jpeg"
import {Team} from '@/components/Team'
import {CallToAction} from "@/components/CallToAction";
import {CoreValues} from "@/components/CoreValues";
import {LogoCloud} from "@/components/LogoCloud";
import {JoinTeam} from "@/components/JoinTeam";


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
            `With Sierra's help, we launched a free search platform for rare resources and attended rare disease conferences to gather feedback.`,
        date: 'Sep 2023',
        dateTime: '2023-09',
    },
    {
        name: 'Launching 2 products',
        description:
            `We're currently working with several patient groups to build a new scientific communicator and patient data platform.`,
        date: 'Mar 2024',
        dateTime: '2024-01',
    },
]

export default function About() {
    return (
        <>
            <main>
                <div className="mx-auto max-w-7xl px-6 py-32 sm:py-20 lg:px-8">
                    <div
                        className="mx-auto max-w-2xl lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6 xl:grid-cols-1 xl:grid-rows-1 xl:gap-x-8">
                        <h1 className="max-w-2xl text-4xl font-display font-medium tracking-tight text-gray-900 sm:text-6xl lg:col-span-2 xl:col-auto">
                            We’re a passionate group working to empower a patient-led future for research and
                            development.
                        </h1>
                        <div className="mt-6 max-w-xl lg:mt-0 xl:col-end-1 xl:row-start-1">
                            <p className="text-lg leading-8 text-gray-600">
                                We’re a team of tech enthusiasts and advocates who see that institutions lack incentives
                                to build infrastructure for rare diseases.
                                We believe the way to foster new treatments is to amplify the grassroots work of patient
                                groups who fight for what patients need.
                            </p>
                        </div>
                        <img
                            src={TeamPhoto.src}
                            alt="The Comend team"
                            className="aspect-[6/5] w-full max-w-lg rounded-2xl object-cover lg:max-w-none xl:row-span-2 xl:row-end-2"
                        />
                    </div>
                </div>

                {/* Timeline section */}
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div
                        className="mx-auto grid max-w-2xl grid-cols-1 gap-8 overflow-hidden lg:mx-0 lg:max-w-none lg:grid-cols-4">
                        {timeline.map((item) => (
                            <div key={item.name}>
                                <time
                                    dateTime={item.dateTime}
                                    className="flex items-center text-sm font-semibold leading-6 text-blue-600"
                                >
                                    <svg viewBox="0 0 4 4" className="mr-4 h-1 w-1 flex-none" aria-hidden="true">
                                        <circle cx={2} cy={2} r={2} fill="currentColor"/>
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

                <LogoCloud />

                <CoreValues />

                <Team />

                <JoinTeam />

                <CallToAction />

            </main>
            <Footer/>
        </>
    )
}
