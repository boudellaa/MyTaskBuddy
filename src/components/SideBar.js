import React from "react";
import CreateEventButton from "./CreateEventButton";
import SmallCalendar from "./SmallCalendar";
import '../css/sidebar.css'

function Sidebar() {
  return (
    <aside className="sidebarContainer">
      <CreateEventButton />
      <SmallCalendar />
    </aside>
  );
}

export default Sidebar;
