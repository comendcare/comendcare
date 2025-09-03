import { RFP } from "@prisma/client";
import { Separator } from "@comend/components/ui/separator";
import { Clock, DollarSign, Megaphone } from "lucide-react";
import { Badge } from "@comend/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@comend/components/ui/card";
import { ProfilePhoto } from "@comend/components/profile-photo";
import { Button } from "@comend/components/ui/button";

export type DateStatus =
    | { status: 'Not Open'; daysRemaining: number | undefined; variant: 'yellow' }
    | { status: 'Open'; daysRemaining: number | undefined; variant: 'green' }
    | { status: 'Closed'; daysRemaining: number | undefined; variant: 'red' }
    | undefined;

export function checkDateRange(startDateStr?: string, endDateStr?: string): DateStatus {
    // If both dates are undefined, return undefined
    if (!startDateStr && !endDateStr) return undefined;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    // Check for invalid dates
    if ((startDate && isNaN(startDate.getTime())) || (endDate && isNaN(endDate.getTime()))) {
        return undefined;
    }

    // Normalize dates for day-level comparison
    const start = startDate
        ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
        : undefined;
    const end = endDate
        ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
        : undefined;

    // If before start date
    if (start && today < start) {
        return { status: 'Not Open', daysRemaining: undefined, variant: 'yellow' };
    }

    // If after end date
    if (end && today > end) {
        return { status: 'Closed', daysRemaining: undefined, variant: 'red' };
    }

    // If within range (start <= today <= end)
    if ((!start || today >= start) && (!end || today <= end)) {
        const daysRemaining = end
        ? Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
        return { status: 'Open', daysRemaining, variant: 'green' };
    }

    // Fallback
    return undefined;
}

export function RFPPage({rfp}: {rfp: any | undefined}) {
    if (!rfp) {
        return (
            <>No RFP found. This RFP may not exist or you don't have permission to access it.</>
        )
    }

    const status = checkDateRange(rfp?.startDate?.toString(), rfp?.endDate?.toString())

    return (
        <div className="flex flex-col items-center">
            <div className="p-8 flex flex-col gap-4 max-w-7xl">
                <span className="flex gap-4 items-center w-full">
                    <div className="p-2 bg-primary/10 rounded-lg">
                    <Megaphone className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-semibold">
                        {rfp.title || 'Untitled RFP'}
                    </h1>
                    {status && <Badge variant={status.variant} className="text-sm">{status.status}</Badge>}
                </span>
                <p className="-mt-4 pl-14 text-muted-foreground">{rfp.description}</p>

                {status?.daysRemaining !== undefined && (
                    <Badge variant={"green"} className="w-full font-normal flex gap-2">
                        <Clock size={18}/>
                        {`${status.daysRemaining} days remaining to submit proposals`}
                    </Badge>
                )}
            </div>
            <Separator className="mb-4"/>
            <div className="p-8 w-full max-w-7xl flex gap-4">
                <div className="flex flex-col gap-4 w-full">
                    <div className="w-full flex gap-4">
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Awards</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div>
                                    <p className="text-xl"><DollarSign className="inline-block"/> {rfp.budget}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Deadlines</CardTitle>
                            </CardHeader>
                            {/* <CardContent className="flex flex-col gap-4">
                                <div className="flex gap-2 items-center">
                                    <ProfilePhoto img={rfp.organization.image} name={rfp.organization.name}/>
                                    <div>
                                        <p>{rfp.organization.name}</p>
                                    </div>
                                </div>
                                <Button variant="secondary" className="w-full">
                                    Visit Profile
                                </Button>
                            </CardContent> */}
                        </Card>

                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Open To</CardTitle>
                            </CardHeader>
                            {/* <CardContent className="flex flex-col gap-4">
                                <div className="flex gap-2 items-center">
                                    <ProfilePhoto img={rfp.organization.image} name={rfp.organization.name}/>
                                    <div>
                                        <p>{rfp.organization.name}</p>
                                    </div>
                                </div>
                                <Button variant="secondary" className="w-full">
                                    Visit Profile
                                </Button>
                            </CardContent> */}
                        </Card>
                    </div>
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Links</CardTitle>
                        </CardHeader>
                        {/* <CardContent className="flex flex-col gap-4">
                            <div className="flex gap-2 items-center">
                                <ProfilePhoto img={rfp.organization.image} name={rfp.organization.name}/>
                                <div>
                                    <p>{rfp.organization.name}</p>
                                </div>
                            </div>
                            <Button variant="secondary" className="w-full">
                                Visit Profile
                            </Button>
                        </CardContent> */}
                    </Card>

                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Linked Projects</CardTitle>
                        </CardHeader>
                        {/* <CardContent className="flex flex-col gap-4">
                            <div className="flex gap-2 items-center">
                                <ProfilePhoto img={rfp.organization.image} name={rfp.organization.name}/>
                                <div>
                                    <p>{rfp.organization.name}</p>
                                </div>
                            </div>
                            <Button variant="secondary" className="w-full">
                                Visit Profile
                            </Button>
                        </CardContent> */}
                    </Card>
                </div>
                <div className="flex flex-col max-w-md">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Organization</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex gap-2 items-center">
                                <ProfilePhoto img={rfp.organization.image} name={rfp.organization.name}/>
                                <div>
                                    <p>{rfp.organization.name}</p>
                                </div>
                            </div>
                            <Button variant="secondary" className="w-full">
                                Visit Profile
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Contacts</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {rfp.contacts?.map((contact: any, index: number) => (
                                <>
                                    {index !== 0 && <Separator />}                
                                    <div>
                                        <p className="text-lg">{contact.name}</p>
                                        <p className="text-muted-foreground">{contact.affiliation}</p>
                                        <p className="text-muted-foregound">{contact.email}</p>
                                    </div>
                                </>
                            ))}

                            {rfp?.contacts?.length <= 0 && (
                                <p>No contacts.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}