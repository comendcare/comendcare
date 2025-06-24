import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { icons } from "lucide-react"

interface FeaturesProps {
    icon: string
    title: string
    description: string
}

const featureList: FeaturesProps[] = [
    {
        icon: "TabletSmartphone",
        title: "Researcher profile",
        description:
            "Showcase your interests by detailing your accomplishments, past research, and successful collaborations."
    },
    {
        icon: "BadgeCheck",
        title: "PAG database",
        description:
            "Search, filter, and get recommendations for advocates relevant to your research interests."
    },
    {
        icon: "Goal",
        title: "Impact factor",
        description:
            "Measure the impact and accessibility of your work on the people who stand to benefit from it most."
    }
]

export const ResearchersFeaturesSection = () => {
    return (
        <section id="features" className="container py-16 sm:py-24">
            <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
                Features
            </h2>

            <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
                For patient-led research
            </h2>

            <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-8">
                End-to-end tools from crafting your research roadmap to
                monitoring project progress.
            </h3>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featureList.map(({ icon, title, description }) => (
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
    )
}
