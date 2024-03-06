import {Footer} from '@/components/Footer'
import {Header} from '@/components/Header'
import Albert from "@/images/profiles/Albert.jpeg"
import Flawnson from "@/images/profiles/Flawnson.jpg"
import Sierra from "@/images/profiles/Sierra.jpeg"
import Betty from "@/images/profiles/Betty.jpeg"
import Foy from "@/images/profiles/Foy.jpg"
import Bruce from "@/images/profiles/Bruce.jpg"
import Pepi from "@/images/profiles/Pepi.jpg"
import Sanath from "@/images/profiles/Sanath.jpg"
import Team from "@/images/profiles/comend-team.jpeg"
import Link from "next/link"
import {FaInstagram, FaLinkedin} from "react-icons/fa";
import {CallToAction} from "@/components/CallToAction";
import {CoreValues} from "@/components/CoreValues";

const people = [
    {
        name: 'Albert Wang',
        role: 'Co-founder and CEO',
        imageUrl: Albert,
        bio: 'I went to school for biomedical engineering, have worked with deep tech startups and in life sciences research, and spent a past life volunteering with kids. On the weekend, I try to catch up with the happenings in genomics.',
        linkedInURL: 'https://www.linkedin.com/in/albert-yq-wang/',
        instagramURL: 'https://www.instagram.com/albert.yqw/',
    },
    {
        name: 'Flawnson Tong',
        role: 'Co-founder and CTO',
        imageUrl: Flawnson,
        bio: 'Hi there! I’m the guy behind the screen building what you see here. My background is in machine learning engineering and these days I do a lot of full stack development. I love playing piano, travelling, and working out.',
        linkedInURL: 'https://www.linkedin.com/in/flawnson/',
        instagramURL: 'https://www.instagram.com/flaws.non/',
    },
    {
        name: 'Sierra Phillips',
        role: 'Advisor',
        imageUrl: Sierra,
        bio: 'Hello! I\'m a twin mom, rare mom, heart mom, genetics enthusiast, and relentless advocate on a mission to to curate the most comprehensive freely-available disability resource database.',
        linkedInURL: 'https://www.linkedin.com/in/sierra-phillips-208a0b106/',
        instagramURL: 'https://www.instagram.com/mrs.phillijt/',
    },
    {
        name: 'Foy Savas',
        role: 'Advisor',
        imageUrl: Foy,
        bio: 'Thrilled to support Comend and its vision for the future of patient-led research! My background includes working at a medical device CRO, bootstrapping a healthcare analytics company, investing as a VC, and contributing to open source communities.',
        linkedInURL: 'https://www.linkedin.com/in/foysavas/',
        instagramURL: '',
    },
    // {
    //     name: 'Dennis Akkaya',
    //     role: 'Advisor',
    //     imageUrl: Betty,
    //     bio: 'I\'m a mom of two amazing boys, one of whom has been diagnosed with Aicardi Goutieres Syndrome, and a wife to my wonderful husband. My goal is to create a welcoming space in the rare disease community where everyone feels connected and better equipped. When I\'m not busy, you\'ll often find me snuggled up with my family while listening to T.S. 🫶🏻',
    //     linkedInURL: 'https://www.linkedin.com/in/bettyctrevino/',
    //     instagramURL: 'https://www.instagram.com/agsadvocacy/',
    // },
    {
        name: 'Andrew Wells',
        role: 'Advisor',
        imageUrl: Bruce,
        bio: 'Experienced C-suite executive and a thought leader in drug development, philanthropy, and patient advocacy with professional experience in all areas of executive management, including strategy, advocacy, medical affairs, legal, operations, finance, sales, marketing, and IT; success in small, mid-size, and large businesses, and entrepreneurial ventures.',
        linkedInURL: 'https://www.linkedin.com/in/andrewjoshuawells/',
        instagramURL: '',
    },
    {
        name: 'Bruce Bloom',
        role: 'Advisor',
        imageUrl: Bruce,
        bio: 'Experienced C-suite executive and a thought leader in drug development, philanthropy, and patient advocacy with professional experience in all areas of executive management, including strategy, advocacy, medical affairs, legal, operations, finance, sales, marketing, and IT; success in small, mid-size, and large businesses, and entrepreneurial ventures.',
        linkedInURL: 'https://www.linkedin.com/in/drbrucebloom/',
        instagramURL: '',
    },
    {
        name: 'Sanath Ramesh',
        role: 'Advisor',
        imageUrl: Sanath,
        bio: 'I am a bold and visionary software leader, open source pioneer, and rare disease drug developer! I am on a mission to break rare disease data silos with open source software and open data network through my latest startup CuresDev. I build software in the day and disrupt biotech industry in the night/weekends.',
        linkedInURL: 'https://www.linkedin.com/in/sanathkr/',
        instagramURL: '',
    },
    {
        name: 'Betty Trevino',
        role: 'Head of Product Marketing',
        imageUrl: Betty,
        bio: 'I\'m a mom of two amazing boys, one of whom has been diagnosed with Aicardi Goutieres Syndrome, and a wife to my wonderful husband. My goal is to create a welcoming space in the rare disease community where everyone feels connected and better equipped. When I\'m not busy, you\'ll often find me snuggled up with my family while listening to T.S. 🫶🏻',
        linkedInURL: 'https://www.linkedin.com/in/bettyctrevino/',
        instagramURL: 'https://www.instagram.com/agsadvocacy/',
    },
    {
        name: 'Pepi Martinez',
        role: 'Head of Data Governance',
        imageUrl: Pepi,
        bio: 'Excited to help Comend revolutionize the future of patient-first drug discovery. I come from a software engineering background with a focus on decentralization, governance systems, and on-chain dynamics. I\'ve been a passionate builder for about 10 years, and have been theorizing heavily in the future of patient drug discovery for the last 3 years.',
        linkedInURL: 'https://www.linkedin.com/in/pepimartinez/',
        instagramURL: '',
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
            `With Sierra's help, we launched a free search platform for rare resources and attended rare disease conferences to gather feedback.`,
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
                            src={Team.src}
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

                <CoreValues/>

                <div className="bg-white py-24 sm:py-32">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl sm:text-center">
                            <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
                                Meet the team
                            </h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                {`Want to chat or collaborate? We're all ears! `}
                                <Link
                                    href="/contact"
                                    className="mt-4 underline font-semibold text-blue-600"
                                >
                                    Contact us.
                                </Link>
                            </p>
                        </div>
                        <ul
                            role="list"
                            className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-6 gap-y-20 sm:grid-cols-2 lg:max-w-4xl lg:gap-x-8 xl:max-w-none"
                        >
                            {people.map((person) => (
                                <li key={person.name} className="flex flex-col gap-6 xl:flex-row">
                                    <img
                                        className="max-h-72 w-52 flex-none rounded-2xl object-cover"
                                        src={person.imageUrl.src}
                                        alt=""
                                    />
                                    <div className="flex-auto">
                                        <h3 className="text-lg font-semibold leading-8 tracking-tight text-gray-900">{person.name}</h3>
                                        <p className="text-base leading-7 text-gray-600">{person.role}</p>
                                        <div className="flex flex-row space-x-1 mt-2">
                                            <Link href={person.linkedInURL} target="_blank">
                                                <FaLinkedin className="h-6 w-6 text-gray-600 hover:text-gray-800"/>
                                            </Link>
                                            {
                                                person.instagramURL && <Link href={person.instagramURL} target="_blank">
                                                    <FaInstagram className="h-6 w-6 text-gray-600 hover:text-gray-800"/>
                                                </Link>
                                            }
                                        </div>
                                        <p className="mt-6 text-base leading-7 text-gray-600">{person.bio}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <CallToAction/>

            </main>
            <Footer/>
        </>
    )
}
