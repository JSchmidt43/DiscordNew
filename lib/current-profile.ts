import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";


export const currentProfile  = async () => {
    const { userId } = auth();

    if(!userId) {
        return null
    }

    const profile = await fetchQuery(api.profiles.getProfileByUserId, {
        userId
    });


    return profile.data;

}

