"use client"

import { RFPCard } from "@comend/components/rfp-card"
import { EditRFPDialog } from "./edit-rfp-dialog"
import Image from "next/image"
import dynamic from "next/dynamic";
import {Button, buttonVariants} from "@comend/components/ui/button";
import LoadingDots from "@comend/components/icons/loading-dots";
import { RFPActionsMenu } from "./rfp-actions-menu";
import { useState } from "react";
import { Plus } from "lucide-react";
import { PulsatingButton } from "@comend/components/ui/pulsating-button";
import { cn } from "@comend/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@comend/components/ui/tabs";

type Props = {
    initialRFPs: any[] // or RFP[] if you have the type locally
}

const NewRFPDialog = dynamic(
    () =>
        import("~web/components/edit-rfp-dialog").then(
            (m) => m.NewRFPDialog
        ),
    {
        ssr: false,
        loading: () => (
            <Button variant="cta">
                <LoadingDots color="#808080" />
            </Button>
        ),
    }
);

export function PrivateRFPsPage({ initialRFPs }: Props) {
    const renderRfps = initialRFPs

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl p-4 h-full items-center mx-auto">
            <div className="flex gap-2 w-full justify-between items-center">
                <h1 className="text-3xl font-semibold">Requests for proposals (RFPs)</h1>
                <NewRFPDialog 
                    trigger={(
                        initialRFPs.length > 0 
                            ? (
                                <Button variant="cta">
                                    <Plus/>
                                    {"Create RFP"}
                                </Button>
                            )
                            : (
                                <PulsatingButton
                                    className={cn(buttonVariants({variant: 'cta'}))}
                                >
                                    <Plus/>
                                    {"Create RFP"}
                                </PulsatingButton>
                            )
                    )}
                />
            </div>

            {renderRfps.length <= 0 
                ? (
                    <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
                        <h1 className="font-cal text-4xl">You do not have any RFPs</h1>
                        <Image
                            alt="No RFPs"
                            src="https://illustrations.popsy.co/gray/graphic-design.svg"
                            width={300}
                            height={300}
                        />
                        <p className="text-lg text-stone-500">
                            An RFP is a milestone you want to support through funding and/or other resources.
                        </p>
                    </div>
                ) : (
                    <Tabs 
                        // set default tab to archived if there are no active RFPs
                        defaultValue={"active"} 
                        className="w-full"
                    >
                        <TabsList>
                            <TabsTrigger value="active">Active RFPs</TabsTrigger>
                            <TabsTrigger value="archived">Archived RFPs</TabsTrigger>
                        </TabsList>
                        <TabsContent value="active" className="h-full w-full">
                            {renderRfps.filter(rfp => !rfp.archived).length > 0 
                                ? (
                                    <div className="w-full gap-4 flex flex-col">
                                        {renderRfps.filter(rfp => !rfp.archived).map((rfp) => (
                                            <EditRFPDialog 
                                                key={rfp.id} 
                                                data={rfp}
                                            >
                                                <RFPCard 
                                                    rfp={rfp} 
                                                    isPrivate 
                                                    actionsMenu={<RFPActionsMenu rfp={rfp}/>} 
                                                />
                                            </EditRFPDialog>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full w-full flex justify-center items-center">
                                    <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
                                        <h1 className="font-cal text-4xl">You do not have any active RFPs</h1>
                                        <Image
                                            alt="No active RFPs"
                                            src="https://illustrations.popsy.co/gray/graphic-design.svg"
                                            width={300}
                                            height={300}
                                        />
                                        <p className="text-lg text-stone-500">
                                            An RFP is a milestone you want to support through funding and/or other resources.
                                        </p>
                                    </div>
                                    </div>
                                )
                            }
                        </TabsContent>
                        <TabsContent value="archived" className="h-full w-full">
                            {renderRfps.filter(rfp => !!rfp.archived).length > 0 
                                ? (
                                    <div className="w-full gap-4 flex flex-col">
                                        {renderRfps.filter(rfp => !!rfp.archived).map((rfp) => (
                                            <EditRFPDialog 
                                                key={rfp.id} 
                                                data={rfp}
                                            >
                                                <RFPCard 
                                                    rfp={rfp} 
                                                    isPrivate 
                                                    actionsMenu={<RFPActionsMenu rfp={rfp}/>} 
                                                />
                                            </EditRFPDialog>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full w-full flex justify-center items-center">
                                    <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
                                        <h1 className="font-cal text-4xl">You do not have any archived RFPs</h1>
                                        <Image
                                            alt="No archived RFPs"
                                            src="https://illustrations.popsy.co/gray/graphic-design.svg"
                                            width={300}
                                            height={300}
                                        />
                                        <p className="text-lg text-stone-500">
                                            An RFP is a milestone you want to support through funding and/or other resources.
                                        </p>
                                    </div>
                                    </div>
                                )
                            }
                        </TabsContent>
                    </Tabs>
                )
            }
        </main>
    )
}
