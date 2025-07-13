import {Paperclip} from "lucide-react";
import {MaterialAndDataAccessRequest} from "@prisma/client";

export default function RequestPage({requestData}: {requestData: MaterialAndDataAccessRequest}) {
    return (
        <div className="max-w-7xl mx-auto">
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
                        <dt className="text-sm/6 font-medium text-gray-900">Full name</dt>
                        <dd className="mt-1 flex text-sm/6 text-gray-700 sm:col-div-2 sm:mt-0">
                            <div className="grow">Margot Foster</div>
                            <div className="ml-4 shrink-0">
                                <button type="button"
                                        className="rounded-md bg-white font-medium text-indigo-600 hover:text-indigo-500">
                                    Update
                                </button>
                            </div>
                        </dd>
                    </div>
                    <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm/6 font-medium text-gray-900">Salary expectation</dt>
                        <dd className="mt-1 flex text-sm/6 text-gray-700 sm:col-div-2 sm:mt-0">
                            <div className="grow">$120,000</div>
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
                                Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa
                                consequat. Excepteur
                                qui ipsum aliquip consequat sint. Sit id mollit nulla mollit nostrud in ea officia
                                proident. Irure
                                nostrud pariatur mollit ad adipisicing reprehenderit deserunt qui eu.
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
                            <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
                                <li className="flex items-center justify-between py-4 pr-5 pl-4 text-sm/6">
                                    <div className="flex w-0 flex-1 items-center">
                                        <Paperclip aria-hidden="true" className="size-5 shrink-0 text-gray-400"/>
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
                                        <Paperclip aria-hidden="true" className="size-5 shrink-0 text-gray-400"/>
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
    )
}
