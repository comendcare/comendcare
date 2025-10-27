import { Button } from "@/packages/components/ui/button"
import { Globe, Lock } from "lucide-react"

export const PublicPrivateButton = ({isPrivate, updateCallback}: {isPrivate: boolean, updateCallback: (isPrivate: boolean) => void}) => {
    if (isPrivate) {
        return (
            <Button
                className="inline-block align-middle mr-2 mb-1 h-fit w-fit p-1.5 bg-red-100 hover:bg-red-300"
                onClick={(e) => {
                    e.stopPropagation()
                    // if (nodeId) setMilestone(props.data.nodeId, {private: false})
                    updateCallback(false)
                }}
            >
                <Lock size={20} className="text-red-800"/>
            </Button>
        )
    } else {
        return (
            <Button
                className="inline-block align-middle mr-2 mb-1 h-fit w-fit p-1.5 bg-green-100 hover:bg-green-300"
                onClick={(e) => {
                    e.stopPropagation()
                    // if (props?.data?.nodeId) setMilestone(props.data.nodeId, {private: true})
                    updateCallback(true)
                }}
            >
                <Globe size={20} className="text-green-800"/>
            </Button>
        )
    }
}