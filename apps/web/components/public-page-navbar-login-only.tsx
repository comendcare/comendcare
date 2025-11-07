"use client"
import {cn} from "@comend/lib/utils"
import {
    motion,
    useScroll,
    useMotionValueEvent,
    AnimatePresence,
} from "framer-motion"
import Link from "next/link"
import React, {useRef, useState} from "react"
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import {Button, buttonVariants} from "@/packages/components/ui/button";
import Image from "next/image";
import { X, Menu as MenuIcon } from "lucide-react"
import logo from "@/public/logos/comend-full-logo.png"

const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN

interface NavbarProps {
    visible: boolean
}

export const PublicPageNavbarLoginOnly: React.FC = ({externalOpen = false}: { externalOpen?: boolean }) => {

    const ref = useRef<HTMLDivElement>(null)
    const {scrollY} = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    })
    const [visible, setVisible] = useState<boolean>(false)

    useMotionValueEvent(scrollY, "change", latest => {
        setVisible(latest > 40)
    })

    return (
        <motion.div ref={ref} className="w-full fixed inset-x-0 z-50" style={{ top: "var(--banner-height, 0px)" }}>
            <DesktopNav visible={visible}/>
            <MobileNav visible={visible}/>
        </motion.div>
    )
}

const DesktopNav: React.FC<NavbarProps> = ({visible}) => {
    const session = useSession()
    const router = useRouter()

    return (
        <motion.div
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
                "hidden lg:grid grid-cols-2 self-start bg-transparent dark:bg-transparent items-center justify-between py-4 max-w-7xl mx-auto px-4 rounded-full relative z-[60] w-full",
                visible && "bg-white/80 dark:bg-neutral-950/80"
            )}
        >
            <Link href={process.env.NEXT_PUBLIC_VERCEL_ENV
                ? `https://${rootDomain}/` : `http://${rootDomain}/`}
            >
                <Image className="w-36 inline" src={logo} alt="Comend Logo"/>
            </Link>

            {session &&
                <div
                    className="flex space-x-4 justify-end"
                >
                    <Button
                        className="w-fit text-base"
                        onClick={() => router.push("/login")}
                        variant="ghost"
                    >
                        Log in
                    </Button>

                    <Button
                        variant="cta"
                        className="w-fit"
                        asChild
                    >
                        <Link href={"https://calendly.com/albertatcomend/onboarding"}>
                            Sign up
                        </Link>
                    </Button>
                </div>
            }

        </motion.div>
    )
}

const MobileNav: React.FC<NavbarProps> = ({visible}) => {
    const session = useSession()
    const router = useRouter()
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
                    <Link href={process.env.NEXT_PUBLIC_VERCEL_ENV
                        ? `https://${rootDomain}/` : `http://${rootDomain}/`}
                    >
                        <Image
                            className="w-24 inline"
                            src={logo}
                            alt="Comend Logo"
                        />
                    </Link>
                    {open ? (
                        <X
                            className="text-black dark:text-white"
                            onClick={() => setOpen(!open)}
                        />
                    ) : (
                        <MenuIcon
                            className="text-black dark:text-white"
                            onClick={() => setOpen(!open)}
                        />
                    )}
                </div>

                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            className="flex rounded-lg absolute top-16 bg-white dark:bg-neutral-950 inset-x-0 z-50 flex-col items-start justify-start gap-4 w-full px-4 py-8"
                        >
                            {session &&
                                <div
                                    className="flex space-x-4 justify-end"
                                >
                                    <Button
                                        className="w-fit text-base"
                                        onClick={() => router.push("/login")}
                                        variant="ghost"
                                    >
                                        Log in
                                    </Button>

                                    <Button
                                        variant="cta"
                                        className="w-fit"
                                        asChild
                                    >
                                        <Link href={"https://calendly.com/albertatcomend/onboarding"}>
                                            Sign up
                                        </Link>
                                    </Button>
                                </div>
                            }
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    )
}
