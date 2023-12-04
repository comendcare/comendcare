import {CallToAction} from '@/components/CallToAction'
import {Faqs} from '@/components/Faqs'
import {Footer} from '@/components/Footer'
import {Header} from '@/components/Header'
import {Hero} from '@/components/Hero'
import {Pricing} from '@/components/Pricing'
import {PrimaryFeatures} from '@/components/PrimaryFeatures'
import {ProductSuite} from '@/components/ProductSuite'
import {Testimonials} from '@/components/Testimonials'
import Flawnson from "@/images/profiles/Flawnson.jpg"
import Sierra from "@/images/profiles/Sierra.jpeg"

const people = [
    {
        name: 'Albert Wang',
        role: 'Co-founder and CEO',
        imageUrl:
            Flawnson,
        bio: 'Quia illum aut in beatae. Possimus dolores aliquid accusantium aut in ut non assumenda. Enim iusto molestias aut deleniti eos aliquid magnam molestiae. At et non possimus ab. Magni labore molestiae nulla qui.',
    },
    {
        name: 'Flawnson Tong',
        role: 'Co-founder and CTO',
        imageUrl:
            Flawnson,
        bio: 'Quia illum aut in beatae. Possimus dolores aliquid accusantium aut in ut non assumenda. Enim iusto molestias aut deleniti eos aliquid magnam molestiae. At et non possimus ab. Magni labore molestiae nulla qui.',
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
        name: 'Founded company',
        description:
            'Nihil aut nam. Dignissimos a pariatur et quos omnis. Aspernatur asperiores et dolorem dolorem optio voluptate repudiandae.',
        date: 'Aug 2021',
        dateTime: '2021-08',
    },
    {
        name: 'Secured $65m in funding',
        description:
            'Provident quia ut esse. Vero vel eos repudiandae aspernatur. Cumque minima impedit sapiente a architecto nihil.',
        date: 'Dec 2021',
        dateTime: '2021-12',
    },
    {
        name: 'Released beta',
        description:
            'Sunt perspiciatis incidunt. Non necessitatibus aliquid. Consequatur ut officiis earum eum quia facilis. Hic deleniti dolorem quia et.',
        date: 'Feb 2022',
        dateTime: '2022-02',
    },
    {
        name: 'Global launch of product',
        description:
            'Ut ipsa sint distinctio quod itaque nam qui. Possimus aut unde id architecto voluptatem hic aut pariatur velit.',
        date: 'Dec 2022',
        dateTime: '2022-12',
    },
]

export default function Home() {
    return (
        <>
            <Header/>
            <main>
                <div className="mx-auto max-w-7xl px-6 py-32 sm:py-20 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6 xl:grid-cols-1 xl:grid-rows-1 xl:gap-x-8">
                        <h1 className="max-w-2xl text-4xl font-display font-medium tracking-tight text-gray-900 sm:text-6xl lg:col-span-2 xl:col-auto">
                            We’re a passionate group of people working from around the world to build the future of ecommerce.
                        </h1>
                        <div className="mt-6 max-w-xl lg:mt-0 xl:col-end-1 xl:row-start-1">
                            <p className="text-lg leading-8 text-gray-600">
                                Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt
                                amet fugiat veniam occaecat fugiat aliqua. Anim aute id magna aliqua ad ad non deserunt sunt. Qui
                                irure qui lorem cupidatat commodo.
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
                            <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">Meet our leadership</h2>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                We’re a dynamic group of individuals who are passionate about what we do and dedicated to delivering the
                                best results for our clients.
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
