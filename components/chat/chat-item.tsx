"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MemberRole } from "@/types";
import { UserAvatar } from "../user-avatar";
import { Crown, Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem
} from "@/components/ui/form"
import { useModel } from "@/hooks/use-model-store";
import { MemberWithProfiles } from "@/types";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ActionTooltip } from "../action-toolkit";
import UserInfoModel from "../models/userinfo-model";

interface ChatItemProps {
  id: string;
  content: string;
  username: string | undefined;
  timestamp: string;
  fileUrl: string | undefined;
  deleted: boolean;
  deletionActor: string | undefined;
  currentMember: MemberWithProfiles | undefined;
  isUpdated: boolean;
}

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="w-4 h-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="w-4 h-4 ml-2 text-rose-500" />,
  CREATOR: <Crown className="w-4 h-4 text-yellow-500" />
};

const formSchema = z.object({
  content: z.string().min(1),
});

const defaultProfilePic = "/defaultpfp.png";

export const ChatItem = ({
  id,
  content,
  username,
  timestamp,
  deletionActor,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,

}: ChatItemProps) => {
  const defaultProfilePic = "/defaultpfp.png";
  const [isEditing, setIsEditing] = useState(false);
  const { onOpen } = useModel();
  const [isUserInfoOpen, setUserInfoOpen] = useState(false);
  const [showActor, setShowActor] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<MemberWithProfiles | null>(null); // Selected profile data

  const profile = useQuery(api.profiles.getProfileByMemberId, { memberId: deletionActor as string })?.data
  const member = useQuery(api.members.getMemberById, { memberId: deletionActor as string })?.data

  const memberProfile = { ...member, profile }
  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "Escape" || event.keyCode === 27) {
        setIsEditing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: content,
    },
  });

  const createMessageMutation = useMutation(api.messages.createMessage);
  const isLoading = form.formState.isSubmitting;

  const editMessage = useMutation(api.messages.updateMessageById)

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {

      await editMessage({ content: values.content, messageId: id })

      form.reset();
      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    form.reset({
      content: content,
    });
  }, [content]);

  // Define this part to determine if the file is either an image or a PDF
  const fileType = fileUrl?.split(".").pop();
  const isPdf = fileUrl && fileType === "pdf";
  const isImage = fileUrl && !isPdf;

  const isAdmin = currentMember?.role === MemberRole.ADMIN;
  const isModerator = currentMember?.role === MemberRole.MODERATOR;
  const isCreator = currentMember?.role === MemberRole.CREATOR;
  const isOwner = currentMember?._id === member?._id;

  const canEditMessage = !deleted && isOwner && !fileUrl;
  const canDeleteMessage =
    !deleted &&
    (isCreator ||
      (isAdmin && (isOwner || member?.role === MemberRole.MODERATOR || member?.role === MemberRole.GUEST)) ||
      (isModerator && (isOwner || member?.role === MemberRole.GUEST)) ||
      (isOwner && member?.role === MemberRole.GUEST));

  const onImageError = () => {
    setImageFailed(true); // Set to true if image fails to load
  };

  // Handle opening the user info dialog
  const handleOpenUserInfo = (member: MemberWithProfiles) => {
    setSelectedProfile(member); // Set the selected profile
    setUserInfoOpen(true); // Open the dialog
  };

  return (
    <div
      className="relative group flex items-center hover:bg-black/5 p-4 transition w-full"
      onMouseEnter={() => setShowActor(true)}
      onMouseLeave={() => setShowActor(false)}
    >
      <div className="group flex gap-x-2 items-start w-full">
        <div className=" hover:cursor-pointer " onClick={() => handleOpenUserInfo(memberProfile)}>
          <UserAvatar src={memberProfile?.profile?.imageUrl || defaultProfilePic} />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p className="font-semibold text-sm mr-1">
                <span className="text-black dark:text-white">{username || "User not found"}</span>
              </p>
              {roleIconMap[member?.role]}
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{timestamp}</span>
          </div>

          {/* Image display */}
          {isImage && !imageFailed && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
            >
              <Image
                src={fileUrl}
                alt={content}
                fill
                className="object-cover"
                onError={onImageError}

              />
            </a>
          )
          }

          {/* PDF display */}
          {(imageFailed || isPdf) && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10 w-[150px]">
              <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
              >
                PDF File
              </a>
            </div>
          )}

          {/* Text content display for non-file messages */}
          {!fileUrl && !isEditing && (
            <p
              className={cn(
                "text-sm text-zinc-600 dark:text-zinc-300 break-words overflow-hidden w-full",
                deleted && "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
              )}
            >
              {deleted ? content.split(".")[0] + "." : content}
              {/* If the current user is the creator, show the full content without deletionActor */}
              {deleted && currentMember?.role === MemberRole.CREATOR && (
                <span
                  className="text-xs text-zinc-500 dark:text-zinc-400 ml-1"
                  style={{ display: showActor ? "inline" : "none" }}
                >
                {" (By: " + content.split(" (By")[1]}
                </span>
              )}
              {isUpdated && !deleted && (
                <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">(edited)</span>
              )}
            </p>
          )}

          {/* Editing form for the message */}
          {!fileUrl && isEditing && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex items-center w-full gap-x-2 pt-2"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            disabled={isLoading}
                            className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                            placeholder="Edited message"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button disabled={isLoading} size="sm" variant="primary">Save</Button>
              </form>
              <span className="text-[10px] mt-1 text-zinc-400">Press ESC to cancel or ENTER to save</span>
            </Form>
          )}
        </div>
        {canDeleteMessage && (
          <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
            {canEditMessage && (
              <ActionTooltip label="Edit">
                <Edit
                  onClick={() => setIsEditing(true)}
                  className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
                />
              </ActionTooltip>
            )}
            <ActionTooltip label="Delete">
              <Trash
                onClick={() => onOpen("deleteMessage", {
                  deleteMessage: {
                    memberId: currentMember?._id!,
                    messageId: id
                  }
                })}
                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          </div>
        )}
      </div>
      <UserInfoModel
        isOpen={isUserInfoOpen}
        onClose={() => setUserInfoOpen(false)}
        memberProfile={selectedProfile}
        currentUser={currentMember}
      />
    </div>
  );
}