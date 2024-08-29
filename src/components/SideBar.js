import React from "react";
import CreateEventButton from "./CreateEventButton";
import SmallCalendar from "./SmallCalendar";

const sidebarStyle = {
  padding: "-20px",
  width: "220px",
  position: "fixed",
  top: "20px",
  left: "5px",
  height: "100vh",
  marginLeft: "20px",
};

function Sidebar() {
  return (
    <aside style={sidebarStyle}>
      <CreateEventButton />
      <SmallCalendar />
    </aside>
  );
}

export default Sidebar;
