"use server";

import prisma from "@/lib/prisma";
import {Roadmap, Organization} from "@prisma/client";
import {revalidateTag} from "next/cache";
import {withRoadmapAuth, withOrganizationAuth} from "./auth";
import {getSession} from "@/lib/auth";
import {
    addDomainToVercel,
    // getApexDomain,
    removeDomainFromVercelProject,
    // removeDomainFromVercelTeam,
    validDomainRegex,
} from "@/lib/domains";
import {put} from "@vercel/blob";
import {customAlphabet} from "nanoid";
import {getBlurDataURL} from "@/lib/utils";
import { Session } from "next-auth";

const nanoid = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    7,
); // 7-character random string

export const createOrganization = async (formData: FormData) => {
    const session = await getSession();
    if (!session?.user.id) {
        return {
            error: "Not authenticated",
        };
    }
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const subdomain = formData.get("subdomain") as string;

    try {
        const response = await prisma.organization.create({
            data: {
                name,
                description,
                subdomain,
                user: {
                    connect: {
                        id: session.user.id,
                    },
                },
            },
        });
        await revalidateTag(
            `${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
        );
        return response;
    } catch (error: any) {
        if (error.code === "P2002") {
            return {
                error: `This subdomain is already taken`,
            };
        } else {
            return {
                error: error.message,
            };
        }
    }
};

export const updateOrganization = withOrganizationAuth(
    async (formData: FormData, organization: Organization, key: string) => {
        const value = formData.get(key) as string;

        try {
            let response;

            if (key === "customDomain") {
                if (value.includes("vercel.pub")) {
                    return {
                        error: "Cannot use vercel.pub subdomain as your custom domain",
                    };

                    // if the custom domain is valid, we need to add it to Vercel
                } else if (validDomainRegex.test(value)) {
                    response = await prisma.organization.update({
                        where: {
                            id: organization.id,
                        },
                        data: {
                            customDomain: value,
                        },
                    });
                    await Promise.all([
                        addDomainToVercel(value),
                        // Optional: add www subdomain as well and redirect to apex domain
                        // addDomainToVercel(`www.${value}`),
                    ]);

                    // empty value means the user wants to remove the custom domain
                } else if (value === "") {
                    response = await prisma.organization.update({
                        where: {
                            id: organization.id,
                        },
                        data: {
                            customDomain: null,
                        },
                    });
                }

                // if the organization had a different customDomain before, we need to remove it from Vercel
                if (organization.customDomain && organization.customDomain !== value) {
                    response = await removeDomainFromVercelProject(organization.customDomain);

                    /* Optional: remove domain from Vercel team

                    // first, we need to check if the apex domain is being used by other organization
                    const apexDomain = getApexDomain(`https://${organization.customDomain}`);
                    const domainCount = await prisma.organization.count({
                      where: {
                        OR: [
                          {
                            customDomain: apexDomain,
                          },
                          {
                            customDomain: {
                              endsWith: `.${apexDomain}`,
                            },
                          },
                        ],
                      },
                    });

                    // if the apex domain is being used by other organization
                    // we should only remove it from our Vercel project
                    if (domainCount >= 1) {
                      await removeDomainFromVercelProject(organization.customDomain);
                    } else {
                      // this is the only organization using this apex domain
                      // so we can remove it entirely from our Vercel team
                      await removeDomainFromVercelTeam(
                        organization.customDomain
                      );
                    }

                    */
                }
            } else if (key === "image" || key === "logo") {
                if (!process.env.BLOB_READ_WRITE_TOKEN) {
                    return {
                        error:
                            "Missing BLOB_READ_WRITE_TOKEN token. Note: Vercel Blob is currently in beta – please fill out this form for access: https://tally.so/r/nPDMNd",
                    };
                }

                const file = formData.get(key) as File;
                const filename = `${nanoid()}.${file.type.split("/")[1]}`;

                const {url} = await put(filename, file, {
                    access: "public",
                });

                const blurhash = key === "image" ? await getBlurDataURL(url) : null;

                response = await prisma.organization.update({
                    where: {
                        id: organization.id,
                    },
                    data: {
                        [key]: url,
                        ...(blurhash && {imageBlurhash: blurhash}),
                    },
                });
            } else {
                response = await prisma.organization.update({
                    where: {
                        id: organization.id,
                    },
                    data: {
                        [key]: value,
                    },
                });
            }
            console.log(
                "Updated organization data! Revalidating tags: ",
                `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
                `${organization.customDomain}-metadata`,
            );
            await revalidateTag(
                `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
            );
            organization.customDomain &&
            (await revalidateTag(`${organization.customDomain}-metadata`));

            return response;
        } catch (error: any) {
            if (error.code === "P2002") {
                return {
                    error: `This ${key} is already taken`,
                };
            } else {
                return {
                    error: error.message,
                };
            }
        }
    },
);

