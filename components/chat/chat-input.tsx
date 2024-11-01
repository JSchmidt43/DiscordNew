"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Plus } from "lucide-react";
import { Input } from "../ui/input"; // Assuming your Input component is in ui/input
import { useModel } from "@/hooks/use-model-store";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { EmojiPicker } from "../emoji-picker";
import { useMutation } from "convex/react";
import { useRef } from "react";

interface ChatInputProps {
    channelId: string;
    serverId: string;
    memberId: string;
    username: string;
    name: string;
    type: "conversation" | "channel";
}

const formSchema = z.object({
    content: z.string().min(1),
});

export const ChatInput = ({
    channelId,
    serverId,
    memberId,
    username,
    name,
    type,
}: ChatInputProps) => {
    const { onOpen } = useModel();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: "",
        },
    });

    const isLoading = form.formState.isSubmitting;
    const createMessageMutation = useMutation(api.messages.createMessage);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await createMessageMutation({
                content: values.content,
                memberId,
                username,
                channelId,
            });

            form.reset();

            router.refresh(); // Optionally refresh the router
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="relative p-4 pb-6">
                                    <button
                                        type="button"
                                        onClick={() => onOpen("messageFile", { fileData: { channelId, memberId, username, serverId } })}
                                        className="absolute top-7 left-8 h-[24px] w-[24px] bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600 dark:hover:bg-zinc-300 transition rounded-full p-1 flex items-center justify-center"
                                    >
                                        <Plus className="text-white dark:text-[#313338]" />
                                    </button>
                                    <Input
                                        disabled={isLoading}
                                        className="px-14 py-6 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                                        placeholder={`Message ${type === "conversation" ? name : "#" + name}`}
                                        {...field} // Spread the field props from react-hook-form
                                    />
                                    <div className="absolute top-7 right-8">
                                        <EmojiPicker onChange={(emoji: string) => field.onChange(`${field.value}${emoji}`)} />
                                    </div>
                                </div>
                            </FormControl>
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
};
