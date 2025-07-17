"use client"

import {useState} from "react"
import {Button} from "@comend/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@comend/components/ui/card"
import {Badge} from "@comend/components/ui/badge"
import {Progress} from "@comend/components/ui/progress"
import {Separator} from "@comend/components/ui/separator"
import {Alert, AlertDescription} from "@comend/components/ui/alert"
import {
    CheckCircle,
    Clock,
    FileText,
    Mail,
    Phone,
    Calendar,
    Users,
    AlertCircle,
    Download,
    MessageSquare,
    Bell,
} from "lucide-react"

export default function RequestPageRequestStatusCard() {
    const [requestData] = useState({
        id: "BR-2024-0157",
        title: "Genetic Markers in Cardiovascular Disease Progression",
        submittedDate: "2024-01-15",
        principalInvestigator: "Dr. Sarah Chen",
        institution: "University Medical Center",
        status: "under-review",
        currentStep: 2,
        estimatedCompletion: "2024-02-15",
    })

    const reviewSteps = [
        {
            id: 1,
            title: "Application Received",
            description: "Your request has been received and assigned a tracking number",
            status: "completed",
            date: "2024-01-15",
            icon: CheckCircle,
        },
        {
            id: 2,
            title: "Initial Review",
            description: "Administrative review for completeness and compliance",
            status: "in-progress",
            date: "2024-01-18",
            icon: Clock,
        },
        {
            id: 3,
            title: "Scientific Review",
            description: "Scientific merit evaluation by expert committee",
            status: "pending",
            date: "Expected: 2024-01-25",
            icon: Users,
        },
        {
            id: 4,
            title: "Ethics Review",
            description: "Ethical compliance and data use agreement review",
            status: "pending",
            date: "Expected: 2024-02-01",
            icon: FileText,
        },
        {
            id: 5,
            title: "Final Decision",
            description: "Committee decision and notification",
            status: "pending",
            date: "Expected: 2024-02-15",
            icon: Bell,
        },
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-500"
            case "in-progress":
                return "bg-blue-500"
            case "pending":
                return "bg-gray-300"
            default:
                return "bg-gray-300"
        }
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Request ID</p>
                                <p className="text-lg font-semibold">{requestData.id}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Submitted</p>
                                <p className="text-lg font-semibold">{new Date(requestData.submittedDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Principal Investigator</p>
                                <p className="text-lg font-semibold">{requestData.principalInvestigator}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Expected Decision</p>
                                <p className="text-lg font-semibold">
                                    {new Date(requestData.estimatedCompletion).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Progress Overview */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-xl">
                        Review Progress
                    </CardTitle>
                    <CardDescription>
                        Your request is currently in step {requestData.currentStep} of 5
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <Progress value={(requestData.currentStep / 5) * 100} className="h-2"/>
                        <p className="text-sm text-gray-600 mt-2">{requestData.currentStep} of 5 steps completed</p>
                    </div>

                    <div className="space-y-4">
                        {reviewSteps.map((step, index) => {
                            const Icon = step.icon
                            return (
                                <div key={step.id} className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(step.status)}`}
                                        >
                                            <Icon className="w-4 h-4 text-white"/>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium text-gray-900">{step.title}</h4>
                                            <span className="text-xs text-gray-500">{step.date}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Current Status Alert */}
            <Alert className="mb-6">
                <Clock className="h-4 w-4"/>
                <AlertDescription>
                    <strong>Current Status:</strong> Your request is undergoing initial administrative review. We are
                    verifying
                    that all required documents are complete and that ethical approvals are in order. You should expect
                    to hear
                    from us within the next 3-5 business days.
                </AlertDescription>
            </Alert>

        </div>
    )
}
