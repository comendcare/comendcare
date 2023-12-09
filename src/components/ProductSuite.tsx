'use client'

import {useId} from 'react'
import Image, {type ImageProps} from 'next/image'
import {Tab} from '@headlessui/react'
import clsx from 'clsx'

import {Container} from '@/components/Container'
import {
    FaBook,
    FaMicroscope,
    FaRocket,
} from "react-icons/fa6";
import screenshotProduct1 from '@/images/screenshots/rareheros.png'
import screenshotProduct2 from '@/images/screenshots/scimantic.png'
import screenshotProduct3 from '@/images/screenshots/librarey.png'
import screenshotProduct1Small from '@/images/screenshots/rareheros-small.png'
import screenshotProduct2Small from '@/images/screenshots/scimantic-small.png'
import screenshotProduct3Small from '@/images/screenshots/librarey-small.png'
import Link from "next/link"

interface Feature {
    name: React.ReactNode
    summary: string
    description: string
    image: ImageProps['src']
    smallImage: ImageProps['src']
    link: string
    icon: React.ComponentType
}

const features: Array<Feature> = [
    {
        name: 'Librarey',
        summary: 'Helping families discover resources they need but didn’t know existed.',
        description:
            'A free platform to search, save, share, and contribute to resources ranging from financial support to accessibility products.',
        image: screenshotProduct3,
        smallImage: screenshotProduct3Small,
        link: "https://librarey.com/",
        icon: function LibrareyIcon() {
            let id = useId()
            return (
                <FaBook className="h-5 w-5 text-white"/>
            )
        },
    },
    {
        name: 'Scimantic',
        summary:
            'Making academic science accessible to families, donors, and industry.',
        description:
            'An AI-powered scientific communicator that translates academic text into helpful content for families and other stakeholders.',
        image: screenshotProduct2,
        smallImage: screenshotProduct2Small,
        link: "https://livery.vercel.app/",
        icon: function InventoryIcon() {
            return (
                <FaMicroscope className="h-5 w-5 text-white"/>
            )
        },
    },
    {
        name: 'Coming soon...',
        summary:
            'Patient-led data management and collaboration.',
        description:
            'A self-governing platform for aggregating and sharing patient data where you own the commercial value you create.',
        image: screenshotProduct1,
        smallImage: screenshotProduct1Small,
        link: "https://rareheros.com/",
        icon: function ContactsIcon() {
            return (
                <FaRocket className="h-5 w-5 text-white"/>
            )
        },
    },
]

function Feature({
                     feature,
                     isActive,
                     className,
                     ...props
                 }: React.ComponentPropsWithoutRef<'div'> & {
    feature: Feature
    isActive: boolean
}) {
    return (
        <div
            className={clsx(className, !isActive && 'opacity-75 hover:opacity-100')}
            {...props}
        >
            <div
                className={clsx(
                    'w-9 rounded-lg',
                    isActive ? 'bg-blue-600' : 'bg-slate-500',
                )}
            >
                <div aria-hidden="true" className="h-9 w-9 flex items-center justify-center">
                    <feature.icon/>
                </div>
            </div>
            <h3
                className={clsx(
                    'mt-6 text-sm font-medium',
                    isActive ? 'text-blue-600' : 'text-slate-600',
                )}
            >
                {feature.name}
            </h3>
            <p className="mt-2 font-display text-xl text-slate-900">
                {feature.summary}
            </p>
            <p className="mt-4 text-sm text-slate-600">
                {feature.description}
            </p>
            <Link
                className="mt-4 text-sm font-bold underline text-blue-600"
                href={feature.link}
            >
                Learn more
            </Link>
        </div>
    )
}

