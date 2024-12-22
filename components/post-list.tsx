"use client";

import * as React from "react";
import {AnimatePresence} from "framer-motion";
import {Post} from "@/components/post";
import {extendedPost} from "@/lib/types";

export function PostList({posts}: { posts: extendedPost[] }) {
    return (
        <AnimatePresence mode="popLayout">
            {posts.map(post =>
                <Post data={post} key={post.id}/>
            )}
        </AnimatePresence>
    );
}