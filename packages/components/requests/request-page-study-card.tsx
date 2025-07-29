import { Card, CardContent, CardHeader, CardTitle } from "@comend/components/ui/card";
import { MaterialAndDataAccessRequestWithResearcherAndComments } from "@comend/lib/types";

export default function RequestPageStudyCard({ requestData }: { requestData: MaterialAndDataAccessRequestWithResearcherAndComments }) {
    console.log(requestData)
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-xl">Study & Research Context</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="border-t border-gray-100">
                    <dl className="divide-y divide-gray-100">
                        {/* Study Title */}
                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm font-medium text-gray-900">Study Title</dt>
                            <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">{requestData?.studyTitle || "Missing"}</dd>
                        </div>

                        {/* Study Description */}
                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm font-medium text-gray-900">Study Description</dt>
                            <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">{requestData?.studyDescription || "Missing"}</dd>
                        </div>

                        {/* Justification */}
                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm font-medium text-gray-900">Justification</dt>
                            <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">{requestData?.justification || "Missing"}</dd>
                        </div>

                        {/* Timeline */}
                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm font-medium text-gray-900">Timeline</dt>
                            <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">{requestData?.timeline || "Missing"}</dd>
                        </div>

                        {/* Dissemination Plan */}
                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm font-medium text-gray-900">Dissemination Plan</dt>
                            <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">{requestData?.disseminationPlan || "Missing"}</dd>
                        </div>

                        {/* Patient Significance */}
                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm font-medium text-gray-900">Patient Significance</dt>
                            <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">{requestData?.patientSignificance || "Missing"}</dd>
                        </div>
                    </dl>
                </div>
            </CardContent>
        </Card>
    );
}
