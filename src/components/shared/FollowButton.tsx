import { useUserContext } from "@/context/AuthContext";
import { client } from "@/lib/appwrite/config";
import {
  useFollowUser,
  useGetFollowers,
  useUnfollowUser,
} from "@/lib/react-query/queryAndMutations";
import { Models } from "appwrite";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import Loader from "./Loader";

interface followButtonProps {
  creator: Models.Document;
}

const FollowButton = ({ creator }: followButtonProps) => {
  const [followers, setFollowers] = useState<Models.Document[]>([]);
  const { user } = useUserContext();

  // QUERIES

  const { mutateAsync: followUser, isPending: isFollowing } = useFollowUser();
  const { mutateAsync: unfollowUser, isPending: isUnfollowing } =
    useUnfollowUser();
  const { data: dataFollowers } = useGetFollowers(creator.$id);

  // ------------------------------------------------------------------------

  useEffect(() => {
    // variable to subscribe to the follow collection from appwrite database
    const event = `databases.${
      import.meta.env.VITE_APPWRITE_DATABASE_ID
    }.collections.${
      import.meta.env.VITE_APPWRITE_FOLLOWS_COLLECTION_ID
    }.documents`;

    // set the followers state to the dataFollowers if it exists
    if (dataFollowers) {
      setFollowers(dataFollowers);
    }

    // function to handle the subscription to the follow collection in realtime (websocket connection). doc : https://appwrite.io/docs/apis/realtime
    const unsubscribe = client.subscribe(event, (response) => {
      if (
        response.events.includes(
          "databases.*.collections.*.documents.*.create"
        ) &&
        (response.payload as Models.Document).user.$id === creator.$id
      ) {
        setFollowers((prev) => [...prev, response.payload as Models.Document]);
      } else if (
        response.events.includes("databases.*.collections.*.documents.*.delete")
      ) {
        const deletedFollower = (response.payload as Models.Document).$id;
        setFollowers((prev) =>
          prev.filter((follower) => follower.$id !== deletedFollower)
        );
      }
    });

    // unsubscribe from the follow collection when the component is unmounted
    return () => unsubscribe();
  }, [creator.$id, dataFollowers]);

  // See if the user is following the creator already
  const isUserFollowing = followers.find(
    (follower) =>
      follower.follower.$id === user?.id && creator.$id === follower.user.$id
  );

  // HANDLERS

  const handleFollow = async () => {
    if (!user) return;
    try {
      await followUser({ userId: creator.$id, followerId: user.id });
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnfollow = async () => {
    // check if the user is logged in and if the user is following the creator
    if (!user || !isUserFollowing) return;
    // find the follower in the followers array
    const followId = followers.find(
      (follower) => follower.follower.$id === user.id
    );
    // unfollow the user
    try {
      await unfollowUser(followId!.$id);
    } catch (error) {
      console.error(error);
    }
  };

  // ------------------------------------------------------------------------

  return (
    <>
      {!isUserFollowing ? (
        <Button
          className="shad-button_primary"
          onClick={handleFollow}
          disabled={isFollowing}
        >
          {isFollowing ? <Loader /> : "Follow"}
        </Button>
      ) : (
        <Button
          className="shad-button_primary"
          onClick={handleUnfollow}
          disabled={isUnfollowing}
        >
          {isUnfollowing ? <Loader /> : "Unfollow"}
        </Button>
      )}
    </>
  );
};

export default FollowButton;