function FeaturesMobile() {
    return (
        <div className="-mx-4 mt-20 flex flex-col gap-y-10 overflow-hidden px-4 sm:-mx-6 sm:px-6 xs:hidden">
            {features.map((feature) => (
                <div key={feature.summary}>
                    <Feature feature={feature} className="mx-auto max-w-2xl" isActive/>
                    <div className="relative mt-10 pb-10">
                        <div className="absolute -inset-x-4 bottom-0 top-8 bg-slate-200 sm:-inset-x-6"/>
                        <div
                            className="relative mx-auto overflow-hidden rounded-xl bg-white shadow-lg shadow-slate-900/5 ring-1 ring-slate-500/10">
                            <Image
                                className="w-full"
                                src={feature.smallImage}
                                alt=""
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

function FeaturesTablet() {
    return (
        <div className="-mx-4 mt-20 hidden flex-col gap-y-10 overflow-hidden px-4 sm:-mx-6 sm:px-6 xs:flex md:hidden">
            {features.map((feature) => (
                <div key={feature.summary}>
                    <Feature feature={feature} className="mx-auto max-w-2xl" isActive/>
                    <div className="relative mt-10 pb-10">
                        <div className="absolute -inset-x-4 bottom-0 top-8 bg-slate-200 sm:-inset-x-6"/>
                        <div
                            className="relative mx-auto overflow-hidden rounded-xl bg-white shadow-lg shadow-slate-900/5 ring-1 ring-slate-500/10">
                            <Image
                                className="w-full"
                                src={feature.image}
                                alt=""
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

function FeaturesDesktop() {
    return (
        <Tab.Group as="div" className="hidden lg:mt-20 md:block">
            {({selectedIndex}) => (
                <>
                    <Tab.List className="grid grid-cols-3 gap-x-8">
                        {features.map((feature, featureIndex) => (
                            <Feature
                                key={feature.summary}
                                feature={{
                                    ...feature,
                                    name: (
                                        <Tab className="ui-not-focus-visible:outline-none">
                                            <span className="absolute inset-0"/>
                                            {feature.name}
                                        </Tab>
                                    ),
                                }}
                                isActive={featureIndex === selectedIndex}
                                className="relative"
                            />
                        ))}
                    </Tab.List>
                    <Tab.Panels
                        className="relative mt-20 overflow-hidden rounded-4xl bg-slate-200 px-14 py-16 xl:px-16">
                        <div className="-mx-5 flex">
                            {features.map((feature, featureIndex) => (
                                <Tab.Panel
                                    static
                                    key={feature.summary}
                                    className={clsx(
                                        'px-5 transition duration-500 ease-in-out ui-not-focus-visible:outline-none',
                                        featureIndex !== selectedIndex && 'opacity-60',
                                    )}
                                    style={{transform: `translateX(-${selectedIndex * 100}%)`}}
                                    aria-hidden={featureIndex !== selectedIndex}
                                >
                                    <div
                                        className="w-[52.75rem] overflow-hidden rounded-xl bg-white shadow-lg shadow-slate-900/5 ring-1 ring-slate-500/10">
                                        <Image
                                            className="w-full"
                                            src={feature.image}
                                            alt=""
                                            sizes="52.75rem"
                                            objectFit={"contain"}
                                        />
                                    </div>
                                </Tab.Panel>
                            ))}
                        </div>
                        <div
                            className="pointer-events-none absolute inset-0 rounded-4xl ring-1 ring-inset ring-slate-900/10"/>
                    </Tab.Panels>
                </>
            )}
        </Tab.Group>
    )
}

export function ProductSuite() {
    return (
        <section
            id="products"
            aria-label="Products for simplifying everyday business tasks"
            className="pb-14 pt-20 sm:pb-20 sm:pt-32 lg:pb-32"
        >
            <Container>
                <div className="mx-auto max-w-2xl md:text-center">
                    <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
                        End-to-end solutions
                    </h2>
                    <p className="mt-4 text-lg tracking-tight text-slate-700">
                        {`We're working with the community to build tools that support your patient group from kitchen table to clinical trials`}
                    </p>
                </div>
                <FeaturesMobile/>
                <FeaturesTablet/>
                <FeaturesDesktop/>
            </Container>
        </section>
    )
}
