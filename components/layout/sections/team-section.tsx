"use client"
import Image from "next/image"
import React, { useEffect, useId, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useOutsideClick } from "@/lib/hooks/use-outside-click"
import Albert from "@/public/profiles/Albert.jpeg"
import Flawnson from "@/public/profiles/Flawnson.jpg"
import Sierra from "@/public/profiles/Sierra.jpeg"
import Bruce from "@/public/profiles/Bruce.jpg"
import Sanath from "@/public/profiles/Sanath.jpg"
import Andrew from "@/public/profiles/Andrew.jpeg"
import Foy from "@/public/profiles/Foy.jpg"
import Pepi from "@/public/profiles/Pepi.jpg"
import Betty from "@/public/profiles/Betty.jpeg"
import Megan from "@/public/profiles/Megan.png"
import Tuongvi from "@/public/profiles/Tuongvi.jpeg"
import Link from "next/link"
import { FaInstagram, FaLinkedin } from "react-icons/fa6"

export function TeamSection() {
    const [active, setActive] = useState<(typeof cards)[number] | null>(null)
    const id = useId()
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setActive(null)
            }
        }

        if (active) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "auto"
        }

        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [active])

    useOutsideClick(ref, () => setActive(null))

    return (
        <section className="relative container w-full mx-auto">
            <div className="max-w-7xl gap-8 mx-auto py-24">
                <h2 className="text-center text-2xl md:text-5xl font-bold pb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-600">
                    Meet the team
                </h2>
                <AnimatePresence>
                    {active && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/20 h-full w-full z-10"
                        />
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {active && (
                        <div className="fixed inset-0 grid place-items-center z-[100]">
                            <motion.button
                                key={`button-${active.name}-${id}`}
                                layout
                                initial={{
                                    opacity: 0
                                }}
                                animate={{
                                    opacity: 1
                                }}
                                exit={{
                                    opacity: 0,
                                    transition: {
                                        duration: 0.05
                                    }
                                }}
                                className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
                                onClick={() => setActive(null)}
                            >
                                <CloseIcon />
                            </motion.button>
                            <motion.div
                                layoutId={`card-${active.name}-${id}`}
                                ref={ref}
                                className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
                            >
                                <motion.div
                                    layoutId={`image-${active.name}-${id}`}
                                >
                                    <Image
                                        priority
                                        unoptimized={true}
                                        quality={100}
                                        width={500}
                                        height={500}
                                        src={active.src}
                                        alt={active.name}
                                        className="object-center w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover"
                                    />
                                </motion.div>

                                <div>
                                    <div className="flex justify-between items-start p-4">
                                        <div>
                                            <motion.h3
                                                layoutId={`name-${active.name}-${id}`}
                                                className="font-medium text-neutral-700 dark:text-neutral-200 text-base"
                                            >
                                                {active.name}
                                            </motion.h3>
                                            <motion.p
                                                layoutId={`title-${active.name}-${id}`}
                                                className="text-neutral-600 dark:text-neutral-400 text-base"
                                            >
                                                {active.title}
                                            </motion.p>
                                        </div>

                                        <div className="flex space-x-4">
                                            {active.linkedInURL && (
                                                <motion.a
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    href={active.linkedInURL}
                                                    target="_blank"
                                                    className="text-gray-600 hover:text-gray-800"
                                                >
                                                    <FaLinkedin className="h-6 w-6" />
                                                </motion.a>
                                            )}
                                            {active.instagramURL && (
                                                <motion.a
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    href={active.instagramURL}
                                                    target="_blank"
                                                    className="text-gray-600 hover:text-gray-800"
                                                >
                                                    <FaInstagram className="h-6 w-6" />
                                                </motion.a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="pt-4 relative px-4">
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                                        >
                                            {typeof active.content ===
                                            "function"
                                                ? active.content()
                                                : active.content}
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <ul className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 items-start gap-4">
                    {cards.map(card => (
                        <motion.div
                            layoutId={`card-${card.name}-${id}`}
                            key={card.name}
                            onClick={() => setActive(card)}
                            className="p-4 flex flex-col hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
                        >
                            <div className="flex gap-4 flex-col w-full items-center justify-center">
                                <motion.div
                                    layoutId={`image-${card.name}-${id}`}
                                >
                                    <Image
                                        unoptimized={true}
                                        quality={100}
                                        width={100}
                                        height={100}
                                        src={card.src}
                                        alt={card.name}
                                        className="object-center size-60 rounded-full object-cover"
                                    />
                                </motion.div>
                                <div className="flex flex-col justify-center items-center">
                                    <motion.h3
                                        layoutId={`name-${card.name}-${id}`}
                                        className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left text-base"
                                    >
                                        {card.name}
                                    </motion.h3>
                                    <motion.p
                                        layoutId={`title-${card.title}-${id}`}
                                        className="text-neutral-600 dark:text-neutral-400 text-center text-base"
                                    >
                                        {card.title}
                                    </motion.p>
                                    <motion.a
                                        layout
                                        layoutId={`title-${card.linkedInURL}-${id}`}
                                    >
                                        <FaLinkedin className="h-6 w-6" />
                                    </motion.a>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </ul>
            </div>
        </section>
    )
}

export const CloseIcon = () => {
    return (
        <motion.svg
            initial={{
                opacity: 0
            }}
            animate={{
                opacity: 1
            }}
            exit={{
                opacity: 0,
                transition: {
                    duration: 0.05
                }
            }}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-black"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M18 6l-12 12" />
            <path d="M6 6l12 12" />
        </motion.svg>
    )
}

const cards = [
    {
        name: "Albert Wang",
        title: "Co-founder and CEO",
        src: Albert,
        linkedInURL: "https://www.linkedin.com/in/albert-yq-wang/",
        instagramURL: "https://www.instagram.com/albert.yqw/",
        content: () => {
            return (
                <p>
                    {`I went to school for biomedical engineering, have worked with deep tech
                    startups and in life sciences research, and spent a past life
                    volunteering with kids. On the weekend, I try to catch up with the
                    happenings in genomics.`}
                </p>
            )
        }
    },
    {
        name: "Flawnson Tong",
        title: "Co-founder and CTO",
        src: Flawnson,
        linkedInURL: "https://www.linkedin.com/in/flawnson/",
        instagramURL: "https://www.instagram.com/flaws.non/",
        content: () => {
            return (
                <p>
                    {`Hi there! I’m the guy behind the screen building what you see here. My
                    background is in machine learning engineering and these days I do a lot
                    of full stack development. I love playing piano, travelling, and
                    working out.`}
                </p>
            )
        }
    },
    {
        name: "Sierra Phillips",
        title: "Chief Rare Mom",
        src: Sierra,
        linkedInURL: "https://www.linkedin.com/in/sierra-phillips-208a0b106/",
        instagramURL: "https://www.instagram.com/mrs.phillijt/",
        content: () => {
            return (
                <p>
                    {`Hello! I'm a twin mom, rare mom, heart mom, genetics enthusiast, and
                    relentless advocate on a mission to curate the most comprehensive
                    freely-available disability resource database.`}
                </p>
            )
        }
    },
    {
        name: "Pepi Martinez",
        title: "Head of Data Governance",
        src: Pepi,
        linkedInURL: "https://www.linkedin.com/in/pepimartinez/",
        instagramURL: "",
        content: () => {
            return (
                <p>
                    {`Excited to help Comend revolutionize the future of patient-first drug
                    discovery. I come from a software engineering background with a focus
                    on decentralization, governance systems, and on-chain dynamics. I've
                    been a passionate builder for about 10 years, and have been theorizing
                    heavily in the future of patient drug discovery for the last 3 years.`}
                </p>
            )
        }
    },
    {
        name: "Betty Trevino",
        title: "Head of Product Marketing",
        src: Betty,
        linkedInURL: "https://www.linkedin.com/in/bettyctrevino/",
        instagramURL: "https://www.instagram.com/agsadvocacy/",
        content: () => {
            return (
                <p>
                    {`I'm a mom of two amazing boys, one of whom has been diagnosed with
                    Aicardi Goutieres Syndrome, and a wife to my wonderful husband. My goal
                    is to create a welcoming space in the rare disease community where
                    everyone feels connected and better equipped. When I'm not busy, you'll
                    often find me snuggled up with my family while listening to T.S. 🫶🏻`}
                </p>
            )
        }
    },
    {
        name: "Megan McClure",
        title: "Full Stack Software Developer",
        src: Megan,
        linkedInURL: "https://www.linkedin.com/in/megan-mcclure-2216391a3/",
        instagramURL: "",
        content: () => {
            return (
                <p>
                    {`Hi! As part of Comend's engineering team, I spend my time helping to
                    build our products. My background is in computer science, with a focus
                    on full stack development and user experience design. In my free time I
                    enjoy knitting, spinning yarn, and generally exploring the fiber arts.`}
                </p>
            )
        }
    },
    {
        name: "Tuongvi Diep",
        title: "Social Media and Community Coordinator",
        src: Tuongvi,
        linkedInURL: "https://www.linkedin.com/in/tuongvi-diep-17080b12b/",
        instagramURL: "",
        content: () => {
            return (
                <p>
                    {`Hello! As part of Comend’s social media team I’m excited to support patient-led biotechs by crafting
                    narratives that not only inform but inspire, and empowering families with rare diseases.
                    With a background in journalism,I’m a storyteller at heart with a passion for helping others and
                    building authentic relationships in the digital space.`}
                </p>
            )
        }
    },
    {
        name: "Bruce Bloom",
        title: "Advisor",
        src: Bruce,
        linkedInURL: "https://www.linkedin.com/in/drbrucebloom/",
        instagramURL: "",
        content: () => {
            return (
                <p>
                    {`Experienced C-suite executive and a thought leader in drug development,
                    philanthropy, and patient advocacy with professional experience in all
                    areas of executive management, including strategy, advocacy, medical
                    affairs, legal, operations, finance, sales, marketing, and IT; success
                    in small, mid-size, and large businesses, and entrepreneurial ventures.`}
                </p>
            )
        }
    },
    {
        name: "Sanath Ramesh",
        title: "Advisor",
        src: Sanath,
        linkedInURL: "https://www.linkedin.com/in/sanathkr/",
        instagramURL: "",
        content: () => {
            return (
                <p>
                    {`I am a bold and visionary software leader, open source pioneer, and
                    rare disease drug developer! I am on a mission to break rare disease
                    data silos with open source software and open data network through my
                    latest startup CuresDev. I build software in the day and disrupt biotech
                    industry in the night/weekends.`}
                </p>
            )
        }
    },
    {
        name: "Andrew Wells",
        title: "Advisor",
        src: Andrew,
        linkedInURL: "https://www.linkedin.com/in/andrewjoshuawells/",
        instagramURL: "",
        content: () => {
            return (
                <p>
                    {`Experienced C-suite executive and a thought leader in drug development,
                    philanthropy, and patient advocacy with professional experience in all
                    areas of executive management, including strategy, advocacy, medical
                    affairs, legal, operations, finance, sales, marketing, and IT; success
                    in small, mid-size, and large businesses, and entrepreneurial ventures.`}
                </p>
            )
        }
    },
    {
        name: "Foy Savas",
        title: "Advisor",
        src: Foy,
        linkedInURL: "https://www.linkedin.com/in/foysavas/",
        instagramURL: "",
        content: () => {
            return (
                <p>
                    {`Thrilled to support Comend and its vision for the future of patient-led
                    research! My background includes working at a medical device CRO,
                    bootstrapping a healthcare analytics company, investing as a VC, and
                    contributing to open source communities.`}
                </p>
            )
        }
    }
]
