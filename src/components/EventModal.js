import React, { useContext, useState, useEffect, useRef } from "react";
import GlobalContext from "../context/GlobalContext";
import axios from "axios";

function EventModal() {
  const parentId = localStorage.getItem("parentId");
  const { setShowEventModal, daySelected, dispatchCalEvent, selectedEvent } =
    useContext(GlobalContext);

  const modalRef = useRef(null); // Create a ref for the modal container
  const [title, setTitle] = useState(
    selectedEvent ? selectedEvent.activity : ""
  );
  const [isImportantTask, setIsImportantTask] = useState(
    selectedEvent && selectedEvent.priority === 1 ? "high" : ""
  );
  const [subtasks, setSubtasks] = useState([]);

  const [startTime, setStartTime] = useState(
    selectedEvent ? selectedEvent.startTime : ""
  );
  const [endTime, setEndTime] = useState(
    selectedEvent ? selectedEvent.endTime : ""
  );
  const [location, setLocation] = useState(
    selectedEvent ? selectedEvent.location : ""
  );
  const [username, setUsername] = useState("");

  const [task_id, setTaskId] = useState(selectedEvent ? selectedEvent.id : "");

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

  function getBosnianDayOfWeek(day) {
    const bosnianDaysOfWeek = [
      "Nedjelja",
      "Ponedjeljak",
      "Utorak",
      "Srijeda",
      "Četvrtak",
      "Petak",
      "Subota",
    ];
    return bosnianDaysOfWeek[day];
  }
  function handleSubmit(e) {
    e.preventDefault();
    const calendarEvent = {
      title,
      isImportantTask,
      subtasks,
      day: daySelected.valueOf(),
      date: daySelected.format("YYYY-MM-DD"),
      startTime,
      endTime,
      location,
      id: selectedEvent ? selectedEvent.id : Date.now(),
      username,
    };
    if (selectedEvent) {
      dispatchCalEvent({ type: "update", payload: calendarEvent });
    } else {
      dispatchCalEvent({ type: "push", payload: calendarEvent });
    }

    let priorityValue = isImportantTask === "high" ? 1 : 0;

    if (selectedEvent) {
      // Update tasks database

      axios
        .put(`http://localhost:8000/tasks/update`, {
          activity: title,
          date: daySelected.format("YYYY-MM-DD"),
          startTime: startTime,
          endTime: endTime,
          location: location,
          priority: priorityValue,
          username: username,
          taskId: task_id,
        })
        .then((response) => {
          // Handle success
          //console.log(response.data);
        })
        .catch((error) => {
          // Handle error
          console.error(error);
        });
      setShowEventModal(false);
    } else {
      // Send data to the endpoint for tasks

      axios
        .post("http://localhost:8000/tasks", {
          activity: title,
          date: daySelected.format("YYYY-MM-DD"),
          startTime: startTime,
          endTime: endTime,
          location: location,
          priority: priorityValue,
          username: username,
          parentId: parentId,
        })
        .then((response) => {
          // Handle success
          //console.log(response.data);

          // Insert subtasks into the substeps table
          const subtasksPromises = subtasks.map((subtask) => {
            return axios.post("http://localhost:8000/substeps", {
              stepName: subtask.stepName,
              description: subtask.description,
              activity: title,
              date: daySelected.format("YYYY-MM-DD"),
              startTime: startTime,
              endTime: endTime,
              location: location,
              priority: priorityValue,
              username: username,
            });
          });

          Promise.all(subtasksPromises)
            .then((subtasksResponses) => {
              // Handle success
              //console.log(subtasksResponses);
            })
            .catch((error) => {
              // Handle error
              console.error(error);
            });
        })
        .catch((error) => {
          // Handle error
          console.error(error);
        });

      setShowEventModal(false);
    }
  }

  function handleDeleteTask(e) {
    //  e.preventDefault();
    dispatchCalEvent({
      type: "delete",
      payload: selectedEvent,
    });
    let priorityValue = isImportantTask === "high" ? 1 : 0;
    // Send data to the endpoint
    axios
      .post("http://localhost:8000/tasks/delete", {
        activity: title,
        date: daySelected.format("YYYY-MM-DD"),
        startTime: startTime,
        endTime: endTime,
        location: location,
        priority: priorityValue,
        username: username,
      })
      .then((response) => {
        // Handle success
        //console.log(response.data);
      })
      .catch((error) => {
        // Handle error
        console.error(error);
      });
    setShowEventModal(false);
  }

  function handleSubtasksChange(index, updatedSubtask) {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index] = updatedSubtask;
    setSubtasks(updatedSubtasks);
  }

  function handleAddSubtask() {
    setSubtasks([...subtasks, { stepName: "", description: "" }]);
  }

  function handleRemoveSubtask(index) {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks.splice(index, 1);
    setSubtasks(updatedSubtasks);
  }

  useEffect(() => {
    if (selectedEvent && selectedEvent.userId) {
      axios
        .get(`http://localhost:8000/users/${selectedEvent.userId}`)
        .then((response) => {
          setUsername(response.data.username);
        })
        .catch((error) => {
          console.error(error);
        });
      axios
        .get(`http://localhost:8000/substeps?taskId=${selectedEvent.id}`)
        .then((response) => {
          setSubtasks(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [selectedEvent]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowEventModal(false);
      }
    };
    if (selectedEvent) {
      //console.log(selectedEvent);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowEventModal]);

  return (
    <div className="fixed top-0 left-0 w-full h-screen flex justify-center items-center">
      <div ref={modalRef} className="w-1/3 bg-white rounded-lg shadow-2xl">
        <header className="flex justify-between items-center px-4 py-2 bg-gray-100">
          <span className="material-icons-outlined text-gray-400 text-xl">
            drag_handle
          </span>

          <div>
            {selectedEvent && (
              <div className="flex items-center">
                <span
                  onClick={() => {
                    handleDeleteTask();
                  }}
                  className="material-icons-outlined text-gray-400 cursor-pointer mr-2"
                >
                  delete
                </span>
                <span
                  className="text-black"
                  onClick={() => {
                    handleDeleteTask();
                  }}
                >
                  Obriši zadatak
                </span>
              </div>
            )}
          </div>

          <button onClick={() => setShowEventModal(false)}>
            <span className="material-icons-outlined text-white text-xl">
              close
            </span>
          </button>
        </header>
        <div
          className="p-6"
          style={{ paddingBottom: "0px", paddingTop: "0px" }}
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="material-icons-outlined text-gray-400 text-3xl">
                priority_high
              </span>
              <select
                value={isImportantTask}
                className="w-full border border-gray-300 rounded text-black"
                onChange={(e) => setIsImportantTask(e.target.value)}
              >
                <option value="">Prioritet zadataka</option>
                <option value="high">Visok</option>
              </select>
            </div>
            <input
              type="text"
              name="title"
              placeholder="Naziv zadatka"
              value={title}
              required
              className="w-full pb-2 border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500 text-2xl font-semibold text-gray-600"
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="mt-4 flex items-center">
              <label className="text-black mr-2">Podzadaci:</label>
              <div className="subtask-container h-32 overflow-y-auto">
                {subtasks.map((subtask, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <input
                      type="text"
                      placeholder="Naziv podzadatka"
                      value={subtask.stepName}
                      className="w-1/2 px-2 py-1 border border-gray-300 rounded text-black"
                      onChange={(e) =>
                        handleSubtasksChange(index, {
                          ...subtask,
                          stepName: e.target.value,
                        })
                      }
                    />
                    <textarea
                      placeholder="Opis podzadatka"
                      value={subtask.description}
                      className="w-1/2 px-2 py-1 border border-gray-300 rounded text-black resize-none"
                      onChange={(e) =>
                        handleSubtasksChange(index, {
                          ...subtask,
                          description: e.target.value,
                        })
                      }
                    ></textarea>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(index)}
                      className="text-red-500"
                    >
                      Ukloni
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddSubtask}
                className="mt-2 ml-2 text-blue-500"
              >
                Dodaj podzadatak
              </button>
            </div>

            <div>
              <p className="text-xl text-black">
                {daySelected &&
                  `${getBosnianDayOfWeek(daySelected.day())}, ${
                    bosnianMonthNames[daySelected.month()]
                  } ${daySelected.date()}`}
              </p>

              <div className="mb-4">
                <label
                  htmlFor="assignee"
                  className="block text-sm font-medium text-gray-700"
                >
                  Unesite username korisnika kojem želite dodijeliti zadatak:
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                  readOnly={false}
                  required
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center space-x-2">
                  <label htmlFor="startTime" className="text-black">
                    Vrijeme početka:
                  </label>
                  <input
                    type="text"
                    id="startTime"
                    name="startTime"
                    placeholder="HH:MM"
                    value={startTime}
                    required
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-black"
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center space-x-2">
                  <label htmlFor="endTime" className="text-black">
                    Vrijeme završetka:
                  </label>
                  <input
                    type="text"
                    id="endTime"
                    name="endTime"
                    placeholder="HH:MM"
                    value={endTime}
                    required
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-black"
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="material-icons-outlined text-gray-400 text-3xl">
                location_on
              </span>
              <input
                type="text"
                name="location"
                placeholder="Lokacija"
                value={location}
                className="w-full pb-2 border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500 text-xl text-gray-600"
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <footer className="flex justify-end p-4 mt-5 border-t">
            <button
              type="button"
              onClick={() => setShowEventModal(false)}
              className="px-4 py-2 mr-2 text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
            >
              Odustani
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
              onClick={handleSubmit}
            >
              {selectedEvent ? "Ažuriraj zadatak" : "Dodaj zadatak"}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default EventModal;
