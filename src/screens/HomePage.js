import React, { useState, useContext, useEffect } from "react";
import "../index.css";
import { getMonth } from "../util";
import CalendarHeader from "../components/CalendarHeader";
import Month from "../components/Month";
import GlobalContext from "../context/GlobalContext";
import EventModal from "../components/EventModal";
import Sidebar from "../components/SideBar";
import MenuBarHP from "../components/MenuBarHP";
import { validateGoogleToken } from "../http/tokenHelper";

function HomePage() {
  const [currentMonth, setCurrentMonth] = useState(getMonth());
  const { monthIndex, showEventModal } = useContext(GlobalContext);
  const [isPristine, setIsPristine] = useState(true);

  useEffect(() => {
    try {
      const parentId = localStorage.getItem("parentId");
      const googleId = localStorage.getItem('googleId');
      if (!parentId && !googleId) {
        window.location.replace("/");
      } else {
        setIsPristine(false);
      }

      if (validateGoogleToken()) {
        return
      }
    } catch (err) {
      window.location.replace("/");
    }
  }, []);

  useEffect(() => {
    setCurrentMonth(getMonth(monthIndex));
  }, [monthIndex]);

  if (isPristine) {
    return null;
  }

  return (
    <React.Fragment>
      {showEventModal && <EventModal />}

      <div className="flex flex-col">
        <MenuBarHP /> {/* Add the MenuBarHP component here */}
        <CalendarHeader />
        <div className="flex flex-1">
          <Sidebar />
          <Month month={currentMonth} />
        </div>
      </div>
    </React.Fragment>
  );
}

export default HomePage;
