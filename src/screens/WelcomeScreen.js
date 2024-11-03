import React, { useEffect } from "react";
import { Banner } from "../components/Banner";
import "../css/banner.css";
import { useSession } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../http/axiosClient";

function WelcomeScreen() {
  const session = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    const handleGoogleSignIn = async () => {
      if (session && session.user && session.user.id) {
        const googleId = session.user.id;
        const email = session.user.email;

        const fullName = session.user.user_metadata.full_name.split(' ');
        const firstName = fullName[0];
        const lastName = fullName[1];

        try {
          // Send Google ID, email, and other user info to your backend
          const response = await axiosClient.post(
            "/oauth-login",
            {
              googleId: googleId,
              email: email,
              firstname: firstName,
              lastname: lastName,
            },
            {
              headers: { "Content-Type": "application/json" }
            }
          );

          const data = response.data;

          if (response.status === 200) {
            // Store the parentId in local storage or handle it as needed
            localStorage.setItem("parentId", data.parentId);
            navigate("/homepage");
          } else {
            console.error("OAuth login failed:", data.message);
          }
        } catch (error) {
          console.error("Error during OAuth login:", error);
        }
      }
    };

    handleGoogleSignIn();
  }, [session, navigate]);


  return (
    <div>
      <Banner></Banner>
    </div>
  );
}

export default WelcomeScreen;
