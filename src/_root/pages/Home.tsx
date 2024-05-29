import Loader from "@/components/shared/Loader";
import PostCard from "@/components/shared/PostCard";
import RightSideBar from "@/components/shared/RightSideBar";
import { useGetRecentPosts } from "@/lib/react-query/queryAndMutations";
import { Models } from "appwrite";

const Home = () => {
  const {
    data: posts,
    isPending: isPostLoading,
    isError: isErrorPosts,
  } = useGetRecentPosts();

  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bold text-left w-full">Home Feed</h2>
          {isErrorPosts ? (
            <div className="flex flex-col items-center justify-center h-96">
              <p className="body-bold text-center">
                Something went wrong. Please try again later.
              </p>
            </div>
          ) : isPostLoading && !posts ? (
            <Loader />
          ) : (
            <ul className="flex flex-col flex-1 gap-9 w-full">
              {posts?.documents.map((post: Models.Document) => (
                <PostCard post={post} key={post.$id} />
              ))}
            </ul>
          )}
        </div>
      </div>
      <RightSideBar />
    </div>
  );
};

export default Home;
