"use client";

import * as React from "react";
import {ScrollArea} from "@/components/ui/scroll-area";
import {AnimatePresence, motion} from "framer-motion"
import {cn} from "@/lib/utils"
import {CommentItem} from "./comment-item";
import {setTransition} from "@/lib/transition";
import {useEffect, useState} from "react";
import {getPostComments, getUser} from "@/lib/fetchers";
import {useSession} from "next-auth/react"
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {Comment} from "@prisma/client";
import {CommentWithUser} from "@/lib/types";


interface PostCommentProps {
    postId: string;
}

export function CommentList({postId}: PostCommentProps) {
    const {data: session, status} = useSession()
    const router = useRouter()
    const [comments, setComments] = useState<CommentWithUser[]>([])

    useEffect(() => {
        const fetchPostComments = async () => {
            if (status === "authenticated" && session?.user?.id) {
                try {
                    const response = await getPostComments(postId);
                    if (response.success && response.data) {
                        setComments(response.data);
                    } else {
                        console.error(response.error)
                        toast.error(response.error)
                    }
                } catch (error) {
                    console.error("Failed to fetch user data:", error);
                }
            }
        };

        fetchPostComments();
    }, [status, session, router])

    return (
        <div className={cn(comments.length !== 0 ? "mt-1 mb-3" : "mt-0 mb-0")}>
            <ScrollArea>
                <AnimatePresence mode="popLayout">
                    <ul className="flex flex-col gap-1">
                        {comments.map((comment: CommentWithUser) =>
                            <motion.li layout {...setTransition()} key={comment.id}>
                                <CommentItem comment={comment} key={comment.id}/>
                            </motion.li>
                        )}
                    </ul>
                </AnimatePresence>
            </ScrollArea>
        </div>
    );
}