"use client"

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'

type Post = {
    id: string
    user: {
        name: string
        username: string
        avatar: string
    }
    content: string
    image: string
    likes: number
    comments: number
    shares: number
    timestamp: string
}

export function ConditionProfileRecentActivityCard({ post }: { post: Post }) {
    const [liked, setLiked] = useState(false)
    const [likes, setLikes] = useState(post.likes)

    const handleLike = () => {
        if (liked) {
            setLikes(likes - 1)
        } else {
            setLikes(likes + 1)
        }
        setLiked(!liked)
    }

    return (
        <Card className="flex flex-col justify-between w-full max-w-md mx-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                    <Avatar>
                        <AvatarImage src={post.user.avatar} alt={post.user.name} />
                        <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium leading-none">{post.user.name}</p>
                        <p className="text-sm text-muted-foreground">{post.user.username}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="h-full flex flex-col justify-between space-y-2">
                <p className="text-sm">{post.content}</p>
                <img src={post.image} alt="Post image" className="rounded-md w-full h-auto" />
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm" onClick={handleLike}>
                    <Heart className={`h-4 w-4 mr-1 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                    {likes}
                </Button>
                <Button variant="ghost" size="sm">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {post.comments}
                </Button>
                <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    {post.shares}
                </Button>
                <p className="text-xs text-muted-foreground">{post.timestamp}</p>
            </CardFooter>
        </Card>
    )
}

