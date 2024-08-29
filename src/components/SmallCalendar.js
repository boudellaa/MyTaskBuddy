import dayjs from "dayjs";
import React, { useContext, useEffect, useState } from "react";
import GlobalContext from "../context/GlobalContext";
import { getMonth } from "../util";

function SmallCalendar() {
  const [currentMonthIdx, setCurrentMonthIdx] = useState(dayjs().month());
  const [currentMonth, setCurrentMonth] = useState(getMonth());
  useEffect(() => {
    setCurrentMonth(getMonth(currentMonthIdx));
  }, [currentMonthIdx]);

  const { monthIndex, setSmallCalendarMonth, setDaySelected, daySelected } =
    useContext(GlobalContext);

  const bosnianMonthNames = [
    "Januar",
    "Februar",
    "Mart",
    "April",
    "Maj",
    "Jun",
    "Jul",
    "Avgust",
    "Septembar",
    "Oktobar",
    "Novembar",
    "Decembar",
  ];

  useEffect(() => {
    setCurrentMonthIdx(monthIndex);
  }, [monthIndex]);

  function handlePrevMonth() {
    setCurrentMonthIdx(currentMonthIdx - 1);
  }

  function handleNextMonth() {
    setCurrentMonthIdx(currentMonthIdx + 1);
  }

  function getDayClass(day) {
    const format = "DD-MM-YY";
    const nowDay = dayjs().format(format);
    const currDay = day.format(format);
    const slcDay = daySelected && daySelected.format(format);

    if (nowDay === currDay) {
      return {
        backgroundColor: "white",
        borderRadius: "50%",
        color: "purple",
      };
    } else if (currDay === slcDay) {
      return {
        backgroundColor: "purple",
        borderRadius: "50%",
        color: "white",
        fontWeight: "bold",
      };
    } else {
      return {
        backgroundColor: "white",
        borderRadius: "50%",
        color: "black",
      };
    }
  }

  function getLocalizedDayName(day) {
    const daysInBosnian = ["NED", "PON", "UTO", "SRI", "ČET", "PET", "SUB"];
    const dayIndex = day.day();
    return daysInBosnian[dayIndex];
  }

  return (
    <div className="mt-9">
      <header className="flex justify-between">
        <p className="text-white-500 font-bold">
          {`${bosnianMonthNames[currentMonthIdx]} ${dayjs().year()}`}
        </p>

        <div>
          <span onClick={handlePrevMonth} className="cursor-pointer">
            <span className="material-icons-outlined text-white-600 mx-2">
              chevron_left
            </span>
          </span>

          <span onClick={handleNextMonth} className="cursor-pointer">
            <span className="material-icons-outlined text-white-600 mx-2">
              chevron_right
            </span>
          </span>
        </div>
      </header>
      <div
        className="grid grid-cols-7 grid-rows-6"
        style={{ backgroundColor: "white" }}
      >
        {currentMonth[0].map((day, i) => (
          <span key={i} className="text-sm py-1 text-center custom-span">
            {getLocalizedDayName(day)}
          </span>
        ))}
        {currentMonth.map((row, i) => (
          <React.Fragment key={i}>
            {row.map((day, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSmallCalendarMonth(currentMonthIdx);
                  setDaySelected(day);
                }}
                style={{
                  padding: "0.25rem 0",
                  width: "100%",
                  ...getDayClass(day),
                }}
              >
                <span style={{ fontSize: "0.875rem" }}>{day.format("D")}</span>
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>
      <style>{`
        .custom-span {
          color: black;
        }

        @media screen and (max-width: 768px) {
          /* Add responsive styles for smaller screens if needed */
        }
      `}</style>
    </div>
  );
}

export default SmallCalendar;
