import dayjs from "dayjs";
import React, { useContext, useState, useEffect } from "react";
import GlobalContext from "../context/GlobalContext";
import axiosClient from "../http/axiosClient";
import '../css/calendar.css'

function Day({ day, rowIdx }) {
  const [dayEvents, setDayEvents] = useState([]);
  const {
    setDaySelected,
    setShowEventModal,
    showEventModal,
    filteredEvents,
    setSelectedEvent,
  } = useContext(GlobalContext);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (localStorage.getItem("parentId")) {
          const response = await axiosClient.get(
            `/tasks?parentId=${localStorage.getItem(
              "parentId"
            )}`
          );

          if (response.status === 200) {
            const tasks = response.data;
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

    if (showEventModal) {
      return
    }
    fetchTasks();
  }, [day, showEventModal]);

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

  const categoryColors = {
    home: 'bg-green-300',
    doctor: 'bg-blue-300',
    school: 'bg-yellow-300',
    free: 'bg-gray-300',
    sport: 'bg-red-300',
  };

  const getTaskCategoryColor = (selectedEvent) => {
    return categoryColors[selectedEvent?.category] || 'bg-gray-300';
  }

  return (
    <div className="singleDay flex flex-col">
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
            className={`${getTaskCategoryColor(evt)} p-1 mr-3 text-black text-sm font-bold rounded mb-1 truncate`}
          >
            {evt.activity}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Day;
