"use server"

import {unstable_cache} from "next/cache"
import prisma from "@/lib/prisma"
import {serialize} from "next-mdx-remote/serialize"
import {replaceExamples, replaceTweets} from "@/lib/remark-plugins"
import {ApiResponse, CustomOrganization, milestoneCategories, RESEARCH_PLAN_TYPES} from "@/lib/types";
import {formatMoney, getProfileCompletionChecks, getStage, logError} from "@/lib/utils";
import {getSession} from "@/lib/auth";
import { subMonths, startOfMonth } from "date-fns";
import {Condition, Prisma} from "@prisma/client";
import {promises as fs} from "fs";
import path from "path";
import {z} from "zod";
import {IPSchema, biosampleSchema, clinicalStudySchema, preclinicalStudySchema, taskSchema} from "@/data/pharma-data/schema";
import { InternalArgs } from "@prisma/client/runtime/library"

/* PUBLIC FUNCTION - these functions are accessible to anyone on the platform, no auth needed */
export async function getPublicAssetsForOrganization(domain: string) {
    const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
        ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
        : domain

    const assets = await prisma.tool.findMany({
        where: {
            organization: {
                subdomain: subdomain
            },
            private: {equals: false}
        },
        include: {
            contacts: true,
            attachments: true,
            milestones: {
                include: {
                    milestone: {
                        include: { types: { include: { milestoneType: true } } }
                    }
                }
            }
        },
        orderBy: [{createdAt: "desc"}]
    })

    return assets
}

export async function getPublicRFPsForOrganization(
    domain: string, 
    select: Prisma.RFPSelect<InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }>,
) {
    const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
        ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
        : domain

    const rfps = await prisma.rFP.findMany({
        where: {
            organization: {
                subdomain: subdomain
            },
            private: {equals: false}
        },
        select:{
            ...select,
            // filter out any private milestones if the user has requested to access milestones
            milestones: select.milestones 
                ? {
                    include: {milestone: true},
                    where: {milestone: {private: {equals: false}}}
                } 
                : undefined
        },
        orderBy: [{createdAt: "desc"}]
    })

    return rfps
}

