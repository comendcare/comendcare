import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Icon} from "@/components/ui/icon";
import {icons} from "lucide-react";
import {HoverBorderGradient} from "@/components/ui/hover-border-gradient";

interface BenefitsProps {
    icon: string;
    title: string;
    description: string;
}

const benefitList: BenefitsProps[] = [
    {
        icon: "Blocks",
        title: "Forums and discussions",
        description:
            "Talk with other advocates and researchers about their progress and find answers to your questions.",
    },
    {
        icon: "Wallet",
        title: "Grant database",
        description:
            "Search, filter, and get recommendations for researcher and advocates relevant to your interests.",
    },
    {
        icon: "ChartLine",
        title: "Project hub",
        description:
            "Search, filter, and get recommendations for completed, in-progress, or future research projects.",
    },
    {
        icon: "Sparkle",
        title: "Research agreements",
        description:
            "Streamline projects with legal templates and IP management tools that protect patient priorities.",
    },
];

export const ComingSoonSection = () => {
    return (
        <section id="benefits" className="container w-full mx-auto py-24 sm:py-32 max-w-7xl">
            <div className="grid lg:grid-cols-2 items-center lg:gap-24">
                <div>
                    <h2 className="text-lg text-primary mb-2 tracking-wider">What's next</h2>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {`Looking forward to building with you`}
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        {`Our roadmap is chock full of features we think you'll like.`}
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-4 w-full">
                    {benefitList.map(({icon, title, description}, index) => (
                        <Card
                            key={title}
                            className="bg-muted/50 dark:bg-card hover:bg-background transition-all delay-75 group/number"
                        >
                            <CardHeader className="flex flex-col space-y-4">

                                <div className="flex justify-between items-center">
                                    <Icon
                                        name={icon as keyof typeof icons}
                                        size={32}
                                        color="hsl(var(--primary))"
                                        className="text-primary"
                                    />
                                    <HoverBorderGradient
                                        containerClassName="rounded-full"
                                        as="button"
                                        className="text-sm dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
                                    >
                                        <span>✨ Coming soon</span>
                                    </HoverBorderGradient>
                                </div>

                                <CardTitle>{title}</CardTitle>
                            </CardHeader>

                            <CardContent className="text-muted-foreground">
                                {description}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};
