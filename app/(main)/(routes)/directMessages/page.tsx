import { api } from "@/convex/_generated/api";
import { currentProfile } from "@/lib/current-profile";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

const DirectIdPage = async () => {
  const profile = await currentProfile();

  if(!profile){
    return auth().redirectToSignIn();
  }

  const friend = await fetchQuery(api.friends.getFirstAcceptedFriendByProfileId, { profileId: profile._id })

  if(!friend?.data){
    return null; // No friends found, handle appropriately
  }

  return redirect(`/directMessages/${friend?.data}`);
}

export default DirectIdPage;