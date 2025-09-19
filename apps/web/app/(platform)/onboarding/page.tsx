"use client";

import React, {useCallback, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

// UI
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@comend/components/ui/form";
import {Input} from "@comend/components/ui/input";
import {Button} from "@comend/components/ui/button";
import {Checkbox} from "@comend/components/ui/checkbox";
import {Separator} from "@comend/components/ui/separator";
import LoadingDots from "@comend/components/icons/loading-dots";
import {Skeleton} from "@comend/components/ui/skeleton";

// Domain helpers / types
import type {FileWithPreview} from "@comend/components/image-selector";
import {acceptedFiletypes, years, getPublicFile} from "@comend/lib/utils";

// Data
import {useDropzone} from "react-dropzone";
import mixpanel from "mixpanel-browser";
import {toast} from "sonner";

// Actions / API
import {
    editUser,
} from "@comend/lib/actions";
import {
    getInvitations,
    getPublicOrganizationData,
    getUser,
} from "@comend/lib/fetchers";
import {handleImageUpload} from "@comend/lib/upload";

const safeMixpanel = {
    identify: (...args: any[]) => {
        try {
            if (typeof window !== "undefined" && (mixpanel as any)?.persistence) {
// @ts-ignore
                mixpanel.identify?.(...(args as any));
            }
        } catch (e) {
            console.warn("mixpanel identify skipped:", e);
        }
    },
    optIn: () => {
        try {
            if (typeof window !== "undefined" && (mixpanel as any)?.persistence) {
                mixpanel.opt_in_tracking?.();
            }
        } catch (e) {
            console.warn("mixpanel opt_in skipped:", e);
        }
    },
    optOut: () => {
        try {
            if (typeof window !== "undefined" && (mixpanel as any)?.persistence) {
                mixpanel.opt_out_tracking?.();
            }
        } catch (e) {
            console.warn("mixpanel opt_out skipped:", e);
        }
    },
};

/**************************************
 * Zod schema (ALL FIELDS IN ONE)
 **************************************/
const unifiedSchema = z.object({
    // USER
    name: z.string().min(2, {message: "Your name must be at least 2 characters."}),
    notificationSettings: z.boolean().default(false),
    consentSettings: z.boolean().default(false),
    userImage: z.string().optional(),
});

/**************************************
 * Component
 **************************************/
export default function OnboardingPage() {
    const router = useRouter();
    const {data: session, status, update} = useSession();
    const [isInitializing, setIsInitializing] = useState(true);
    const [loading, setLoading] = useState(false);
    const [selectedUserFile, setSelectedUserFile] = useState<FileWithPreview | null>(null);
    const [invitations, setInvitations] = useState<any[]>([]);
    const hasInvitations = invitations.length > 0;

    // Debounced subdomain check
    const form = useForm<z.infer<typeof unifiedSchema>>({
        mode: "onChange",
        resolver: zodResolver(unifiedSchema),
        defaultValues: {
            name: "",
            notificationSettings: false,
            consentSettings: false,
        },
    });

    /**************************************
     * Image drop handlers
     **************************************/
    const onDropUser = useCallback((files: any[]) => {
        const file = files?.[0];
        if (!file) return;
        if (file.type === "image/svg+xml") {
            toast.error("SVG files are not allowed. Please select a valid image.");
            return;
        }
        const withPreview = Object.assign(file, {preview: URL.createObjectURL(file)});
        setSelectedUserFile(withPreview);
    }, []);

    const userDropzone = useDropzone({onDrop: onDropUser, accept: acceptedFiletypes});

    /**************************************
     * Initialization: fetch user, orgs, invitations
     **************************************/
    useEffect(() => {
        (async () => {
            try {
                // Invitations (to decide where to redirect after user update)
                const invRes = await getInvitations({
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                    accepted: true,
                    organizationId: true,
                });
                if (invRes.success && invRes.data) {
                    const withDetails = await Promise.all(
                        invRes.data.map(async (i: any) => {
                            const orgRes = await getPublicOrganizationData(i.organizationId, {
                                id: true,
                                name: true,
                                description: true,
                                image: true,
                                subdomain: true,
                            });
                            return {...i, organization: orgRes.success ? orgRes.data : null};
                        })
                    );
                    setInvitations(withDetails);
                }

                // User defaults
                if (session?.user?.id) {
                    const uRes = await getUser(session.user.id, {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        notificationSettings: true,
                        consentSettings: true,
                        address1: true,
                        address2: true,
                        formattedAddress: true,
                        city: true,
                        region: true,
                        postalCode: true,
                        country: true,
                        lat: true,
                        lng: true,
                    } as any);
                    if (uRes.success && uRes.data) {
                        const u = uRes.data as any;
                        form.reset({
                            ...form.getValues(),
                            name: u.name || "",
                            notificationSettings: u.notificationSettings ?? false,
                            consentSettings: u.consentSettings ?? false,
                            userImage: u.image || "",
                        });

                        if (u.image) {
                            try {
                                const file: File = await getPublicFile(u.image);
                                const withPreview = Object.assign(file, {preview: URL.createObjectURL(file)});
                                setSelectedUserFile(withPreview);
                            } catch (e) {
                                console.error(e);
                            }
                        }
                    }
                }

            } catch (err) {
                console.error(err);
            } finally {
                setIsInitializing(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user?.id, session?.user?.organizationId]);

    /**************************************
     * Submit handler (keeps original logic)
     **************************************/
    async function onSubmit(values: z.infer<typeof unifiedSchema>) {
        setLoading(true);

        try {
            // 1) Consent / mixpanel
            if (values.consentSettings) {
                if (session?.user?.id && session?.user?.email) {
                    if (process.env.NEXT_PUBLIC_NODE_ENV !== "production") safeMixpanel.identify(session.user.email);
                    else safeMixpanel.identify(session.user.id);
                }
                safeMixpanel.optIn();
            } else {
                safeMixpanel.optOut();
            }

            // 2) User image upload (if changed)
            if (selectedUserFile && values.userImage && values.userImage !== (form.formState.defaultValues as any)?.userImage) {
                const imgUrl = await handleImageUpload(selectedUserFile as File, values.userImage);
                if (imgUrl) values.userImage = imgUrl;
            }

            // 3) Persist user fields (one-by-one, as before)
            if (session?.user?.id) {
                const userPayload: Record<string, any> = {
                    name: values.name,
                    notificationSettings: values.notificationSettings,
                    consentSettings: values.consentSettings,
                    image: values.userImage,
                };
                for (const [key, value] of Object.entries(userPayload)) {
                    const res: any = await editUser(session.user.id as string, {[key]: value});
                    if (res?.error) {
                        toast.error(res.error);
                        return;
                    }
                }
            }

            // 7) Final route (erases onboarding from history so user can't navigate back)
            await update({})
            if (hasInvitations) router.replace("/app/profile");
            else router.replace("/app/dashboard");
            toast.success("Onboarding complete ✨");
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong while saving.");
        } finally {
            setLoading(false);
        }
    }

    if (status === "loading" || isInitializing) {
        return (
            <div className="flex flex-col space-y-8 w-full max-w-5xl mx-auto">
                <Skeleton className="h-[20px] w-full"/>
                <Skeleton className="h-[32px] w-full"/>
                <Skeleton className="mt-4 h-[80px] w-full"/>
                <Skeleton className="h-[80px] w-full"/>
                <Skeleton className="mt-4 h-[40px] w-full"/>
                <Skeleton className="h-[20px] w-full"/>
                <Skeleton className="h-[32px] w-full"/>
                <Skeleton className="mt-4 h-[80px] w-full"/>
                <Skeleton className="h-[80px] w-full"/>
                <Skeleton className="mt-4 h-[40px] w-full"/>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-8 w-full max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-semibold">
                    Welcome to Comend
                </h1>
                <p className="text-sm text-muted-foreground">
                    We just have a few questions for you to get started.
                </p>
            </div>
            <Separator/>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, (e) => {
                    console.log(e);
                    toast.error("Please fix the highlighted errors.");
                })} className="space-y-10">
                    {/* USER */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-semibold">
                            Your profile
                        </h2>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Your full name (required)</FormLabel>
                                    <FormControl><Input type="text" {...field} /></FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="notificationSettings"
                                render={({field}) => (
                                    <FormItem
                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Allow platform updates & notifications</FormLabel>
                                            <FormDescription>You can change this later in
                                                settings.</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="consentSettings"
                                render={({field}) => (
                                    <FormItem
                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>I consent to data collection to improve Comend</FormLabel>
                                            <FormDescription>Analytics preferences can be updated
                                                anytime.</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* User image picker */}
                        <FormField
                            control={form.control}
                            name="userImage"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Profile photo</FormLabel>
                                    <div {...userDropzone.getRootProps({className: "border rounded-lg p-4 cursor-pointer"})}>
                                        <input {...userDropzone.getInputProps()} />
                                        {selectedUserFile ? (
                                            <div className="flex items-center space-x-4">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={(selectedUserFile as any).preview} alt="preview"
                                                     className="h-16 w-16 rounded-full object-cover"/>
                                                <span>Click to replace</span>
                                            </div>
                                        ) : (
                                            <p>Drag & drop or click to upload</p>
                                        )}
                                    </div>
                                    <FormDescription className="text-xs">PNG/JPG only (no SVG).</FormDescription>
                                    {/*<FormControl>*/}
                                    {/*    <Input type="text" placeholder="Existing image path (optional)" {...field} />*/}
                                    {/*</FormControl>*/}
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </section>

                    <div className="flex justify-between">
                        <div/>
                        <Button type="submit" disabled={loading}>
                            {loading ? <LoadingDots color="#808080"/> : "Complete sign-up"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
