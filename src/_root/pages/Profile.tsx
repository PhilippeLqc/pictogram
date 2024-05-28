import Loader from "@/components/shared/Loader";
import { useUserContext } from "@/context/AuthContext";
import {
  useGetFollowers,
  useGetFollowing,
  useGetUserById,
} from "@/lib/react-query/queryAndMutations";
import { Link, useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GridPostList from "@/components/shared/GridPostList";
import LikedPosts from "./LikedPosts";
import FollowButton from "@/components/shared/FollowButton";
import { useState } from "react";

interface StabBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({ value, label }: StabBlockProps) => (
  <div className="flex-center gap-2">
    <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
    <p className="small-medium lg:base-medium text-light-2">{label}</p>
  </div>
);

const Profile = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const { id } = useParams();
  const { data: currentUser } = useGetUserById(id || "");
  const { data: currentUserFollowers } = useGetFollowers(id || "");
  const { data: currentUserFollowing } = useGetFollowing(id || "");
  const { user } = useUserContext();

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <div className="profile-container">
      <div className="profile-inner_container">
        <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
          <img
            src={user?.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="user profile"
            className="w-28 h-28 lg:h-36 lg:w-36 rounded-full"
          />
          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <div className="flex flex-col w-full">
              <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full">
                {currentUser.name}
              </h1>
              <p className="small-regular md:body-medium text-light-3 text-center xl:text-left">
                @{currentUser.username}
              </p>
            </div>

            <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
              <StatBlock value={currentUser.posts.length} label="Posts" />
              <StatBlock
                value={currentUserFollowers?.length ?? 0}
                label={
                  currentUserFollowers && currentUserFollowers.length <= 1
                    ? "Follower"
                    : "Followers"
                }
              />
              <StatBlock
                value={currentUserFollowing?.length ?? 0}
                label="Following"
              />
            </div>

            <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">
              {currentUser.bio}
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <div className={`${user.id !== currentUser.$id && "hidden"}`}>
              <Link
                to={`/update-profile/${currentUser.$id}`}
                className={`h-12 px-5 text-light-1 flex-center gap-2 rounded-lg ${
                  user.id !== currentUser.$id && "hidden"
                }`}
              >
                <img
                  src={"/assets/icons/edit.svg"}
                  alt="edit"
                  width={20}
                  height={20}
                />
                <p className="flex whitespace-nowrap small-medium">
                  Edit Profile
                </p>
              </Link>
            </div>
            <div className={`${user.id === id && "hidden"}`}>
              <FollowButton creator={currentUser} />
            </div>
          </div>
        </div>
      </div>
      {user.id === currentUser.$id ? (
        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className=" max-w-5xl w-full"
        >
          <TabsList className="flex max-w-5xl w-full justify-start">
            <TabsTrigger
              value="posts"
              className={`profile-tab rounded-l-lg ${
                activeTab === "posts" && "!bg-dark-3"
              }`}
            >
              <img
                src={"/assets/icons/posts.svg"}
                alt="posts"
                width={20}
                height={20}
              />
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="liked-posts"
              className={`profile-tab rounded-r-lg ${
                activeTab === "liked-posts" && "!bg-dark-3"
              }`}
            >
              <img
                src={"/assets/icons/like.svg"}
                alt="like"
                width={20}
                height={20}
              />
              Liked Posts
            </TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="pt-10">
            {currentUser?.posts.length === 0 ? (
              <div className="flex-center">
                <p className="h2-bold text-center">No posts yet</p>
              </div>
            ) : (
              <GridPostList posts={currentUser.posts} showUser={false} />
            )}
          </TabsContent>
          <TabsContent value="liked-posts" className="pt-10">
            <LikedPosts />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex flex-col gap-10">
          <div className="profile-tab rounded-lg !bg-dark-3">
            <img
              src={"/assets/icons/posts.svg"}
              alt="posts"
              width={20}
              height={20}
            />
            Posts
          </div>
          {currentUser?.posts.length === 0 ? (
            <div className="flex-center">
              <p className="h2-bold text-center">No posts yet</p>
            </div>
          ) : (
            <GridPostList posts={currentUser.posts} showUser={false} />
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
