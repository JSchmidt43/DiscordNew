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
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const DeleteReportModel = () => {
    const { isOpen, onClose, type, data } = useModel();
    const router = useRouter();
    const isModelOpen = isOpen && type === "deleteReport";
    const [isLoading, setIsLoading] = useState(false);

    const reportId = data?.report?.reportId;
    const title = data?.report?.title;

    const deleteReport = useMutation(api.reports.deleteReportById);


    const onClick = async () => {
        try {
            setIsLoading(true);
            await deleteReport({ reportId: reportId! })

            // If delete is successful, refresh router and close modal
            router.refresh(); 
            onClose();
            // router.push(`/servers/${server?._id}`);
        } catch (error) {
            console.log("Error deleting report:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog open={isModelOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-gray-50 dark:bg-[#292a3e] text-black dark:text-white p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Delete Report
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Are you sure you want to do this? <br />
                        <span className="font-semibold text-indigo-500">#{title} </span>
                        will be permanently deleted!!!
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

export default DeleteReportModel;
