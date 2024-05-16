import Loader from "@/components/shared/Loader";
import UserCard from "@/components/shared/UserCard";
import { useGetUsers } from "@/lib/react-query/queryAndMutations";
import { Models } from "appwrite";

const AllUsers = () => {
  const {
    data: allUsers,
    isLoading: isUserLoading,
    isError: isErrorCreators,
  } = useGetUsers();

  return (
    <div className="common-container ">
      <div className="user-container">
        <div className="max-w-5xl flex-start gap-3 justify-start w-full">
          <img
            src="assets/icons/people.svg"
            alt="allusers"
            width={36}
            height={36}
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
            {allUsers?.documents.map((creator: Models.Document) => (
              <UserCard creator={creator} key={creator.$id} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
