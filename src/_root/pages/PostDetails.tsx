import CommentForm from "@/components/forms/CommentForm";
import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import PostStats from "@/components/shared/PostStats";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import {
  useDeletePost,
  useGetComments,
  useGetPostsById,
  useGetUserPosts,
} from "@/lib/react-query/queryAndMutations";
import { formatDate } from "@/lib/utils";
import { Models } from "appwrite";
import { Link, useNavigate, useParams } from "react-router-dom";

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserContext();
  const { data: post, isPending } = useGetPostsById(id || "");
  const { data: userPosts, isPending: userPostsPending } = useGetUserPosts(
    post?.creator.$id || ""
  );
  const { data: comments, isPending: commentsPending } = useGetComments(
    id || ""
  );
  const { mutateAsync: deletePost } = useDeletePost();

  const relatedPosts = userPosts?.documents.filter((post) => post.$id !== id);

  const handleDelete = () => {
    deletePost({
      postId: id || "",
      imageId: post?.imageId,
      savedRecordId: post?.save.map((save: Models.Document) => save.$id) || [],
      commentId: comments?.documents.map((comment) => comment.$id) || [],
    });
    navigate(-1);
  };

  return (
    <div className="post_details-container">
      {isPending ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          <img
            src={post?.imageUrl}
            alt="creator"
            className="post_details-img"
          />
          <div className="post_details-info h-[480px]">
            <div className="flex-between w-full">
              <Link
                to={`/profile/${post?.creator?.$id}`}
                className="flex items-center gap-3"
              >
                <img
                  src={
                    post?.creator?.imageUrl || "assets/icons/default-avatar.svg"
                  }
                  alt="creator"
                  className="rounded-full w-8 h-8 lg:h-12 lg:w-12"
                />

                <div className="flex flex-col">
                  <p className="base-medium lg:body-bold text-light-1">
                    {post?.creator.name}
                  </p>
                  <div className="flex-center gap-2 text-light-3">
                    <p className="subtle-semibold lg:small-regular">
                      {formatDate(post?.$createdAt ?? "")}
                    </p>
                    -
                    <p className="subtle-semibold lg:small-regular">
                      {post?.location}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="flex-center">
                <Link
                  to={`/update-post/${post?.$id}`}
                  className={`${user.id !== post?.creator.$id && "hidden"}`}
                >
                  <img
                    src="/assets/icons/edit.svg"
                    alt="edit"
                    width={24}
                    height={24}
                  />
                </Link>

                <Button
                  variant="ghost"
                  className={`"ghost_details-delete" ${
                    user.id !== post?.creator.$id && "hidden"
                  }`}
                  onClick={handleDelete}
                >
                  <img
                    src="/assets/icons/delete.svg"
                    alt="delete"
                    width={24}
                    height={24}
                  />
                </Button>
              </div>
            </div>
            <div className="flex flex-1 w-full small-medium lg:base-regular">
              <p>{post?.caption}</p>
              <ul className="flex ml-2">
                {post?.tags.map((tag: string) => (
                  <li key={tag} className="text-light-3">
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>
            <hr className="border w-full border-dark-4/80" />
            <div className="comments-container">
              {commentsPending ? (
                <Loader />
              ) : (
                comments?.documents.map((comment) => (
                  <div key={comment.$id} className="flex gap-2">
                    <img
                      src={comment.user_id.map(
                        (url: { imageUrl: string }) => url.imageUrl
                      )}
                      alt="user"
                      className="rounded-full w-8 h-8"
                    />
                    <div className="flex flex-col mb-5">
                      <div className="flex flex-row gap-4">
                        <p className="base-regular lg:base-semibold text-light-3 gap-10">
                          {comment.user_id.map(
                            (user: { name: string }) => user.name
                          )}
                        </p>
                        <p className="base-regular lg:base-regular">
                          {comment.content}
                        </p>
                      </div>
                      <p className="subtle-semibold lg:subtle-semibold text-light-3">
                        {formatDate(comment.$createdAt ?? "")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="w-full">
              <PostStats post={post} userId={user.id} />
            </div>
            <div className="w-full">
              <CommentForm post={post} />
            </div>
          </div>
        </div>
      )}
      <div className="w-full max-w-5xl">
        <hr className="border w-full border-dark-4/80" />
        <h3 className="body-bold md:h3-bold w-full my-10">
          More related Posts
        </h3>
        {userPostsPending ? (
          <Loader />
        ) : (
          <GridPostList
            posts={relatedPosts || []}
            showUser={false}
            showStats={false}
          />
        )}
      </div>
    </div>
  );
};

export default PostDetails;
