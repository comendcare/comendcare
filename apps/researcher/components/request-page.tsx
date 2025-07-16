import { Paperclip } from "lucide-react";
import RequestPageCommentSection from "~researcher/components/request-page-comment-section";
import { MaterialAndDataAccessRequestWithResearcherAndComments } from "@comend/lib/types";

export default function RequestPage({ requestData }: { requestData: MaterialAndDataAccessRequestWithResearcherAndComments }) {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-3 space-x-8">
                <div className="col-span-2 flex flex-col">
                    <div className="px-4 sm:px-0">
                        <h3 className="text-base/7 font-semibold text-gray-900">
                            {requestData?.title ?? "Untitled Request"}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm/6 text-gray-500">
                            {requestData?.description ?? "No description provided."}
                        </p>
                    </div>

                    <div className="mt-6 border-t border-gray-100">
                        <dl className="divide-y divide-gray-100">
                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm/6 font-medium text-gray-900">Researcher</dt>
                                <dd className="mt-1 flex text-sm/6 text-gray-700 sm:col-div-2 sm:mt-0">
                                    <div className="grow">
                                        {requestData.researcher.name}
                                    </div>
                                    <div className="ml-4 shrink-0">
                                        <button type="button"
                                                className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500">
                                            Update
                                        </button>
                                    </div>
                                </dd>
                            </div>

                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm/6 font-medium text-gray-900">Sample Count</dt>
                                <dd className="mt-1 flex text-sm/6 text-gray-700 sm:col-div-2 sm:mt-0">
                                    <div className="grow">{requestData.sampleCount}</div>
                                    <div className="ml-4 shrink-0">
                                        <button type="button"
                                                className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500">
                                            Update
                                        </button>
                                    </div>
                                </dd>
                            </div>

                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm/6 font-medium text-gray-900">About</dt>
                                <dd className="mt-1 flex text-sm/6 text-gray-700 sm:col-div-2 sm:mt-0">
                                    <div className="grow">
                                        <p>Status: {requestData.status}</p>
                                        <p>Submitted: {new Date(requestData.submittedAt).toLocaleString()}</p>
                                        {requestData.expiresAt && (
                                            <p>Expires: {new Date(requestData.expiresAt).toLocaleString()}</p>
                                        )}
                                        <p>Sample Types: {requestData.sampleTypes?.join(", ")}</p>
                                        <p>Data Types: {requestData.dataTypes?.join(", ")}</p>
                                    </div>
                                    <div className="ml-4 shrink-0">
                                        <button type="button"
                                                className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500">
                                            Update
                                        </button>
                                    </div>
                                </dd>
                            </div>

                            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                                <dt className="text-sm/6 font-medium text-gray-900">Attachments</dt>
                                <dd className="mt-1 text-sm/6 text-gray-700 sm:col-div-2 sm:mt-0">
                                    <ul role="list"
                                        className="divide-y divide-gray-100 rounded-md border border-gray-200">
                                        <li className="flex items-center justify-between py-4 pr-5 pl-4 text-sm/6">
                                            <div className="flex w-0 flex-1 items-center">
                                                <Paperclip aria-hidden="true"
                                                           className="size-5 shrink-0 text-gray-400"/>
                                                <div className="ml-4 flex min-w-0 flex-1 gap-2">
                                                    <div
                                                        className="truncate font-medium text-gray-900">resume_back_end_developer.pdf
                                                    </div>
                                                    <div className="shrink-0 text-gray-400">2.4mb</div>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex shrink-0 space-x-4">
                                                <button
                                                    type="button"
                                                    className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500"
                                                >
                                                    Update
                                                </button>
                                                <div aria-hidden="true" className="text-gray-200">
                                                    |
                                                </div>
                                                <button type="button"
                                                        className="rounded-md bg-white font-medium text-gray-900 hover:text-gray-800">
                                                    Remove
                                                </button>
                                            </div>
                                        </li>
                                        <li className="flex items-center justify-between py-4 pr-5 pl-4 text-sm/6">
                                            <div className="flex w-0 flex-1 items-center">
                                                <Paperclip aria-hidden="true"
                                                           className="size-5 shrink-0 text-gray-400"/>
                                                <div className="ml-4 flex min-w-0 flex-1 gap-2">
                                                    <div
                                                        className="truncate font-medium text-gray-900">coverletter_back_end_developer.pdf
                                                    </div>
                                                    <div className="shrink-0 text-gray-400">4.5mb</div>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex shrink-0 space-x-4">
                                                <button
                                                    type="button"
                                                    className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500"
                                                >
                                                    Update
                                                </button>
                                                <div aria-hidden="true" className="text-gray-200">
                                                    |
                                                </div>
                                                <button type="button"
                                                        className="rounded-md bg-white font-medium text-gray-900 hover:text-gray-800">
                                                    Remove
                                                </button>
                                            </div>
                                        </li>
                                    </ul>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <div className="col-span-1">
                    <RequestPageCommentSection requestData={requestData} />
                </div>
            </div>
        </div>
    );
}
