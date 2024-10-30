"use client";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useModel } from "@/hooks/use-model-store";
import qs from "query-string";
import { useEffect } from "react";
import { ChannelType } from "@/types";

const formSchema = z.object({
    name: z
        .string()
        .min(1, {
            message: "Channel name is required!",
        })
        .refine((name) => name.toLowerCase() !== "general", {
            message: "Channel name cannot be 'general'!",
        }),
    type: z.nativeEnum(ChannelType),
});

const CreateChannelModel = () => {
    const { isOpen, onClose, type, data } = useModel();
    const router = useRouter();
    const params = useParams();
    const isModelOpen = isOpen && type === "createChannel";
    const { channelType } = data;

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: channelType || ChannelType.TEXT,
        },
    });
    useEffect(() => {
        if (channelType) {
            form.setValue("type", channelType);
        } else {
            form.setValue("type", ChannelType.TEXT);
        }
    }, [channelType, form]);

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: "/api/channels",
                query: {
                    serverId: params?.serverId,
                },
            });
            const response = await axios.post(url, values);
            console.log(response)

            // Check the response for any errors
            const { data, message, missingInfoError, channelTypeError, existsError } = response.data;

            if (response.status === 409) {
                form.setError("name", {
                    type: "server",
                    message: existsError,
                });
                return; // Stop further execution
            }

            form.reset();
            router.refresh();
            onClose();
        } catch (error: any) {
            if (error.response) {
                form.setError("name", {
                    type: "server",
                    message: error.response.data,
                });
            }
        }
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    return (
        <Dialog open={isModelOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white dark:bg-[#1e1f22] text-black dark:text-white p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl font-bold">
                        <div className="flex flex-col items-start">
                            <img
                                src="/logo.png"
                                alt="logo"
                                width={55}
                                height={55}
                                className="object-cover mb-2"
                            />
                            <p>Create New Channel</p>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-8 px-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="uppercase text-xs font-bold text-zinc-800 dark:text-zinc-400">
                                            Channel name
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-800 dark:text-zinc-400">
                                                    #
                                                </span>
                                                <Input
                                                    disabled={isLoading}
                                                    className="pl-6 bg-zinc-300/50 dark:bg-zinc-900 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                                                    placeholder="Enter Channel Name"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="uppercase text-xs font-bold text-zinc-800 dark:text-zinc-400">
                                            Channel Type
                                        </FormLabel>
                                        <Select
                                            disabled={isLoading}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-zinc-300/50 dark:bg-zinc-900 border-0 focus:ring-0 text-black dark:text-white ring-offset-0 capitalize focus:ring-offset-0 outline-none">
                                                    <SelectValue placeholder="Select a channel type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(ChannelType).map((type) => (
                                                    <SelectItem
                                                        key={type}
                                                        value={type}
                                                        className="capitalize"
                                                    >
                                                        {type.toLowerCase()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className="bg-gray-100 dark:bg-[#383338] px-6 py-4">
                            <Button disabled={isLoading} variant="primary">
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateChannelModel;
