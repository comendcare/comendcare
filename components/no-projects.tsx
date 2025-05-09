import Image from "next/image"

export function NoProjects() {
    return (
        <div className="flex flex-col items-center justify-center space-x-4 my-8 gap-2">
        <h1 className="font-cal text-4xl text-center">This research plan is under development</h1>
        <Image
            alt="missing roadmap"
            src="https://illustrations.popsy.co/gray/creative-work.svg"
            width={300}
            height={300}
        />
        <p className="text-lg text-stone-500">
            This research plan does not have any public projects.
        </p>
    </div>
    )
}
