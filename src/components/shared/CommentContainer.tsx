import { formatDate } from "@/lib/utils";
import Loader from "./Loader";
import { Models } from "appwrite";

interface commentContainerProps {
  comments: Models.DocumentList<Models.Document>;
  commentsPending: boolean;
}

const CommentContainer = ({
  comments,
  commentsPending,
}: commentContainerProps) => {
  return (
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
                  {comment.user_id.map((user: { name: string }) => user.name)}
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
  );
};

export default CommentContainer;
