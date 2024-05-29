import Loader from "@/components/shared/Loader";
import UserCard from "@/components/shared/UserCard";
import { useUserContext } from "@/context/AuthContext";
import { useGetUsers } from "@/lib/react-query/queryAndMutations";
import { Models } from "appwrite";

const AllUsers = () => {
  const {
    data: allUsers,
    isLoading: isUserLoading,
    isError: isErrorCreators,
  } = useGetUsers();

  const { user } = useUserContext();

  // filter out the current user from the allUsers list
  const creators: Models.Document[] = allUsers!.documents.filter(
    (creator) => creator.$id !== user?.id
  );

  return (
    <div className="common-container ">
      <div className="user-container">
        <div className="max-w-5xl flex-start gap-3 justify-start w-full">
          <img
            src="assets/icons/people.svg"
            alt="allusers"
            width={36}
            height={36}
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>
        </div>
        {isErrorCreators ? (
          <div className="flex flex-col items-center justify-center h-96">
            <p className="body-bold text-center">
              Something went wrong. Please try again later.
            </p>
          </div>
        ) : isUserLoading && !allUsers ? (
          <Loader />
        ) : (
          <ul className="user-grid">
            {creators?.map((creator: Models.Document) => (
              <UserCard creator={creator} key={creator.$id} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
