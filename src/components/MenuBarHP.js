import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import NotificationsList from "./NotificationsList";
import "../css/menubar.css";
import { useNotifications } from "../context/NotificationsContext";

const MenuBar = () => {
  const supabase = useSupabaseClient();
  const [hoveredLink, setHoveredLink] = useState(null);
  const [areNotificationsOpen, setAreNotificationsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { notifications } = useNotifications()
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    setNotificationCount(notifications.length)
  }, [notifications])

  const handleNotificationsOpen = () => {
    setAreNotificationsOpen(true);
  };

  const handleNotificationsClose = () => {
    setAreNotificationsOpen(false);
  };

  const handleHover = (index) => {
    setHoveredLink(index);
  };

  const handleLeave = () => {
    setHoveredLink(null);
  };

  const handleLogout = async () => {
    localStorage.removeItem('googleId');
    localStorage.removeItem("parentId");

    await supabase.auth.signOut().then(() => {
      localStorage.removeItem('sb-svlrsvxrzxkqrhhpwkzw-auth-token');
      localStorage.removeItem('token');
      window.location.replace("/login");
    });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className="navbar">
        <Link to={"/homepage"} className="navbar-brand">
          <img src="/assets/images/logo.png" alt="MyTaskBuddy Logo" width="30" height="30" />
          <span>MyTaskBuddy</span>
        </Link>

        <div className={`navbar-menu ${isMenuOpen ? "open" : ""}`}>
          <li>
            <Link
              to={"/homepage"}
              className={hoveredLink === 0 ? "active" : ""}
              onMouseEnter={() => handleHover(0)}
              onMouseLeave={handleLeave}
            >
              Početna
            </Link>
          </li>
          <li>
            <Link
              to={"/editprofile"}
              className={hoveredLink === 1 ? "active" : ""}
              onMouseEnter={() => handleHover(1)}
              onMouseLeave={handleLeave}
            >
              Profil
            </Link>
          </li>
          <li>
            <Link
              to={"/statistics"}
              className={hoveredLink === 2 ? "active" : ""}
              onMouseEnter={() => handleHover(2)}
              onMouseLeave={handleLeave}
            >
              Statistika
            </Link>
          </li>
          <li>
            <Link
              to={"#"}
              className={hoveredLink === 3 ? "active" : ""}
              onMouseEnter={() => handleHover(3)}
              onMouseLeave={handleLeave}
              onClick={handleNotificationsOpen}
            >
              <div className="notificationText">
                Notifikacije
                <div className="notificationCount">{notificationCount}</div>
              </div>
            </Link>
          </li>
          <li>
            <a
              href="/login"
              className={hoveredLink === 4 ? "active logout" : "logout"}
              onMouseEnter={() => handleHover(4)}
              onMouseLeave={handleLeave}
              onClick={handleLogout}
            >
              Odjavi se
            </a>
          </li>
        </div>

        <div className="hamburger" onClick={toggleMenu}>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </nav>

      {areNotificationsOpen && (
        <NotificationsList
          show={areNotificationsOpen}
          handleClose={handleNotificationsClose}
        />
      )}
    </>
  );
};

export default MenuBar;
