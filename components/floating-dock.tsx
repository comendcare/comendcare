"use client"
/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/

import {cn} from "@/lib/utils";
import {IconLayoutNavbarCollapse} from "@tabler/icons-react";
import {
    AnimatePresence,
    MotionValue,
    motion,
    useMotionValue,
    useSpring,
    useTransform,
} from "framer-motion";
import Link from "next/link";
import {useRef, useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Sheet,
    SheetTrigger,
    SheetContent,
} from "@/components/ui/sheet"

export const FloatingDock = ({
                                 items,
                                 orientation = "horizontal",
                                 desktopClassName,
                                 mobileClassName,
                             }: {
    items: {
        title: string;
        icon: React.ReactNode;
        href?: string;
        dialog?: React.ReactNode;
        sheet?: React.ReactNode;
    }[];
    orientation?: "horizontal" | "vertical";
    desktopClassName?: string;
    mobileClassName?: string;
}) => {
    return (
        <>
            <FloatingDockDesktop items={items} orientation={orientation} className={desktopClassName}/>
            <FloatingDockMobile items={items} orientation={orientation} className={mobileClassName}/>
        </>
    );
};

const FloatingDockMobile = ({
                                items,
                                orientation,
                                className,
                            }: {
    items: {
        title: string;
        icon: React.ReactNode;
        href?: string;
        dialog?: React.ReactNode;
    }[];
    orientation: "horizontal" | "vertical";
    className?: string;
}) => {
    const [open, setOpen] = useState(false);

    return (
        <div className={cn("fixed bottom-4 right-4 md:hidden z-50", className)}>
            <AnimatePresence>
                {open && (
                    <motion.div
                        layoutId="nav"
                        className={cn(
                            "absolute bottom-full mb-2 right-0 flex gap-2 bg-white dark:bg-neutral-900 p-2 rounded-xl shadow-lg",
                            orientation === "vertical" ? "flex-col" : "flex-row"
                        )}
                    >
                        {items.map((item, idx) => (
                            <motion.div
                                key={item.title}
                                initial={{opacity: 0, y: 10}}
                                animate={{opacity: 1, y: 0}}
                                exit={{
                                    opacity: 0,
                                    y: 10,
                                    transition: {delay: idx * 0.05},
                                }}
                                transition={{delay: (items.length - 1 - idx) * 0.05}}
                            >
                                {item.dialog ? (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <button
                                                className="h-10 w-10 rounded-full bg-gray-50 dark:bg-neutral-900 flex items-center justify-center">
                                                <div className="h-4 w-4">{item.icon}</div>
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent>{item.dialog}</DialogContent>
                                    </Dialog>
                                ) : (
                                    <a
                                        href={item.href || ""}
                                        target={"_blank"}
                                        className="h-10 w-10 rounded-full bg-gray-50 dark:bg-neutral-900 flex items-center justify-center"
                                    >
                                        <div className="h-4 w-4">{item.icon}</div>
                                    </a>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            <button
                onClick={() => setOpen(!open)}
                className="h-10 w-10 rounded-full bg-gray-50 dark:bg-neutral-800 flex items-center justify-center"
            >
                <IconLayoutNavbarCollapse className="h-5 w-5 text-neutral-500 dark:text-neutral-400"/>
            </button>
        </div>
    );
};

const FloatingDockDesktop = ({
                                 items,
                                 orientation,
                                 className,
                             }: {
    items: {
        title: string;
        icon: React.ReactNode;
        href?: string;
        dialog?: React.ReactNode;
    }[];
    orientation: "horizontal" | "vertical";
    className?: string;
}) => {
    let mouseX = useMotionValue(Infinity);
    let mouseY = useMotionValue(Infinity);

    return (
        <motion.div
            onMouseMove={(e) => {
                mouseX.set(e.pageX);
                mouseY.set(e.pageY);
            }}
            onMouseLeave={() => {
                mouseX.set(Infinity);
                mouseY.set(Infinity);
            }}
            className={cn(
                "hidden md:flex gap-4 items-end rounded-2xl bg-blue-light dark:bg-neutral-900 p-4",
                orientation === "vertical"
                    ? "flex-col h-auto fixed top-1/2 right-4 transform -translate-y-1/2"
                    : "flex-row h-16 mx-auto",
                className
            )}
        >
            {items.map((item) => (
                <IconContainer
                    mouseX={mouseX}
                    mouseY={mouseY}
                    orientation={orientation}
                    key={item.title}
                    {...item}
                />
            ))}
        </motion.div>
    );
};

function IconContainer({
                           mouseX,
                           mouseY,
                           orientation,
                           title,
                           icon,
                           href,
                           dialog,
                           sheet
                       }: {
    mouseX: MotionValue;
    mouseY: MotionValue;
    orientation: "horizontal" | "vertical";
    title: string;
    icon: React.ReactNode;
    href?: string | undefined;
    dialog?: React.ReactNode;
    sheet?: React.ReactNode;
}) {
    let ref = useRef<HTMLDivElement>(null);

    // Calculate distance based on orientation
    let distance = useTransform(
        orientation === "horizontal" ? mouseX : mouseY,
        (val) => {
            let bounds = ref.current?.getBoundingClientRect() ?? {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            };
            return orientation === "horizontal"
                ? val - bounds.x - bounds.width / 2
                : val - bounds.y - bounds.height / 2;
        }
    );

    // Animate icon sizes
    let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
    let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

    let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
    let heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

    let widthIcon = useSpring(widthTransformIcon, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });
    let heightIcon = useSpring(heightTransformIcon, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });

    let width = useSpring(widthTransform, {mass: 0.1, stiffness: 150, damping: 12});
    let height = useSpring(heightTransform, {mass: 0.1, stiffness: 150, damping: 12});
    let widthIconSpring = useSpring(widthIcon, {mass: 0.1, stiffness: 150, damping: 12});
    let heightIconSpring = useSpring(heightIcon, {mass: 0.1, stiffness: 150, damping: 12});

    const [hovered, setHovered] = useState(false);

    if (dialog) {
        return (
            <Dialog>
                <DialogTrigger asChild>
                    <motion.div
                        ref={ref}
                        style={{width, height}}
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                        className="aspect-square rounded-full bg-blue-dark flex items-center justify-center relative cursor-pointer"
                    >
                        <motion.div
                            style={{width: widthIcon, height: heightIcon}}
                            className="flex items-center justify-center text-blue-light"
                        >
                            {icon}
                        </motion.div>
                        <AnimatePresence>
                            {hovered && (
                                <motion.div
                                    initial={{opacity: 0, y: 10, x: "-50%"}}
                                    animate={{opacity: 1, y: 0, x: "-50%"}}
                                    exit={{opacity: 0, y: 2, x: "-50%"}}
                                    className="px-2 py-0.5 whitespace-pre rounded-md bg-gray-100 border dark:bg-neutral-800 dark:border-neutral-900 dark:text-white border-gray-200 text-neutral-700 absolute left-1/2 -translate-x-1/2 -top-8 w-fit text-xs"
                                >
                                    {title}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </DialogTrigger>
                <DialogContent className="min-w-fit">{dialog}</DialogContent>
            </Dialog>
        );
    }

    if (sheet) {
        return (
            <Sheet>
                <SheetTrigger asChild>
                    <motion.div
                        ref={ref}
                        style={{width, height}}
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                        className="aspect-square rounded-full bg-blue-dark flex items-center justify-center relative cursor-pointer"
                    >
                        <motion.div style={{width: widthIconSpring, height: heightIconSpring}}
                                    className="flex items-center justify-center text-blue-light">
                            {icon}
                        </motion.div>
                        <AnimatePresence>
                            {hovered && (
                                <motion.div
                                    initial={{opacity: 0, y: 10, x: "-50%"}}
                                    animate={{opacity: 1, y: 0, x: "-50%"}}
                                    exit={{opacity: 0, y: 2, x: "-50%"}}
                                    className="px-2 py-0.5 whitespace-pre rounded-md bg-gray-100 border dark:bg-neutral-800 dark:border-neutral-900 dark:text-white border-gray-200 text-neutral-700 absolute left-1/2 -translate-x-1/2 -top-8 w-fit text-xs"
                                >
                                    {title}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </SheetTrigger>
                <SheetContent>{sheet}</SheetContent>
            </Sheet>
        );
    }

    return (
        <a href={href || ""} target={"_blank"}>
            <motion.div
                ref={ref}
                style={{width, height}}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="aspect-square rounded-full bg-blue-dark flex items-center justify-center relative"
            >
                <AnimatePresence>
                    {hovered && (
                        <motion.div
                            initial={{opacity: 0, y: 10, x: "-50%"}}
                            animate={{opacity: 1, y: 0, x: "-50%"}}
                            exit={{opacity: 0, y: 2, x: "-50%"}}
                            className="px-2 py-0.5 whitespace-pre rounded-md bg-gray-100 border dark:bg-neutral-800 dark:border-neutral-900 dark:text-white border-gray-200 text-neutral-700 absolute left-1/2 -translate-x-1/2 -top-8 w-fit text-xs"
                        >
                            {title}
                        </motion.div>
                    )}
                </AnimatePresence>
                <motion.div
                    style={{width: widthIcon, height: heightIcon}}
                    className="flex items-center justify-center text-blue-light"
                >
                    {icon}
                </motion.div>
            </motion.div>
        </a>
    );
}
