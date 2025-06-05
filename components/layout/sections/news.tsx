import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getNotionDatabaseAndContents } from "@/lib/notion";

export async function News() {
    const newsDBKey = '1f7801a6fddc805297d9d10211608c11'
    const {pages} = await getNotionDatabaseAndContents(newsDBKey)

    const filteredPages: Blog[] = pages
        .map((page: any) => {
            // depending on the page Status, show or hide it
            if (process.env.NEXT_PUBLIC_NODE_ENV === 'production' && !(page?.properties?.["Status"]?.status?.name === 'Published (in production)')) {
                return null
            }

            // if (process.env.NEXT_PUBLIC_NODE_ENV === 'development' && !(page?.properties?.["Status"]?.status?.name === 'Published (in production)' || page?.properties?.["Status"]?.status?.name === 'Ready to Deploy (in preview)')) {
            //     return null
            // }

            const title = page?.properties?.["Name"]?.title?.map((text: any) => text?.plain_text)?.join(" ")
            const description = page.properties["Description"].rich_text.map((text: any) => text.plain_text).join("\n")
            const slug = `/news/${page.id}`
            const image = page?.cover?.external?.url || ''
            const author = page.properties["Author"].people[0].name
            const authorAvatar = page.properties["Author"].people[0].avatar_url
            const publishDate = new Date(page.properties["Publication Date"].date.start)

            if (!title || !description || !slug || !author || !authorAvatar || !publishDate) return null
            return {title, description, slug, image, author, authorAvatar, date: publishDate}
        })
        .filter((page) => page !== null)
        .sort((a, b) => b.date.valueOf() - a.date.valueOf())
        .slice(0, 3) // only show 3 most recent pages in news section on landing page

    if (filteredPages.length === 0) return null

    return (
        <div id="news" className="relative overflow-hidden py-20 md:py-0">
            <div className="py-4 md:py-10 overflow-hidden relative px-4 md:px-8">
                <div className="relative z-20 py-10 mx-auto w-full text-center">
                    <p className="mt-2 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                        News
                    </p>

                    <p className="mt-6 text-lg/8 text-gray-600">
                        Read our latest blog and news
                    </p>
                </div>
            </div>
            <div className="flex flex-col items-center justify-between pb-20 max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full relative z-20">
                    {filteredPages.map((page: any, index) => {
                        return (
                            <BlogCard 
                                blog={page}
                                key={index} 
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    );
}

export const BlogCard = ({ blog }: { blog: Blog }) => {
    const truncate = (text: string, length: number) => {
        return text.length > length ? text.slice(0, length) + "..." : text;
    };
    return (
        <Link
            className="shadow-derek rounded-3xl border dark:border-neutral-800 w-full bg-white dark:bg-neutral-900  overflow-hidden  hover:scale-[1.02] transition duration-200"
            href={`${blog.slug}`}
        >
            {blog.image ? (
                <div className="relative w-full h-60">
                    <Image
                        src={blog.image || ""}
                        alt={blog.title}
                        fill
                        className="object-cover object-top"
                    />
                </div>
            ) : (
                <div className="h-52 flex items-center justify-center bg-blue-light dark:bg-neutral-900" />
            )}
            <div className="p-4 md:p-8 bg-white dark:bg-neutral-900">
                <div className="flex space-x-2 items-center  mb-2">
                    <Image
                        src={blog.authorAvatar}
                        alt={blog.author}
                        width={20}
                        height={20}
                        className="rounded-full h-5 w-5"
                    />
                    <p className="text-sm font-normal text-neutral-600 dark:text-neutral-400">
                        {blog.author}
                    </p>
                </div>
                <p className="text-lg font-bold mb-4 text-neutral-800 dark:text-neutral-100">
                    {blog.title}
                </p>
                <p className="text-left text-sm mt-2 text-neutral-600 dark:text-neutral-400">
                    {truncate(blog.description, 100)}
                </p>
            </div>
        </Link>
    );
};

export type Blog = {
    title: string;
    description: string;
    slug: string;
    image: string;
    author: string;
    authorAvatar: string;
    date: Date;
    section?: string | undefined;
};

export interface IBlurImage {
    height?: any;
    width?: any;
    src?: string | any;
    objectFit?: any;
    className?: string | any;
    alt?: string | undefined;
    layout?: any;
    [x: string]: any;
}

export const BlurImage = ({
                              height,
                              width,
                              src,
                              className,
                              objectFit,
                              alt,
                              layout,
                              ...rest
                          }: IBlurImage) => {
    return (
        <Image
            className={cn(
                "transition duration-300 transform blur-0 scale-100",
                className
            )}
            src={src}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            blurDataURL={src}
            layout={layout}
            alt={alt ? alt : "Avatar"}
            {...rest}
        />
    );
};
