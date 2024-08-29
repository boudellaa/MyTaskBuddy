import dayjs from "dayjs";
import React, { useContext, useState, useEffect } from "react";
import GlobalContext from "../context/GlobalContext";

function Day({ day, rowIdx }) {
  const [dayEvents, setDayEvents] = useState([]);
  const {
    setDaySelected,
    setShowEventModal,
    filteredEvents,
    setSelectedEvent,
  } = useContext(GlobalContext);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (localStorage.getItem("parentId")) {
          const response = await fetch(
            `http://localhost:8000/tasks?parentId=${localStorage.getItem(
              "parentId"
            )}`
          );
          if (response.ok) {
            const tasks = await response.json();
            const events = tasks.filter(
              (task) =>
                dayjs(task.date).format("YYYY-MM-DD") ===
                day.format("YYYY-MM-DD")
            );

            setDayEvents(events);
          } else {
            throw new Error("Failed to fetch tasks");
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchTasks();
  }, [day, dayEvents]);

  function getCurrentDayClass() {
    const isCurrentDay = day.format("DD-MM-YY") === dayjs().format("DD-MM-YY");
    return isCurrentDay
      ? "bg-blue-600 text-white rounded-full w-7"
      : "text-black";
  }

  function getLocalizedDayName() {
    const daysInBosnian = ["NED", "PON", "UTO", "SRI", "ČET", "PET", "SUB"];
    const dayIndex = day.day();
    return daysInBosnian[dayIndex];
  }

  return (
    <div className="custom-border flex flex-col">
      <header className="flex flex-col items-center">
        {rowIdx === 0 && (
          <p className="text-sm mt-1 text-black">{getLocalizedDayName()}</p>
        )}
        <p className={`text-sm p-1 my-1 text-center ${getCurrentDayClass()}`}>
          {day.format("DD")}
        </p>
      </header>
      <div
        className="flex-1 cursor-pointer"
        onClick={() => {
          setDaySelected(day);
          setShowEventModal(true);
        }}
      >
        {dayEvents.map((evt, idx) => (
          <div
            key={evt.id}
            onClick={() => {
              setSelectedEvent(evt);
            }}
            className={`bg-blue-200 p-1 mr-3 text-black text-sm font-bold rounded mb-1 truncate`}
          >
            {evt.activity}
          </div>
        ))}
      </div>
      <style>{`
        .custom-border {
          border: 0.5px solid black;
          width: 150px;
          height:150px;
          background-color: white;
        }

        @media screen and (max-width: 768px) {
          .custom-border {
            width: 80px;
          }
        }
      `}</style>
    </div>
  );
}

export default Day;
