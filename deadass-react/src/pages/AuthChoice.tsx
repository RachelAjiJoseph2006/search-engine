import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import AuthLogo from "../components/AuthLogo";

function AuthChoice() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    const guest = localStorage.getItem("guest");

    if (user || guest) {
      navigate("/search");
    }
  }, [navigate]);

  const googleLogin = useGoogleLogin({
    flow: "auth-code",

    onSuccess: async (codeResponse) => {
      try {
        const response = await fetch("https://racheljoseph-webdev-backend.azurewebsites.net/auth/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: codeResponse.code,
          }),
        });

        if (!response.ok) {
          throw new Error("Google authentication failed");
        }

        const data = await response.json();

        localStorage.setItem("user", JSON.stringify(data.user));

        navigate("/search");
      } catch (err) {
        console.error(err);
        alert("Login failed. Please try again.");
      }
    },

    onError: () => {
      console.log("Google Login Failed");
    },
  });

  const handleGuest = () => {
    localStorage.setItem("guest", "true");
    navigate("/search");
  };

  return (
    <div className="home-page">
      <AuthLogo />

      <button
        className="guest-button"
        onClick={() => googleLogin()}
      >
        Login with Google
      </button>

      <button
        className="guest-button"
        onClick={handleGuest}
      >
        Continue as Guest
      </button>
    </div>
  );
}

export default AuthChoice;