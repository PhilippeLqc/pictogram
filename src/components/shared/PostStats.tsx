import React, { useState, useEffect } from "react";
import {
  useDeleteSavedPost,
  useGetComments,
  useGetCurrentUser,
  useLikePost,
  useSavePost,
} from "@/lib/react-query/queryAndMutations";
import { Models } from "appwrite";
import { checkIsLiked } from "@/lib/utils";
import Loader from "./Loader";
import { Link } from "react-router-dom";

interface PostStatsProps {
  post?: Models.Document;
  userId: string;
}

const PostStats = ({ post, userId }: PostStatsProps) => {
  // Store the likes of the post
  const LikeList = post?.likes.map((user: Models.Document) => user.$id);

  // USESTATE

  const [likes, setlikes] = useState<string[]>(LikeList);
  const [isSaved, setIsSaved] = useState(false);

  // ------------------------------------------------------------------------

  // QUERIES

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost, isPending: isSavingPost } = useSavePost();
  const { mutate: deleteSavedPost, isPending: isDeletingSaved } =
    useDeleteSavedPost();
  const { data: comments } = useGetComments(post?.$id || "");
  const { data: currentUser } = useGetCurrentUser();

  // ------------------------------------------------------------------------

  // Check if the post is saved by the current user
  const savedPostRecord = currentUser?.save.find(
    (record: Models.Document) => record.post.$id === post?.$id
  );

  useEffect(() => {
    // Update the isSaved state when the savedPostRecord changes
    setIsSaved(!!savedPostRecord);
  }, [currentUser, savedPostRecord]);

  // HANDLERS

  const handleLikePost = (e: React.MouseEvent) => {
    // Stop the propagation of the event
    e.stopPropagation();

    let NewLikes = [...likes];
    const hasLiked = NewLikes.includes(userId);

    // If the user has liked the post, remove their id from the likes list
    if (hasLiked) {
      NewLikes = NewLikes.filter((id) => id !== userId);
    } else {
      // If the user has not liked the post, add their id to the likes list
      NewLikes.push(userId);
    }

    setlikes(NewLikes);
    likePost({ postId: post?.$id || "", likesArray: NewLikes });
  };

  const handleSavePost = (e: React.MouseEvent) => {
    // Stop the propagation of the event
    e.stopPropagation();

    // If the post is already saved, delete the saved post
    if (savedPostRecord) {
      deleteSavedPost(savedPostRecord.$id);
      setIsSaved(false);
    } else {
      // If the post is not saved, save the post
      savePost({ post: post?.$id || "", user: userId });
      setIsSaved(true);
    }
  };

  // ------------------------------------------------------------------------

  return (
    <div className="flex justify-between items-center z-20">
      <div className="flex gap-2 mr-5">
        <img
          src={
            checkIsLiked(likes, userId)
              ? "/assets/icons/liked.svg"
              : "/assets/icons/like.svg"
          }
          alt="like"
          width={20}
          height={20}
          onClick={handleLikePost}
          className="cursor-pointer"
        />
        <p className="small-medium lg:base-medium">{likes.length}</p>
        <Link to={`/posts/${post?.$id}`}>
          <img
            src="/assets/icons/comment.svg"
            alt="comment"
            width={20}
            height={20}
            className="cursor-pointer"
          />
        </Link>
        <p className="small-medium lg:base-medium">
          {comments?.documents.length}
        </p>
      </div>
      <div className="flex gap-2">
        {isSavingPost || isDeletingSaved ? (
          <Loader />
        ) : (
          <img
            src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
            alt="like"
            width={20}
            height={20}
            onClick={handleSavePost}
            className="cursor-pointer"
          />
        )}
      </div>
    </div>
  );
};

export default PostStats;
