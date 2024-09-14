"use client"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import grants from "../../../../data/grants.json"
import Image from "next/image";
import React, {forwardRef, ReactElement, ReactNode} from "react";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {FaAtom, FaMoneyBills, FaUsers} from "react-icons/fa6";
import Link from "next/link";
import {motion} from "framer-motion";
import {createDicebearAvatar, shuffleArray} from "@/lib/utils";

interface CardProps {
    children: ReactNode;
    className?: string;
}

export const GrantsSection = () => {

    const card = forwardRef<HTMLDivElement, CardProps>(({children, className}, ref) => (
        <Card ref={ref} className={className}>
            {children}
        </Card>
    ))

    const MotionCard = motion(card);

    return (
        <section id="grants" className="container w-full py-8">
            <div className="flex flex-col items-start mx-auto lg:max-w-screen-xl lg:gap-8">
                <div className="flex flex-col space-y-2">
                    <div className="flex flex-row items-center space-x-4">
                        <FaMoneyBills className="h-8 w-8"/>
                        <h2 className="text-3xl md:text-4xl font-bold">
                            {`Grants`}
                        </h2>
                    </div>
                    <p className="text-xl text-muted-foreground">
                        Browse the open grants on RareSearch.
                    </p>
                </div>

                <ScrollArea className="w-full whitespace-nowrap rounded-md border border-none">
                    <div className="flex space-x-4 p-4">
                        {shuffleArray(grants).map((grant, index) => (
                            <Link
                                key={grant.title}
                                href={`grant/${grant.title}/profile`}
                            >
                                <MotionCard
                                    whileHover={{
                                        scale: 1.01,
                                        boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1)"
                                    }}
                                    transition={{type: "spring", stiffness: 300}}
                                    className="w-96 h-56 flex flex-row items-start"
                                >
                                    <div className="flex flex-col">
                                        <CardHeader className="pb-2">
                                            <CardTitle
                                                className="text-lg text-wrap line-clamp-2"
                                            >
                                                {grant.title}
                                            </CardTitle>
                                            <div className="text-wrap line-clamp-3">
                                                ${grant.amount} - {`${grant.numberOfGrants} grant${grant.numberOfGrants > 1 ? 's' : ''} available - ${grant.duration} year${grant.duration > 1 ? 's' : ''}`}
                                            </div>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="text-muted-foreground text-wrap line-clamp-3">
                                                {grant.description}
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
