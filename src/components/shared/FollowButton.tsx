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

type followButtonProps = {
  creator: Models.Document;
};

const FollowButton = ({ creator }: followButtonProps) => {
  const [followers, setFollowers] = useState<Models.Document[]>([]);
  const { user } = useUserContext();
  const { mutateAsync: followUser, isPending: isFollowing } = useFollowUser();
  const { mutateAsync: unfollowUser, isPending: isUnfollowing } =
    useUnfollowUser();
  const { data: dataFollowers } = useGetFollowers(creator.$id);

  useEffect(() => {
    const event = `databases.${
      import.meta.env.VITE_APPWRITE_DATABASE_ID
    }.collections.${
      import.meta.env.VITE_APPWRITE_FOLLOWS_COLLECTION_ID
    }.documents`;

    if (dataFollowers) {
      setFollowers(dataFollowers);
    }

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
    return () => unsubscribe();
  }, [creator.$id, dataFollowers]);

  // Détermine si l'utilisateur actuel suit le créateur
  const isUserFollowing = followers.find(
    (follower) =>
      follower.follower.$id === user?.id && creator.$id === follower.user.$id
  );

  const handleFollow = async () => {
    if (!user) return;
    try {
      await followUser({ userId: creator.$id, followerId: user.id });
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnfollow = async () => {
    if (!user || !isUserFollowing) return;
    const followId = followers.find(
      (follower) => follower.follower.$id === user.id
    );
    try {
      await unfollowUser(followId!.$id);
    } catch (error) {
      console.error(error);
    }
  };

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
