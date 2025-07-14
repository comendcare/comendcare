import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@comend/components/ui/alert-dialog"
import { buttonVariants } from "@comend/components/ui/button"

interface AreYouSureProps {
    isOpen: boolean
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
    callback: (args?: any) => void // Consider specifying a more detailed type for the callback if possible
    callbackData?: any // Consider specifying a more precise type if you know the shape of `callbackData`
    title: string
    message: string
}

export default function AreYouSure({ isOpen, setIsOpen, callback, callbackData, title, message }: AreYouSureProps) {
    const handleImSure = () => {
        callbackData ? callback(callbackData) : callback()
        setIsOpen(false)
    }

    const handleClose = () => {
        setIsOpen(false)
    }

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{message}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleClose}>{`Cancel`}</AlertDialogCancel>
                    <AlertDialogAction
                        className={buttonVariants({ variant: "destructive" })}
                        onClick={() => {
                            handleImSure()
                        }}
                    >
                        {`I'm sure`}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
