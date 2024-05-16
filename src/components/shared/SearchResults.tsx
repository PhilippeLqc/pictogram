import { Models } from "appwrite";
import Loader from "@/components/shared/Loader";
import GridPostList from "./GridPostList";

type searcResultsprops = {
  isSearchFetching: boolean;
  searchedPosts: Models.DocumentList<Models.Document> | undefined;
};

const SearchResults = ({
  isSearchFetching,
  searchedPosts,
}: searcResultsprops) => {
  if (isSearchFetching) return <Loader />;
  if (searchedPosts && searchedPosts.documents.length > 0) {
    return <GridPostList posts={searchedPosts.documents} />;
  }

  return (
    <p className="text-light-4 mt-10 text-center w-full">No results found</p>
  );
};

export default SearchResults;
