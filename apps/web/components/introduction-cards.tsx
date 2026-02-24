"use client"

import React, { Dispatch, useEffect, useState } from "react";
import type {Organization} from "@prisma/client";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogFooter,
} from "@comend/components/ui/alert-dialog";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    useCarousel
} from "@comend/components/ui/carousel"
import { Button } from "@comend/components/ui/button";
import screenshot1 from "@/public/Screenshot 2026-02-24 at 11.14.38 AM.png"
import screenshot2 from "@/public/Screenshot 2026-02-24 at 11.15.00 AM.png"
import screenshot3 from "@/public/Screenshot 2026-02-24 at 11.15.50 AM.png"
import Image from "next/image";
import { cn } from "@comend/lib/utils";

const introPages = [
    {
        title: "First, plan your research, end-to-end",
        description: "Create and organize research projects, tools, and RFPs using interactive planner.",
        img: screenshot1,
        imgAlt: ""
    },
    {
        title: "Next, turn your work into visibility",
        description: "Showcase your active and published projects, tools, and funding opportunities to your community, researchers, and partners—all in one trusted place.",
        img: screenshot2,
        imgAlt: ""
    },
    {
        title: "Finally, connect with the right partners",
        description: "Discover complementary patient groups, researchers, and service providers matched to your research priorities and research stage.",
        img: screenshot3,
        imgAlt: ""
    }
]

export default function IntroductionCards({
    invitations,
    claimInvitations,
    children,
}: {
    invitations: { id: string; organizationId: string, role: string, organization: Organization }[];
    claimInvitations: { id: string; organizationId: string, role: string, organization: Organization }[];
    children: React.ReactNode;
}) {
    const [open, setIsOpen] = useState(true); // permanently open until handled

    return (
        <>
            {children}

            {(invitations.length <= 0 && claimInvitations.length <= 0) && (
                // onboarding cards display
                <AlertDialog open={open}>
                    <AlertDialogContent className="w-[80dvw] max-w-3xl gap-0">
                        <div className="h-full w-full flex items-center justify-center">
                        <Carousel className="w-full">
                            <CarouselContent className="m-0 w-full">
                                {introPages.map((pageData, index) => (
                                <CarouselItem key={index} className="pl-0">
                                    <div className="p-1 flex flex-col gap-2">
                                        <h1 className="font-semibold text-xl">{pageData.title}</h1>
                                        <p className="text-sm text-muted-foreground">{pageData.description}</p>
                                        <Image src={pageData.img || ""} alt={pageData.imgAlt || ""} className="mt-4 h-full w-full"/>
                                    </div>
                                </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CustomCarouselControls setIsOpen={setIsOpen}/>
                        </Carousel>
                        </div>

                        <AlertDialogFooter/>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    );
}

const CustomCarouselControls = ({setIsOpen}: {setIsOpen: Dispatch<React.SetStateAction<boolean>>}) => {
    const { canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useCarousel();
    const [slideIndex, setSlideIndex] = useState(0)

    return (
        <div className="relative flex justify-between mt-4">
            {canScrollPrev ? (
                <Button
                    variant="outline"
                    onClick={() => {
                        scrollPrev()
                        setSlideIndex(prev => Math.max(prev - 1, 0))
                    }}
                    disabled={!canScrollPrev} // Disable the button when it can't scroll left
                >
                    Previous
                </Button>
            ) : (
                // hidden spacer
                <span className="transparent w-[85px]"></span>
            )}

            <div className="absolute top-0 mt-4 w-full flex justify-center gap-2 ml-auto mr-auto">
            {introPages.map((_, index) => (
                <div 
                    className={cn(
                        "h-2 w-2 rounded-full",
                        index <= slideIndex ? "bg-muted-foreground" : "bg-muted"
                    )}
                />
            ))}
            </div>

            {canScrollNext ? (
                <Button
                    variant="outline"
                    onClick={() => {
                        scrollNext()
                        setSlideIndex(prev => Math.min(prev + 1, introPages.length))
                    }}
                    disabled={!canScrollNext} // Disable the button when it can't scroll right
                >
                    Next
                </Button>
            ) : (
                <Button
                    variant="outline"
                    onClick={() => {
                        setIsOpen(false)
                    }}
                >
                    Finish
                </Button>
            )}
        </div>
    );
};
