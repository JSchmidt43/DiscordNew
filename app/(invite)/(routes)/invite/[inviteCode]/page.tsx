import { api } from "@/convex/_generated/api";
import { currentProfile } from "@/lib/current-profile";
import { auth} from "@clerk/nextjs/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

interface InviteCodePageProps {
    params: {
        inviteCode: string;
    }
}

const InviteCodePage = async ({
    params
}: InviteCodePageProps) => {
    const profile = await currentProfile();

    if(!profile) {
        return auth().redirectToSignIn();
    }

    if(!params.inviteCode){
        return redirect("/");
    }

    const existingServer = await fetchQuery(api.servers.getServerByInviteCodeAndMemberCheck, {
        inviteCode: params.inviteCode,
        profileId: profile._id
    })


    if(existingServer.data && existingServer.message){
        return redirect(`/servers/${existingServer.data._id}`);
    }

    const createdMember = await fetchMutation(api.members.createMember, {
        role: "GUEST",
        profileId: profile._id,
        serverId: existingServer.data!._id
    })


    if(createdMember.data){
        return redirect(`/servers/${createdMember.data!.serverId}`);
    }

    // return null;
}



 
export default InviteCodePage;