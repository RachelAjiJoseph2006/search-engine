import { useState } from "react";
import { useNavigate } from "react-router-dom";

function UserMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const guest = localStorage.getItem("guest");

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("guest");
    navigate("/");
  };

  const handleLogin = () => {
    localStorage.removeItem("guest");
    navigate("/");
  };

  return (
    <div className="user-menu">
      <img
        src={
          user?.picture ||
          "https://ui-avatars.com/api/?name=Guest&background=333333&color=ffffff"
        }
        alt="Profile"
        className="profile-avatar"
        onClick={() => setOpen(!open)}
      />

      {open && (
        <div className="profile-dropdown">
          <img
            src={
              user?.picture ||
              "https://ui-avatars.com/api/?name=Guest&background=333333&color=ffffff"
            }
            alt="Profile"
            className="profile-large"
          />

          {user ? (
            <>
              <h3>{user.name}</h3>
              <p>{user.email}</p>

              <button onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : guest ? (
            <>
              <h3>Guest</h3>
              <p>You are browsing as a guest.</p>

              <button onClick={handleLogin}>
                Login
              </button>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default UserMenu;