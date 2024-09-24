import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { icons } from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import {useRouter} from "next/navigation";

interface BenefitsProps {
    icon: string;
    title: string;
    description: string | ReactNode;  // Allow description to be string or ReactNode
    eta?: string;
}

export const ComingSoonSection = () => {
    const router = useRouter()

    const benefitList: BenefitsProps[] = [
        {
            icon: "Wallet",
            title: "Grant funding database",
            description:
                "Find funding opportunities for your organization and advertise your own grants for others.",
            eta: "early 2025"
        },
        {
            icon: "ChartLine",
            title: "Therapeutic overviews",
            description:
                "Stay on top of the latest efforts, evidence, and eligibility in rapidly advancing technologies.",
            eta: "spring 2025"
        },
        {
            icon: "Sparkle",
            title: "Research agreements",
            description:
                "Streamline new projects with legal templates and IP tools to protect patient priorities.",
            eta: "summer 2025"
        },
        {
            icon: "Blocks",
            title: "Have ideas?",
            description:
            <div className="flex flex-col justify-center items-center gap-y-4">
                Work with us!
                <Button
                    onClick={() => router.push("/contact")}
                >
                    Get in touch
                </Button>
            </div>,
        },
    ];

    return (
        <section id="benefits" className="container w-full mx-auto px-8 py-24 sm:py-24 max-w-7xl">
            <div className="grid lg:grid-cols-2 items-center lg:gap-24">
                <div>
                    <h2 className="text-lg text-primary mb-2 tracking-wider">
                        {`What's next`}
                    </h2>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {`Empowering patient groups with technology`}
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        {`Our roadmap is being actively designed with patients, for patients.`}
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-4 w-full">
                    {benefitList.map(({ icon, title, description, eta }, index) => (
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
                                    {eta &&
                                        <HoverBorderGradient
                                            containerClassName="rounded-full"
                                            as="button"
                                            className="text-xs dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
                                        >
                                            <span>✨ Coming {eta}</span>
                                        </HoverBorderGradient>
                                    }
                                </div>

                                <CardTitle>{title}</CardTitle>
                            </CardHeader>

                            <CardContent className={`text-muted-foreground ${typeof description === 'string' ? "" : "flex flex-col justify-center items-center"}`}>
                                {/* Render description, whether it's a string or a component */}
                                {typeof description === 'string' ? <p>{description}</p> : description}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};
