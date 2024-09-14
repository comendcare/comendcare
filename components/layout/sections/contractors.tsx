"use client"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import contractors from "../../../../data/contractors.json"
import Image from "next/image";
import React, {forwardRef, ReactElement, ReactNode} from "react";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {FaFileSignature} from "react-icons/fa6";
import Link from "next/link";
import {motion} from "framer-motion";
import {createDicebearAvatar, getFavicon, shuffleArray} from "@/lib/utils";

interface CardProps {
    children: ReactNode;
    className?: string;
}

// Usage in your component
const randomContractors = shuffleArray([...contractors]).slice(0, 15)

export const ContractorsSection = () => {

    const card = forwardRef<HTMLDivElement, CardProps>(({children, className}, ref) => (
        <Card ref={ref} className={className}>
            {children}
        </Card>
    ))

    const MotionCard = motion(card);

    return (
        <section id="contractors" className="container w-full py-8">
            <div className="flex flex-col items-start mx-auto lg:max-w-screen-xl lg:gap-8">
                <div className="flex flex-col space-y-2">
                    <div className="flex flex-row items-center space-x-4">
                        <FaFileSignature className="h-8 w-8"/>
                        <h2 className="text-3xl md:text-4xl font-bold">
                            {`Contractors`}
                        </h2>
                    </div>
                    <p className="text-xl text-muted-foreground">
                        Browse contract research, development, and manufacturing organization on RareSearch.
                    </p>
                </div>

                <ScrollArea className="w-full whitespace-nowrap rounded-md border border-none">
                    <div className="flex space-x-4 p-4">
                        {randomContractors.map((contractor: any, index: number) => (
                            <Link
                                key={contractor.title}
                                href={`contractor/${contractor.title}/profile`}
                            >
                                <MotionCard
                                    whileHover={{
                                        scale: 1.01,
                                        boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1)"
                                    }}
                                    transition={{type: "spring", stiffness: 300}}
                                    className="w-80 h-56 flex flex-row items-start"
                                >
                                    <div className="flex flex-col">
                                        <CardHeader className="flex flex-row items-center justify-start gap-4">
                                            <img alt="" src={getFavicon(contractor.url)}
                                                 className="h-6 w-6 rounded-full"/>
                                            <CardTitle
                                                className="flex flex-col"
                                            >
                                                <div
                                                    className="text-lg text-wrap line-clamp-2"
                                                >
                                                    {contractor.title}
                                                </div>
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="text-muted-foreground text-wrap line-clamp-3">
                                                {contractor.description}
                                            </div>
                                        </CardContent>
                                    </div>
                                </MotionCard>
                            </Link>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal"/>
                </ScrollArea>
            </div>
        </section>
    );
};
