import {
    CircleIcon,
} from "@radix-ui/react-icons"
import Link from "next/link"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {formatDate} from "@/lib/utils";
import React from "react"
import {fixPlatformName} from "~web/lib/utils";
import {PubMedPublication} from "~web/types/types";

export const MatchCard: React.FC<Partial<PubMedPublication>> = ({
                                                        title,
                                                        authors,
                                                        platform,
                                                        url,
                                                        date,
                                                        keywords,
                                                    }) => {

    return (
        <Card className="border-0 bg-card text-card-foreground shadow-none">
            <CardHeader className="items-start gap-4 space-y-0 p-2">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold leading-none tracking-tight">
                        <Link
                            href={url ?? ""}
                            className="hover:underline"
                            target="_blank"
                        >
                            {title}
                        </Link>
                    </CardTitle>
                    <CardDescription className="">
                        {authors?.join(", ")}
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

            <CardContent className="p-2">
                <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-baseline">
                        <CircleIcon className="mr-1 h-3 w-3 fill-sky-400 text-sky-400"/>
                        {fixPlatformName(platform ?? "")}
                    </div>
                    {/*<div className="flex items-center">*/}
                    {/*    <StarIcon className="mr-1 h-3 w-3"/>*/}
                    {/*    {annotations}*/}
                    {/*</div>*/}
                    <div>{formatDate(date)}</div>
                    <div className="flex flex-wrap gap-2">
                        {keywords?.map((keyword: string, index: number) => (
                            <Badge
                                key={index}
                                variant={"default"}
                            >
                                {keyword}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
