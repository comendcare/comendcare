import Image from "next/image";
import database from "public/illustrations/database.png"

export const DatabaseSection = () => {
    return (
        <section id="database" className="container py-24 sm:py-32">
            <div className="flex flex-row items-center lg:gap-24">
                <div>
                    <h2 className="text-lg text-primary mb-2 tracking-wider">Benefits</h2>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {`For novel and impactful research`}
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        {`Reagents, data, patients, and collaborators, all in once place.`}
                    </p>
                    <div className="flex justify-start space-x-16">
                        <div>
                            <div className="text-2xl font-bold">700+</div>
                            <div className="text-muted-foreground">disease models</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">300+</div>
                            <div className="text-muted-foreground">clinical datasets</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">200+</div>
                            <div className="text-muted-foreground">RFPs</div>
                        </div>
                    </div>
                </div>

                <div
                    className="flex justify-center items-center w-full max-w-7xl mx-auto bg-gradient-to-b p-8 from-80% from-[#1E3A8A] to-[#5AC1CF] to-100% rounded-lg">
                    <div className="relative rounded-lg">
                        <Image // dynamically pull page preview if thumbnail is not available
                            src={database}
                            quality={100}
                            priority={true}
                            className="w-full rounded-lg"
                            alt="preview image"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};
