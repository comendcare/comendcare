import {FaPlus} from "react-icons/fa6";
import {Button} from "@/components/ui/button";
import {Column} from "@prisma/client";
import {createNewKanbanTask} from "@/lib/actions";
import {toast} from "sonner";


export default function NewKanbanTaskButton({column}: { column: Column }) {

    async function createTask() {
        try {
            await createNewKanbanTask(column).then((response) => {
                if (response.success && response.data) {
                    toast.success("Task created successfully!");
                } else {
                    console.error(response.error)
                    toast.error(response.error)
                }
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