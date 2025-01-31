import {FaPlus} from "react-icons/fa6";
import {Button} from "@/components/ui/button";
import {Column} from "@prisma/client";
import { KanbanState, useKanbanStore } from "@/state/kanban/kanbanStore";
import { useShallow } from "zustand/react/shallow";

const kanbanSelector = (state: KanbanState) => ({
    addTask: state.addTask
})

export default function NewKanbanTaskButton({column, assignTo}: { column: Column, assignTo?: string }) {
    const { addTask } = useKanbanStore(useShallow(kanbanSelector))

    async function createTask() {
        try {
            if (assignTo) await addTask(column.id, {stakeholders: [{ userId: assignTo }]})
            else await addTask(column.id)
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Button
            variant="outline"
            onClick={createTask}
        >
            <FaPlus/>
            New task
        </Button>
    )
}