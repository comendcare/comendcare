import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {FaBullhorn, FaCircleDollarToSlot, FaFileLines, FaStar, FaUsers} from "react-icons/fa6";
import {formatMoney, truncate} from "@/lib/utils";
import {Badge} from "./ui/badge";
import {ProfilePhoto} from "./profile-photo";
import {Separator} from "@/components/ui/separator";
import {BookCheck, TestTube, Search} from "lucide-react";
import React from "react";

export function CROMarketplaceCard({cro}: { cro: any }) {
    const {title} = cro;

    return (
        <Link
            href={
                process.env.NEXT_PUBLIC_VERCEL_ENV
                    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/app/organization/${title}`
                    : `http://localhost:3000/app/organization/${title}`
            }
        >
            <Card className="h-full w-full text-left flex flex-col justify-start">
                <CardHeader className="gap-2">
                    <CardTitle className="text-xl flex flex-row gap-2 items-center">
                        {title}
                    </CardTitle>
                </CardHeader>
            </Card>
        </Link>
    );
}
