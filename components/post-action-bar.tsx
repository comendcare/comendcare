"use client";

import * as React from "react";
import {AnimatePresence, motion} from "framer-motion";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {cn, formatDates} from "@/lib/utils";
import {CommentForm} from "@/components/comment-form";
import {setTransition} from "@/lib/transition";
import {IconShare, IconThumbUp, IconThumbUpFilled} from "@tabler/icons-react";
import {CommentList} from "@/components/comment-list";
import {useLike} from "@/lib/hooks/use-like";
import useMeasure from "react-use-measure";
import {PostWithAuthorAndComments} from "@/lib/types";
import {MessageCircle} from "lucide-react"

export default function PostActionBar({data}: {data: PostWithAuthorAndComments}) {
    const postId = data.id;
    const [showComment, setShowComment] = React.useState(false);

    const {hasLiked, toggleLike, likeCount} = useLike(postId);

    const toggleComment = React.useCallback(() => {
        setShowComment((prev) => !prev);
    }, []);

    const [ref, {height}] = useMeasure();

    return (
        <>
            <div className="flex w-full justify-between text-muted-foreground text-sm mb-1">
                {likeCount > 0 && (
                    <div className="flex items-center gap-1">
                        <IconThumbUpFilled className="text-facebook-primary w-4 h-4"/>
                        <span>{likeCount}</span>
                    </div>
                )}

                {data.comments.length !== 0 ? (
                    <div className="flex w-full justify-end">
                        <div>
                            <span className="flex items-center gap-1">
                                <p>{data.comments.length}</p>
                                <MessageCircle className="w-4 h-4 md:hidden"/>
                                <p className="hidden md:block">Comments</p>
                            </span>
                        </div>
                    </div>
                ) : null}
            </div>
            <Separator className="mb-2"/>
            <div className="flex w-full text-base font-medium">
                <Button
                    variant="ghost"
                    className="flex-1 active:scale-95"
                    onClick={() => toggleLike()}
                >
                    <span
                        className={cn(
                            "flex items-center",
                            hasLiked ? "text-facebook-primary" : "text-muted-foreground"
                        )}
                    >
                        <IconThumbUp className={cn("w-5 h-5 md:w-6 md:h-6 mr-2")}/>
                        <span>Like</span>
                    </span>
                </Button>
                <Button
                    variant="ghost"
                    className="flex-1 active:scale-95"
                    onClick={toggleComment}
                >
                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6 mr-2"/>
                    <span>Comment</span>
                </Button>
                <Button
                    variant="ghost"
                    className="flex-1 sm:flex cursor-not-allowed"
                >
                    <IconShare className="w-5 h-5 md:w-6 md:h-6 mr-2"/>
                    <span>Share</span>
                </Button>
            </div>
            <div className="w-full">
                <motion.div animate={{height}} className="overflow-hidden w-full">
                    {showComment && (
                        <>
                            <AnimatePresence>
                                <div ref={ref} className="w-full py-1">
                                    <Separator className="mt-2"/>
                                    <motion.div
                                        layout
                                        {...setTransition({
                                            duration: 0.5,
                                        })}
                                        className="w-full flex flex-col pt-2"
                                    >
                                        <CommentList postId={postId}/>
                                        <CommentForm
                                            postId={postId}
                                        />
                                    </motion.div>
                                </div>
                            </AnimatePresence>
                        </>
                    )}
                </motion.div>
            </div>
        </>
    )
}