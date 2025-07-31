"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@comend/components/ui/dialog";
import {Button} from "@comend/components/ui/button";
import {Input} from "@comend/components/ui/input";
import {Textarea} from "@comend/components/ui/textarea";
import {useState} from "react";
import {updateMaterialAndDataAccessRequestProperty} from "@comend/lib/actions";
import {toast} from "sonner";

type PropertyKey =
    | "sampleCount"
    | "researcher"
    | "about"
    | "status"
    | "submittedAt"
    | "expiresAt"
    | "sampleTypes"
    | "dataTypes"
    | "institutions";

type UpdateRequestDetailDialogProps = {
    requestId: string;
    property: PropertyKey;
    currentValue: any;
    triggerLabel?: string;
};

export function RequestUpdatePropertyDialog({
                                                requestId,
                                                property,
                                                currentValue,
                                                triggerLabel = "Update",
                                            }: UpdateRequestDetailDialogProps) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false);

    // Unified state handler for dynamic input types
    const [formState, setFormState] = useState<any>(currentValue ?? "");

    const handleSubmit = async (e: React.FormEvent) => {
        setLoading(true)
        try {
            e.preventDefault();
            const response = await updateMaterialAndDataAccessRequestProperty(requestId, property, formState);
            setOpen(false);
            if (response.success) {
                toast.success("Service Provider created successfully")
                setFormState(currentValue ?? "")
                setOpen(false)
            } else {
                toast.error(response.error || "An error occurred while creating the Service Provider.")
            }
        } catch (error) {
            console.error("Create Service Provider error:", error)
            toast.error("An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    };

    // Title map
    const titleMap: Record<PropertyKey, string> = {
        sampleCount: "Sample Count",
        researcher: "Researcher",
        about: "About",
        status: "Status",
        submittedAt: "Submitted At",
        expiresAt: "Expires At",
        sampleTypes: "Sample Types",
        dataTypes: "Data Types",
        institutions: "Institutions",
    };

    const renderField = () => {
        switch (property) {
            case "sampleCount":
                return (
                    <Input
                        type="number"
                        value={formState}
                        onChange={(e) => setFormState(Number(e.target.value))}
                    />
                );

            case "researcher":
                return (
                    <>
                        <Input
                            placeholder="Name"
                            value={formState?.name ?? ""}
                            onChange={(e) =>
                                setFormState((prev: any) => ({...prev, name: e.target.value}))
                            }
                            className="mb-2"
                        />
                        <Input
                            placeholder="Title"
                            value={formState?.title ?? ""}
                            onChange={(e) =>
                                setFormState((prev: any) => ({...prev, title: e.target.value}))
                            }
                        />
                    </>
                );

            case "about":
                return (
                    <Textarea
                        value={formState}
                        onChange={(e) => setFormState(e.target.value)}
                    />
                );

            case "status":
                return (
                    <Input
                        value={formState}
                        onChange={(e) => setFormState(e.target.value)}
                    />
                );

            case "submittedAt":
            case "expiresAt":
                return (
                    <Input
                        type="datetime-local"
                        value={formState}
                        onChange={(e) => setFormState(e.target.value)}
                    />
                );

            case "sampleTypes":
            case "dataTypes":
                return (
                    <Input
                        placeholder="Comma-separated values"
                        value={formState?.join(", ") ?? ""}
                        onChange={(e) =>
                            setFormState(
                                e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                            )
                        }
                    />
                );

            case "institutions":
                return (
                    <Textarea
                        placeholder='One institution per line (format: "Institution Name")'
                        value={formState?.map((i: any) => i.name).join("\n") ?? ""}
                        onChange={(e) =>
                            setFormState(
                                e.target.value
                                    .split("\n")
                                    .map((name) => ({id: crypto.randomUUID(), name: name.trim()}))
                                    .filter((i) => i.name)
                            )
                        }
                    />
                );

            default:
                return <p>Unsupported field.</p>;
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="link" className="text-indigo-600 hover:text-indigo-500 p-0">
                    {triggerLabel}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update {titleMap[property]}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    {renderField()}
                    <div className="flex justify-end">
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
