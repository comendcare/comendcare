'use client'

import {useState} from 'react'
import { InlineWidget } from "react-calendly"
import {Switch} from '@headlessui/react'

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function Contact() {
    const [enabled, setEnabled] = useState(true)

    return (
        <div className="isolate bg-white px-6 py-8 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Get in touch
                </h2>
                <p className="mt-2 text-lg leading-8 text-gray-600">
                    Say hello, learn about our tools, or explore ways to work together.
                </p>
            </div>

            <form action="#" method="POST" className="mx-auto mt-16 max-w-xl sm:mt-20">

                <div className="grid grid-cols-1 gap-x-8 gap-y-6">
                    {/*<Switch.Group as="div" className="flex items-center">*/}
                    {/*    <Switch*/}
                    {/*        checked={enabled}*/}
                    {/*        onChange={setEnabled}*/}
                    {/*        className={classNames(*/}
                    {/*            enabled ? 'bg-blue-600' : 'bg-gray-200',*/}
                    {/*            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2'*/}
                    {/*        )}*/}
                    {/*    >*/}
                    {/*        <span*/}
                    {/*            aria-hidden="true"*/}
                    {/*            className={classNames(*/}
                    {/*                enabled ? 'translate-x-5' : 'translate-x-0',*/}
                    {/*                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'*/}
                    {/*            )}*/}
                    {/*        />*/}
                    {/*    </Switch>*/}
                    {/*    <Switch.Label as="span" className="ml-3 text-sm md:text-base">*/}
                    {/*        <span className="font-medium text-gray-900">*/}
                    {/*            {enabled ? 'Send a message' : 'Book a meeting'}*/}
                    {/*        </span>*/}
                    {/*    </Switch.Label>*/}
                    {/*</Switch.Group>*/}

                    {enabled ? <InlineWidget url="https://calendly.com/albertatcomend/librarey" styles={{height: '500px'}}/>
                        : <>
                            <div>
                                <label htmlFor="first-name" className="block text-sm font-semibold leading-6 text-gray-900">
                                    Name
                                </label>
                                <div className="mt-2.5">
                                    <input
                                        type="text"
                                        name="first-name"
                                        id="first-name"
                                        autoComplete="given-name"
                                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">
                                    Email
                                </label>
                                <div className="mt-2.5">
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        autoComplete="email"
                                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900">
                                    Message
                                </label>
                                <div className="mt-2.5">
                                <textarea
                                    name="message"
                                    id="message"
                                    rows={4}
                                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                    defaultValue={''}
                                />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="block w-full rounded-md bg-blue-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            >
                                {`Let's talk`}
                            </button>
                        </>
                    }
                </div>

            </form>
        </div>
    )
}