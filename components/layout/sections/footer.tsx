import {Separator} from "@/components/ui/separator";
import logo from "@/public/RareSearch Logo.svg"
import Link from "next/link";
import Image from "next/image"

export const FooterSection = () => {
    return (
        <footer id="footer" className="container py-24 sm:py-32">
            <div className="p-10 bg-card border border-secondary rounded-2xl">
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-12 gap-y-8">
                    <div className="w-32">
                        <Image
                            priority
                            src={logo}
                            alt="Comend logo"
                        />
                    </div>
                </div>

                <Separator className="my-6"/>
                <section className="">
                    <h3 className="">
                        &copy; 2024 Designed and developed by
                        <Link
                            target="_blank"
                            href="https://www.comendcare.com/"
                            className="text-primary transition-all border-primary hover:border-b-2 ml-1"
                        >
                            Comend
                        </Link>
                    </h3>
                </section>
            </div>
        </footer>
    );
};
