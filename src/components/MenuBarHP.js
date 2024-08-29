import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const MenuBar = () => {
  const [hoveredLink, setHoveredLink] = useState(null);

  const handleHover = (index) => {
    setHoveredLink(index);
  };

  const handleLeave = () => {
    setHoveredLink(null);
  };

  const getLinkStyle = (index) => {
    const baseStyle = {
      textDecoration: "none",
      color: "#000",
      transition: "color 0.3s",
    };

    if (index === hoveredLink) {
      return { ...baseStyle, color: "blue" };
    }

    return baseStyle;
  };

  const handleLogout = () => {
    // Perform logout logic here
    // Redirect to the login screen
    localStorage.removeItem("parentId");
    window.location.replace("/login");
  };

  return (
    <nav
      style={{
        backgroundColor: "#f8f9fa",
        padding: "10px 20px",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Link
        to={"/homepage"}
        style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
          color: "#000",
        }}
      >
        <img
          src="/assets/images/logo.png"
          alt="MyTaskBuddy Logo"
          width="30"
          height="30"
          style={{ marginRight: "10px" }}
        />
        <span style={{ fontWeight: "bold", fontSize: "20px" }}>
          MyTaskBuddy
        </span>
      </Link>

      <ul
        style={{
          display: "flex",
          listStyle: "none",
          margin: 0,
          padding: 0,
        }}
      >
        <li style={{ marginRight: "35px" }}>
          <Link
            to={"/homepage"}
            style={getLinkStyle(0)}
            onMouseEnter={() => handleHover(0)}
            onMouseLeave={handleLeave}
          >
            Početna
          </Link>
        </li>
        <li style={{ marginRight: "35px" }}>
          <Link
            to={"/editprofile"}
            style={getLinkStyle(1)}
            onMouseEnter={() => handleHover(1)}
            onMouseLeave={handleLeave}
          >
            Profil
          </Link>
        </li>
        <li style={{ marginRight: "35px" }}>
          <Link
            to={"/statistics"}
            style={{
              ...getLinkStyle(2),
              fontWeight: "bold",
            }}
            onMouseEnter={() => handleHover(2)}
            onMouseLeave={handleLeave}
          >
            Statistika
          </Link>
        </li>
        <li>
          <a
            href="/login"
            style={getLinkStyle(3)}
            onMouseEnter={() => handleHover(3)}
            onMouseLeave={handleLeave}
            onClick={handleLogout}
          >
            ODJAVA
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default MenuBar;
