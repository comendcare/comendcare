import Albert from "@/images/profiles/Albert.jpeg";
import Flawnson from "@/images/profiles/Flawnson.jpg";
import Sierra from "@/images/profiles/Sierra.jpeg";
import Bruce from "@/images/profiles/Bruce.jpg";
import Sanath from "@/images/profiles/Sanath.jpg";
import Andrew from "@/images/profiles/Andrew.jpeg";
import Foy from "@/images/profiles/Foy.jpg";
import Pepi from "@/images/profiles/Pepi.jpg";
import Betty from "@/images/profiles/Betty.jpeg";
import Link from "next/link";
import {FaInstagram, FaLinkedin} from "react-icons/fa";

const team = [
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
    // {
    //     name: 'Dennis Akkaya',
    //     role: 'Advisor',
    //     imageUrl: Betty,
    //     bio: 'I\'m a mom of two amazing boys, one of whom has been diagnosed with Aicardi Goutieres Syndrome, and a wife to my wonderful husband. My goal is to create a welcoming space in the rare disease community where everyone feels connected and better equipped. When I\'m not busy, you\'ll often find me snuggled up with my family while listening to T.S. 🫶🏻',
    //     linkedInURL: 'https://www.linkedin.com/in/bettyctrevino/',
    //     instagramURL: 'https://www.instagram.com/agsadvocacy/',
    // },
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
        name: 'Andrew Wells',
        role: 'Advisor',
        imageUrl: Andrew,
        bio: 'Experienced C-suite executive and a thought leader in drug development, philanthropy, and patient advocacy with professional experience in all areas of executive management, including strategy, advocacy, medical affairs, legal, operations, finance, sales, marketing, and IT; success in small, mid-size, and large businesses, and entrepreneurial ventures.',
        linkedInURL: 'https://www.linkedin.com/in/andrewjoshuawells/',
        instagramURL: '',
    },
    {
        name: 'Foy Savas',
        role: 'Advisor',
        imageUrl: Foy,
        bio: 'Thrilled to support Comend and its vision for the future of patient-led research! My background includes working at a medical device CRO, bootstrapping a healthcare analytics company, investing as a VC, and contributing to open source communities.',
        linkedInURL: 'https://www.linkedin.com/in/foysavas/',
        instagramURL: '',
    },
    {
        name: 'Pepi Martinez',
        role: 'Head of Data Governance',
        imageUrl: Pepi,
        bio: 'Excited to help Comend revolutionize the future of patient-first drug discovery. I come from a software engineering background with a focus on decentralization, governance systems, and on-chain dynamics. I\'ve been a passionate builder for about 10 years, and have been theorizing heavily in the future of patient drug discovery for the last 3 years.',
        linkedInURL: 'https://www.linkedin.com/in/pepimartinez/',
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
]

export function Team() {

    return (
        <div className="mx-auto max-w-7xl px-6 lg:px-8 my-48">
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
                className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-6 gap-y-20 sm:grid-cols-3 lg:max-w-4xl lg:gap-x-8 xl:max-w-none"
            >
                {team.map((person) => (
                    <li key={person.name}>
                        <img className="aspect-square w-full rounded-2xl object-cover" src={person.imageUrl.src} alt=""/>
                        <h3 className="mt-6 text-lg font-semibold leading-8 text-gray-900">{person.name}</h3>
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
                        <p className="mt-4 text-base leading-7 text-gray-600">{person.bio}</p>
                    </li>
                ))}
            </ul>
        </div>
    )
}