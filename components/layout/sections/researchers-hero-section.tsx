import {Badge} from "@/components/ui/badge";
import researchersHero from "@/public/illustrations/researchers-hero.svg"
import Image from "next/image";

export default function ResearchersHeroSection() {
    return (
        <section className="container w-full">
            <div className="grid grid-cols-2 items-center lg:max-w-screen-xl gap-8 mx-auto py-24 md:py-32">
                <div className="text-left space-y-8">
                    <div className="max-w-screen-md mx-auto text-4xl md:text-6xl font-bold">
                        <h1>
                            Do the research you want,&nbsp;
                            <span
                                className="text-transparent pr-2 bg-gradient-to-r from-[#EEAE43] to-[#E65D27] bg-clip-text">
                                with
                            </span>
                            <span
                                className="text-transparent px-2 bg-gradient-to-r from-[#5AC1CF] to-[#1E3A8A] bg-clip-text">
                                impact.
                            </span>
                        </h1>
                    </div>

                    <p className="max-w-screen-sm text-xl text-muted-foreground">
                        {`Join our marketplace of patient groups and researchers to connect with patients, discover funding opportunities, and launch partnerships.`}
                    </p>

                    {/*<Link*/}
                    {/*    href="/platform"*/}
                    {/*    className={cn(buttonVariants({variant: "default"}), "w-5/6 md:w-1/4 font-bold group/arrow")}*/}
                    {/*>*/}
                    {/*    Check it out*/}
                    {/*    <ArrowRight className="size-5 ml-2 group-hover/arrow:translate-x-1 transition-transform"/>*/}
                    {/*</Link>*/}
                </div>
                <div className="relative">
                    <Image
                        priority
                        src={researchersHero}
                        alt="Comend hero"
                        className="w-full"
                    />
                </div>
            </div>
        </section>
    );
}
