"use client";

import * as React from "react";
import Link from "next/link";
import {ProfilePhoto} from "@/components/profile-photo"

import {CommentInput} from "@/components/comment-input";
import {useState} from "react";
import {useSession} from "next-auth/react";
import {createComment} from "@/lib/actions";
import {toast} from "sonner";

interface CommentFormProps {
    postId: string | null;
}

export function CommentForm({postId}: CommentFormProps) {
    const { data: session } = useSession()
    const [commentValue, setCommentValue] = useState("");
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const [isLoading, setIsLoading] = useState(false)

    React.useEffect(() => {
        inputRef.current?.focus();
    }, []);

    let comment
    const onSubmit = React.useCallback(async () => {
        const response = await createComment(postId, commentValue)
        if (response.success) {
            comment = response.data
        } else {
            console.error(response.error)
            toast.error("Something went wrong and we couldn't post your comment... Please try again later.")
        }
    }, [commentValue, isLoading, postId])

    const disabled = isLoading || commentValue.trim() === "";
    return (
        <form onSubmit={onSubmit}>
            <div className="flex item w-full items-center gap-2">
                <Link href={`/profile/${""}`}>
                    <ProfilePhoto
                        img={session?.user.image}
                        name={session?.user.name}
                        className="h-8 w-8 rounded-full"
                    />
                </Link>
                <CommentInput
                    className="rounded-full text-foreground focus-visible:ring-0"
                    ref={inputRef}
                    type="text"
                    placeholder="Write a comment..."
                    value={commentValue}
                    onChange={(e) => setCommentValue(e.target.value)} // Wrap setCommentValue
                    onSubmit={onSubmit}
                    disabled={disabled}
                    isLoading={isLoading}
                />
            </div>
        </form>
    );
}
