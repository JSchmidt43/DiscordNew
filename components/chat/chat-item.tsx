"use client";

import * as z from "zod";
import axios from "axios";
import qs from "query-string";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Member, MemberRole, Profile } from "@/types";
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
  const [isImageValid, setIsImageValid] = useState(true); // Track image validity

  const profile = useQuery(api.profiles.getProfileByMemberId, { memberId: deletionActor as string })?.data
  const member = useQuery(api.members.getMemberById, { memberId: deletionActor as string})?.data

  const memberProfile= { ...member, profile }
  

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
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {


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

  const fileType = fileUrl?.split(".").pop();

  const isPdf = fileType === "pdf" && fileUrl;
  const isImage = !isPdf && fileUrl;

  const handleOpenUserInfo = async (member: MemberWithProfiles | null) => {
    if (!member) return; // Avoid trying to fetch if member is null/undefined

    const fetchedUser = await axios.get(`/api/members/${member._id}`, {
      params: {
        serverId: member.serverId,
      },
    });
    console.log(fetchedUser.data);
    setUserInfoOpen(true);
  };

  return (
    <div
      className={`relative group flex items-center hover:bg-black/5 p-4 transition w-full`}
      onMouseEnter={() => setShowActor(true)}  // Set hover state to true on mouse enter
      onMouseLeave={() => setShowActor(false)} // Set hover state to false on mouse leave
    >
      <div className={`group flex gap-x-2 items-start w-full`}>
        <UserAvatar src={memberProfile?.profile?.imageUrl} />
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p className="font-semibold text-sm mr-1">
                <span className="text-black dark:text-white">
                  {username || "User not found"}
                </span>
              </p>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timestamp}
            </span>
          </div>
          {isImage && isImageValid ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
            >
              <Image
                src={fileUrl}
                alt="Image not found"
                fill
                className="object-cover"
                onLoad={() => setIsImageValid(true)} // Image successfully loaded
                onError={() => setIsImageValid(false)} // Image failed to load
              />
            </a>
          ) : (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
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
          
          {!fileUrl && !isEditing && (
            <p
              className={cn(
                "text-sm text-zinc-600 dark:text-zinc-300 break-words overflow-hidden w-full",
                deleted && "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
              )}
            >
              {content}
              {/* Show deletionActor only for the creator when hovered */}
              {deleted && deletionActor && showActor && currentMember?.role === MemberRole.CREATOR && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">
                  ({deletionActor})
                </span>
              )}

              {isUpdated && !deleted && (
                <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                  (edited)
                </span>
              )}
            </p>
          )}

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
                <Button disabled={isLoading} size="sm" variant="primary">
                  Save
                </Button>
              </form>
              <span className="text-[10px] mt-1 text-zinc-400">
                Press ESC to cancel or ENTER to save
              </span>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

