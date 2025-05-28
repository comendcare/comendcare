import { ProfilePhoto } from "@/components/profile-photo"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { getNotionPage } from "@/lib/notion"
import { House } from "lucide-react"

export default async function GuideArticleLayout({
    params,
    children
}: Readonly<{
    params: {id: string},
    children: React.ReactNode
}>) {
    const page: any = await getNotionPage(params.id)
    
    if (!page) throw new Error("No page found")
    
    const author = page.properties["Author"].people[0]
    const publishDate = page.properties["Publication Date"].date.start
    const title = page.properties["Name"].title.map((text: any) => text.plain_text).join(" ")
    const description = page.properties["Description"].rich_text.map((text: any) => text.plain_text).join("\n")

    return (
        <div>
            <header className="mt-6 flex flex-col gap-8 p-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/app/guides`} className="flex gap-2 items-center">
                                <House className="h-4 w-4"/>
                                Guides
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

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
    )
}