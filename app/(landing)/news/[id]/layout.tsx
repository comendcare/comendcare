import {ProfilePhoto} from "@/components/profile-photo"
import {getNotionPage} from "@/lib/notion"

export default async function NewsArticleLayout({
                                                    params,
                                                    children
                                                }: Readonly<{
    params: { id: string },
    children: React.ReactNode
}>) {
    const page: any = await getNotionPage(params.id)

    if (!page) throw new Error("No page found")

    const author = page.properties["Author"].people[0]
    const publishDate = page.properties["Publication Date"].date.start
    const title = page.properties["Name"].title.map((text: any) => text.plain_text).join(" ")
    const description = page.properties["Description"].rich_text.map((text: any) => text.plain_text).join("\n")

    return (
        <main className="pt-24 sm:pt-32 lg:pt-32 pb-16 lg:pb-24 bg-white">
            <div className="max-w-2xl mx-auto w-full">
                <div className="flex flex-col items-start justify-center">
                    <header className="mt-6 flex flex-col gap-8 p-4">
                        <div className="inline-flex items-center mr-3 text-sm text-gray-900 gap-4">
                            <ProfilePhoto
                                img={author.avatar_url}
                                name={author.name}
                                textSize={"medium"}
                                editable={false}
                                className="h-16 w-16"
                            />
                            <div className="flex flex-col gap-1">
                                <p className="text-base font-semibold">{author.name}</p>
                                <p className="text-base text-muted-foreground">{
                                    (publishDate
                                        ? new Date(publishDate)
                                        : new Date())
                                        .toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })
                                }
                                </p>
                            </div>
                        </div>
                        <div>
                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                    </header>
                    {children}
                </div>
            </div>
        </main>
    )
}
