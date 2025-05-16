"use server"

import {unstable_cache} from "next/cache"
import prisma from "@/lib/prisma"
import {serialize} from "next-mdx-remote/serialize"
import {replaceExamples, replaceTweets} from "@/lib/remark-plugins"
import {ApiResponse, CustomOrganization} from "@/lib/types";
import {getProfileCompletionChecks, logError} from "@/lib/utils";
import {getSession} from "@/lib/auth";
import { subMonths, startOfMonth } from "date-fns";
import {Condition} from "@prisma/client";
import {promises as fs} from "fs";
import path from "path";
import {z} from "zod";
import {biosampleSchema, taskSchema} from "@/data/pharma-data/schema";

export async function getConditionData(slug: string): Promise<ApiResponse<any>> {
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

export async function getConditionsDataFromOrgId(organizationId: string): Promise<ApiResponse<any[]>> {
    try {
        const conditions = await prisma.condition.findMany({
            where: {
                organizations: {some: {organizationId}},
            },
            include: {organizations: true},
        });

        return {success: true, data: conditions};
    } catch (error: any) {
        logError("Error fetching conditions data from organization ID", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getOrganizationData(domain: string) {
    const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
        ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
        : domain

    return await unstable_cache(
        async () => {
            let organization = await prisma.organization.findUnique({
                where: subdomain ? {subdomain} : {customDomain: domain},
                include: {
                    user: true,
                    roadmaps: true,
                    members: {
                        orderBy: {
                            createdAt: 'asc'
                        },
                        include: {
                            user: true
                        }
                    }
                }
            })

            if (!organization) return organization

            // sort members list - move org owners to the beginning of the list
            organization.members = organization.members.sort((a, b) => {
                if (a.role === 'owner' && b.role !== 'owner') return -1
                if (b.role === 'owner' && a.role !== 'owner') return 1
                return 0
            })

            // sort members list - move comend users to the end of the list
            organization.members = organization.members.sort((a, b) => {
                if (a.email.includes(`@comendcare.com`) && !b.email.includes(`@comendcare.com`)) return 1
                if (b.email.includes(`@comendcare.com`) && !a.email.includes(`@comendcare.com`)) return -1
                return 0
            })

            return organization
        },
        [`${domain}-metadata`],
        {
            revalidate: 900,
            tags: [`${domain}-metadata`]
        }
    )()
}

export async function getCROData(id: string) {
    return prisma.company.findUnique({
        where: {
            id: id
        },
        include: {
            services: true,
            sites: true,
            certifications: {
                include: {
                    files: true
                }
            },
            rfis: true,
            reviews: {
                include: {
                    author: true,
                    organization: true,
                    feedbacks: true
                },
            }
        }
    })
}

export async function getPublicAssetsForOrganization(domain: string) {
    const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
        ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
        : domain

    const assets = await prisma.asset.findMany({
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

export async function getPublicRFPsForOrganization(domain: string) {
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
        include: {
            contacts: true,
            attachments: true,
            milestones: {
                include: {milestone: true},
                where: {milestone: {private: {equals: false}}}
            }
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
                            assets: { 
                                include: { 
                                    asset: {
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
                                    asset: {
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
                    assets: { 
                        include: { 
                            asset: {
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
                            asset: {
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

export async function getMembers(organizationId: string | null | undefined) {
    if (!organizationId) {
        return {success: false, error: "No organization id provided."};
    }

    try {
        const fetchedMembers = await prisma?.member.findMany({
            include: {user: true},
            where: {organizationId},
        })


        if (!fetchedMembers) {
            return {success: false, error: "members not found"};
        }

        return {
            success: true,
            data: fetchedMembers
        };
    } catch (error: any) {
        logError("Error fetching members", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getAssets(organizationId: string | undefined) {
    if (!organizationId) {
        return {success: false, error: "No organization id provided."};
    }

    try {
        const fetchedAssets = await prisma?.asset.findMany({
            where: {organizationId},
            include: {
                contacts: true,
                attachments: true,
                milestones: {
                    include: {
                        milestone: true
                    }
                }
            },
            orderBy: [{ createdAt: "desc" }]
        })

        if (!fetchedAssets) {
            return {success: false, error: "tools not found"}
        }

        return {
            success: true,
            data: fetchedAssets
        }
    } catch (error: any) {
        logError("Error fetching tools", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getRFPs(organizationId: string | undefined) {
    if (!organizationId) {
        return {success: false, error: "No organization id provided."};
    }

    try {
        const fetchedRFPs = await prisma?.rFP.findMany({
            where: {organizationId},
            include: {
                contacts: true,
                attachments: true,
                milestones: {
                    include: {
                        milestone: true
                    }
                }
            },
            orderBy: [{ createdAt: "desc" }]
        })

        if (!fetchedRFPs) {
            return {success: false, error: "RFPs not found"}
        }

        return {
            success: true,
            data: fetchedRFPs
        }
    } catch (error: any) {
        logError("Error fetching RFPs", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getMilestones(organizationId: string | undefined) {
    if (!organizationId) {
        return {success: false, error: "No organization id provided."};
    }

    try {
        const fetchedMilestones = await prisma?.milestone.findMany({
            // include: {user: true},
            where: {organizationId},
            include: {roadmap: true}
        })

        if (!fetchedMilestones) {
            return {success: false, error: "milestones not found"};
        }

        return {
            success: true,
            data: fetchedMilestones
        };
    } catch (error: any) {
        logError("Error fetching members", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getInvitations() {
    const session = await getSession()

    try {
        if (!session) {
            return {success: false, error: "Session not found."};
        }

        const invitations = await prisma?.invitation.findMany({
            where: {
                email: session.user.email,
                accepted: false
            },
        })

        if (!invitations) {
            return {success: false, error: "invitations not found"};
        }

        return {
            success: true,
            data: invitations
        };
    } catch (error: any) {
        logError("Error fetching invitations", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getInvitees(organizationId: string | undefined) {
    if (!organizationId) {
        return {success: false, error: "No organization id provided."};
    }

    try {
        const fetchedInvitees = await prisma?.invitation.findMany({
            where: {organizationId, accepted: false},
        })

        if (!fetchedInvitees) {
            return {success: false, error: "invitees not found"};
        }

        return {
            success: true,
            data: fetchedInvitees
        };
    } catch (error: any) {
        logError("Error fetching invitees", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getMemberRequestsWithUsers(organizationId: string | undefined): Promise<ApiResponse<any>> {
    if (!organizationId) {
        return {success: false, error: "No organization id provided."};
    }

    try {
        const fetchedMemberRequests = await prisma?.memberRequest.findMany({
            include: {user: true},
            where: {
                organizationId,
            },
        })

        // return {fetchedMemberRequests}

        if (!fetchedMemberRequests) {
            return {success: false, error: "user not found"};
        }

        return {
            success: true,
            data: {fetchedMemberRequests}
        };
    } catch (error: any) {
        logError("Error fetching member requests", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getUser(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            include: {organizations: true},
            where: {id: userId}
        })

        if (!user) {
            return {success: false, error: "user not found"};
        }

        return {
            success: true,
            data: user
        };
    } catch (error: any) {
        logError("Error fetching user", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getRoadmaps(orgId: string | null | undefined) {
    if (!orgId) {
        return {success: false, error: "No organization id provided."};
    }

    try {
        const organization = await prisma.organization.findUnique({
            include: {roadmaps: {include: {milestones: true}}},
            where: {
                id: decodeURIComponent(orgId)
            }
        })

        if (!organization) {
            return {success: false, error: "organization not found"};
        }

        return {
            success: true,
            data: organization?.roadmaps
        };
    } catch (error: any) {
        logError("Error fetching roadmap id", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getRoadmap(orgId: string | null | undefined, roadmapId: string | null | undefined) {
    if (!orgId) return {success: false, error: "No organization id provided."}
    if (!roadmapId) return {success: false, error: "No roadmap id provided."}

    try {
        const organization = await prisma.organization.findUnique({
            include: {roadmaps: true},
            where: {id: decodeURIComponent(orgId)}
        })

        if (!organization) return {success: false, error: "Organization not found."}

        const roadmap = await prisma.roadmap.findFirst({
            where: {
                organizationId: organization.id,
                id: roadmapId
            },
            include: {
                nodes: {
                    include: {data: true},
                    orderBy: [{ createdAt: "desc" }]
                },
                milestones: {
                    include: {
                        node: true,
                        contacts: true,
                        attachments: true,
                        types: {include: { milestoneType: true }},
                        assets: {include: {asset: true}},
                        rfps: {include: {rfp: true}}
                    },
                    orderBy: [{ createdAt: "desc" }]
                },
                edges: true,
                organization: true
            }
        })

        return {success: true, data: roadmap}
    } catch (error: any) {
        logError("Error fetching roadmap", error);
        return {success: false, error: "Internal server error."};
    }
}

export const getOrganizationFromOrganizationId = async (organizationId: string) => {
    try {
        let organization = await prisma.organization.findUnique({
            where: {
                id: organizationId,
            },
            include: {
                roadmaps: true,
                members: {
                    orderBy: {
                        createdAt: 'asc'
                    },
                    include: {
                        user: true
                    }
                },
                condition: {
                    include: {
                        condition: true
                    }
                }
            }
        });

        if (!organization) {
            return {success: false, error: "organization not found"};
        }

        // sort members list - move org owners to the beginning of the list
        organization.members = organization.members.sort((a, b) => {
            if (a.role === 'owner' && b.role !== 'owner') return -1
            if (b.role === 'owner' && a.role !== 'owner') return 1
            return 0
        })

        // sort members list - move comend users to the end of the list
        organization.members = organization.members.sort((a, b) => {
            if (a.email.includes(`@comendcare.com`) && !b.email.includes(`@comendcare.com`)) return 1
            if (b.email.includes(`@comendcare.com`) && !a.email.includes(`@comendcare.com`)) return -1
            return 0
        })

        return {success: true, data: organization};
    } catch (error: any) {
        logError("Error fetching organization data", error);
        return {success: false, error: "Internal server error"};
    }
};

export const getConditionsFromOrganizationId = async (organizationId: string) => {
    try {
        const conditions = await prisma.condition.findMany({
            where: {
                organizations: {
                    some: {
                        organizationId: organizationId, // Filter by organizationId
                    },
                },
            },
            include: {
                organizations: true, // Include related ConditionToOrganization data if needed
            },
        });

        if (!conditions || conditions.length === 0) {
            return {success: false, error: "No conditions found for the organization"};
        }

        return {success: true, data: conditions};
    } catch (error: any) {
        logError("Error fetching conditions for organization", error);
        return {success: false, error: "Internal server error"};
    }
};

export const getAllNonMemberOrganizations = async () => {
    const session = await getSession()
    try {
        if (!session) {
            return {success: false, error: "Session not found."};
        }

        const organizations = await prisma.organization.findMany({
            where: {
                members: {
                    none: {
                        userId: session.user.id,
                    },
                },
            },
            orderBy: {
                createdAt: "asc"
            },
        })

        if (!organizations) {
            return {success: false, error: "organizations not found"};
        }

        return {success: true, data: organizations};
    } catch (error: any) {
        logError("Error fetching membership data", error);
        return {success: false, error: "Internal server error"};
    }
};

export const getAllOrganizations = async () => {
    try {
        const organizations = await prisma.organization.findMany({

            orderBy: {
                createdAt: "asc"
            },
        })

        if (!organizations) {
            return {success: false, error: "organizations not found"};
        }

        return {success: true, data: organizations};
    } catch (error: any) {
        logError("Error fetching membership data", error);
        return {success: false, error: "Internal server error"};
    }
};

export const getAllMembershipsFromUserId = async (userId: string) => {
    try {
        const memberships = await prisma.member.findMany({
            where: {
                userId: userId
            },
            include: {
                organization: true
            }
        });

        if (!memberships) {
            return {success: false, error: "memberships not found"};
        }

        return {success: true, data: memberships};
    } catch (error: any) {
        logError("Error fetching membership data", error);
        return {success: false, error: "Internal server error"};
    }
};

export const getAllNotifications = async () => {
    try {
        const session = await getSession()
        if (!session?.user.id) throw new Error("User ID or Organization ID not in session")
        
        const notifications = await prisma.platformNotification.findMany({
            where: {
                userId: session.user.id,
                organizationId: session.user.organizationId
            }
        })

        return {success: true, data: notifications}
    } catch (error: any) {
        logError("Error fetching notifications data", error);
        return {success: false, error: "Internal server error"};
    }
}

export const getOrganizationFromRoadmapId = async (roadmapId: string): Promise<ApiResponse<any>> => {
    try {
        const roadmap = await prisma.roadmap.findUnique({
            where: {
                id: roadmapId
            },
            select: {
                organizationId: true
            }
        })

        if (!roadmap) {
            return {success: false, error: "roadmap not found"};
        }

        return {success: true, data: roadmap?.organizationId};
    } catch (error: any) {
        logError("Error fetching roadmap data", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function checkSubdomainAvailability(nickname: string) {
    try {
        const existingOrg = await prisma.organization.findUnique({
            where: {subdomain: nickname},
        });

        return !existingOrg
    } catch (error: any) {
        console.error("Database error checking subdomain availability:", error);
        return {error: "Database error. Please try again later."};
    }
}

export async function getMilestoneTypes() {
    try {
        const types = await prisma.milestoneType.findMany({})

        return {success: true, data: types}
    } catch (error: any) {
        console.error("Database error finding milestone types:", error)
        return {success: false, error: "Database error. please try again later."}
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
                assets: { 
                    include: { 
                        asset: {
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
                        asset: {
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

export async function getKanbanFromOrganizationId() {
    const session = await getSession()
    try {
        if (!session) {
            return {success: false, error: "Session not found."};
        }

        const kanban = await prisma.kanban.findUnique({
            where: {
                organizationId: session?.user.organizationId
            }
        })

        return {success: true, data: kanban}
    } catch (error: any) {
        console.error("Database error finding task board details:", error)
        return {success: false, error: "Database error. please try again later."}
    }
}

export async function getColumns(orgId: string | null | undefined): Promise<ApiResponse<any>> {
    if (orgId) {
        try {
            const dbColumns = await prisma.column.findMany({
                where: {
                    kanban: {
                        organization: {
                            id: orgId
                        }
                    }
                },
                orderBy: [
                    {kanbanPosition: 'asc'},
                ],
                include: {
                    tasks: {
                        orderBy: [{kanbanPosition: 'asc'}],
                        include: {
                            checklist: true,
                            stakeholders: {include: {user: true}},
                            milestone: true
                        }
                    }
                }
            })

            return {success: true, data: {columns: dbColumns}}
        } catch (error: any) {
            console.error("Database error finding column details:", error)
            return {success: false, error: "Database error. please try again later."}
        }
    }

    return {success: false, error: "No roadmapId provided."}
}

export async function getPosts() {
    try {
        const posts = await prisma.post.findMany({
            include: {
                author: true,
                comments: true,
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        return {success: true, data: posts}
    } catch (error: any) {
        console.error("Database error finding posts details:", error)
        return {success: false, error: "Database error. please try again later."}
    }
}

export async function getPostComments(postId: string) {
    try {
        const comments = await prisma.comment.findMany({
            where: {
                postId: postId
            },
            include: {
                author: true,
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        return {success: true, data: comments}
    } catch (error: any) {
        console.error("Database error finding comments:", error)
        return {success: false, error: "Database error. please try again later."}
    }
}

export async function isUserFollowing(id: string) {
    const session = await getSession()

    try {
        if (!session) {
            return {success: false, error: "Session not found."};
        }

        const follow = await prisma.follow.findUnique({
            where: {
                userId_followedType_followedId: {
                    userId: session.user.id,
                    followedType: "ORGANIZATION", // right now we only allow following organizations
                    followedId: id,
                },
            },
        })

        return {success: true, data: follow !== null}
    } catch (error: any) {
        console.error("Database error finding comments:", error)
        return {success: false, error: "Database error. please try again later."}
    }
}

export async function getSavedCompaniesFromOrganizationId(organizationId: string | undefined) {
    if (!organizationId) {
        return {success: false, error: "No organization id provided."};
    }

    try {
        const savedCompanies = await prisma?.savedCompany.findMany({
            where: {organizationId},
            include: {
                company: true,
                milestone: true
            }
        })

        if (!savedCompanies) {
            return {success: false, error: "Saved companies not found"};
        }

        return {
            success: true,
            data: savedCompanies
        };
    } catch (error: any) {
        logError("Error fetching saved companies", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getUserAnalytics() {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));

    // Total users
    const totalUsers = await prisma.user.count();

    // New users this month
    const newUsersThisMonth = await prisma.user.count({
        where: {
            createdAt: {
                gte: startOfCurrentMonth,
            },
        },
    });

    // New users last month
    const newUsersLastMonth = await prisma.user.count({
        where: {
            createdAt: {
                gte: startOfLastMonth,
                lt: startOfCurrentMonth,
            },
        },
    });

    // Active accounts (users updated in last 30 days)
    const activeUsers = await prisma.user.count({
        where: {
            updatedAt: {
                gte: subMonths(now, 1),
            },
        },
    });

    const growthRate =
        newUsersLastMonth === 0
            ? 100
            : ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100;

    return {
        totalUsers,
        newUsersThisMonth,
        newUsersLastMonth,
        activeUsers,
        growthRate,
    };
}

export async function getOrganizationAnalytics() {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));

    // Total organizations
    const totalOrganizations = await prisma.organization.count();

    // New organizations this month
    const newOrganizationsThisMonth = await prisma.organization.count({
        where: {
            createdAt: {
                gte: startOfCurrentMonth,
            },
        },
    });

    // New organizations last month
    const newOrganizationsLastMonth = await prisma.organization.count({
        where: {
            createdAt: {
                gte: startOfLastMonth,
                lt: startOfCurrentMonth,
            },
        },
    });

    // Active organizations (updated in last 30 days)
    const activeOrganizations = await prisma.organization.count({
        where: {
            updatedAt: {
                gte: subMonths(now, 1),
            },
        },
    });

    const growthRate =
        newOrganizationsLastMonth === 0
            ? 100
            : ((newOrganizationsThisMonth - newOrganizationsLastMonth) / newOrganizationsLastMonth) * 100;

    const allOrganizations = await prisma.organization.findMany({
        include: {
            condition: true,
            roadmaps: true,
        },
    });

    let completedProfiles = 0;

    for (const org of allOrganizations) {
        let conditions: Condition[] = [];
        const condResponse = await getConditionsFromOrganizationId(org.id);
        if (condResponse.success) conditions = (condResponse.data ?? []) as Condition[];
        const checks = getProfileCompletionChecks(org as any, conditions as any);
        const isComplete = Object.values(checks).every(Boolean);
        if (isComplete) completedProfiles++;
    }

    return {
        totalOrganizations,
        newOrganizationsThisMonth,
        newOrganizationsLastMonth,
        activeOrganizations,
        growthRate,
        completedProfiles
    };
}

export async function getOrganizationChartAnalytics() {
    const organizations = await prisma.organization.findMany({
        where: {
            createdAt: {
                lte: new Date(),
            },
        },
        select: {
            createdAt: true,
        },
    });

    const countsByDate: Record<string, number> = {};

    for (const org of organizations) {
        const dateStr = org.createdAt.toISOString().split("T")[0]; // "YYYY-MM-DD"
        countsByDate[dateStr] = (countsByDate[dateStr] || 0) + 1;
    }

    const chartData = Object.entries(countsByDate)
        .map(([date, count]) => ({
            date,
            organizations: count,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return chartData;
}

export async function getCompanyAndReviewAnalytics() {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));

    // Companies
    const totalCompanies = await prisma.company.count();
    const newCompaniesThisMonth = await prisma.company.count({
        where: { createdAt: { gte: startOfCurrentMonth } },
    });
    const newCompaniesLastMonth = await prisma.company.count({
        where: {
            createdAt: {
                gte: startOfLastMonth,
                lt: startOfCurrentMonth,
            },
        },
    });

    const companyGrowthRate =
        newCompaniesLastMonth === 0
            ? 100
            : ((newCompaniesThisMonth - newCompaniesLastMonth) / newCompaniesLastMonth) * 100;

    // Reviews
    const totalReviews = await prisma.review.count();
    const newReviewsThisMonth = await prisma.review.count({
        where: { createdAt: { gte: startOfCurrentMonth } },
    });

    return {
        totalCompanies,
        newCompaniesThisMonth,
        newCompaniesLastMonth,
        companyGrowthRate,
        totalReviews,
        newReviewsThisMonth,
    };
}

export async function getCompanyChartAnalytics() {
    const companies = await prisma.company.findMany({
        where: {
            createdAt: {
                lte: new Date(),
            },
        },
        select: {
            createdAt: true,
        },
    });

    // Aggregate by date
    const countsByDate: Record<string, number> = {};

    for (const company of companies) {
        const dateStr = company.createdAt.toISOString().split("T")[0]; // "YYYY-MM-DD"
        countsByDate[dateStr] = (countsByDate[dateStr] || 0) + 1;
    }

    // Convert to array sorted by date
    const chartData = Object.entries(countsByDate)
        .map(([date, count]) => ({
            date,
            companies: count,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return chartData;
}

export async function getUserChartAnalytics() {
    const users = await prisma.user.findMany({
        where: {
            createdAt: {
                lte: new Date(),
            },
        },
        select: {
            createdAt: true,
        },
    });

    // Aggregate by date
    const countsByDate: Record<string, number> = {};

    for (const user of users) {
        const dateStr = user.createdAt.toISOString().split("T")[0]; // "2024-06-28"
        countsByDate[dateStr] = (countsByDate[dateStr] || 0) + 1;
    }

    // Convert to array sorted by date
    const chartData = Object.entries(countsByDate)
        .map(([date, count]) => ({
            date,
            users: count,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return chartData;
}

export async function getUserWhitelist() {
    try {
        const whitelist = await prisma.whitelist.findMany({
            orderBy: { createdAt: "desc" },
        })


        if (!whitelist) {
            return {success: false, error: "User whitelist not found"};
        }

        return {
            success: true,
            data: whitelist
        };
    } catch (error: any) {
        logError("Error fetching whitelisted users", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getOverviewAnalytics() {
    const totalUsers = await prisma.user.count();
    const totalOrganizations = await prisma.organization.count();
    const totalCompanies = await prisma.company.count();
    const totalProjects = await prisma.milestone.count();

    return {
        totalUsers,
        totalOrganizations,
        totalCompanies,
        totalProjects,
    };
}

export async function getPharmaProjects() {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: "desc" },
        })

        return {
            success: true,
            data: projects
        };
    } catch (error: any) {
        logError("Error fetching pharma projects", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getBiosampleData() {
    try {
        const data = await fs.readFile(
            path.join(process.cwd(), "data/pharma-data/biosamples.json")
        )
        console.log("FUCK")
        console.log(data)

        const tasks = JSON.parse(data.toString())

        return {
            success: true,
            data: z.array(biosampleSchema).parse(tasks)
        };
    } catch (error: any) {
        logError("Error fetching biosamples", error);
        return {success: false, error: "Internal server error"};
    }
}

export async function getPharmaProjectData(id: string) {
    return prisma.project.findUnique({
        where: {
            id: id
        },
    })
}
