"use client"
import {
    Card,
    CardTitle,
  } from "@/components/ui/card"
import { UserButton } from "@clerk/nextjs";
import { Handshake, Pencil, UserRound, UserRoundSearch } from "lucide-react";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea"
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";


const statuses = [
    '🟢 Online',
    '🌙 Idle',
    '🔴 Offline',
    '⛔ Do Not Disturb',
    '💬 Free to chat',
    '🕺🏻 Taking a break'
]

const addFriendFormSchema = z.object({
    email: z.string().min(1, {message: 'Email is required'}).email(),
})

const ProfileDialogContent = ({profile } : any) => {

    const [status, setStatus] = useState(profile?.status ?? "")
    const [updateStatusDialogue, setUpdateStatusDialogue] = useState(false);
    const [temporaryStatus, setTemporaryStatus] = useState(""); // Temporary status

    // Open or close the dialog and reset the temporaryStatus to the current status when opened
    const handleOpenChange = (isOpen: boolean) => {
        setUpdateStatusDialogue(isOpen);
        if (isOpen) {
        setTemporaryStatus(status); // Reset to current status when opening
        }
    };

    const form = useForm<z.infer<typeof addFriendFormSchema>>({
        resolver: zodResolver(addFriendFormSchema),
        defaultValues: {
            email: ''
        }
    });

    async function onSubmit({ email }:z.infer<typeof addFriendFormSchema>){
        console.log(email)
    }

    const isStatusChanged = status !== temporaryStatus;
    const statusUpdate = useMutation(api.profiles.updateStatusById);

    const handleUpdateStatus = async () => {
        try {
            
            await statusUpdate({ 
                profileId: profile._id,
                status: temporaryStatus
            })

            setStatus(temporaryStatus);
            setUpdateStatusDialogue(false);

        } catch (error) {
            console.log(error);
        }
    };
    
    return (
    <div>
        <Card className="border-0 bg-transparent flex flex-col space-y-4">
            <CardTitle>Profile</CardTitle>
            <div>
                <Avatar className="h-20 w-20 mx-auto">  
                    <AvatarImage src={profile?.imageUrl}/>
                    <AvatarFallback>{profile?.username ?? 'User'}</AvatarFallback>        
                </Avatar>
            </div>
        </Card>
        <div className="flex flex-col gap-y-6 mt-4">
            <div className="flex items-center space-x-2">
                     <UserRound />
                     <Input disabled 
                     placeholder="Name" 
                     value={profile?.username} 
                     className="border-none outline-none ring-0"/>
            </div>
            <Separator/>
            <div className="flex items-center justify-center space-x-5">
                <p>Manage your account</p>
                <UserButton appearance={{
                    elements: {
                        userButtonPopoverCard: {
                            pointerEvents: 'initial'
                        }
                    }
                }}/>
            </div>

            <Separator/>
            <Dialog>
                <DialogTrigger>
                    <div className="flex items-center space-x-2">
                        <UserRoundSearch/>
                        <p>Send friend request</p>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField control={form.control} name='email' 
                            render={({field})=><FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="friend@email.com" disabled={true} {...field}/>
                                </FormControl>
                                <FormDescription>
                                    Enter your friend&apos;s email to send a friend request.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>}/>
                            <Button type="submit" disabled={true}>Submit</Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            <Separator/>
            <Dialog>
                <DialogTrigger>
                    <div className="flex items-center space-x-2">
                        <Handshake/>
                        <p>View Friend request</p>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <p className="text-xl text-center font-bold">No friend request yet</p>
                </DialogContent>
            </Dialog>
            <Separator/>
            <Dialog open={updateStatusDialogue} onOpenChange={handleOpenChange}>
                <DialogTrigger>
                    <div className="flex items-center space-x-2">
                        <Pencil/>
                        <p>{status}</p>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <Textarea placeholder={profile?.status ?? "Choose a status or enter custom status"} className="resize-none h-48"
                    value={temporaryStatus}
                    onChange={(e) => setTemporaryStatus(e.target.value)}/>
                    <div>
                        {statuses.map(statusOption => (
                            <p
                            key={statusOption}
                            className={`px-2 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer ${
                              temporaryStatus === statusOption ? 'bg-gray-200 dark:bg-gray-600' : ''
                            }`}
                            onClick={() => setTemporaryStatus(statusOption)} // Update temporary status
                          >
                            {statusOption}
                          </p>
                        ))}
                    </div>
                    <Button 
                        className="ml-auto w-fit bg-blue-700" 
                        disabled={!isStatusChanged} 
                        type="button"
                        onClick={handleUpdateStatus}
                        >Update Status</Button>
                </DialogContent>
            </Dialog>
        </div>
    </div>)
};


export default ProfileDialogContent;