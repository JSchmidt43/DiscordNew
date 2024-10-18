import { currentUser, auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export const InitialProfile = async() => {
    const user = await currentUser();

    if(!user){
        return redirect("/homepage")
    }

    const profile = await fetchQuery(api.profiles.getProfileByUserId, {
        userId: user.id
    });

    if(profile){
        return profile
    }
    console.log(user)


    const newUserData =  {
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        username: user.username || `user_${user.id}`,
        password: undefined,
        email: user.emailAddresses[0].emailAddress,
        imageUrl: user.imageUrl,
        status: `🟢 Online`,
    }

        // Correct way to use the mutation
    const createdProfile = await fetchMutation(api.profiles.createProfile, newUserData);


    // Fetch the newly created profile
    const newProfile = await fetchQuery(api.profiles.getProfileById, {
        profileId: createdProfile.profileId,
    });

    return newProfile;
    

}



