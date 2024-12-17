import {FaPlus} from "react-icons/fa6";
import {Button} from "@/components/ui/button";
import {Column} from "@prisma/client";
import {createNewKanbanTask} from "@/lib/actions";
import {toast} from "sonner";
import { KanbanState, useKanbanStore } from "@/state/kanban/kanbanStore";
import { useShallow } from "zustand/react/shallow";

const kanbanSelector = (state: KanbanState) => ({
    addTask: state.addTask
})

export default function NewKanbanTaskButton({column}: { column: Column }) {
    const { addTask } = useKanbanStore(useShallow(kanbanSelector))

    async function createTask() {
        try {
            // await createNewKanbanTask(column).then((response) => {
            //     if (response.success && response.data) {
            //         toast.success("Task created successfully!");
            //     } else {
            //         console.error(response.error)
            //         toast.error(response.error)
            //     }
            // })
            addTask({
                name: 'New Task',
                columnId: column.id
            })
        } catch (error) {
            console.error(error);
            toast.error("Failed to create task.");
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