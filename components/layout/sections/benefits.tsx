import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Icon} from "@/components/ui/icon";
import {ChevronRight, icons} from "lucide-react";
import AnimatedGradientText from "@/components/ui/animated-gradient-text";
import {cn} from "@/lib/utils";

interface BenefitsProps {
    icon: string;
    title: string;
    description: string;
}

const benefitList: BenefitsProps[] = [
    {
        icon: "Blocks",
        title: "Researcher & patient group profiles",
        description:
            "Showcase your interests by detailing your accomplishments, roadmaps, and goals.",
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
            "Streamline projects with legal templates that protect patient priorities.",
    },
];

export const BenefitsSection = () => {
    return (
        <section id="benefits" className="container py-24 sm:py-32">
            <div className="grid lg:grid-cols-2 place-items-center lg:gap-24">
                <div>
                    <h2 className="text-lg text-primary mb-2 tracking-wider">Benefits</h2>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        For patient-led research
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        End-to-end tools from ideation to collaboration and beyond.
                    </p>
                    <div className="flex justify-start space-x-16">
                        <div>
                            <div className="text-2xl font-bold">400+</div>
                            <div className="text-muted-foreground">Patient groups</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">5000+</div>
                            <div className="text-muted-foreground">Contractors</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">1000+</div>
                            <div className="text-muted-foreground">Researchers</div>
                        </div>
                    </div>
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
                                    <AnimatedGradientText>
                                        <span
                                            className={cn(
                                                `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
                                            )}
                                        >
                                            Coming soon
                                        </span>
                                        <ChevronRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                                    </AnimatedGradientText>
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
