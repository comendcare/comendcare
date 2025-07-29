import { Card, CardContent, CardHeader, CardTitle } from "@comend/components/ui/card";
import { Paperclip } from "lucide-react";
import { MaterialAndDataAccessRequestWithResearcherAndComments } from "@comend/lib/types";

export default function RequestPageDetailsCard({ requestData }: { requestData: MaterialAndDataAccessRequestWithResearcherAndComments }) {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-xl">Request Details</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="border-t border-gray-100">
                    <dl className="divide-y divide-gray-100">
                        {/* Researcher */}
                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900">Researcher</dt>
                            <dd className="mt-1 flex text-sm/6 text-gray-700 col-span-2 sm:mt-0">
                                <div className="grow">
                                    {requestData?.researcher?.name} ({requestData?.researcher?.title})
                                </div>
                                <div className="ml-4 shrink-0">
                                    <button type="button" className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500">Update</button>
                                </div>
                            </dd>
                        </div>

                        {/* Sample Count */}
                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900">Sample Count</dt>
                            <dd className="mt-1 flex text-sm/6 text-gray-700 col-span-2 sm:mt-0">
                                <div className="grow">{requestData?.sampleCount ?? "N/A"}</div>
                                <div className="ml-4 shrink-0">
                                    <button type="button" className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500">Update</button>
                                </div>
                            </dd>
                        </div>

                        {/* About */}
                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900">About</dt>
                            <dd className="mt-1 flex text-sm/6 text-gray-700 col-span-2 sm:mt-0">
                                <div className="grow">
                                    <p>Status: {requestData?.status}</p>
                                    <p>Submitted: {requestData?.submittedAt ? new Date(requestData?.submittedAt).toLocaleString() : "N/A"}</p>
                                    {requestData?.expiresAt && <p>Expires: {new Date(requestData?.expiresAt).toLocaleString()}</p>}
                                    <p>Sample Types: {requestData?.sampleTypes?.length > 0 ? requestData?.sampleTypes.join(", ") : "None"}</p>
                                    <p>Data Types: {requestData?.dataTypes?.length > 0 ? requestData?.dataTypes.join(", ") : "None"}</p>
                                </div>
                                <div className="ml-4 shrink-0">
                                    <button type="button" className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500">Update</button>
                                </div>
                            </dd>
                        </div>

                        {/* Institutions */}
                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900">Institutions</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 col-span-2 sm:mt-0">
                                <ul className="list-disc pl-5">
                                    {requestData?.institutions?.length > 0 ? (
                                        requestData?.institutions.map((i) => (
                                            <li key={i.id}>{i.name}</li>
                                        ))
                                    ) : (
                                        <li className="text-gray-400">None listed</li>
                                    )}
                                </ul>
                            </dd>
                        </div>

                        {/* Attachments (Placeholder) */}
                        <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm/6 font-medium text-gray-900">Attachments</dt>
                            <dd className="mt-1 text-sm/6 text-gray-700 col-span-2 sm:mt-0">
                                <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
                                    <li className="flex items-center justify-between py-4 pr-5 pl-4 text-sm/6">
                                        <div className="flex w-0 flex-1 items-center">
                                            <Paperclip aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
                                            <div className="ml-4 flex min-w-0 flex-1 gap-2">
                                                <div className="truncate font-medium text-gray-900">example_document.pdf</div>
                                                <div className="shrink-0 text-gray-400">1.2mb</div>
                                            </div>
                                        </div>
                                        <div className="ml-4 flex shrink-0 space-x-4">
                                            <button type="button" className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500">Update</button>
                                            <div aria-hidden="true" className="text-gray-200">|</div>
                                            <button type="button" className="rounded-md bg-white font-medium text-gray-900 hover:text-gray-800">Remove</button>
                                        </div>
                                    </li>
                                </ul>
                            </dd>
                        </div>
                    </dl>
                </div>
            </CardContent>
        </Card>
    );
}
