import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MemberRole, roleHierarchy } from "@/types";
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
import UserInfoModel from "../models/userinfo-model";
import { ActionTooltip } from "../action-toolkit";

interface ChatItemProps {
  id?: string;
  content?: string;
  timestamp?: string;
  fileUrl?: string | undefined;
  deleted?: boolean;
  deletionActor?: string | undefined;
  currentMember?: MemberWithProfiles | undefined;
  isUpdated?: boolean;
  action?: string;
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
  timestamp,
  deletionActor,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  action,
}: ChatItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { onOpen } = useModel();
  const [isUserInfoOpen, setUserInfoOpen] = useState(false);
  const [showActor, setShowActor] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<MemberWithProfiles | null>(null); // Selected profile data

  const memberRef = useRef(null);

  const profile = useQuery(api.profiles.getProfileByMemberId, {
    memberId: deletionActor || '', // Default to empty string if undefined
  })?.data;

  memberRef.current = currentMember;

  const username = useQuery(api.profiles.getProfileByMemberId, { memberId: deletionActor!})?.data?.username;


  const member = useQuery(api.members.getMemberById, {
    memberId: deletionActor || '', // Same here
  })?.data;

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

  const editMessage = useMutation(api.messages.updateMessageById);

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

  // Check if this message is a system message
  const isSystemMessage = action && action.trim() !== ""; // Check if the action is non-empty or matches specific actions for system messages

  return (
    <div
      className="relative group flex items-center hover:bg-black/5 p-4 transition w-full"
      onMouseEnter={() => setShowActor(true)}
      onMouseLeave={() => setShowActor(false)}
    >
      <div className="group flex gap-x-2 items-start w-full">
        {/* Only show the user avatar if it's not a system message */}
        {!isSystemMessage && (
          <div
            className="hover:cursor-pointer"
            onClick={() => handleOpenUserInfo(memberProfile)}
          >
            <UserAvatar
              src={memberProfile?.profile?.imageUrl || defaultProfilePic}
            />
          </div>
        )}

        <div className="flex flex-col w-full">
          {/* User information (only show username and timestamp if not a system message) */}
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              {/* Show username only if not a system message */}
              {!isSystemMessage && (
                <>
                  <p className="font-semibold text-sm mr-1">
                    <span className="text-black dark:text-white">
                      {username || "User not found"}
                    </span>
                  </p>
                  {roleIconMap[member?.role]}
                </>
              )}
            </div>
            {/* Show timestamp only if not a system message */}
            {!isSystemMessage && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {timestamp}
              </span>
            )}
          </div>

          {/* Render system message */}
          {isSystemMessage ? (
            <>
              {action === "KICK" && (
                <div
                  className={cn(
                    "flex justify-center items-center p-3 rounded-md border text-sm text-center italic bg-red-500 border-red-300 text-black"
                  )}
                >
                  <p>{content} -- {timestamp?.slice(-5)}</p>
                </div>
              )}
              {action === "LEAVE" && (
                <div
                  className={cn(
                    "flex justify-center items-center p-3 rounded-md border text-sm text-center italic bg-yellow-500 border-yellow-300 text-black "
                  )}
                >
                  <p>{content} -- {timestamp?.slice(-5)}</p>
                </div>
              )}
              {action === "JOIN" && (
                <div
                  className={cn(
                    "flex justify-center items-center p-3 rounded-md border text-sm text-center italic bg-green-500 border-green-300 text-black "
                  )}
                >
                  <p>{content} -- {timestamp?.slice(-5)}</p>
                </div>
              )}
              {/* Fallback for other system messages */}
              {!["KICK", "LEAVE", "JOIN"].includes(action) && (
                <div
                  className={cn(
                    "flex justify-center items-center p-3 rounded-md border text-sm text-center italic bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-300"
                  )}
                >
                  <p>{content}</p>
                </div>
              )}
            </>
          ) : (
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
                  {
                    // Regular text content for non-file messages
                    showActor && isCreator
                      ? content // Full content for creator on hover
                      : `${content!.split(".")[0]}.` // Truncated content for others
                  }
                </p>
              )}

              {/* Regular text content */}
              {!fileUrl && !isEditing && !action?.trim() && !deleted && (
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
          )}
        </div>
      </div>
      {!isSystemMessage && canDeleteMessage && (
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
              onClick={() => onOpen("deleteMessage", {
                deleteMessage: {
                  memberId: currentMember?._id!,
                  messageId: id!
                }
              })}
              className="cursor-pointer ml-auto w-4 h-4 text-zinc-500
                  hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
        </div>
      )}
      <UserInfoModel
        isOpen={isUserInfoOpen}
        onClose={() => setUserInfoOpen(false)}
        memberProfile={selectedProfile}
        currentUser={memberRef.current}
      />
    </div>
  );
};

