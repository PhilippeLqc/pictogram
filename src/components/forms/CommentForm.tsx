import { useUserContext } from "@/context/AuthContext";
import {
  useCreateComment,
  useGetCurrentUser,
} from "@/lib/react-query/queryAndMutations";
import { CommentValidation } from "@/lib/validation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Models } from "appwrite";
import { toast } from "../ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "../ui/button";
import Loader from "../shared/Loader";

type PostCommentProps = {
  post?: Models.Document;
};

const CommentForm = ({ post }: PostCommentProps) => {
  const { mutateAsync: createComment, isPending: isCreatingComment } =
    useCreateComment();
  const { user } = useUserContext();
  const { data: currentUser } = useGetCurrentUser();

  // 1. Define your form
  const form = useForm<z.infer<typeof CommentValidation>>({
    resolver: zodResolver(CommentValidation),
    defaultValues: {
      post_id: post?.$id,
      user_id: currentUser?.$id,
      content: "",
    },
  });

  // 2. Define a submit handler
  async function onSubmit(values: z.infer<typeof CommentValidation>) {
    const newComment = await createComment(values);

    if (!newComment) {
      toast({
        title: "Something went wrong. Please try again later",
      });
    }
    form.reset();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex items-center space-x-4 mt-4"
      >
        <img
          src={user?.imageUrl || "assets/icons/profile-placeholder.svg"}
          alt="user profile"
          className="rounded-full w-10 h-10"
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormControl>
                <div className="flex flex-row w-full bg-dark-4 rounded-lg p-1">
                  <input
                    type="content"
                    placeholder="Write your comment..."
                    className="w-full bg-dark-4 border-none placeholder:text-light-4 focus:outline-none p-2 rounded-lg"
                    {...field}
                  />
                  <Button type="submit" className="p-2">
                    {isCreatingComment ? (
                      <Loader />
                    ) : (
                      <img
                        src="assets/icons/add-comment.svg"
                        alt="send"
                        className="w-6 h-6 cursor-pointer "
                      />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default CommentForm;
