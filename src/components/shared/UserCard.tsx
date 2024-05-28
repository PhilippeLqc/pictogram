import { Models } from "appwrite";
import { Button } from "../ui/button";
import {
  useFollowUser,
  useGetFollowers,
  useUnfollowUser,
} from "@/lib/react-query/queryAndMutations";
import { useUserContext } from "@/context/AuthContext";
import Loader from "@/components/shared/Loader";
import { useEffect, useState } from "react";
import { client } from "@/lib/appwrite/config";

type userCardsProps = {
  creator: Models.Document;
};
const UserCard = ({ creator }: userCardsProps) => {
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
    <div>
      <div className="user-card">
        <img
          src={creator?.imageUrl || "assets/icons/default-avatar.svg"}
          alt="creator"
          className="rounded-full w-12 h-12 md:w-16 md:h-16"
        />
        <div className="flex flex-col text-center">
          <p className="small-semibold">{creator.username}</p>
          <p className="small-regular text-light-3">
            Followed by {followers?.length}{" "}
            {followers?.length > 1 ? "followers" : "follower"}
          </p>
        </div>
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
      </div>
    </div>
  );
};

export default UserCard;