export async function getPublicRoadmapsForOrganization(domain: string) {
    const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
        ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
        : domain

    const roadmaps = prisma.roadmap.findMany({
        where: {
            // organization: subdomain
            //     ? {subdomain}
            //     : {customDomain: domain},
            organization: {
                subdomain: subdomain,
            },
            // published: true
        },
        // select: {
        //     title: true,
        //     description: true,
        //     slug: true,
        //     image: true,
        //     imageBlurhash: true,
        //     createdAt: true,
        // },
        include: {
            nodes: {
                include: {
                    data: {
                        include: {
                            node: true,
                            contacts: true,
                            attachments: true,
                            types: { include: { milestoneType: true } },
                            tools: { 
                                include: { 
                                    tool: {
                                        include: { 
                                            milestones: {
                                                include: {
                                                    milestone: true
                                                },
                                                where: {
                                                    milestone: {
                                                        private: {
                                                            equals: false
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }, 
                                }, 
                                where: { 
                                    tool: {
                                        private: {
                                            equals: false
                                        }
                                    }
                                } 
                            },
                            rfps: { 
                                include: { 
                                    rfp: {
                                        include: {
                                            milestones: {
                                                include: {
                                                    milestone: true
                                                },
                                                where: {
                                                    milestone: {
                                                        private: {
                                                            equals: false
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }, 
                                }, 
                                where: { 
                                    rfp: {
                                        private: {
                                            equals: false
                                        }
                                    }
                                } 
                            }
                        }
                    }
                },
                where: {
                    data: {private: false}
                },
                orderBy: [{ createdAt: "desc" }]
            },
            edges: true,
            milestones: {
                where: {
                    private: false
                },
                include: {
                    node: true,
                    contacts: true,
                    attachments: true,
                    types: { include: { milestoneType: true } },
                    tools: { 
                        include: { 
                            tool: {
                                include: { 
                                    milestones: {
                                        include: {
                                            milestone: true
                                        },
                                        where: {
                                            milestone: {
                                                private: {
                                                    equals: false
                                                }
                                            }
                                        }
                                    }
                                }
                            }, 
                        }, 
                        where: { 
                            tool: {
                                private: {
                                    equals: false
                                }
                            }
                        } 
                    },
                    rfps: { 
                        include: { 
                            rfp: {
                                include: {
                                    milestones: {
                                        include: {
                                            milestone: true
                                        },
                                        where: {
                                            milestone: {
                                                private: {
                                                    equals: false
                                                }
                                            }
                                        }
                                    }
                                }
                            }, 
                        }, 
                        where: { 
                            rfp: {
                                private: {
                                    equals: false
                                }
                            }
                        } 
                    }
                },
                orderBy: [{ createdAt: "desc" }]
            },
        },
        orderBy: [{ createdAt: "desc" }]
    })
    return roadmaps

    // return await unstable_cache(
    //     async () => {
    //         const roadmaps = prisma.roadmap.findMany({
    //             where: {
    //                 // organization: subdomain
    //                 //     ? {subdomain}
    //                 //     : {customDomain: domain},
    //                 organization: {
    //                     subdomain: subdomain,
    //                 },
    //                 // published: true
    //             },
    //             // select: {
    //             //     title: true,
    //             //     description: true,
    //             //     slug: true,
    //             //     image: true,
    //             //     imageBlurhash: true,
    //             //     createdAt: true,
    //             // },
    //             include: {
    //                 nodes: {
    //                     include: {
    //                         data: true
    //                     }
    //                 },
    //                 edges: true,
    //                 milestones: {
    //                     where: {
    //                         private: false
    //                     }
    //                 },
    //             },
    //             orderBy: [
    //                 {
    //                     createdAt: "desc"
    //                 }
    //             ]
    //         })
    //         console.log(`roadmaps`, roadmaps)
    //         return roadmaps
    //     },
    //     [`${domain}-roadmaps`],
    //     {
    //         revalidate: 900,
    //         tags: [`${domain}-roadmaps`]
    //     }
    // )()
}

export async function getPublicConditionData(slug: string): Promise<ApiResponse<any>> {
    try {
        const condition = await prisma.condition.findUnique({
            where: {slug},
            include: {
                organizations: {
                    select: {
                        organization: true
                    }
                }
            },
        });

        if (!condition) {
            return {success: false, error: "Condition not found"};
        }

        return {success: true, data: condition};
    } catch (error: any) {
        logError("Error fetching condition data", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getPublicMilestoneDetails(id: string) {
    try {
        const milestone = await prisma.milestone.findUnique({
            where: {id},
            include: {
                node: true,
                contacts: true,
                attachments: true,
                types: { include: { milestoneType: true } },
                tools: { 
                    include: { 
                        tool: {
                            include: { 
                                milestones: {
                                    include: {
                                        milestone: true
                                    },
                                    where: {
                                        milestone: {
                                            private: {
                                                equals: false
                                            }
                                        }
                                    }
                                }
                            }
                        }, 
                    }, 
                    where: { 
                        tool: {
                            private: {
                                equals: false
                            }
                        }
                    } 
                },
                rfps: { 
                    include: { 
                        rfp: {
                            include: {
                                milestones: {
                                    include: {
                                        milestone: true
                                    },
                                    where: {
                                        milestone: {
                                            private: {
                                                equals: false
                                            }
                                        }
                                    }
                                }
                            }
                        }, 
                    }, 
                    where: { 
                        rfp: {
                            private: {
                                equals: false
                            }
                        }
                    } 
                }
            }
        })

        return {success: true, data: milestone}
    } catch (error: any) {
        console.error("Database error finding milestone details:", error)
        return {success: false, error: "Database error. please try again later."}
    }
}
