import UserCard from "@/components/shared/UserCard";
import { useGetUsers } from "@/lib/react-query/queryAndMutations";
import { Models } from "appwrite";
import Loader from "../shared/Loader";

const RightSideBar = () => {
  const {
    data: creator,
    isLoading: isUserLoading,
    isError: isErrorCreators,
  } = useGetUsers(10);

  return (
    <div className="rightsidebar">
      <div className="flex flex-col py-5">
        <h2 className="h2-bold md:h3-bold text-left w-full mb-5">
          Top Creators
        </h2>
        {isErrorCreators ? (
          <div className="flex flex-col items-center justify-center h-96">
            <p className="body-bold text-center">
              Something went wrong. Please try again later.
            </p>
          </div>
        ) : isUserLoading && !creator ? (
          <Loader />
        ) : (
          <ul className="flex flex-col gap-9 w-full">
            {creator?.documents.map((creator: Models.Document) => (
              <UserCard creator={creator} key={creator.$id} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RightSideBar;
