import { Models } from "appwrite";
import Loader from "@/components/shared/Loader";
import GridPostList from "./GridPostList";

interface searcResultsprops {
  isSearchFetching: boolean;
  searchedPosts: Models.DocumentList<Models.Document> | undefined;
}

const SearchResults = ({
  isSearchFetching,
  searchedPosts,
}: searcResultsprops) => {
  // If the search is fetching, show a loader
  if (isSearchFetching) return <Loader />;

  // If the search has returned posts, show the grid post list
  if (searchedPosts && searchedPosts.documents.length > 0) {
    return <GridPostList posts={searchedPosts.documents} />;
  }

  // If the search has returned no posts, show a message
  return (
    <p className="text-light-4 mt-10 text-center w-full">No results found</p>
  );
};

export default SearchResults;
