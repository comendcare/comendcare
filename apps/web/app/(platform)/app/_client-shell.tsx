"use client";

import {SidebarInset, SidebarProvider, SidebarTrigger} from "@comend/components/ui/sidebar";
import {AppSidebar} from "~web/components/app-sidebar";
import {useIsMobile} from "@comend/lib/hooks/use-mobile";
import {MobileWarning} from "~web/components/mobile-warning";
import {NavUser} from "~web/components/nav-user";
import {
    InvitationWithOrganization,
    MemberRequestWithUserAndOrganization,
    MembershipWithOrganization
} from "@/packages/lib/types";
import * as React from "react";
import {useEffect, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/packages/components/ui/dialog";
import {Button} from "@/packages/components/ui/button";
import {cn} from "@/packages/lib/utils";
import {
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from "@/packages/components/ui/carousel";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/packages/components/ui/card";
import researchPlanner from "@/public/screenshots/research-planner.png";
import Image from "next/image"
import {User} from "@prisma/client";

export default function AppClientShell({
                                           user,
                                           memberships,
                                           invitations,
                                           memberRequests,
                                           children,
                                       }: {
    user: Partial<User>;
    memberships: MembershipWithOrganization[];
    invitations: InvitationWithOrganization[];
    memberRequests: MemberRequestWithUserAndOrganization[];
    children: React.ReactNode;
}) {
    const isMobile = useIsMobile();
    if (isMobile) return <MobileWarning/>;

    return (
        <SidebarProvider>
            <AppSidebar memberships={memberships}/>
            <SidebarInset className="w-full max-w-full overflow-hidden">
                <header
                    className="bg-white sticky top-0 flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-10 border-b bg-background w-full z-50 overflow-hidden">
                    <div className="w-full flex items-center justify-between gap-4 px-4">
                        <SidebarTrigger className="-ml-1"/>
                        <NavUser
                            user={user}
                            memberships={memberships}
                            invitations={invitations}
                            memberRequests={memberRequests}
                        />
                    </div>
                </header>
                <div className="flex h-[calc(100vh-3.5rem)] max-h-screen w-full overflow-hidden overflow-y-auto">
                    {children}
                    <OnboardingCards/>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

const OnboardingCards = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    // const [cardState, setCardState] = useState<number>(0)
    const [api, setApi] = useState<CarouselApi | null>(null);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    useEffect(() => {
        if (!api) return

        const updateScrollAbility = () => {
            setCanScrollPrev(api.canScrollPrev())
            setCanScrollNext(api.canScrollNext())
        }

        api.on('select', updateScrollAbility) // Update on slide change
        api.on('reInit', updateScrollAbility) // Update on re-initialization
        updateScrollAbility() // Initial check

        return () => {
            api.off('select', updateScrollAbility)
            api.off('reInit', updateScrollAbility)
        }
    }, [api])

    const cards = [
        {
            title: 'Develop your research plans',
            content: 'Map out projects intuitively with help from templates, recommendations, and the patient group network.',
            img: researchPlanner
        },
        {
            title: ' Build Your Toolkit',
            content: 'Share biosamples, datasets, or models to support your projects and attract collaborators.'
        },
        {
            title: 'Discover partners',
            content: 'Post requests for proposals and find complementary patient groups and service providers in our marketplace based on your research plan.'
        }
    ]

    return (
        <Dialog
            open={searchParams.get("showIntro") !== null}
            onOpenChange={(open) => {
                if (!open) {
                    const params = new URLSearchParams(searchParams.toString())
                    params.delete("showIntro")

                    router.push(`${pathname}?${params.toString()}`, {scroll: false})
                }
            }}
        >
            <DialogContent>
                <Carousel setApi={setApi}>
                    <CarouselContent>
                        {cards.map((card, index) => (
                            <CarouselItem key={index}>
                                <Card className="border-none shadow-none flex flex-col">
                                    <CardHeader>
                                        <CardTitle>{card.title}</CardTitle>
                                        <CardDescription>{card.content}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {card.img && (
                                            <Image
                                                style={{objectFit: 'scale-down'}}
                                                src={card.img}
                                                quality={100}
                                                priority={true}
                                                alt="preview image"
                                                width={2432}
                                                height={1442}
                                            />
                                        )}
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <DialogFooter
                        className={cn(
                            "pr-2 flex",
                            !canScrollPrev ? 'justify-end sm:justify-end' : 'justify-between sm:justify-between'
                        )}
                    >
                        {canScrollPrev && (
                            <Button
                                onClick={() => api?.scrollPrev()}
                                disabled={!canScrollPrev}
                                variant={'secondary'}
                            >
                                Previous
                            </Button>
                        )}
                        {canScrollNext ? (
                            <Button
                                onClick={() => api?.scrollNext()}
                                disabled={!canScrollNext}
                                variant={'secondary'}
                            >
                                Next
                            </Button>
                        ) : (
                            <DialogClose>
                                <Button
                                    variant={'cta'}
                                >
                                    Finish
                                </Button>
                            </DialogClose>
                        )}
                    </DialogFooter>
                </Carousel>
            </DialogContent>
        </Dialog>
    )
}
