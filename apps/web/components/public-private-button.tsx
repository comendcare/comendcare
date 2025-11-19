import LoadingDots from "@comend/components/icons/loading-dots"
import { Button } from "@comend/components/ui/button"
import { Globe, Lock } from "lucide-react"
import { useEffect, useState } from "react"

export const PublicPrivateButton = ({isPrivate, updateCallback}: {isPrivate: boolean, updateCallback: (isPrivate: boolean) => Promise<void>}) => {
    const [localIsPrivate, setLocalIsPrivate] = useState(isPrivate)

    useEffect(() => {
        setLocalIsPrivate(isPrivate)
    }, [isPrivate])

    return (localIsPrivate ? (
            <Button
                className="inline-block align-middle mr-2 mb-1 h-fit w-fit p-1.5 bg-red-100 hover:bg-red-300"
                onClick={async (e) => {
                    e.stopPropagation()
                    setLocalIsPrivate(prev => !prev)
                    await updateCallback(false)
                }}
            >
                <Lock size={20} className="text-red-800"/>
            </Button>
        ) : (
            <Button
                className="inline-block align-middle mr-2 mb-1 h-fit w-fit p-1.5 bg-green-100 hover:bg-green-300"
                onClick={async (e) => {
                    e.stopPropagation()
                    setLocalIsPrivate(prev => !prev)
                    await updateCallback(true)
                }}
            >
                <Globe size={20} className="text-green-800"/>
            </Button>
        ))
}