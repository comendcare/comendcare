import * as React from "react";
import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {PostWithAuthorAndComments} from "@/lib/types";
import {ProfilePhoto} from "@/components/profile-photo";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {useSession} from "next-auth/react";
import Link from "next/link";
import {formatDates} from "@/lib/utils";
import {createComment, deletePost} from "@/lib/actions";
import {useRouter, useSearchParams} from "next/navigation";
import Image from "next/image"
import {useState} from "react";
import {toast} from "sonner";
import PostActionBar from "@/components/post-action-bar";
import { Ellipsis, Trash } from "lucide-react";
import Spinner from "./ui/spinner";

export function PostDialog(
    {
        trigger,
        post
    }:
    {
        trigger: React.ReactNode,
        post: PostWithAuthorAndComments
    }) {
    const {data: session} = useSession()
    const router = useRouter();
    const searchParams = useSearchParams()
    const [isDeletingPost, setIsDeletingPost] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);
    const [commentValue, setCommentValue] = useState("");
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const [isLoading, setIsLoading] = useState(false)

    React.useEffect(() => {
        inputRef.current?.focus();
    }, []);

    let comment
    const onSubmit = React.useCallback(async () => {
        const response = await createComment(post.id, commentValue)
        if (response.success) {
            comment = response.data
        } else {
            console.error(response.error)
            toast.error("Something went wrong and we couldn't post your comment... Please try again later.")
        }
    }, [commentValue, isLoading, post.id])

    const disabled = isLoading || commentValue.trim() === "";

    const params = new URLSearchParams(searchParams.toString())

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (open) {
            console.log("opened")
            params.set("post", post.id)
        } else {
            console.log("closed")
            params.delete("post")
        }

        router.push(`?${params.toString()}`)
    };

    React.useEffect(() => {
        // Open the dialog if the URL contains the post ID
        if (params.get("post") === post.id) {
            console.log("opened useeffect")
            setIsOpen(true);
        }
    }, [params.get("post"), post.id]);

    const postByCurrentUser = React.useMemo(() => {
        return post.author.id === session?.user.id
    }, [post.author.id, session?.user.id]);

    const createdAt = React.useMemo(() => {
        return formatDates(post.createdAt);
    }, [post.createdAt]);

    const onDelete = React.useCallback(async () => {
        await deletePost(post.id)
        router.refresh()
    }, [post.id]);

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent
                showCloseButton={false}
                className="grid grid-cols-3 max-w-full grid-flow-dense"
            >
                <DialogHeader className="col-span-1 order-2">
                    <DialogTitle>
                        <div className="flex justify-between">
                            <div className="flex gap-1.5 md:gap-2 items-center">
                                <ProfilePhoto
                                    img={post.author?.image}
                                    name={post.author?.name}
                                    className="h-8 w-8 rounded-full"
                                />
                                <div className="flex flex-col">
                                    <Link href={`/profile/${post.author?.id}`} passHref>
                                        {post.author?.name}
                                    </Link>
                                    <span
                                        className="font-light text-muted-foreground text-[0.6rem] md:text-xs leading-3">
                                        {createdAt}
                                    </span>
                                </div>
                            </div>
                            {postByCurrentUser && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" className="rounded-full">
                                            <Ellipsis className="w-4 h-4"/>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-40 bg-background p-2"
                                        align="end"
                                        sideOffset={2}
                                    >
                                        <Button
                                            variant="ghost"
                                            onClick={onDelete}
                                            disabled={isDeletingPost}
                                            className="rounded-md w-full flex flex-row justify-start"
                                        >
                                            {isDeletingPost ? (
                                                <Spinner className="w-4 h-4 mr-2 animate-spin"/>
                                            ) : (
                                                <Trash className="w-4 h-4 mr-2"/>
                                            )}
                                            <span className="font-medium text-sm">
                                                Delete Post
                                            </span>
                                        </Button>
                                    </PopoverContent>
                                </Popover>
                            )}
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        {post.text}
                        <PostActionBar data={post} />
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter
                    className="col-span-2 order-1 flex flex-col sm:flex-col items-center justify-center space-x-4"
                >
                    <h1 className="font-cal text-4xl">
                        No research plan yet
                    </h1>
                    <Image
                        alt="missing roadmap"
                        src="https://illustrations.popsy.co/gray/graphic-design.svg"
                        width={400}
                        height={400}
                    />
                    <p className="text-lg text-stone-500">
                        You do not have any research plans yet. Create one to get started.
                    </p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
