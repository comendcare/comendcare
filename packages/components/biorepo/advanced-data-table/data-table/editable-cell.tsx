"use client";

import * as React from "react";
import { revalidate } from "./../../../../../packages/lib/revalidate";
import { createOrUpdateBiosample } from "./../../../../../packages/lib/actions";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "./../../../ui/textarea";

export function EditableCell({ row, session, pathname }: { row: any, session: any, pathname: string }) {
    const [isEditing, setIsEditing] = useState(false)
    const [value, setValue] = useState(row.original.title)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const onBlur = async () => {
        await createOrUpdateBiosample(
            session?.user.organizationId,
            {
                id: row.original.id,
                title: value
            }
        )
        setIsEditing(false)
        await revalidate(pathname)
    }

    useEffect(() => {
        if (inputRef.current && isEditing) {
            setTimeout(() => {
                inputRef.current?.focus()
            }, 50)
        }
    }, [isEditing])

    if (!isEditing) {
        return (
            <div
                onClick={() => setIsEditing(true)}
                className="min-w-[200px]"
            >
                {value}
            </div>
        )
    }

    return (
        <Textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
            className="border-none min-w-[200px]"
        />
    )
}
