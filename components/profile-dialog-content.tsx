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
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DialogTitle } from "@radix-ui/react-dialog";
import toast from "react-hot-toast";
import { FriendRequestWithProfile, Profile } from "@/types";

const statuses = [
    '🟢 Online',
    '🌙 Idle',
    '🔴 Offline',
    '⛔ Do Not Disturb',
    '💬 Free to chat',
    '🕺🏻 Taking a break'
]

const addFriendFormSchema = z.object({
    username: z.string().min(1, {message: 'Username is required!'}),
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
            username: ''
        }
    });

    // Call the query at the top level and let it run whenever 'username' value from the form changes.
    const username = form.watch('username');
    const receiverUser = useQuery(api.profiles.getProfileByUsername, { username })?.data;
    const sendRequest = useMutation(api.friends.sendFriendRequest);

    const onSubmit = async ({ username }:z.infer<typeof addFriendFormSchema>) => {
        try {
            if (!receiverUser) {
                // If the user doesn't exist, show an error message in the form
                form.setError("username", {
                    type: "manual",
                    message: "User not found! Please check the username.",
                });
                return; // Exit if the user does not exist
            }

            const sendRequestResponse = await sendRequest({
                senderProfileId: profile._id,
                receiverProfileId: receiverUser._id
            });

            if (sendRequestResponse.data) {
                // Show toaster message
                toast.success("Friend request sent successfully!");
            } 
            else if (sendRequestResponse.sameError){
                toast.error("Cannot send friend request to yourself.");

            }
            
            else if(sendRequestResponse.error) {
                toast("Friend request already sent.", {
                    icon: '👏'
                });
            }

        } catch (error) {
            console.log(error)
            toast.error("An error occurred while sending the request.");

        }
        
    }

    const isStatusChanged = status !== temporaryStatus;
    const statusUpdate = useMutation(api.profiles.updateStatusById);
    const friendRequests = profile ? useQuery(api.friends.getFriendRequestsById, { profileId: profile._id })?.data : [];

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
                <DialogTitle></DialogTitle>
                <DialogTrigger>
                    <div className="flex items-center space-x-2">
                        <UserRoundSearch/>
                        <p>Send friend request</p>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField control={form.control} name='username' 
                            render={({field})=><FormItem>
                                <FormLabel className="text-black dark:text-white">Username</FormLabel>
                                <FormControl>
                                    <Input placeholder="JohnDoe123" {...field}/>
                                </FormControl>
                                <FormDescription>
                                    Enter your friend&apos;s username to send a friend request.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>}/>
                            <Button type="submit" disabled={!form.formState.isValid}>          
                                Send
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            <Separator/>
            <Dialog>
                <DialogTrigger>
                    <div className="flex items-center space-x-2">
                        <Handshake/>
                        <p>View Friend requests</p>
                    </div>
                </DialogTrigger>
                <DialogContent  className="max-h-[400px] overflow-y-auto overflow-x-hidden" >
                    <div className="pr-6 -mb-6"> {/* Add padding-right to add space between the scrollbar and the content */}
                    <p> <b>Friend Requests</b></p>
                            {friendRequests && friendRequests.length > 0 ? (
                            friendRequests.map((request) => (
                                <FriendRequest key={request._id} request={request} />
                            ))
                        ) : (
                            <p className="text-sm mb-4">No friend requests.</p>
                        )}
                   </div>
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

// Component to handle each friend request and fetch sender profile
const FriendRequest = ({ request }: { request: FriendRequestWithProfile }) => {
    const senderProfile = useQuery(api.profiles.getProfileById, { profileId: request.sender })?.data;
    // Move the useMutation hooks outside of the conditional rendering
    const acceptRequest = useMutation(api.friends.acceptFriendRequest);
    const declineRequest = useMutation(api.friends.declineFriendRequest);

    if (!senderProfile) {
        return <p>Loading sender profile...</p>;
    }

    // Example functions for handling the accept and decline actions
    const handleAccept = (requestId: string, senderProfile: Profile) => {
        acceptRequest({ requestId });
        toast.success(`You are now friends with ${senderProfile.username}.`)
        console.log("Accepted request with ID:", requestId);
    };

    const handleDecline = async (requestId: string) => {
        declineRequest({ requestId })
        console.log("Declined request with ID:", requestId);
    };

    return (
        <div key={request._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-transparent rounded-lg shadow-md -ml-4">
            {/* Avatar and user info */}
            <div className="flex items-center flex-grow">
                <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={senderProfile.imageUrl} />
                    <AvatarFallback>{senderProfile.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{senderProfile.username}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{senderProfile.email}</p>
                </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex space-x-3 ml-4">
                <Button variant="primary" onClick={() => handleAccept(request._id, senderProfile)} className="bg-green-500 hover:bg-green-600">
                    Accept
                </Button>
                <Button variant="secondary" onClick={() => handleDecline(request._id)} className="bg-red-500 hover:bg-red-600">
                    Decline
                </Button>
            </div>
        </div>
    );
};





export default ProfileDialogContent;