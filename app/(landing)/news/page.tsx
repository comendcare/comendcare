// "use client";
import {cn} from "@/lib/utils";
import {format} from "date-fns";
import Image from "next/image";
import Link from "next/link";
// import {useEffect, useState} from "react";
// import FuzzySearch from "fuzzy-search";
import { getNotionDatabaseAndContents } from "@/lib/notion";
import { Blog, BlurImage } from "@/components/layout/sections/news";

export default async function NewsPage() {
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

    return (
        <div
            className="container max-w-7xl mx-auto flex flex-col justify-center items-center space-y-16 py-4 md:py-8">
            <div className="relative z-20 py-10 md:pt-40">
                <h1 className="mt-4 text-xl font-bold md:text-3xl lg:text-5xl text-black dark:text-white tracking-tight">
                    News
                </h1>
            </div>

            {filteredPages.slice(0, 1).map((page: any, index: number) => {
                return (
                    <BlogCard 
                        blog={page}
                        key={index}
                    />
                )
            })}

            <BlogPostRows blogs={filteredPages} />
        </div>
    );
}

const BlogPostRows = ({blogs}: { blogs: Blog[] }) => {
    // const [search, setSearch] = useState("");

    // const searcher = new FuzzySearch(blogs, ["title", "description"], {
    //     caseSensitive: false,
    // });

    // const [results, setResults] = useState(blogs);
    // useEffect(() => {
    //     const results = searcher.search(search);
    //     setResults(results);
    // }, [search]);
    return (
        <div className="w-full py-20">
            <div className="flex sm:flex-row flex-col justify-between gap-4 items-center mb-10">
                <p className="text-2xl font-bold text-neutral-800 dark:text-white">
                    More Posts
                </p>
                {/* <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search blogs"
                    className="text-sm max-w-xl w-full sm:min-w-96 border dark:border-transparent border-neutral-200 p-2 rounded-md dark:bg-neutral-800 bg-white shadow-sm focus:border-neutral-200 focus:ring-0 focus:outline-none outline-none text-neutral-700 dark:text-neutral-200 dark:placeholder-neutral-400 placeholder:neutral-700"
                /> */}
            </div>

            <div className="divide-y dark:divide-neutral-800 divide-neutral-200">
                {blogs.length === 0 ? (
                    <p className="text-neutral-400 text-center p-4">No results found</p>
                ) : (
                    blogs.map((blog, index) => (
                        <BlogPostRow blog={blog} key={blog.slug + index}/>
                    ))
                )}
            </div>
        </div>
    );
};

const BlogPostRow = ({blog}: { blog: Blog }) => {
    return (
        <Link
            href={`${blog.slug}`}
            key={`${blog.slug}`}
            className="flex md:flex-row flex-col items-start justify-between md:items-center group/blog-row py-4"
        >
            <div>
                <p className="dark:text-neutral-300 text-neutral-600 text-lg font-medium transition duration-200">
                    {blog.title}
                </p>
                <p className="dark:text-neutral-300 text-neutral-500 text-sm mt-2 max-w-xl transition duration-200">
                    {truncate(blog.description, 80)}
                </p>

                <div className="flex gap-2 items-center my-4">
                    <p className="dark:text-neutral-300 text-neutral-500 text-sm  max-w-xl transition duration-200">
                        {format(new Date(blog.date), "MMMM dd, yyyy")}
                    </p>
                </div>
            </div>
            <Image
                src={blog.authorAvatar}
                alt={blog.author}
                width={40}
                height={40}
                className="rounded-full md:h-10 md:w-10 h-6 w-6 mt-4 md:mt-0 object-cover"
            />
        </Link>
    );
};

const Logo = () => {
    return (
        <Link
            href="/"
            className="font-normal flex space-x-2 items-center text-sm mr-4  text-black px-2 py-1  relative z-20"
        >
            <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm"/>
            <span className="font-medium text-black dark:text-white">DevStudio</span>
        </Link>
    );
};

