import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { useGetCurrentUser } from "@/lib/react-query/queryAndMutations";
import { Models } from "appwrite";

const Saved = () => {
  const { data: user } = useGetCurrentUser();

  const savePosts: Models.Document[] = user?.save
    .map((savePost: Models.Document) => ({
      ...savePost.post,
      creator: {
        imageUrl: user?.imageUrl,
      },
    }))
    .reverse();

  return (
    <div className="explore-container">
      <div className="explore-inner_container">
        <div className="max-w-5xl flex-start gap-3 justify-start w-full">
          <img
            src="/assets/icons/bookmark.svg"
            alt="bookmark"
            width={36}
            height={36}
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold w-full">Saved Post</h2>
        </div>
        {!user ? (
          <Loader />
        ) : (
          <ul className="w-full flex justify-center max-w-5xl gap-9">
            {savePosts.length === 0 ? (
              <p className="text-light-4">No available posts</p>
            ) : (
              <GridPostList posts={savePosts} showStats={false} />
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Saved;
