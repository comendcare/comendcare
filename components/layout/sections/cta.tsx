import Link from "next/link";
import {FaArrowRight} from "react-icons/fa6";
import {buttonVariants} from "@/components/ui/button";
import {cn} from "@/lib/utils";


export default function CTASection () {
    return (
        <section className="py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div
                    // className="lg:py-14 lg:px-20 p-10 rounded-2xl bg-gradient-to-r from-[#E65D27] to-[#EEAE43] flex items-center justify-between flex-col lg:flex-row"
                    className="lg:py-14 lg:px-20 p-10 rounded-2xl bg-gradient-to-r from-[#1A2F38] to-[#87CEEB] flex items-center justify-between flex-col lg:flex-row"
                >
                    <div className="block text-center mb-5 lg:text-left lg:mb-0">
                        <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">
                            Connect with us
                        </h2>
                        <p className="text-xl text-gray-100">
                            Contact us with any query or any idea.
                        </p>
                    </div>
                    <Link
                        href="/contact"
                        className={cn(buttonVariants({variant: "secondary"}), "gap-x-2")}
                    >
                        Get In Touch
                        <FaArrowRight />
                    </Link>
                </div>
            </div>
        </section>

    )
}