const BlogCard = ({blog}: { blog: Blog }) => {
    return (
        <Link
            className="shadow-derek grid grid-cols-1 md:grid-cols-2  rounded-3xl group/blog border border-transparent dark:hover:border-neutral-800 w-full dark:hover:bg-neutral-900 hover:border-neutral-200 hover:bg-neutral-100  overflow-hidden  hover:scale-[1.02] transition duration-200"
            href={`${blog.slug}`}
        >
            <div className="">
                {blog.image ? (
                    <BlurImage
                        src={blog.image || ""}
                        alt={blog.title}
                        height="800"
                        width="800"
                        className="h-full max-h-96 object-cover object-top w-full rounded-3xl"
                    />
                ) : (
                    <div
                        className="h-full flex items-center justify-center dark:group-hover/blog:bg-neutral-900 group-hover/blog:bg-neutral-100">
                        <Logo/>
                    </div>
                )}
            </div>
            <div
                className="p-4 md:p-8 dark:group-hover/blog:bg-neutral-900 group-hover/blog:bg-neutral-100 flex flex-col justify-between">
                <div>
                    <p className="text-lg md:text-4xl font-bold mb-4 text-neutral-800 dark:text-neutral-100">
                        {blog.title}
                    </p>
                    <p className="text-left text-base md:text-xl mt-2 text-neutral-600 dark:text-neutral-400">
                        {truncate(blog.description, 500)}
                    </p>
                </div>
                <div className="flex space-x-2 items-center  mt-6">
                    <Image
                        src={blog.authorAvatar}
                        alt={blog.author}
                        width={20}
                        height={20}
                        className="rounded-full h-5 w-5"
                    />
                    <p className="text-sm font-normal text-black dark:text-white">
                        {blog.author}
                    </p>
                    <div className="h-1 w-1 bg-neutral-300 rounded-full"></div>
                    <p className="text-neutral-600 dark:text-neutral-300 text-sm  max-w-xl  transition duration-200">
                        {format(new Date(blog.date), "MMMM dd, yyyy")}
                    </p>
                </div>
            </div>
        </Link>
    );
};

const blogs: Blog[] = [
    {
        title: "Changelog for 2024",
        description:
            "Explore the latest updates and enhancements in our 2024 changelog. Discover new features and improvements that enhance user experience.",
        date: new Date("2021-01-01"),
        slug: "changelog-for-2024",
        image:
            "https://images.unsplash.com/photo-1696429175928-793a1cdef1d3?q=80&w=3000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        author: "Flawnson Tong",
        authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocIUaW58ZFSCnM2ZUBuW2l6HGJ2dJqWKtOC_hFFDbt5YMWBbz3WG=s96-c",
    },
    {
        title: "Understanding React Hooks",
        description:
            "A comprehensive guide to understanding and using React Hooks in your projects.",
        date: new Date("2021-02-15"),
        slug: "understanding-react-hooks",
        image:
            "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        author: "Flawnson Tong",
        authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocIUaW58ZFSCnM2ZUBuW2l6HGJ2dJqWKtOC_hFFDbt5YMWBbz3WG=s96-c",
    },
    {
        title: "CSS Grid Layout",
        description: "Learn how to create complex layouts easily with CSS Grid.",
        date: new Date("2021-03-10"),
        slug: "css-grid-layout",
        image:
            "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        author: "Flawnson Tong",
        authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocIUaW58ZFSCnM2ZUBuW2l6HGJ2dJqWKtOC_hFFDbt5YMWBbz3WG=s96-c",
    },
    {
        title: "JavaScript ES2021 Features",
        description:
            "An overview of the new features introduced in JavaScript ES2021.",
        date: new Date("2021-04-05"),
        slug: "javascript-es2021-features",
        image:
            "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        author: "Flawnson Tong",
        authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocIUaW58ZFSCnM2ZUBuW2l6HGJ2dJqWKtOC_hFFDbt5YMWBbz3WG=s96-c",
    },
    {
        title: "Building RESTful APIs with Node.js",
        description:
            "Step-by-step guide to building RESTful APIs using Node.js and Express.",
        date: new Date("2021-05-20"),
        slug: "building-restful-apis-with-nodejs",
        image:
            "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        author: "Flawnson Tong",
        authorAvatar: "https://lh3.googleusercontent.com/a/ACg8ocIUaW58ZFSCnM2ZUBuW2l6HGJ2dJqWKtOC_hFFDbt5YMWBbz3WG=s96-c",
    },
];

const truncate = (text: string, length: number) => {
    return text.length > length ? text.slice(0, length) + "..." : text;
};
