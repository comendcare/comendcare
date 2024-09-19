import {cn} from "@/lib/utils";
import React from "react";

const events = [
    {
        title: 'Research Proposal Submission',
        isLatest: true,
        date: 'March 1st, 2022',
        description: 'Submitted a detailed research proposal to study the genetic basis of a rare disease. The proposal includes the study design, objectives, and expected outcomes.',
        buttonText: 'Download Proposal',
        buttonIcon: (
            <svg className="w-3.5 h-3.5 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                 fill="currentColor" viewBox="0 0 20 20">
                <path
                    d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z"/>
                <path
                    d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
            </svg>
        )
    },
    {
        title: 'Grant Approval',
        isLatest: false,
        date: 'April 15th, 2022',
        description: 'Received approval for funding from a major health organization to conduct the proposed research. The grant will cover all necessary resources and personnel for the study.'
    },
    {
        title: 'Ethics Committee Approval',
        isLatest: false,
        date: 'May 10th, 2022',
        description: 'Secured approval from the ethics committee to ensure the research complies with ethical standards and protects participant rights and welfare.'
    },
    {
        title: 'Recruitment of Participants',
        isLatest: false,
        date: 'June 1st, 2022',
        description: 'Started recruiting participants for the study. Recruitment criteria and processes were strictly followed to ensure a representative sample.'
    },
    {
        title: 'Data Collection Begins',
        isLatest: false,
        date: 'July 20th, 2022',
        description: 'Initiated data collection, including genetic samples, medical histories, and other relevant information from participants.'
    },
    {
        title: 'Initial Data Analysis',
        isLatest: false,
        date: 'September 15th, 2022',
        description: 'Conducted initial analysis of collected data to identify potential genetic markers and patterns related to the rare disease.'
    },
    {
        title: 'Mid-Project Review',
        isLatest: false,
        date: 'November 10th, 2022',
        description: 'Performed a mid-project review to assess progress, address challenges, and refine methodologies based on preliminary findings.'
    },
    {
        title: 'Advanced Data Analysis',
        isLatest: false,
        date: 'January 5th, 2023',
        description: 'Advanced analysis using sophisticated bioinformatics tools to gain deeper insights into the genetic underpinnings of the disease.'
    },
    {
        title: 'Manuscript Preparation',
        isLatest: false,
        date: 'March 1st, 2023',
        description: 'Began preparing a manuscript detailing the research findings, methodologies, and implications for future research and treatment.'
    },
    {
        title: 'Publication and Dissemination',
        isLatest: false,
        date: 'April 15th, 2023',
        description: 'Submitted the manuscript to a peer-reviewed journal and presented findings at international conferences to disseminate knowledge and encourage further research.'
    }
]

export default function TimelinePage({params}: { params: { projectId: string } }) {
    return (
        <main className="flex flex-col items-center w-full h-screen mx-auto">
            <div className="max-w-7xl flex flex-col w-full p-4 mt-72">
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h2 className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
                            Timeline
                        </h2>
                        <p className="whitespace-pre-wrap">
                            {/*{faker.lorem.paragraphs(4, "\n")}*/}
                            {`The timeline of our rare disease research project encapsulates a rigorous and systematic approach to uncovering genetic insights and developing potential treatments.

The journey began with the submission of a detailed research proposal on March 1st, 2022, outlining the study design, objectives, and expected outcomes. Following this, the project secured crucial funding through grant approval on April 15th, 2022, ensuring the availability of necessary resources and personnel. By May 10th, 2022, the project received ethics committee approval, affirming compliance with ethical standards and the protection of participant rights.

Recruitment of participants commenced on June 1st, 2022, with stringent criteria to ensure a representative sample. The active phase of data collection began on July 20th, 2022, involving the gathering of genetic samples, medical histories, and other pertinent information. Initial data analysis, conducted on September 15th, 2022, aimed to identify genetic markers and patterns associated with the rare disease.

A mid-project review on November 10th, 2022, allowed for assessment of progress, addressing challenges, and refining methodologies. Advanced data analysis, utilizing sophisticated bioinformatics tools, began on January 5th, 2023, providing deeper insights into the genetic basis of the disease.

The project moved into the manuscript preparation phase on March 1st, 2023, where findings, methodologies, and future implications were meticulously documented. Finally, on April 15th, 2023, the manuscript was submitted to a peer-reviewed journal, and the research findings were presented at international conferences, marking the culmination of a dedicated effort to disseminate knowledge and inspire further research in the field of rare diseases.

This comprehensive timeline highlights the disciplined, step-by-step progression from initial proposal to widespread dissemination, underscoring the project's commitment to advancing understanding and treatment of rare diseases.`}
                        </p>
                    </div>

                    <ol className="relative border-s border-gray-200 dark:border-gray-700">
                        {events.map((event, index) => (
                            <li key={index} className="mb-10 ms-6">
                                <span
                                    className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -start-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                                    <svg className="w-2.5 h-2.5 text-blue-800 dark:text-blue-300" aria-hidden="true"
                                         xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                                    </svg>
                                </span>
                                <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                                    {event.title}
                                    {event.isLatest && (
                                        <span
                                            className="bg-blue-100 text-blue-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 ms-3">
                                            Latest
                                        </span>
                                    )}
                                </h3>
                                <time
                                    className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                                    Released on {event.date}
                                </time>
                                <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
                                    {event.description}
                                </p>
                                {event.buttonText && (
                                    <a href="#"
                                       className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700">
                                        {event.buttonIcon}
                                        {event.buttonText}
                                    </a>
                                )}
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </main>
    )
}
