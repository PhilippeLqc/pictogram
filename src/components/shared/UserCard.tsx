import { Models } from "appwrite";
import { useGetFollowers } from "@/lib/react-query/queryAndMutations";
import { useEffect, useState } from "react";
import { client } from "@/lib/appwrite/config";
import FollowButton from "./FollowButton";

type userCardsProps = {
  creator: Models.Document;
};
const UserCard = ({ creator }: userCardsProps) => {
  const [followers, setFollowers] = useState<Models.Document[]>([]);
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
        <FollowButton creator={creator} />
      </div>
    </div>
  );
};

export default UserCard;
