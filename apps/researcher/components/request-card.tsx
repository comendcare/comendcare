import { Badge } from "@comend/components/ui/badge"
import { Button } from "@comend/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@comend/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@comend/components/ui/dropdown-menu"
import { Calendar, Download, Eye, MoreHorizontal, User } from "lucide-react"

const getStatusColor = (status: string) => {
    switch (status) {
        case "approved":
            return "bg-green-100 text-green-800 border-green-200"
        case "pending":
            return "bg-yellow-100 text-yellow-800 border-yellow-200"
        case "in-progress":
            return "bg-blue-100 text-blue-800 border-blue-200"
        case "rejected":
            return "bg-red-100 text-red-800 border-red-200"
        case "completed":
            return "bg-gray-100 text-gray-800 border-gray-200"
        default:
            return "bg-gray-100 text-gray-800 border-gray-200"
    }
}

const getStatusText = (status: string) => {
    switch (status) {
        case "approved":
            return "Approved"
        case "pending":
            return "Under Review"
        case "in-progress":
            return "In Progress"
        case "rejected":
            return "Rejected"
        case "completed":
            return "Completed"
        default:
            return status
    }
}

export default function RequestCard({request}: any) {
    return (
        <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                            <Badge className={getStatusColor(request.status)}>{getStatusText(request.status)}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                            <div>
                                <span className="font-medium">Request ID:</span> {request.id}
                            </div>
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span className="font-medium">Submitted:</span> {request.submittedDate}
                            </div>
                            <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                <span className="font-medium">PI:</span> {request.pi}
                            </div>
                            <div>
                                <span className="font-medium">Institution:</span> {request.institution}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-700">Sample Types:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {request.sampleTypes?.map((type: string) => (
                                        <Badge key={type} variant="default" className="text-xs">
                                            {type}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Data Types:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {request.dataTypes?.map((type: string) => (
                                        <Badge key={type} variant="default" className="text-xs">
                                            {type}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Sample Count:</span>
                                <span className="ml-2">{request.sampleCount}</span>
                            </div>
                        </div>

                        {request.approvalDate && (
                            <div className="mt-3 text-sm text-gray-600">
                                <span className="font-medium">Approved:</span> {request.approvalDate}
                                {request.expiryDate && (
                                    <span className="ml-4">
                            <span className="font-medium">Expires:</span> {request.expiryDate}
                          </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                        </Button>

                        {request.status === "approved" || request.status === "completed" ? (
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                            </Button>
                        ) : null}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Download Agreement</DropdownMenuItem>
                                {request.status === "pending" && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>Edit Request</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600">Cancel Request</DropdownMenuItem>
                                    </>
                                )}
                                {(request.status === "approved" || request.status === "completed") && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>Download Data</DropdownMenuItem>
                                        <DropdownMenuItem>Access Instructions</DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
