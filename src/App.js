import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomeScreen from "./screens/WelcomeScreen";
import Login from "./screens/Login";
import Register from "./screens/Register";
import ForgotPassword from "./screens/ForgotPassword";
import HomePage from "./screens/HomePage";
import EditProfile from "./screens/EditProfile";
import Statistics from "./screens/Statistics";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useNotifications } from "./context/NotificationsContext";
import axiosClient from "./http/axiosClient";

function App() {
  const supabase = useSupabaseClient();
  const { addNotification } = useNotifications();

  const insertNotification = async (taskType, task) => {
    const taskId = task.id
    await axiosClient.put('/notifications', {
      taskType,
      taskId
    }).then((response) => {
      if (response.status === 200) {
        addNotification(task, taskType);
      }
    }).catch((error) => {
      console.error("Error adding notification ", error)
    })
  }

  useEffect(() => {
    const channel = supabase.channel('tasks-channel');

    channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' }, (payload) => {
      const task = payload.new;

      if (task.parentId !== JSON.parse(localStorage.getItem('parentId'))) {
        return;
      }

      /*
      This setup is working in the following way:
      1. Once a task is completed -> uncompleting it or simulating completion again will not result in a new notification
      2. Help can be asked as many times as the user wants to -> each time a notification will be raised
        2.1. Protection against spam notifications is implemented -> while a help notification is active, it won't raise new notifications for the same type
      3. If a user asks for help and in the mean time completes the task:
        3.1. First notification will include the help request
        3.2. Second notifcation will override that one -> not add a new one, but instead show one notification with help and status=completed
      */

    // Handle task started
    if (task.status === 2) {
      insertNotification('task_started', task);
      return;
    }
      // Handle task help requested + task completed already - preventing infinite loop
      if (task.help_requested && task.task_completed && task.help === 1 && task.status === 1) {
        return
      }

      // Handle task help requested + task completed in the mean time
      if (task.help_requested && task.help === 1 && task.status === 1) {
        insertNotification('task_completed', task)
        return
      }

      // Handle task completion
      if (task.task_completed === false && task.status === 1) {
        insertNotification('task_completed', task)
      }

      // Handle help request
      if (!task.help_requested && task.help === 1) {
        insertNotification('help_requested', task)
      }

    }).subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase]);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route exact path="/" element={<WelcomeScreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/editprofile" element={<EditProfile />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
