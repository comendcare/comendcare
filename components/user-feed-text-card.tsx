import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import {Button} from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription, CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Separator} from "@/components/ui/separator"
import {Input} from "@/components/ui/input";
import {UserFeedCardSocialSection} from "@/components/user-feed-card-social-section";
import {createDicebearAvatar} from "@/lib/utils";

interface UserFeedTextCardProps {
    content: string
    blockquote?: string
}

export function UserFeedTextCard({content, blockquote}: UserFeedTextCardProps) {
    return (
        <Card className="p-2">
            <CardHeader className="grid items-start gap-4">
                <div className="space-y-1">
                    <CardTitle>
                        <Link href="#" className="group block flex-shrink-0">
                            <div className="flex items-center">
                                <div>
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={createDicebearAvatar("", 50, 40, "identicon")}/>
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="ml-3">
                                    <div className="flex text-base flex-wrap items-baseline">
                                        <p className="font-bold text-gray-700 group-hover:text-gray-900">
                                            Tom Cook&nbsp;
                                        </p>
                                        <p className="font-medium text-gray-700 group-hover:text-gray-900">
                                            asked a question
                                        </p>
                                    </div>
                                    <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                                        Yesterday 9:05pm
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </CardTitle>
                    <CardDescription className="pt-4">
                        {blockquote &&
                            <blockquote className="p-4 my-4 border-s-4 border-gray-300 bg-gray-50 dark:border-gray-500 dark:bg-gray-800">
                                <p className="text-lg italic font-medium leading-relaxed text-gray-500 dark:text-white">
                                    {`"${blockquote}"`}
                                </p>
                            </blockquote>
                        }
                        <p className="text-base text-black">
                            {`${content}`}
                        </p>
                    </CardDescription>
                </div>

                {/*<div className="flex items-center space-x-1 rounded-md bg-secondary text-secondary-foreground">*/}
                {/*    <Button variant="secondary" className="px-3 shadow-none">*/}
                {/*        <FaRegBookmark className="mr-2 h-4 w-4"/>*/}
                {/*        Save*/}
                {/*    </Button>*/}
                {/*    <Separator orientation="vertical" className="h-[20px]"/>*/}
                {/*    <DropdownMenu>*/}
                {/*        <DropdownMenuTrigger asChild>*/}
                {/*            <Button variant="secondary" className="px-2 shadow-none">*/}
                {/*                <ChevronDownIcon className="h-4 w-4 text-secondary-foreground"/>*/}
                {/*            </Button>*/}
                {/*        </DropdownMenuTrigger>*/}
                {/*        <DropdownMenuContent*/}
                {/*            align="end"*/}
                {/*            alignOffset={-5}*/}
                {/*            className="w-[200px]"*/}
                {/*            forceMount*/}
                {/*        >*/}
                {/*            <DropdownMenuLabel>Suggested Lists</DropdownMenuLabel>*/}
                {/*            <DropdownMenuSeparator/>*/}
                {/*            <DropdownMenuCheckboxItem checked>*/}
                {/*                Interesting papers*/}
                {/*            </DropdownMenuCheckboxItem>*/}
                {/*            <DropdownMenuCheckboxItem>*/}
                {/*                For Dr. Humphrey*/}
                {/*            </DropdownMenuCheckboxItem>*/}
                {/*            <DropdownMenuCheckboxItem>*/}
                {/*                Read later*/}
                {/*            </DropdownMenuCheckboxItem>*/}
                {/*            <DropdownMenuSeparator/>*/}
                {/*            <DropdownMenuItem>*/}
                {/*                <PlusIcon className="mr-2 h-4 w-4"/> Create List*/}
                {/*            </DropdownMenuItem>*/}
                {/*        </DropdownMenuContent>*/}
                {/*    </DropdownMenu>*/}
                {/*</div>*/}
            </CardHeader>

            <UserFeedCardSocialSection text={""} />
        </Card>
    )
}
