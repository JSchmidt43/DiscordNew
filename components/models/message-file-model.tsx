"use client"

import { Button } from "@/components/ui/button";
import FileUpload from "../file-upload";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios";
import qs from "query-string"

import {
Dialog,
DialogContent,
DialogDescription,
DialogFooter,
DialogHeader,
DialogTitle
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { useModel } from "@/hooks/use-model-store";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";


const formSchema = z.object({
    fileUrl : z.string().min(1, {
        message: "Attachment is required!"
    })
})

const MessageFileModel = () => {
    const { isOpen, onClose, type, data } = useModel();
    const router = useRouter();

    const isModelOpen = isOpen && type === "messageFile";
    const { fileData } = data;

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fileUrl: ""
        }
    })

    const handleClose = () => {
        form.reset();
        onClose();
    }

    const isLoading = form.formState.isSubmitting;
    const sendMessage = useMutation(api.messages.createMessage)

    const onSubmit = async(values: z.infer<typeof formSchema>) => {
        try {

            const messageData = {
                content : values.fileUrl,
                memberId : fileData?.memberId!,
                channelId: fileData?.channelId!,
                fileUrl: values.fileUrl
            }

            await sendMessage(messageData)

            form.reset();
            router.refresh();
            handleClose();
        } catch (error) {
            console.log(error)
        }
    }

    return (  
        <Dialog open={isModelOpen}  onOpenChange={handleClose}>
            <DialogContent className="bg-white dark:bg-[#1e1f22] text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Add an attachment
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Send a file as message
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-8 px-6">
                            <div className="flex items-center justify-center text-center">
                            <FormField 
                                control={form.control}
                                name="fileUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <FileUpload
                                                endpoint="messageFile" 
                                                value={field.value}
                                                onChange={field.onChange}
                                                type="message"
                                                />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            </div>
                        </div>
                        <DialogFooter className="bg-gray-100 dark:bg-[#383338] px-6 py-4">
                            <Button disabled={isLoading} variant="primary">
                                Send
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
 
export default MessageFileModel;