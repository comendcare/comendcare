"use client"

import * as React from "react";
// Zustand store
import {useSession} from "next-auth/react";
import {useEffect} from "react";
import {useState} from "react";
import {redirect, usePathname, useRouter, useSearchParams} from "next/navigation";
import Loading from "@/loading";
import {
    getAllMembershipsFromUserId,
} from "@comend/lib/fetchers";
import {toast} from "sonner";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@comend/components/ui/sidebar";
import {AppSidebar} from "~web/components/app-sidebar";
import { MembershipWithOrganization } from "@comend/lib/types";
import {MobileWarning} from "~web/components/mobile-warning";
import {useIsMobile} from "@comend/lib/hooks/use-mobile";
import {NavUser} from "~web/components/nav-user";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@comend/components/ui/alert-dialog"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/packages/components/ui/dialog";
import { Button } from "@/packages/components/ui/button";
import { cn } from "@/packages/lib/utils";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/packages/components/ui/carousel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/components/ui/card";
import researchPlanner from "@/public/screenshots/research-planner.png";
import Image from "next/image"

interface AppLayoutProps {
    children: React.ReactNode
}

export default function AppLayout({children}: AppLayoutProps) {
    const {data: session, status} = useSession()
    const [memberships, setMemberships] = useState<MembershipWithOrganization[]>([]);

    useEffect(() => {
        if (status === "unauthenticated") {
            redirect("/login");
        }
    }, [status])

    useEffect(() => {
        if (status === "authenticated" && session) {
            getAllMembershipsFromUserId(session.user.id, {
                id: true,
                role: true,
                title: true,
                email: true,
                createdAt: true,
                updatedAt: true,
                invitedBy: true,
                organization: true,
                organizationId: true,
                user: true,
                metadata: true
            })
                .then(response => {
                    if (response.success) {
                        setMemberships(response.data ?? []);
                    } else {
                        console.error(response.error);
                        toast.error(response.error);
                    }
                })
                .catch(err => {
                    console.error(err);
                    toast.error("Unexpected error fetching organizations.");
                });
        }
    }, [session, status]);

    const isMobile = useIsMobile()
    if (isMobile) return <>
        <MobileWarning />
    </>

    if (status === "authenticated" && session) {
        return (
            <SidebarProvider>
                <AppSidebar memberships={memberships}/>
                <SidebarInset className="w-full max-w-full overflow-hidden">
                    <header className="bg-white sticky top-0 flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-10 border-b bg-background w-full z-50 overflow-hidden">
                        <div className="w-full flex items-center justify-between gap-4 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <NavUser/>
                        </div>
                    </header>
                    <div className="flex h-[calc(100vh-3.5rem)] max-h-screen w-full overflow-hidden overflow-y-auto">
                        {/* {status !== "authenticated" || !session || isLoading  ? <Loading /> : (children)} */}
                        {children}
                        <OnboardingCards />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    return <Loading />
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

                    router.push(`${pathname}?${params.toString()}`, { scroll: false })
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
                                            style={{ objectFit: 'scale-down' }}
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
                    ): (
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
