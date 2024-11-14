"use client"
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MemberRole, Profile, roleHierarchy } from "@/types";
import { UserAvatar } from "../user-avatar";
import { Crown, Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from "lucide-react";
import Image from "next/image";
import { act, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useModel } from "@/hooks/use-model-store";
import { MemberWithProfiles } from "@/types";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ActionTooltip } from "../action-toolkit";
import UserInfoModel from "../models/userinfo-model";

interface ChatItemProps {
  id?: string;
  content?: string;
  timestamp?: string;
  sender?: string;
  receiver?: string;
  currentUserId?: string
  fileUrl?: string | undefined;
  deleted?: boolean;
  isUpdated?: boolean;
}

const formSchema = z.object({
  content: z.string().min(1),
});

const defaultProfilePic = "/defaultpfp.png";

export const DirectChatItem = ({
  id,
  content,
  timestamp,
  sender,
  receiver,
  fileUrl,
  currentUserId,
  deleted,
  isUpdated,
}: ChatItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { onOpen } = useModel();
  const [imageFailed, setImageFailed] = useState(false);

  const senderProfile = useQuery(api.profiles.getProfileById, { profileId: sender! })?.data;
  const receiverProfile = useQuery(api.profiles.getProfileById, { profileId: receiver! })?.data;


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

  const editMessage = useMutation(api.directMessages.updateMessageById);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await editMessage({ content: values.content, messageId: id! });
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
  const isOwner = sender === currentUserId;

  const canEditMessage = !deleted && isOwner && !fileUrl;
  const canDeleteMessage = !deleted && isOwner;

  const onImageError = () => {
    setImageFailed(true); // Set to true if image fails to load
  };

  return (
    <div
      className="relative group flex items-center hover:bg-black/5 p-4 transition w-full"
    >
      <div className="group flex gap-x-2 items-start w-full">
        <div
          className="hover:cursor-pointer"
        >
          <UserAvatar
            src={senderProfile?.imageUrl || defaultProfilePic}
          />
        </div>


        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p className="font-semibold text-sm mr-1">
                <span className="text-black dark:text-white">
                  {senderProfile?.username || "User not found"}
                </span>
              </p>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timestamp}
            </span>
          </div>
          <div>
            {/* Render file or image attachments */}
            {fileUrl && !deleted && isImage && !imageFailed && (
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
            )}

            {/* Render PDF file */}
            {fileUrl && !deleted && (imageFailed || isPdf) && (
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

            {/* Show only content if message is deleted */}
            {deleted && (
              <p
                className="text-sm italic text-zinc-500 dark:text-zinc-400 break-words overflow-hidden w-full mt-1"
              >
                {content}
              </p>
            )}

            {/* Regular text content */}
            {!fileUrl && !isEditing && !deleted && (
              <p
                className={cn(
                  "text-sm text-zinc-600 dark:text-zinc-300 break-words overflow-hidden w-full",
                  deleted && "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
                )}
              >
                {content}

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
                                disabled={false}
                                className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-auto w-full rounded-md"
                                placeholder="Edit message..."
                                {...field}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button variant="outline" type="submit" className="h-9 text-sm rounded-md">
                      Save
                    </Button>
                  </form>
                  <span className="text-[10px] mt-1 text-zinc-400">Press esacpe to cancel, Enter to save</span>
                </Form>
              )}
          </div>
        </div>
        {canDeleteMessage && (
        <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1
          -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
          {canEditMessage && (
            <ActionTooltip label="Edit">
              <Edit
                onClick={() => setIsEditing(true)}
                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500
                    hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          )}
          <ActionTooltip label="Delete">
            <Trash
              onClick={() => onOpen("deleteDirectMessage", {
                deleteDirectMessage: {
                  profileId: currentUserId!,
                  messageId: id!
                }
              })}
              className="cursor-pointer ml-auto w-4 h-4 text-zinc-500
                  hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
        </div>
      )}
      </div>
    </div>
  );
};

