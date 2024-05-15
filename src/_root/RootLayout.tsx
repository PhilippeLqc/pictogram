import Bottombar from "@/components/shared/Bottombar";
import Leftsidebar from "@/components/shared/LeftSidebar";
import RightSideBar from "@/components/shared/RightSideBar";
import Topbar from "@/components/shared/Topbar";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="w-full md:flex">
      <Topbar />
      <Leftsidebar />
      <section className="flex flex-1 h-full">
        <Outlet />
      </section>
      <Bottombar />
      <RightSideBar />
    </div>
  );
};

export default RootLayout;
