import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useGetCurrentUser } from "@/lib/react-query/queryAndMutations";

const Profile = () => {
  const { data: creator, isPending } = useGetCurrentUser();
  const { user } = useUserContext();

  return (
    <div className="flex flex-row items-center justify-center gap-4">
      <img
        src={creator?.imageUrl}
        alt="user profile"
        width={150}
        height={150}
        className="rounded-full"
      />
      <h1>{user?.name}</h1>
      {user?.id === creator?.id ? (
        <Button>Edit Profile</Button>
      ) : (
        <Button>Follow</Button>
      )}
    </div>
  );
};

export default Profile;
