import { useState } from "react";
import { Checkbox } from "./ui/checkbox"
import { FaCheck, FaPlus } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export function CheckBubble({ data, onCheckedChanged }: { data: any, onCheckedChanged: (checked: boolean) => void }) {
    const [isChecked, setIsChecked] = useState(false);

    const handleChange = () => {
      setIsChecked(!isChecked)
      onCheckedChanged(!isChecked)
    };
    
    return (
        <Button 
            id={data.title}
            className={cn(
                "absolute top-0 right-0 -mt-2 -mr-2 flex w-6 h-6 items-center justify-center border-2 border-primary p-3 rounded-full",
                isChecked ? "bg-primary hover:bg-primary" : "bg-white hover:bg-white"
            )}
            onClick={handleChange}
        >
            {isChecked ? (
                <FaCheck className="text-white" /> // Checked indicator
            ) : (
                <FaPlus className="text-primary" /> // Unchecked indicator
            )}
        </Button>
    )
}