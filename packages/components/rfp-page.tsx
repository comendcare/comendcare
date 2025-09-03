import { ExternalAttachment, RFP } from "@prisma/client";
import { Separator } from "@comend/components/ui/separator";
import { Check, Clock, DollarSign, Link2, Megaphone, Link as LinkIcon } from "lucide-react";
import { Badge } from "@comend/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@comend/components/ui/card";
import { ProfilePhoto } from "@comend/components/profile-photo";
import { Button } from "@comend/components/ui/button";
import Link from "next/link";

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
            <div className="p-8 flex flex-col gap-4 max-w-7xl w-full">
                <span className="flex gap-4 items-center w-full">
                    <div className="p-2 bg-primary/10 rounded-lg">
                    <Megaphone className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-4xl font-semibold">
                        {rfp.title || 'Untitled RFP'}
                    </h1>
                    {status && <Badge variant={status.variant} className="text-sm">{status.status}</Badge>}
                </span>
                {/* <p className="-mt-4 pl-14 text-muted-foreground">{rfp.description}</p> */}

                {status?.daysRemaining !== undefined && (
                    <Badge variant={"green"} className="w-full font-normal flex gap-2">
                        <Clock size={18}/>
                        {`${status.daysRemaining} days remaining to submit proposals`}
                    </Badge>
                )}
            </div>
            <Separator className="mb-4"/>
            <div className="p-8 w-full max-w-7xl flex flex-col md:flex-row gap-4">
                <div className="flex flex-col gap-4 w-full">
                    <div className="w-full flex flex-col md:flex-row gap-4">
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Awards</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div>
                                    <p className="text-2xl font-bold text-green-800">{`$ ${rfp.budget}`}</p>
                                    <p className="text-muted-foreground text-sm">Available funding for selected proposals</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Timeline</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-2">
                                    <div>
                                        <p className="text-muted-foreground">Request Opens</p>
                                        <p className="text-xl">{`${rfp?.startDate?.toLocaleDateString("en-US", {year: 'numeric', month: 'long', day: 'numeric'})}`}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Deadline for Proposals</p>
                                        <p className="text-xl">{`${rfp?.endDate?.toLocaleDateString("en-US", {year: 'numeric', month: 'long', day: 'numeric'})}`}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle>Open To</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-2">
                                    {rfp.openTo.includes('CRO') && (
                                        <div className="text-lg flex gap-2 items-center">
                                            <div className="bg-green-100 rounded-full p-1 font-semibold"><Check className="text-green-800 h-5 w-5 font-semibold"/></div>
                                            Service Providers
                                        </div>
                                    )}
                                    {rfp.openTo.includes('ACADEMIC') && (
                                        <div className="text-lg flex gap-2 items-center">
                                            <div className="bg-green-100 rounded-full p-1 font-semibold"><Check className="text-green-800 h-5 w-5 font-semibold"/></div>
                                            Researchers
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Scope</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <>
                                <p>{rfp.description}</p>
                            </>
                        </CardContent>
                    </Card>

                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Eligibility</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <>
                                <p>{rfp.description}</p>
                            </>
                        </CardContent>
                    </Card>

                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Instructions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <>
                                <p>{rfp.description}</p>
                            </>
                        </CardContent>
                    </Card>

                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Selection Process</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <>
                                <p>{rfp.description}</p>
                            </>
                        </CardContent>
                    </Card>

                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Links</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <>
                                {rfp.attachments?.map((attachment: ExternalAttachment) => (
                                    <div className="flex justify-between items-center gap-4 p-4 border border-solid border-gray-200 rounded-md">
                                        <div className="flex gap-4 items-center">
                                            <LinkIcon />
                                            <div>
                                                <p className="text-lg">{attachment.name}</p>
                                                <p className="text-muted-foreground">{attachment.link}</p>
                                            </div>
                                        </div>
                                        <Button asChild variant={'secondary'}>
                                            <Link href={attachment.link}>View Link</Link>
                                        </Button>
                                    </div>
                                ))}
                            </>
                        </CardContent>
                    </Card>

                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle>Relevant Projects</CardTitle>
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
                            <CardTitle>Relevant Tools</CardTitle>
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
                <div className="flex flex-col gap-4 max-w-md">
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