import { MouseEventHandler } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Check, Plus } from "lucide-react";

export function CheckBubble({ isChecked, onCheckedChanged }: { isChecked: boolean, onCheckedChanged: MouseEventHandler<HTMLButtonElement> }) {    
    return (
        <Button 
            className={cn(
                "absolute top-0 right-0 -mt-2 -mr-2 flex w-6 h-6 items-center justify-center border-2 p-3 rounded-full",
                isChecked ? "bg-blue-dark hover:bg-blue-dark border-blue-dark" : "bg-white hover:bg-white border-primary"
            )}
            onClick={onCheckedChanged}
        >
            {isChecked ? (
                <Check className="text-white" /> // Checked indicator
            ) : (
                <Plus className="text-primary" /> // Unchecked indicator
            )}
        </Button>
    )
}