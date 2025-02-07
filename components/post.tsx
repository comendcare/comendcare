"use client";

import * as React from "react";
import Link from "next/link";
import {User} from "@prisma/client";
import {AnimatePresence, MotionConfig, motion} from "framer-motion";
import {format} from "date-fns";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import {Icons} from "@/components/icons";
import {PostWithAuthorAndComments} from "@/lib/types";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {cn, formatDates} from "@/lib/utils";
import {CommentForm} from "@/components/comment-form";
import {useLike} from "@/lib/hooks/use-like";
// import {UserName} from "@/components/user/user-name";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
// import {ImagePreview} from "@/components/image/image-preview";
import useMeasure from "react-use-measure";
import {setTransition} from "@/lib/transition";
// import {UserTooltip} from "@/components/user-tooltip";
import {ProfilePhoto} from "@/components/profile-photo"
import {IconShare, IconThumbUp, IconThumbUpFilled} from "@tabler/icons-react";
import {useSession} from "next-auth/react";
import {FaEllipsis} from "react-icons/fa6";
import {deletePost} from "@/lib/actions";
import {useRouter} from "next/navigation";
import {CommentList} from "@/components/comment-list";
import {PostDialog} from "@/components/post-dialog";
import PostActionBar from "@/components/post-action-bar";

interface PostProps {
    data: PostWithAuthorAndComments;
}

export function Post({data}: PostProps) {
    const router = useRouter();
    const {data: session} = useSession()
    const postId = data.id;
    const [showComment, setShowComment] = React.useState(false);
    const [showMoreText, setShowMoreText] = React.useState(false);
    const [isDeletingPost, setIsDeletingPost] = React.useState(false);

    const {hasLiked, toggleLike, likeCount} = useLike(postId);

    const postByCurrentUser = React.useMemo(() => {
        return data.author.id === session?.user.id
    }, [data.author.id, session?.user.id]);

    const createdAt = React.useMemo(() => {
        return formatDates(data.createdAt);
    }, [data.createdAt]);

    const toggleComment = React.useCallback(() => {
        setShowComment((prev) => !prev);
    }, []);

    const toggleShowMoreText = React.useCallback(() => {
        setShowMoreText((prev) => !prev);
    }, []);

    const onDelete = React.useCallback(async () => {
        await deletePost(data.id)
        // router.refresh()
    }, [data.id]);

    const [ref, {height}] = useMeasure();

    return (
        <MotionConfig transition={{duration: 0.3}}>
            <Card className="rounded-sm w-full">
                <CardHeader className="space-y-1 md:space-y-1.5 p-4">
                    <div className="flex justify-between">
                        <div className="flex gap-1.5 md:gap-2 items-center">
                            {/*<UserTooltip*/}
                            {/*    firstName={firstName}*/}
                            {/*    lastName={lastName}*/}
                            {/*    verified={verified}*/}
                            {/*    userCreatedAt={userCreatedAt}*/}
                            {/*    imageUrl={src}*/}
                            {/*    href={href}*/}
                            {/*    size="lg"*/}
                            {/*    larger*/}
                            {/*>*/}
                            <ProfilePhoto
                                img={data.author?.image}
                                name={data.author?.name}
                                className="h-8 w-8 rounded-full"
                            />
                            {/*</UserTooltip>*/}
                            <div className="flex flex-col">
                                <Link href={`/app/user/${data.author?.id}`} passHref>
                                    {/*<UserName*/}
                                    {/*    firstName={firstName}*/}
                                    {/*    lastName={lastName}*/}
                                    {/*    verified={verified}*/}
                                    {/*    className="md:text-lg font-medium"*/}
                                    {/*/>*/}
                                    {data.author?.name}
                                </Link>
                                <span className="font-light text-muted-foreground text-[0.6rem] md:text-xs leading-3">
                                    {createdAt}
                                </span>
                            </div>
                        </div>
                        {postByCurrentUser && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" className="rounded-full">
                                        <FaEllipsis className="w-4 h-4"/>
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
                                            <Icons.spinner className="w-4 h-4 mr-2 animate-spin"/>
                                        ) : (
                                            <Icons.trash className="w-4 h-4 mr-2"/>
                                        )}
                                        <span className="font-medium text-sm">
                                            Delete Post
                                        </span>
                                    </Button>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="w-full flex flex-col">
                        <PostDialog
                            trigger={
                                <p
                                    onClick={toggleShowMoreText}
                                    className={cn(
                                        "break-words text-sm md:text-base",
                                        showMoreText
                                            ? "line-clamp-none" : "line-clamp-6",
                                        "whitespace-pre-line"
                                    )}
                                >
                                    {data.text}
                                </p>
                            }
                            post={data}
                        />

                        {/*<div*/}
                        {/*    className={cn(*/}
                        {/*        "w-full grid",*/}
                        {/*        data.images.length > 1*/}
                        {/*            ? "grid-cols-2 relative gap-1"*/}
                        {/*            : "grid-cols-1"*/}
                        {/*    )}*/}
                        {/*>*/}
                        {/*    {data.images.map((image, i) => (*/}
                        {/*        <ImagePreview*/}
                        {/*            key={i}*/}
                        {/*            imageData={image}*/}
                        {/*            i={i}*/}
                        {/*            imagesLength={data.images.length}*/}
                        {/*            imagesPreview={data.images}*/}
                        {/*        />*/}
                        {/*    ))}*/}
                        {/*</div>*/}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col text-muted-foreground">
                    <PostActionBar data={data} />
                </CardFooter>
            </Card>
        </MotionConfig>
    );
}