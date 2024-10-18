import InitialModel from "@/components/models/initial-model";
import { api } from "@/convex/_generated/api";
import { InitialProfile } from "@/lib/initial-profile";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

const SetupPage = async () => {
    const profile = await InitialProfile();

    const serverData = await fetchQuery(api.servers.getServerByProfileId, {
        profileId: profile!._id
    });

    if(serverData.server){
        return redirect(`/servers/${serverData.server._id}`)
    }
    

    return (
        <div>
            <InitialModel />
        </div>
    );
}

export default SetupPage;