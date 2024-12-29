"use client";

import * as React from "react";
import {AnimatePresence} from "framer-motion";
import {Post} from "@/components/post";
import {extendedPost} from "@/lib/types";
import Image from "next/image";

export function PostList({posts}: { posts: extendedPost[] }) {
    return (
        <AnimatePresence mode="popLayout">
            {posts.length > 0 ? posts.map(post =>
                <Post data={post} key={post.id}/>
            )
                :
                <div className="h-full flex flex-col items-center justify-center py-20">
                    <Image
                        alt="no posts illustration"
                        src="https://illustrations.popsy.co/gray/success.svg"
                        width={400}
                        height={400}
                        className="dark:hidden"
                    />
                    <Image
                        alt="no posts illustration"
                        src="https://illustrations.popsy.co/white/success.svg"
                        width={400}
                        height={400}
                        className="hidden dark:block"
                    />
                    <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                        No posts yet.
                    </p>
                </div>
            }
        </AnimatePresence>
    );
}