"use client"
import { useModel } from "@/hooks/use-model-store";
import {
Dialog,
DialogContent,
DialogDescription,
DialogFooter,
DialogHeader,
DialogTitle
} from "@/components/ui/dialog"
import { Button } from "../ui/button";
import {  useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";



const DeleteDirectMessageModel = () => {
    const { isOpen, onClose, type, data} = useModel();

    const isModelOpen = isOpen && type === "deleteDirectMessage";
    const { deleteDirectMessage } = data;

    const [isLoading, setIsLoading] = useState(false);

    const messageDelete = useMutation(api.directMessages.deleteMessageById);

    const onClick = async() => {
        try {
            await messageDelete({profileId: deleteDirectMessage?.profileId!, messageId: deleteDirectMessage?.messageId!});
            onClose();

        } catch (error) {
            console.log(error);

        } finally{
            setIsLoading(false);
        }
    }


    return (  
        <>  
            <Dialog open={isModelOpen} onOpenChange={onClose}>
                <DialogContent className="bg-white dark:bg-[#1e1f22] text-black dark:text-white p-0 overflow-hidden">
                    <DialogHeader className="pt-8 px-6">
                        <DialogTitle className="text-2xl text-center font-bold">
                            Delete Message
                        </DialogTitle>
                        <DialogDescription className="text-center text-zinc-500">
                            Are you sure you want to do this? <br/>
                            This message will be permanently deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="bg-gray-100 dark:bg-[#383338] px-6 py-4">
                        <div className="flex items-center justify-between w-full">
                            <Button 
                            disabled={isLoading}
                            onClick={()=>onClose()}
                            variant="ghost"
                            >
                                Cancel
                            </Button>
                            <Button
                            onClick={onClick}
                            disabled={isLoading}                  
                            variant="primary"
                            >
                                Confirm
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>

    );
}
 
export default DeleteDirectMessageModel;