import { Models } from "appwrite";
import { Button } from "../ui/button";
import { useFollowUser } from "@/lib/react-query/queryAndMutations";
import { useUserContext } from "@/context/AuthContext";
import Loader from "@/components/shared/Loader";

type userCardsProps = {
  creator: Models.Document;
};
const UserCard = ({ creator }: userCardsProps) => {
  const { user } = useUserContext();
  const { mutateAsync: followUser, isPending: isFollowing } = useFollowUser();

  const hanfleFollow = async () => {
    if (!user) return;
    try {
      await followUser({ userId: creator.$id, followerId: creator.$id });
    } catch (error) {
      console.log(error);
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
          {/* <p className="small-regular text-light-3">Followed by john doe</p> */}
        </div>
        <Button
          className="shad-button_primary"
          onClick={hanfleFollow}
          disabled={isFollowing}
        >
          {isFollowing ? <Loader /> : "Follow"}
        </Button>
      </div>
    </div>
  );
};

export default UserCard;
