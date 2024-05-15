import { Button } from "../ui/button";

const UserCard = () => {
  return (
    <div className="user-container">
      <div className="user-grid">
        <div className="user-card">
          <img
            src="/assets/icons/profile-placeholder.svg"
            alt="creator"
            className="rounded-full w-12 h-12 md:w-16 md:h-16"
          />
          <div className="flex flex-col text-center">
            <p className="small-semibold">John Doe</p>
            <p className="small-regular text-light-3">Followed by john doe</p>
          </div>
          <Button className="shad-button_primary">Follow</Button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
