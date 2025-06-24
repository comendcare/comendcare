import {Button} from "@/components/ui/button";
import {Column} from "@prisma/client";
import { KanbanState, useKanbanStore } from "@/state/kanban/kanbanStore";
import { useShallow } from "zustand/react/shallow";
import { Plus } from "lucide-react";

const kanbanSelector = (state: KanbanState) => ({
    addTask: state.addTask
})

export default function NewKanbanTaskButton({orgId, column, assignTo}: { orgId: string | null | undefined, column: Column, assignTo?: string }) {
    const { addTask } = useKanbanStore(useShallow(kanbanSelector))

    async function createTask() {
        try {
            if (assignTo) await addTask(orgId, column.id, {stakeholders: [{ userId: assignTo }]})
            else await addTask(orgId, column.id)
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Button
            variant="outline"
            onClick={createTask}
        >
            <Plus />
            New task
        </Button>
    )
}