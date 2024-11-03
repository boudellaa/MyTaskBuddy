import dayjs from "dayjs";
import React, { useContext } from "react";
import GlobalContext from "../context/GlobalContext";

function CalendarHeader() {
  const { monthIndex, setMonthIndex } = useContext(GlobalContext);

  const bosnianMonthNames = [
    "Januar",
    "Februar",
    "Mart",
    "April",
    "Maj",
    "Juni",
    "Juli",
    "August",
    "Septembar",
    "Oktobar",
    "Novembar",
    "Decembar",
  ];

  function handlePrevMonth() {
    setMonthIndex(monthIndex - 1);
  }
  function handleNextMonth() {
    setMonthIndex(monthIndex + 1);
  }
  function handleReset() {
    setMonthIndex(
      monthIndex === dayjs().month()
        ? monthIndex + Math.random()
        : dayjs().month()
    );
  }
  return (
    <header
      className="calendarHeader px-4 py-2 flex flex-col items-center"
      style={{ marginTop: "50px" }}
    >
      <div className="flex items-center">
        <img
          src="/assets/images/calLogo.png"
          alt="calendar"
          className="mr-2 w-12 h-12"
        />
        <h1 className="mr-10 text-xl text-white-500 font-bold">Kalendar</h1>
        <button
          onClick={handleReset}
          style={{
            border: "1px solid",
            borderRadius: "3px",
            padding: "4px 8px",
            fontSize: "16px",
            backgroundColor: "white",
            color: "black",
            marginRight: "10px",
          }}
        >
          Danas
        </button>
        <span
          onClick={handlePrevMonth}
          className="cursor-pointer text-white-600 mx-2"
        >
          <span className="material-icons-outlined">chevron_left</span>
        </span>
        <span
          onClick={handleNextMonth}
          className="cursor-pointer text-white-600 mx-2"
        >
          <span className="material-icons-outlined">chevron_right</span>
        </span>
        <h2 className="text-xl text-white-500 font-bold">
          {`${bosnianMonthNames[monthIndex]} ${dayjs().year()}`}
        </h2>
      </div>
    </header>
  );
}
export default CalendarHeader;