export const deleteOrganization = withOrganizationAuth(async (_: FormData, organization: Organization) => {
    try {
        const response = await prisma.organization.delete({
            where: {
                id: organization.id,
            },
        });
        await revalidateTag(
            `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
        );
        response.customDomain &&
        (await revalidateTag(`${organization.customDomain}-metadata`));
        return response;
    } catch (error: any) {
        return {
            error: error.message,
        };
    }
});

export const getOrganizationFromRoadmapId = async (roadmapId: string) => {
    const roadmap = await prisma.roadmap.findUnique({
        where: {
            id: roadmapId,
        },
        select: {
            organizationId: true,
        },
    });
    return roadmap?.organizationId;
};

export const createRoadmap = withOrganizationAuth(async (_: FormData, organization: Organization) => {
    const session = await getSession();
    if (!session?.user.id) {
        return {
            error: "Not authenticated",
        };
    }
    const response = await prisma.roadmap.create({
        data: {
            organizationId: organization.id,
            userId: session.user.id,
        },
    });

    await revalidateTag(
        `${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-roadmaps`,
    );
    organization.customDomain && (await revalidateTag(`${organization.customDomain}-roadmaps`));

    return response;
});

// creating a separate function for this because we're not using FormData
export const updateRoadmap = async (data: Roadmap) => {
    const session = await getSession();
    if (!session?.user.id) {
        return {
            error: "Not authenticated",
        };
    }
    const roadmap = await prisma.roadmap.findUnique({
        where: {
            id: data.id,
        },
        include: {
            organization: true,
        },
    });
    if (!roadmap || roadmap.userId !== session.user.id) {
        return {
            error: "Roadmap not found",
        };
    }
    try {
        const response = await prisma.roadmap.update({
            where: {
                id: data.id,
            },
            data: {
                title: data.title,
                description: data.description,
                content: data.content,
            },
        });

        await revalidateTag(
            `${roadmap.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-roadmap`,
        );
        await revalidateTag(
            `${roadmap.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-${roadmap.slug}`,
        );

        // if the organization has a custom domain, we need to revalidate those tags too
        roadmap.organization?.customDomain &&
        (await revalidateTag(`${roadmap.organization?.customDomain}-roadmaps`),
            await revalidateTag(`${roadmap.organization?.customDomain}-${roadmap.slug}`));

        return response;
    } catch (error: any) {
        return {
            error: error.message,
        };
    }
};

export const updateRoadmapMetadata = withRoadmapAuth(
    async (
        formData: FormData,
        roadmap: Roadmap & {
            organization: Organization;
        },
        key: string,
    ) => {
        const value = formData.get(key) as string;

        try {
            let response;
            if (key === "image") {
                const file = formData.get("image") as File;
                const filename = `${nanoid()}.${file.type.split("/")[1]}`;

                const {url} = await put(filename, file, {
                    access: "public",
                });

                const blurhash = await getBlurDataURL(url);

                response = await prisma.roadmap.update({
                    where: {
                        id: roadmap.id,
                    },
                    data: {
                        image: url,
                        imageBlurhash: blurhash,
                    },
                });
            } else {
                response = await prisma.roadmap.update({
                    where: {
                        id: roadmap.id,
                    },
                    data: {
                        [key]: key === "published" ? value === "true" : value,
                    },
                });
            }

            await revalidateTag(
                `${roadmap.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-roadmaps`,
            );
            await revalidateTag(
                `${roadmap.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-${roadmap.slug}`,
            );

            // if the organization has a custom domain, we need to revalidate those tags too
            roadmap.organization?.customDomain &&
            (await revalidateTag(`${roadmap.organization?.customDomain}-roadmaps`),
                await revalidateTag(`${roadmap.organization?.customDomain}-${roadmap.slug}`));

            return response;
        } catch (error: any) {
            if (error.code === "P2002") {
                return {
                    error: `This slug is already in use`,
                };
            } else {
                return {
                    error: error.message,
                };
            }
        }
    },
);

export const deleteRoadmap = withRoadmapAuth(async (_: FormData, roadmap: Roadmap) => {
    try {
        const response = await prisma.roadmap.delete({
            where: {
                id: roadmap.id,
            },
            select: {
                organizationId: true,
            },
        });
        return response;
    } catch (error: any) {
        return {
            error: error.message,
        };
    }
});

export const editUser = async (
    formData: FormData,
    _id: unknown,
    key: string,
) => {
    const session = await getSession();
    if (!session?.user.id) {
        return {
            error: "Not authenticated",
        };
    }
    const value = formData.get(key) as string;

    try {
        const response = await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                [key]: value,
            },
        });
        return response;
    } catch (error: any) {
        if (error.code === "P2002") {
            return {
                error: `This ${key} is already in use`,
            };
        } else {
            return {
                error: error.message,
            };
        }
    }
};

// Invite user function with updated Site model
export async function inviteUser(
    session: Session | null,
    email: string = "therealflawnsontong@gmail.com",
    role: string = "admin",
    organizationId: string = "Test"
) {
    try {
        if (!session) {
            throw new Error('You must be signed in to perform this action');
        }

        const lowerCaseEmail = email.toLowerCase();
        const userExists = await prisma.user.findFirst({
            where: {
                email: {
                    equals: lowerCaseEmail,
                    mode: 'insensitive',
                },
            },
        });

        let invitationId: string | undefined;
        if (!userExists) {
            const ticket = await prisma.invitation.create({
                data: {
                    email: lowerCaseEmail,
                    role: role,
                    organizationId: organizationId // Updated to siteId
                }
            });
            invitationId = ticket.id;

            return ticket
        }

        // Create member should happen AFTER the invited user accepts the invitation and creates and account.
        // return await prisma.member.create({
        //     data: {
        //         email: lowerCaseEmail,
        //         organizationId: site_id, // Updated field
        //         role: role,
        //         invitedById: session?.user?.id,
        //         meta: {
        //             invitationId,
        //         },
        //     },
        // });
    } catch (error) {
        console.error("Error inviting user:", error);
        throw new Error("Failed to invite user.");
    }
}

// Create or get site (replaces organization logic with site logic)
export async function createOrGetSite(
    input: {
        siteName: string
        siteSlug: string
    },
    userId: string | undefined,
    description: string
) {
    const session = await getSession();

    if (!session?.user.id) {
        return {
            error: "Not authenticated",
        };
    }

    try {
        // Try to find a site by slug first
        if (input.siteSlug) {
            const site = await prisma.organization.findUnique({
                where: {
                    subdomain: input.siteSlug,
                },
            });

            // If the site is found, return it
            if (site) {
                return site;
            }
        }

        // If no site was found by slug or no slug was provided, create a new one if name is provided
        if (input.siteName) {
            return await prisma.organization.create({
                data: {
                    name: input.siteName,
                    description: description,
                    user: {
                        connect: {
                            id: session.user.id,
                        },
                    },
                },
            });
        }

        // If neither name nor slug was provided or used, throw an error
        throw new Error("Site name or slug must be provided");
    } catch (error) {
        console.error("Error creating or retrieving site:", error);
        throw new Error("Failed to create or retrieve site.");
    }
}

// Add a member to the site
export async function addMemberToSite(
    organizationId: string,
    session: Session | null
) {
    try {
        if (!session || !organizationId) {
            throw new Error("Invalid session or organizationId");
        }

        const email = session.user?.email;

        if (!email) {
            throw new Error("Email is required but is missing");
        }

        // If session and organizationId are valid, create a new member for the site
        return await prisma.member.create({
            data: {
                email: email, // email is guaranteed to be a string here
                organizationId: organizationId, // Updated to organizationId
                role: 'admin',
                userId: session.user?.id, // Ensure userId is also non-null
            },
        });
    } catch (error) {
        console.error("Error adding member to site:", error);
        throw new Error("Failed to add member to site.");
    }
}
