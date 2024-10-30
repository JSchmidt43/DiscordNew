"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useRouter } from "next/navigation";
import { useModel } from "@/hooks/use-model-store";
import { useEffect, useState } from "react"; 

// Define validation schema
const formSchema = z.object({
  serverLink: z.string().url({
    message: "Please enter a valid server link!",
  }),
});

const JoinServerModel = () => {
  const { isOpen, onClose, type } = useModel();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState(""); // Local state for error message
  const isModelOpen = isOpen && type === "joinServer"; // Only open if the model type is "joinServer"

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serverLink: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { serverLink } = values; // Get the server link from the form values

    // Extract the UUID from the serverLink
    const inviteCodeMatch = serverLink.match(/\/invite\/([a-f0-9\-]+)/); // Regex to extract UUID
    const inviteCode = inviteCodeMatch ? inviteCodeMatch[1] : null; // Get the UUID

    if (!inviteCode) {
      setErrorMessage("Invalid server link! Please provide a valid link.");
      return;
    }


    try {
      // Make a GET request to check if the server exists
      const response = await fetch(`/api/servers/check?inviteCode=${inviteCode}`, {
        method: "GET",
      });

      const data = await response.json(); // Parse JSON response

      if (response.ok && data.exists) {
        setErrorMessage("");


        window.location.href = serverLink; // Set the URL to the serverLink
        
      } else {
        // If the server does not exist, show an error message
        setErrorMessage("Server not found! Please check your invite link.");
      }
    } catch (error) {
      console.error("Error checking server:", error);
      setErrorMessage("An error occurred while checking the server.");
    }
  };
  

  const handleClose = () => {
    form.reset();
    setErrorMessage(""); // Reset error message on close
    onClose();
  };

  return (
    <Dialog open={isModelOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white dark:bg-[#1e1f22] text-black dark:text-white p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Join a Server
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Enter the server link below to join.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              {/* Server link input field */}
              <FormField
                control={form.control}
                name="serverLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-800 dark:text-zinc-400">
                      Server Link
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 dark:bg-zinc-900 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                        placeholder="Enter server link"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Error message display */}
            {errorMessage && (
              <div className="text-red-500 text-center px-6">
                {errorMessage}
              </div>
            )}
            {/* Footer with Join button */}
            <DialogFooter className="bg-gray-100 dark:bg-[#383338] px-6 py-4">
              <Button disabled={isLoading} variant="primary">
                Join Server
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinServerModel;
