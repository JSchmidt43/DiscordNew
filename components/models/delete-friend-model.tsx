"use client";
import { useModel } from "@/hooks/use-model-store";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const DeleteFriend = () => {
    const { isOpen, onClose, type, data } = useModel();
    const router = useRouter();
    const isModelOpen = isOpen && type === "deleteFriend";
    const { friend } = data;
    const [isLoading, setIsLoading] = useState(false);
    
    const removeFriend = useMutation(api.friends.deleteFriend)

    const onClick = async () => {
        try {
            await removeFriend({
                requestId: friend?.friendshipId!,
            });
            router.push("/directMessages");
            onClose();
            // router.push(`/servers/${server?._id}`);
        } catch (error) {
            console.log("Error removing friend:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog open={isModelOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white dark:bg-[#1e1f22] text-black dark:text-white p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Remove Friend
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Are you sure you want to do this? <br />
                        <span className="font-semibold text-indigo-500">{friend?.name} </span>
                        will be removed from friends and all the chats will be deleted!!!
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="bg-gray-100 dark:bg-[#383338] px-6 py-4">
                    <div className="flex items-center justify-between w-full">
                        <Button
                            disabled={isLoading}
                            onClick={onClose}
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
    );
};

export default DeleteFriend;
