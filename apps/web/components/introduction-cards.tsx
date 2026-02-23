"use client"

import React, { Dispatch, useState } from "react";
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
import { Card, CardContent } from "@comend/components/ui/card";
import { Button } from "@comend/components/ui/button";

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
                    <AlertDialogContent className=" gap-0">
                        <div className="h-full w-full flex items-center justify-center">
                        <Carousel className="w-full">
                            <CarouselContent className="m-0 w-full">
                                {Array.from({ length: 5 }).map((_, index) => (
                                <CarouselItem key={index} className="pl-0">
                                    <div className="p-1">
                                    <Card>
                                        <CardContent className="flex aspect-square items-center justify-center p-6">
                                        <span className="text-4xl font-semibold">{index + 1}</span>
                                        </CardContent>
                                    </Card>
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

  return (
    <div className="flex justify-between mt-4">
        {canScrollPrev ? (
            <Button
                variant="outline"
                onClick={() => scrollPrev()}
                disabled={!canScrollPrev} // Disable the button when it can't scroll left
            >
                Previous
            </Button>
        ) : (
            // hidden spacer
            <span className="transparent"></span>
        )}
        {canScrollNext ? (
            <Button
                variant="outline"
                onClick={() => scrollNext()}
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
