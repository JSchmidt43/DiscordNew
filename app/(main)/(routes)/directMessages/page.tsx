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
    return (
      <div className="flex flex-col items-center justify-center h-screen  text-center">
        <div className=" p-6 rounded-lg shadow-lg border border-gray-300 dark:border-red-700 max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            No Friends Yet 😢
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            It looks like you don't have any friends added yet. Start by connecting with others to see your conversations here.
          </p>

        </div>
      </div>
    )
  }

  return redirect(`/directMessages/${friend?.data}`);
}

export default DirectIdPage;