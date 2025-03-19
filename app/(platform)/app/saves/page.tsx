"use client"

import { useEffect, useState } from "react";
import { PulsatingButton } from "@/components/ui/pulsating-button"
import Image from "next/image"
import {useRouter} from "next/navigation";
import { useSession } from "next-auth/react";
import {SavedCompany} from "@prisma/client";
import {getSavedCompaniesFromOrganizationId} from "@/lib/fetchers";
import {CROServicesDataTable} from "@/components/cro-services-data-table/cro-services-data-table";
import {columns} from "@/components/saved-cro-data-table/saved-cros-data-columns";
import {SavedCROsDataTable} from "@/components/saved-cro-data-table/saved-cros-data-table";
import {SavedCompanyData} from "@/lib/types";

export default async function SavesPage() {
    const router = useRouter()
    const { data: session } = useSession();
    const [savedCompanies, setSavedCompanies] = useState<SavedCompanyData[]>([]);

    useEffect(() => {
        async function fetchData() {
            const savedCompaniesResponse = await getSavedCompaniesFromOrganizationId(session?.user?.organizationId || undefined);
            if (savedCompaniesResponse.success) {
                const savedCompaniesData = savedCompaniesResponse.data as SavedCompanyData[];
                setSavedCompanies(savedCompaniesData);
            } else {
                console.error(savedCompaniesResponse.error);
            }
        }

        fetchData();
    }, [session?.user?.organizationId]);
    console.log(savedCompanies);

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto">
            {savedCompanies.length === 0 ?
                <div className="h-full flex flex-col items-center justify-center py-20">
                    <Image
                        alt="No saves"
                        src="https://illustrations.popsy.co/gray/digital-nomad.svg"
                        width={400}
                        height={400}
                        className="dark:hidden"
                    />
                    <Image
                        alt="No saves"
                        src="https://illustrations.popsy.co/white/digital-nomad.svg"
                        width={400}
                        height={400}
                        className="hidden dark:block"
                    />
                    <div className="flex flex-col justify-center items-center space-y-8">
                        <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                            {`You do not have any saves yet. Visit the marketplace to save some CROs.`}
                        </p>
                        <PulsatingButton
                            className="bg-black"
                            pulseColor={"#9ca3af"}
                            onClick={() => router.push("/app/marketplace/cro")}
                        >
                            Visit marketplace
                        </PulsatingButton>
                    </div>
                </div>
                :
                <SavedCROsDataTable data={savedCompanies} columns={columns}/>
            }
        </main>
    )
}
