"use client"

import { ReactNode } from "react"
import { cn, isOnboarded } from "@comend/lib/utils"
import { PulsatingButton } from "@comend/components/ui/pulsating-button"
import { Button, buttonVariants } from "@comend/components/ui/button"
import Image from "next/image"
import arrow from "../../public/arrow-curved.svg"
import { motion } from "framer-motion"

interface StartHereWrapperProps {
  children: ReactNode
}

export function StartHereWrapper({
  children,
}: StartHereWrapperProps) {
    return (
        <div className="relative">
        {(!isOnboarded("tools-tour")) ? (
            <>
            <div className="-top-[65px] -right-[68px] absolute -rotate-[10deg]">
                <motion.div
                    initial={{ scale: 0.9 }} 
                    animate={{ scale: [0.9, 1, 0.9] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                >
                    <p>Start here!</p>
                    <Image src={arrow} alt="arrow" width={50} height={50} className="rotate-[130deg]" />
                </motion.div>
            </div>
            <PulsatingButton className={cn(buttonVariants({variant: 'cta'}))}>
                {children}
            </PulsatingButton>
            </>
        ) : (
            <Button variant="cta">{children}</Button>
        )}
        </div>
    )
}