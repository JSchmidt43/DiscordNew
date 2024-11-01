"use client";
import { useModel } from "@/hooks/use-model-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import axios from "axios";
import { redirect, useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { Member, MemberRole, ServerWithChannelsWithMembers } from "@/types";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const DeleteServerModel = () => {
  const { isOpen, onClose, type, data } = useModel();
  const router = useRouter();
  const isModelOpen = isOpen && type === "deleteServer";
  const { server } = data as { server: ServerWithChannelsWithMembers };

  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [confirmDeletionText, setConfirmDeletionText] = useState(""); // Initialize state for confirmation text
  const [isConfirmed, setIsConfirmed] = useState(false); // State to track confirmation status

  // Update confirmDeletionText when server changes
  useEffect(() => {
    if (server) {
      const adminRole = server?.members.find(
        (member: Member) => member.role === MemberRole.CREATOR
      );
      if (adminRole) {
        const adminNameForDeleteServer = adminRole.profile.username;
        const requiredText = `${adminNameForDeleteServer}/${server.name}`;
        setConfirmDeletionText(requiredText);
      }
    }
  }, [server?.name, server?.imageUrl]);
  const deleteServer = useMutation(api.servers.deleteServerById)

  const onDeleteClick = async () => {
    try {
      await deleteServer({serverId: server._id})
      return redirect("/")
      router.refresh();
      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    setShowConfirmDialog(true);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setConfirmationText(""); 
    onClose();
  };

  const handleConfirmDelete = () => {
    if (confirmationText === confirmDeletionText) {
      onDeleteClick();
      setConfirmationText("");
    }
  };

  const handleConfirmationInputChange = (e: any) => {
    const { value } = e.target;
    setConfirmationText(value);
    setIsConfirmed(value === confirmDeletionText); // Update confirmation status
  };

  return (
    <>
      <Dialog open={isModelOpen} onOpenChange={onClose}>
        <DialogContent className="bg-white dark:bg-[#1e1f22] text-black dark:text-white p-0 overflow-hidden">
          <DialogHeader className="pt-8 px-6">
            <DialogTitle className="text-2xl text-center font-bold">
              Delete Server
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-500">
              Are you sure you want to do this? <br />
              <span className="font-semibold text-indigo-500">
                "{server?.name}"{" "}
              </span>
              will be permanently deleted!!!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-gray-100 dark:bg-[#383338] px-6 py-4">
            <div className="flex items-center justify-between w-full">
              <Button
                disabled={isLoading}
                onClick={() => onClose()}
                variant="primary"
              >
                No
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                variant="destructive"
              >
                Yes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showConfirmDialog} onOpenChange={() => {
            setShowConfirmDialog(false)
            onClose();
            setConfirmationText(""); 
        }}>
        <DialogContent className="bg-white dark:bg-[#1e1f22] text-black dark:text-white p-0 overflow-hidden">
          <DialogHeader className="pt-8 px-6">
            <DialogTitle className="text-2xl text-center font-bold">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-500">
              Please type{" "}
              <span className="font-semibold select-none">
                "{confirmDeletionText}"
              </span>{" "}
              to confirm.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-grey-100 px-6 py-4">
            <div className="flex flex-col items-center justify-between w-full space-y-4">
              <Input
                className="bg-zinc-300/50 border border-red-500
                                focus-visible:ring-0 dark:text-white
                                focus-visible:ring-offset-0
                                "
                value={confirmationText}
                onChange={handleConfirmationInputChange}
                placeholder="Type here"
              />
              <div className="flex items-center justify-between w-full">
                <Button
                  disabled={isLoading}
                  onClick={handleCancel}
                  variant="primary"
                >
                  Cancel
                </Button>
                <Button
                  disabled={isLoading || !isConfirmed}
                  onClick={() => {
                    handleConfirmDelete();
                    setShowConfirmDialog(false);
                    onClose();
                  }}
                  variant="destructive"
                >
                  Confirm
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteServerModel;
