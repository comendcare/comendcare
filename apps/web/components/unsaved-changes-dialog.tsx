"use client"

import LoadingDots from "@comend/components/icons/loading-dots"
import { Button } from "@comend/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@comend/components/ui/dialog"

export const UnsavedChangesDialog = ({
    isSaving,
    isClosing,
    setIsClosing,
    isOpen,
    setIsOpen,
    closeDialog,
    form,
    formSubmit,
}: {
    isSaving: boolean
    isClosing: boolean,
    setIsClosing: React.Dispatch<React.SetStateAction<boolean>>,
    isOpen: boolean,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
    closeDialog: (values?: any) => void,
    form: any,
    formSubmit: (values?: any, ...rest: any[]) => void,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>You have unsaved changes.</DialogTitle>
                    <DialogDescription>If you close this dialog your changes will not be saved.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            variant={'secondary'}
                            // set back to a non-closing state, so future closes can also trigger
                            onClick={() => setIsClosing(false)} 
                        >
                            Back to edit
                        </Button>
                    </DialogClose>
                    <Button
                        variant={'destructive'}
                        onClick={() => closeDialog()}
                    >
                        Discard changes
                    </Button>
                    <Button 
                        type="submit"
                        variant={'cta'}
                        onClick={async () => {
                            const isValid = await form.trigger()
                            console.log(`isValid`, isValid)
                            if (isValid) formSubmit(form.getValues())
                            setIsOpen(false)
                        }}
                    >
                        {isSaving 
                            ? (
                                <div className="w-[81px] flex justify-center items-center">
                                    <LoadingDots/>
                                </div>
                            ) 
                            : ("Save changes")
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}