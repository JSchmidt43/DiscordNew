import { api } from "@/convex/_generated/api";
import { currentProfile } from "@/lib/current-profile";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

interface ServerIdPageProps {
  params: {
    serverId: string
  }
}
const ServerIdPage = async ({
  params
}: ServerIdPageProps) => {
  const profile = await currentProfile();

  if(!profile){
    return auth().redirectToSignIn();
  }

  const server = await fetchQuery(api.servers.getServerWithMembersAndChannelsByServerIdAndProfileId, { serverId: params.serverId, profileId: profile._id})

  if(!server.data?.channels || server.data.channels.length === 0){
    return null; // No channels found, handle appropriately
  }

  const generalChannel = server.data.channels.find(channel => channel.name === "general");
  if (!generalChannel) {
    return null; // Handle case where the general channel is not found
  }

  return redirect(`/servers/${params.serverId}/channels/${generalChannel?._id}`);
}

export default ServerIdPage;