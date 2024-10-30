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
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";


const LeaveServerModel = () => {
    const { isOpen, onClose, type, data} = useModel();
    const router = useRouter();
    const isModelOpen = isOpen && type === "leaveServer";
    const { server } = data;

    const [isLoading, setIsLoading] = useState(false);

    const onClick = async() => {
        try {
            setIsLoading(true);

            await axios.patch(`/api/servers/${server?._id}/leave`);
            router.refresh();
            onClose();
        } catch (error) {
            console.log(error);

        } finally{
            setIsLoading(false);
        }
    }

    return (  
        <Dialog open={isModelOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white dark:bg-[#1e1f22] text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Leave Server
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Are you sure you want to leave <span className="font-semibold text-indigo-500">{server?.name}</span>?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="bg-gray-100 dark:bg-[#383338] px-6 py-4">
                    <div className="flex items-center justify-between w-full">
                        <Button 
                         disabled={isLoading}
                         onClick={()=>onClose()}
                         variant="primary"
                        >
                            Cancel
                        </Button>
                        <Button
                          disabled={isLoading}
                          onClick={()=>{onClick()}}
                          variant="destructive"
                        >
                            Confirm
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
 
export default LeaveServerModel;