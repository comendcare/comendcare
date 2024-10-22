import Image from "next/image"
import bulletin from "public/illustrations/bulletin.png"

export const BulletinSection = () => {
    return (
        <section id="database" className="container py-24 sm:py-32">
            <div className="flex flex-row items-center lg:gap-24">
                <div className="flex justify-center items-center w-full max-w-7xl mx-auto bg-gradient-to-b p-8 from-80% from-[#1E3A8A] to-[#5AC1CF] to-100% rounded-lg">
                    <div className="relative rounded-lg">
                        <Image // dynamically pull page preview if thumbnail is not available
                            src={bulletin}
                            quality={100}
                            priority={true}
                            className="w-full rounded-lg"
                            alt="preview image"
                        />
                    </div>
                </div>

                <div className="max-w-80">
                    <h2 className="text-lg text-primary mb-2 tracking-wider">
                        Benefits
                    </h2>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {`Stay on top of progress`}
                    </h2>
                    <p className="text-xl text-muted-foreground mb-8">
                        {`Stay informed and up to date with researcher bulletins containing news, questions, and updates.`}
                    </p>
                </div>
            </div>
        </section>
    )
}
