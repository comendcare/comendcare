"use client"
import {cn} from "@/lib/utils"
import {FaBars, FaX} from "react-icons/fa6"
import {
    motion,
    AnimatePresence,
    useScroll,
    useMotionValueEvent
} from "framer-motion"
import Link from "next/link"
import React, {useRef, useState} from "react"
import {buttonVariants} from "@/components/ui/button"
import logo from "@/public/logos/comend-full-logo.png"
import Image from "next/image"
import {
    Menu,
    MenuItem,
    ProductItem
} from "@/components/layout/sections/navbar-menu"
import {encode} from "qss"
import {imgHeight, imgWidth} from "@/components/layout/sections/tabs-features"
import {PulsatingButton} from "@/components/ui/pulsating-button";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";

interface NavbarItem {
    name: string
    link?: string
    items?: {
        title: string
        href: string
        imgParams: string
        description: string
    }[]
}

interface NavbarProps {
    navItems: NavbarItem[]
    visible: boolean
}

const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN

export const PublicPageNavbar: React.FC = () => {
    const navItems: NavbarItem[] = [
        // {
        //     name: "Products",
        //     items: [
        //         {
        //             title: "Librarey",
        //             href: "https://www.librarey.com/",
        //             imgParams: encode({
        //                 url: "https://www.librarey.com/",
        //                 screenshot: true,
        //                 meta: false,
        //                 embed: "screenshot.url",
        //                 colorScheme: "dark",
        //                 "viewport.isMobile": true,
        //                 "viewport.deviceScaleFactor": 1,
        //                 "viewport.width": imgWidth * 3,
        //                 "viewport.height": imgHeight * 3
        //             }),
        //             description: "Where rare disease and disability communities discover and share resources."
        //         },
        //         {
        //             title: "Scimantic",
        //             href: "https://scimantic.com/",
        //             imgParams: encode({
        //                 url: "https://scimantic.com/",
        //                 screenshot: true,
        //                 meta: false,
        //                 embed: "screenshot.url",
        //                 colorScheme: "dark",
        //                 "viewport.isMobile": true,
        //                 "viewport.deviceScaleFactor": 1,
        //                 "viewport.width": imgWidth * 3,
        //                 "viewport.height": imgHeight * 3
        //             }),
        //             description: "Helping patient families engage in science by making research more accessible."
        //         },
        //     ]
        // },
        // { name: "Features", link: "/#features" },
        {
            name: "About",
            link: process.env.NEXT_PUBLIC_VERCEL_ENV
                ? `https://${rootDomain}/about` : `http://${rootDomain}/about`
        },
        {
            name: "FAQ",
            link: process.env.NEXT_PUBLIC_VERCEL_ENV
                ? `https://${rootDomain}/faq` : `http://${rootDomain}/faq`
        },
        {
            name: "Contact",
            link: process.env.NEXT_PUBLIC_VERCEL_ENV
                ? `https://${rootDomain}/contact` : `http://${rootDomain}/contact`
        },
    ]

    const ref = useRef<HTMLDivElement>(null)
    const {scrollY} = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    })
    const [visible, setVisible] = useState<boolean>(false)

    useMotionValueEvent(scrollY, "change", latest => {
        setVisible(latest > 100)
    })

    return (
        <motion.div ref={ref} className="w-full fixed top-0 inset-x-0 z-50">
            <DesktopNav visible={visible} navItems={navItems}/>
            <MobileNav visible={visible} navItems={navItems}/>
        </motion.div>
    )
}

