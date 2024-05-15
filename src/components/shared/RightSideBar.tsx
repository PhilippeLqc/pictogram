import React from "react";
import UserCard from "@/components/shared/UserCard";

const RightSideBar = () => {
  return (
    <div className="rightsidebar">
      <div className="flex flex-col py-5">
        <h2 className="h2-bold md:h3-bold text-left w-full mb-5">
          Top Creators
        </h2>
        <UserCard />
      </div>
    </div>
  );
};

export default RightSideBar;
