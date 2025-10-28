"use client"
import {cn} from "@comend/lib/utils"
import {
    motion,
    useScroll,
    useMotionValueEvent,
} from "framer-motion"
import Link from "next/link"
import React, {useRef, useState} from "react"
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import {Button, buttonVariants} from "@/packages/components/ui/button";

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
        <motion.div ref={ref} className="w-full fixed top-0 inset-x-0 z-50">
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
                "self-start bg-transparent dark:bg-transparent items-end justify-end py-4 max-w-7xl mx-auto px-4 rounded-full relative z-[60] w-full",
                visible && "bg-white/80 dark:bg-neutral-950/80"
            )}
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
    )
}

const MobileNav: React.FC<NavbarProps> = ({visible}) => {
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
                <Link
                    href="signin"
                    onClick={() => setOpen(false)}
                    className={cn(buttonVariants({variant: "default"}), "block md:hidden w-full")}
                >
                    Login
                </Link>
            </motion.div>
        </>
    )
}
