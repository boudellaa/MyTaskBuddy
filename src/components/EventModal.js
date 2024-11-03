import React, { useContext, useState, useEffect, useRef } from "react";
import GlobalContext from "../context/GlobalContext";
import axiosClient from "../http/axiosClient";
import { useSession } from "@supabase/auth-helpers-react";
import '../css/eventModal.css'
import { validateGoogleToken } from "../http/tokenHelper";

function EventModal() {
  const parentId = localStorage.getItem("parentId");
  const { setShowEventModal, daySelected, dispatchCalEvent, selectedEvent } =
    useContext(GlobalContext);

  const modalRef = useRef(null); // Create a ref for the modal container
  const [title, setTitle] = useState(
    selectedEvent ? selectedEvent.activity : ""
  );
  const [taskCategory, setTaskCategory] = useState(
    selectedEvent ? selectedEvent?.category : ""
  )
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

  const [videoFile, setVideoFile] = useState(null)
  const [audioFile, setAudioFile] = useState(null)

  const routineTypes = ["Standardna", "Dnevna", "Sedmična", "Mjesečna"]
  const [selectedRoutine, setSelectedRoutine] = useState(selectedEvent ? selectedEvent.routine : "Standardna")

  const session = useSession()

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

  const categoryColors = {
    home : 'bg-green-300',
    doctor: 'bg-blue-300',
    school: 'bg-yellow-300',
    free: 'bg-gray-300',
    sport: 'bg-red-300',
  };

  const getTaskCategoryColor = () => {
    return categoryColors[taskCategory] || 'bg-gray-300'
  }

  const createGoogleDate = (daySelected, timeString) => {

    // Split the time string into hours and minutes
    const [hours, minutes] = timeString.split(':').map(Number);

    // Add the hours and minutes to the daySelected object
    const updatedDate = daySelected.hour(hours).minute(minutes).second(0).millisecond(0);

    // Convert to ISO string
    return updatedDate.toISOString();
  }

  const deleteGoogleEvent = async () => {
    if (selectedEvent.event_id) {
      // if (validateGoogleToken()) {
      //   return
      // }
      const deleteUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${selectedEvent.event_id}`;
      await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          'Authorization': 'Bearer ' + session.provider_token,
        },
      });
    }
  };

  const updateGoogleEvent = async () => {
    // if (validateGoogleToken()) {
    //   return
    // }

    const event = {
      'summary': title,
      'description': "Created by MyTaskBuddy",
      'start': {
        'dateTime': createGoogleDate(daySelected, startTime),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      'end': {
        'dateTime': createGoogleDate(daySelected, endTime),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    }


    var createdEvent = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${selectedEvent.event_id}`, {
      method: "PUT",
      headers: {
        'Authorization': 'Bearer ' + session.provider_token
      },
      body: JSON.stringify(event)
    }).then((response) => response.json());

    return createdEvent.id;
  }

  const determineRecurrence = (recurrenceType) => {
    switch (recurrenceType) {
      case 'Dnevna':
        return 'RRULE:FREQ=DAILY'
      case 'Sedmična':
        return 'RRULE:FREQ=WEEKLY'
      case 'Mjesečna':
        return 'RRULE:FREQ=MONTHLY'
      default:
        // No recurrence for one-time events
        break;
    }
  }

  const createGoogleEvent = async (recurrenceType) => {
    // if (validateGoogleToken()) {
    //   return
    // }

    const event = {
      'summary': title,
      'description': "Created by MyTaskBuddy",
      'start': {
        'dateTime': createGoogleDate(daySelected, startTime),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      'end': {
        'dateTime': createGoogleDate(daySelected, endTime),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      'recurrence': []
    }

    event.recurrence.push(determineRecurrence(recurrenceType))

    var createdEvent = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        'Authorization': 'Bearer ' + session.provider_token
      },
      body: JSON.stringify(event)
    }).then((response) => response.json());

    return createdEvent.id;
  }

  async function handleSubmit(e) {
    // e.preventDefault();

    // Create a FormData object to handle file uploads
    const formData = new FormData();

    // Append existing fields to formData
    formData.append('activity', title);
    formData.append('date', daySelected.format("YYYY-MM-DD"));
    formData.append('startTime', startTime);
    formData.append('endTime', endTime);
    formData.append('location', location);
    formData.append('priority', isImportantTask === "high" ? 1 : 0);
    formData.append('username', username);
    formData.append('event_id', '');
    formData.append('parentId', parentId)
    formData.append('category', taskCategory)
    formData.append('routine', selectedRoutine)

    // Append audio and video files if they exist
    if (audioFile) {
      formData.append('audioFile', audioFile);
    } else if (selectedEvent?.audioFile) {
      formData.append('audioFile', selectedEvent.audioFile);
    }
    if (videoFile) {
      formData.append('videoFile', videoFile);
    } else if (selectedEvent?.videoFile) {
      formData.append('videoFile', selectedEvent.videoFile);
    }

    // Add the subtasks as a JSON string
    formData.append('subtasks', JSON.stringify(subtasks));

    var createdEventId = '';
    if (session) {
      if (selectedEvent) {
        createdEventId = selectedEvent.event_id
        await updateGoogleEvent()
      } else {
        createdEventId = await createGoogleEvent(selectedRoutine);
      }
    }

    formData.set('event_id', createdEventId);

    // Update calendar event
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
      event_id: createdEventId,
      category: taskCategory,
      routine: selectedRoutine
    };

    dispatchCalEvent({ type: selectedEvent ? "update" : "push", payload: calendarEvent });

    if (selectedEvent) {
      formData.append('id', selectedEvent.id)
      // Update tasks in the database
      axiosClient
        .put(`/tasks/update`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then(async (response) => {
          // Handle success
          if(subtasks.length === 0){
            return
          }

          subtasks.map((subtask) => subtask.taskId = selectedEvent.id)

          await axiosClient.put("/substeps", { subtasks })
            .catch((error) => {
              console.error("Error updating substeps! ", error)
            })
        })
        .catch((error) => {
          // Handle error
          console.error(error);
        });
    } else {
      // Send new task data to the endpoint
      axiosClient
        .post("/tasks", formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then(async (response) => {
          // Insert subtasks into the substeps table
          if(subtasks.length === 0){
            return
          }

          subtasks.map((subtask) => subtask.taskId = selectedEvent.id)

          await axiosClient.post("/substeps", { subtasks })
            .catch(error => console.error("Error adding substeps! ", error))
        })
        .catch((error) => {
          // Handle error
          console.error(error);
        });
    }

    setShowEventModal(false);
  }

  async function handleDeleteTask(e) {
    //  e.preventDefault();
    dispatchCalEvent({
      type: "delete",
      payload: selectedEvent,
    });

    await deleteGoogleEvent()

    let priorityValue = isImportantTask === "high" ? 1 : 0;
    // Send data to the endpoint
    axiosClient
      .delete(`/tasks?id=${selectedEvent.id}&routine=${selectedEvent.routine}&startDate=${selectedEvent.date}`)
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

  async function handleRemoveSubtask(index) {
    const updatedSubtasks = [...subtasks];

    if ((subtasks[index].stepName.trim() === '' || subtasks[index].description.trim() === '') && subtasks[index].id === undefined) {
      updatedSubtasks.splice(index, 1);
      setSubtasks(updatedSubtasks);
      return
    }

    await axiosClient.delete(`/substeps?id=${subtasks[index].id}`).then((res) => {
      if (res.status === 200) {
        updatedSubtasks.splice(index, 1);
        setSubtasks(updatedSubtasks);
      }
    }).catch((error) => {
      console.error("Erroring deleting substep! ", error)
    })
  }

  useEffect(() => {
    if (selectedEvent && selectedEvent.userId) {
      axiosClient
        .get(`/users/${selectedEvent.userId}`)
        .then((response) => {
          setUsername(response.data.username);
        })
        .catch((error) => {
          console.error(error);
        });
      axiosClient
        .get(`/substeps?taskId=${selectedEvent.id}`)
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowEventModal]);

  return (
    <div className="fixed w-full h-[90%] overflow-y-auto flex justify-center items-center modalContainer">
      <div ref={modalRef} className="modalWrapper">
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
          className="p-6 bg-white"
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

            <div className="flex flex-col">
              <label
                htmlFor="routine"
                className="block text-sm font-medium text-gray-700"
              >
                {selectedEvent ? "Odabrana rutina: " + selectedEvent.routine : "Odaberite tip rutine"}
              </label>
              {!selectedEvent &&
                <select
                  id="routine"
                  value={selectedRoutine}
                  className="w-full border border-gray-300 rounded text-black"
                  onChange={(e) => setSelectedRoutine(e.target.value)}
                >
                  {routineTypes.map(routine => (
                    <option key={routine} value={routine}>{routine}</option>
                  ))}
                </select>
              }
            </div>

            <div className="flex gap-4">
              <div className={`w-4 h-4 p-4 rounded-full ${getTaskCategoryColor()}`} />
              <select
                value={taskCategory}
                className="w-full border border-gray-300 rounded text-black"
                onChange={(e) => setTaskCategory(e.target.value)}
              >
                <option value="">Kategorija zadatka</option>
                <option value="home">Kuća</option>
                <option value="doctor">Ljekarski pregled</option>
                <option value="school">Škola</option>
                <option value="free">Slobodno vrijeme</option>
                <option value="sport">Sport</option>
              </select>
            </div>
            <div className="subtasksInfo">
              <label className="subtasksTitle">Podzadaci</label>
              <button className="addSubtaskButton" onClick={handleAddSubtask}>
                Dodaj podzadatak
              </button>
            </div>
            <div className="subtasksContainer">
              {subtasks.map((subtask, index) => (
                <div key={index} className="singleSubtask">
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

            <div>
              <p className="text-xl text-black">
                {daySelected &&
                  `${getBosnianDayOfWeek(daySelected.day())}, ${bosnianMonthNames[daySelected.month()]
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

            {/* Audio File Upload */}
            <div className="flex flex-col mt-4 space-y-2">
              <label htmlFor="audioFile" className="text-black">
                Upload Audio:
              </label>
              {selectedEvent?.audioFile && (
                <audio controls className="w-full">
                  <source src={`http://localhost:8000/uploads/${selectedEvent.audioFile}`} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              <input
                type="file"
                id="audioFile"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files[0])}
                className="w-full px-2 py-1 border border-gray-300 rounded text-black"
              />
            </div>

            {/* Video File Upload */}
            <div className="flex flex-col mt-4 space-y-2">
              <label htmlFor="videoFile" className="text-black">
                Upload Video:
              </label>
              {selectedEvent?.videoFile && (
                <video controls className="w-[50%]">
                  <source src={`http://localhost:8000/uploads/${selectedEvent.videoFile}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
              <input
                type="file"
                id="videoFile"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
                className="w-full px-2 py-1 border border-gray-300 rounded text-black"
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
