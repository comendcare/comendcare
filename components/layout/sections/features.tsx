import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Icon} from "@/components/ui/icon";
import {icons} from "lucide-react";

interface FeaturesProps {
    icon: string;
    title: string;
    description: string;
}

const featureList: FeaturesProps[] = [
    {
        icon: "TabletSmartphone",
        title: "Researcher database",
        description:
            "Search, filter, and get recommendations for researcher relevant to your condition and research roadmap.",
    },
    {
        icon: "BadgeCheck",
        title: "Project repository",
        description:
            "Search, filter, and get recommendations for completed, in-progress, or future research projects.",
    },
    {
        icon: "Goal",
        title: "Grant marketplace",
        description:
            "Post opportunities you want to support with data, funding, or other resources.",
    },
    {
        icon: "PictureInPicture",
        title: "Personalized feed",
        description:
            "Stay current with relevant research, ask questions, and weigh in on discussions.",
    },
    {
        icon: "MousePointerClick",
        title: "AI co-pilot",
        description:
            "Get plain-language summaries of academic jargon and guidance for your research strategy on the fly.",
    },
    {
        icon: "Newspaper",
        title: "Data and IP licensing",
        description:
            "Streamline legal ownership over projects you’ve funded or contributed to.",
    },
];

export const FeaturesSection = () => {
    return (
        <section id="features" className="container py-24 sm:py-32">
            <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
                Features
            </h2>

            <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
                For patient-led research
            </h2>

            <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-8">
                End-to-end tools from crafting your research roadmap to monitoring project progress.
            </h3>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featureList.map(({icon, title, description}) => (
                    <div key={title}>
                        <Card className="h-full bg-background border-0 shadow-none">
                            <CardHeader className="flex justify-center items-center">
                                <div className="bg-primary/20 p-2 rounded-full ring-8 ring-primary/10 mb-4">
                                    <Icon
                                        name={icon as keyof typeof icons}
                                        size={24}
                                        color="hsl(var(--primary))"
                                        className="text-primary"
                                    />
                                </div>

                                <CardTitle>{title}</CardTitle>
                            </CardHeader>

                            <CardContent className="text-muted-foreground text-center">
                                {description}
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        </section>
    );
};