const DesktopNav: React.FC<NavbarProps> = ({navItems, visible}) => {
    const session = useSession()
    const router = useRouter()
    const [hovered, setHovered] = useState<number | null>(null)
    const [active, setActive] = useState<string | null>(null)

    return (
        <motion.div
            onMouseLeave={() => setHovered(null)}
            animate={{
                backdropFilter: visible ? "blur(10px)" : "none",
                boxShadow: visible
                    ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05)"
                    : "none",
                width: visible ? "40%" : "100%",
                y: visible ? 20 : 0
            }}
            transition={{
                type: "spring",
                stiffness: 200,
                damping: 50
            }}
            style={{
                minWidth: "800px"
            }}
            className={cn(
                "hidden lg:grid grid-cols-3 self-start bg-transparent dark:bg-transparent items-center justify-between py-4 max-w-7xl mx-auto px-4 rounded-full relative z-[60] w-full",
                visible && "bg-white/80 dark:bg-neutral-950/80"
            )}
        >
            <Link href={process.env.NEXT_PUBLIC_VERCEL_ENV
                ? `https://${rootDomain}/` : `http://${rootDomain}/`}
            >
                <Image className="w-36 inline" src={logo} alt="Comend Logo"/>
            </Link>
            {/*<motion.div*/}
            {/*    className="lg:flex flex-row flex-1 hidden items-center justify-center space-x-2 lg:space-x-2 text-sm text-zinc-600 font-medium hover:text-zinc-800 transition duration-200">*/}
            {/*    {navItems.map((navItem, idx) =>*/}
            {/*        navItem.link ? (*/}
            {/*            <Link*/}
            {/*                onMouseEnter={() => setHovered(idx)}*/}
            {/*                className="text-neutral-600 dark:text-neutral-300 relative px-4 py-2"*/}
            {/*                key={`link-${idx}`}*/}
            {/*                href={navItem.link}*/}
            {/*            >*/}
            {/*                {hovered === idx && (*/}
            {/*                    <motion.div*/}
            {/*                        layoutId="hovered"*/}
            {/*                        className="w-full h-full absolute inset-0 bg-gray-100 dark:bg-neutral-800 rounded-full"*/}
            {/*                    />*/}
            {/*                )}*/}
            {/*                <span className="relative z-20">*/}
            {/*                    {navItem.name}*/}
            {/*                </span>*/}
            {/*            </Link>*/}
            {/*        ) : (*/}
            {/*            <Menu setActive={setActive} key={`menu-${idx}`}>*/}
            {/*                <MenuItem*/}
            {/*                    setActive={setActive}*/}
            {/*                    active={active}*/}
            {/*                    item="Products"*/}
            {/*                >*/}
            {/*                    <div className="text-sm grid grid-cols-2 gap-10 p-4">*/}
            {/*                        {navItem.items?.map((item, idx) => (*/}
            {/*                            <ProductItem*/}
            {/*                                key={idx}*/}
            {/*                                title={item.title}*/}
            {/*                                href={item.href}*/}
            {/*                                imgParams={item.imgParams}*/}
            {/*                                description={item.description}*/}
            {/*                            />*/}
            {/*                        ))}*/}
            {/*                    </div>*/}
            {/*                </MenuItem>*/}
            {/*            </Menu>*/}
            {/*        )*/}
            {/*    )}*/}
            {/*</motion.div>*/}

            {/*<div className="flex items-center gap-4">*/}
            {/*    <Link href="/signin" className={cn(buttonVariants({ variant: "secondary" }), "hidden md:block")}>*/}
            {/*        Login*/}
            {/*    </Link>*/}
            {/*</div>*/}

            {/*{session &&*/}
            {/*    <div*/}
            {/*        className="flex justify-end"*/}
            {/*    >*/}
            {/*        <PulsatingButton*/}
            {/*            className="w-fit"*/}
            {/*            onClick={() => router.push("/login")}*/}
            {/*        >*/}
            {/*            Sign in*/}
            {/*        </PulsatingButton>*/}
            {/*    </div>*/}
            {/*}*/}

        </motion.div>
    )
}

const MobileNav: React.FC<NavbarProps> = ({navItems, visible}) => {
    const [open, setOpen] = useState(false)

    return (
        <>
            <motion.div
                animate={{
                    backdropFilter: visible ? "blur(10px)" : "none",
                    boxShadow: visible
                        ? "0 0 24px rgba(34, 42, 53, 0.06)"
                        : "none",
                    width: visible ? "90%" : "100%",
                    y: visible ? 20 : 0,
                    borderRadius: open ? "4px" : "2rem",
                    paddingRight: visible ? "12px" : "0px",
                    paddingLeft: visible ? "12px" : "0px"
                }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 50
                }}
                className={cn(
                    "flex relative flex-col lg:hidden w-full justify-between items-center bg-transparent max-w-[calc(100vw-2rem)] mx-auto px-4 py-2 z-50",
                    visible && "bg-white/80 dark:bg-neutral-950/80"
                )}
            >
                <div className="flex flex-row justify-between items-center w-full">
                    <Link href="/">
                        <Image
                            className="w-24 inline"
                            src={logo}
                            alt="Comend Logo"
                        />
                    </Link>
                    {open ? (
                        <FaX
                            className="text-black dark:text-white"
                            onClick={() => setOpen(!open)}
                        />
                    ) : (
                        <FaBars
                            className="text-black dark:text-white"
                            onClick={() => setOpen(!open)}
                        />
                    )}
                </div>

                {/*<AnimatePresence>*/}
                {/*    {open && (*/}
                {/*        <motion.div*/}
                {/*            initial={{opacity: 0}}*/}
                {/*            animate={{opacity: 1}}*/}
                {/*            exit={{opacity: 0}}*/}
                {/*            className="flex rounded-lg absolute top-16 bg-white dark:bg-neutral-950 inset-x-0 z-50 flex-col items-start justify-start gap-4 w-full px-4 py-8"*/}
                {/*        >*/}
                {/*            {navItems.map((navItem, idx) => (*/}
                {/*                <Link*/}
                {/*                    key={`link-${idx}`}*/}
                {/*                    href={navItem.link ?? "#"}*/}
                {/*                    onClick={() => setOpen(false)}*/}
                {/*                    className="relative text-neutral-600 dark:text-neutral-300"*/}
                {/*                >*/}
                {/*                    <motion.span className="block">*/}
                {/*                        {navItem.name}*/}
                {/*                    </motion.span>*/}
                {/*                </Link>*/}
                {/*            ))}*/}

                {/*            /!*<Link*!/*/}
                {/*            /!*    href="signin"*!/*/}
                {/*            /!*    onClick={() => setOpen(false)}*!/*/}
                {/*            /!*    className={cn(buttonVariants({ variant: "default" }), "block md:hidden w-full")}*!/*/}
                {/*            /!*>*!/*/}
                {/*            /!*    Login*!/*/}
                {/*            /!*</Link>*!/*/}
                {/*        </motion.div>*/}
                {/*    )}*/}
                {/*</AnimatePresence>*/}
            </motion.div>
        </>
    )
}
