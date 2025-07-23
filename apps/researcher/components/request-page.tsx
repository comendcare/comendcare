"use client"

import {ArrowLeft, Paperclip} from "lucide-react";
import RequestPageCommentSection from "~researcher/components/request-page-comment-section";
import {MaterialAndDataAccessRequestWithResearcherAndComments} from "@comend/lib/types";
import {Button} from "@comend/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@comend/components/ui/card"
import {Badge} from "@comend/components/ui/badge"
import RequestPageTermsAndConditionsCard from "~researcher/components/request-page-terms-and-conditions-card";
import RequestPageRequestStatusCard from "~researcher/components/request-page-request-status-card";
import {useRouter} from "next/navigation";
import RequestPageDetailsCard from "~researcher/components/request-page-details-card";


const getStatusBadge = (status: string) => {
    console.log(status)
    switch (status) {
        case "UNDER-REVIEW":
            return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>
        case "APPROVED":
            return <Badge className="bg-green-100 text-green-800">Approved</Badge>
        case "REJECTED":
            return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
        case "PENDING-INFO":
            return <Badge className="bg-yellow-100 text-yellow-800">Additional Info Required</Badge>
        default:
            return <Badge>Unknown</Badge>
    }
}

export default function RequestPage({requestData}: {
    requestData: MaterialAndDataAccessRequestWithResearcherAndComments
}) {
    const router = useRouter()

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-3 space-x-8">
                <div className="col-span-2 flex flex-col space-y-4">
                    <Button
                        variant="secondary"
                        onClick={() => router.push("/requests")}
                        className="w-min"
                    >
                        <ArrowLeft/>
                        Back to all requests
                    </Button>
                    <div className="flex items-center justify-between mb-4">
                        <div className="px-4 sm:px-0">
                            <h3 className="text-2xl font-semibold text-gray-900">
                                {requestData?.title ?? "Untitled Request"}
                            </h3>
                            <p className="mt-1 max-w-2xl text-base text-gray-500">
                                {requestData?.description ?? "No description provided."}
                            </p>
                        </div>
                        {getStatusBadge(requestData.status)}
                    </div>

                    <RequestPageRequestStatusCard/>

                    <RequestPageDetailsCard requestData={requestData} />

                    <RequestPageTermsAndConditionsCard/>

                    <Card>
                        <CardContent className="pt-6">
                            <div
                                className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 mb-2">
                                        <strong>Next Steps:</strong> After submission, your request will be reviewed by
                                        our access
                                        committee. You will receive a confirmation email and updates on the review
                                        status.
                                    </p>
                                    <div className="flex gap-2">
                                        <Badge variant="outline">Review Time: 2-4 weeks</Badge>
                                        <Badge variant="outline">Committee Meeting: Monthly</Badge>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" type="button">
                                        Save Draft
                                    </Button>
                                    <Button type="submit" className="min-w-[120px]">
                                        Submit Request
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-1">
                    <RequestPageCommentSection requestData={requestData}/>
                </div>
            </div>
        </div>
    );
}
