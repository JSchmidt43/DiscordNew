"use client";

import { useModel } from "@/hooks/use-model-store";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Member, MemberRole } from "@/types";
import { Crown, ShieldAlert, ShieldCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

const formSchema = z.object({
  offenderId: z.string().min(1, "Offender is required."),
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  tags: z
    .array(z.string())
    .optional()
    .transform((tags) => tags?.filter(Boolean) || []),
});

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: <ShieldCheck className="w-4 h-4 mr-2 text-indigo-500" />,
  [MemberRole.ADMIN]: <ShieldAlert className="w-4 h-4 mr-2 text-rose-500" />,
  [MemberRole.CREATOR]: <Crown className="w-4 h-4 mr-2 text-yellow-500" />
};

const CreateReportModel = () => {
  const { isOpen, onClose, type, data } = useModel();
  const router = useRouter();

  const isModelOpen = isOpen && type === "createReport";
  const { createReport } = data;

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedOffender, setSelectedOffender] = useState<any | null>(null); // New state for selected offender

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      offenderId: "",
      description: "",
      tags: [],
    },
  });

  const isLoading = form.formState.isSubmitting;
  const createReportMutation = useMutation(api.reports.createReport);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload = { ...values, tags };

      await createReportMutation({
        reporterId: createReport?.reporterId,
        reportedMemberId: payload.offenderId,
        title: payload.title,
        description: payload.description,
        tags: payload.tags,
        serverId: createReport?.serverId
      })

      handleClose();
      router.refresh();
      // handleClose();
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleClose = () => {
    form.reset();
    setTags([]);
    setTagInput("");
    setSelectedOffender(null); // Reset selected offender when closing
    onClose();
  };

  const handleSelectOffender = (member: Member) => {
    setSelectedOffender(member); // Set selected offender
    form.setValue("offenderId", member._id); // Set offender ID in the form
  };

  return (
    <Dialog open={isModelOpen} onOpenChange={handleClose}>
      <div>
        <DialogContent className="bg-white dark:bg-[#1e1f22] text-black dark:text-white p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create Report</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className="space-y-4">
              <div className="space-y-8 px-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-800 dark:text-zinc-400">Title</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="bg-zinc-300/50 dark:bg-zinc-900 border-0 focus-visible:ring-0 text-black dark:text-white"
                          placeholder="Enter Report Title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs font-bold text-zinc-800 dark:text-zinc-400">Description</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="bg-zinc-300/50 dark:bg-zinc-900 border-0 focus-visible:ring-0 text-black dark:text-white"
                          placeholder="Enter Report Description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel className="uppercase text-xs font-bold text-zinc-800 dark:text-zinc-400">Tags</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInput}
                        disabled={isLoading}
                        className="bg-zinc-300/50 dark:bg-zinc-900 border-0 focus-visible:ring-0 text-black dark:text-white"
                        placeholder="Press Enter to add a tag"
                      />
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <div key={index} className="flex items-center bg-indigo-500 text-white rounded px-2 py-1 text-sm">
                            #{tag}
                            <button type="button" className="ml-2 text-red-500" onClick={() => handleRemoveTag(index)}>
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                </FormItem>

                <FormField control={form.control} name="offenderId" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-800 dark:text-zinc-400">Offender</FormLabel>
                    <FormControl>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="bg-zinc-300/50 dark:bg-zinc-900 border-0 focus-visible:ring-0 text-black dark:text-white w-full py-2 px-3">
                            {selectedOffender ? `${selectedOffender.profile.username}` : 'Select Offender'}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[415px] max-h-60 overflow-y-auto">
                          {createReport?.membersWithProfiles?.map((member) => (
                            <DropdownMenuItem
                              key={member._id}
                              onClick={() => handleSelectOffender(member)} // Select member
                              className="flex items-center space-x-4 py-2"
                            >
                              <img
                                src={member.profile.imageUrl || "/default-avatar.jpg"}
                                alt={member.profile.username}
                                className="w-8 h-8 rounded-full"
                              />
                              <span className="flex items-center">
                                {member.profile.username}
                                <span className="ml-2">{roleIconMap[member.role]}</span>
                              </span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isLoading} variant="primary">Create</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default CreateReportModel;
