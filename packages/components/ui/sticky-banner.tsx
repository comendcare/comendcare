"use client";
import React, { SVGProps, useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { cn } from "@comend/lib/utils";

export const StickyBanner = ({
                                 className,
                                 children,
                                 hideOnScroll = false,
                             }: {
    className?: string;
    children: React.ReactNode;
    hideOnScroll?: boolean;
}) => {
    const [open, setOpen] = useState(true);
    const { scrollY } = useScroll();
    const bannerRef = useRef<HTMLDivElement | null>(null);
    const storageKey = "sticky-banner:v1";              // optional: make a prop if you want
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {                                   // restore dismissed state
        if (localStorage.getItem(storageKey) === "1") {
            setDismissed(true);
            setOpen(false);
            document.documentElement.style.setProperty("--banner-height", "0px");
        }
    }, []);

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (dismissed) return;                            // ✅ don't reopen after close
        if (hideOnScroll && latest > 40) setOpen(false);
        else setOpen(true);
    });

    // Publish height to a CSS variable so siblings can offset.
    useEffect(() => {
        const el = bannerRef.current;
        if (!el) return;

        const updateVar = () => {
            const h = open ? el.offsetHeight || 56 : 0; // 56px = min-h-14
            document.documentElement.style.setProperty("--banner-height", `${h}px`);
        };

        updateVar();

        const ro = new ResizeObserver(updateVar);
        ro.observe(el);
        return () => {
            ro.disconnect();
            document.documentElement.style.removeProperty("--banner-height");
        };
    }, [open]);

    if (dismissed) return null;
    return (
        <motion.div
            ref={bannerRef}
            className={cn(
                "sticky inset-x-0 top-0 z-40 flex min-h-14 w-full items-center justify-center bg-transparent px-4 py-1",
                className
            )}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: open ? 0 : -100, opacity: open ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            {children}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer"
                onClick={() => {
                    setDismissed(true);
                    setOpen(false);
                    localStorage.setItem(storageKey, "1");          // persist across nav
                    document.documentElement.style.setProperty("--banner-height", "0px");
                }}
            >
                <CloseIcon className="h-5 w-5 text-black" />
            </motion.button>
        </motion.div>
    );
};

const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M18 6l-12 12" />
        <path d="M6 6l12 12" />
    </svg>
);
