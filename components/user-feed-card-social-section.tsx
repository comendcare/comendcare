import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {FaPaperPlane} from "react-icons/fa6";
import {CardContent, CardFooter} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {faker} from "@faker-js/faker";
import {createDicebearAvatar} from "@/lib/utils";

interface FeedCardSocialSectionProps {
    text?: string
}

export const UserFeedCardSocialSection = ({text}: FeedCardSocialSectionProps) => {
    return (
        <div>
            <CardContent>
                <Separator className="mt-2 mb-4 bg-gray-200" />
                <div className="flex flex-col sm:flex-row sm:justify-between items-baseline sm:space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                        9 reactions
                    </div>
                    <div className="flex items-center">
                        0 comments
                    </div>
                </div>
                <Separator className="mt-4 mb-2 bg-gray-200" />
            </CardContent>

            <CardFooter className="flex flex-row space-x-2 justify-between items-center">
                <Avatar>
                    <AvatarImage src={createDicebearAvatar("", 50, 40, "identicon")} />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Input placeholder={"What's on your mind?"}/>
                <Button
                    variant="ghost"
                    className="p-3 disabled:opacity-50"
                    disabled={text?.length === 0}
                >
                    <FaPaperPlane/>
                </Button>
            </CardFooter>
        </div>
    )
}
