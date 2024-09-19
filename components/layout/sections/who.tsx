import {Card, CardContent, CardHeader, CardTitle} from "../../ui/card";
import patients from "@/public/illustrations/patients.svg"
import advocates from "@/public/illustrations/advocates.svg"
import researchers from "@/public/illustrations/researchers.svg"
import Image from "next/image";
import {ReactElement} from "react";

interface WhoProps {
    icon: ReactElement;
    title: string;
    description: string;
    keyFeatures: string[];
}

const whoList: WhoProps[] = [
    {
        icon: <Image priority src={patients} alt="Patients"/>,
        title: "Patients",
        description:
            "Participate in research and support your research goals.",
        keyFeatures: [
            "Track research progression",
            "Project researchers breakdowns",
            "Data intake and distribution",
        ]
    },
    {
        icon: <Image priority src={advocates} alt="Advocates"/>,
        title: "Advocates",
        description:
            "Attract researcher with our project hub and patient group profiles.",
        keyFeatures: [
            "Research project pages",
            "Partnership agreement templates",
            "Research planner and roadmaps",
        ]
    },
    {
        icon: <Image priority src={researchers} alt="Researchers"/>,
        title: "Researchers",
        description:
            "Find patient partners, data, and funding opportunities.",
        keyFeatures: [
            "Project collaborators hub",
            "Patient group database",
            "Data collection and repository",
        ]
    },
];

export const WhoSection = () => {
    return (
        <section id="who" className="container w-full py-16 sm:py-24">
            <div className="flex flex-col items-start mx-auto lg:max-w-screen-xl lg:gap-8">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold">
                        {`Who's on RareSearch?`}
                    </h2>
                </div>

                <div className="grid grid-cols-3 gap-4 w-full">
                    {whoList.map(({icon, title, description, keyFeatures}, index) => (
                        <Card
                            key={title}
                            className="border-none shadow-none"
                        >
                            <div className="flex flex-col">
                                <div className="flex flex-row">
                                    <div className="flex flex-col">
                                        <CardHeader>
                                            <CardTitle>{title}</CardTitle>
                                        </CardHeader>

                                        <CardContent className="text-muted-foreground">
                                            {description}
                                        </CardContent>
                                    </div>
                                    {icon}
                                </div>
                                <CardContent className="text-muted-foreground">
                                    <ul>
                                        {keyFeatures.map(feature =>
                                            <li key={feature} className="flex items-center">
                                                <svg
                                                    className="w-3.5 h-3.5 me-2 text-green-500 dark:text-green-400 flex-shrink-0"
                                                    aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                                    fill="currentColor" viewBox="0 0 20 20">
                                                    <path
                                                        d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                                                </svg>
                                                {feature}
                                            </li>)}
                                    </ul>
                                </CardContent>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};
