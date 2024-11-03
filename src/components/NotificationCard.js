import React from "react";
import "../css/notification.css";
import axiosClient from "../http/axiosClient";
import { useNotifications } from "../context/NotificationsContext";

const NotificationCard = ({ task }) => {
    const { id, activity, category, date, help, parentId, userId, status, progress } = task;
    const { deleteNotification } = useNotifications()

    const categoryColors = {
        home: 'bg-green-300',
        doctor: 'bg-blue-300',
        school: 'bg-yellow-300',
        free: 'bg-gray-300',
        sport: 'bg-red-300',
    };

    const determineTaskType = () => {
        if (status === 1) {
          return 'task_completed';
        } else if (status === 2) {
          return 'task_started';  // Added case for task_started
        } else if (help === 1) {
          return 'help_requested';
        }
      };
      
    const categoryTranslations = {
      home: 'Kuća',         
      doctor: 'Doktor',     
      school: 'Škola',      
      free: 'Slobodno vrijeme',      
      sport: 'Sport',       
    };
    
    const getTranslatedCategory = () => {
      return categoryTranslations[category] || category; 
    }

    const getTaskCategoryColor = () => {
        return categoryColors[category] || 'bg-gray-300'
    }

    const dismissNotification = async () => {
        await axiosClient.put(`/notifications/dismiss?id=${id}&taskType=${determineTaskType()}`)
            .then((response) => {
                if (response.status === 200) {
                    deleteNotification(id)
                }
            })
    }

    return (
        <div className="notification-card">
            <div className="notification-header">
                <h4 className="notification-title">{activity}</h4>
                <p className={`notification-category ${getTaskCategoryColor()}`}>{getTranslatedCategory()}</p>
            </div>
            <div className="notification-body">
                <p><strong>Datum:</strong> {new Date(date).toLocaleDateString()}</p>
                <p><strong>Potrebna pomoć:</strong> {help ? "Da" : "Ne"}</p>
                <p><strong>Status zadatka:</strong> {status === 1 ? "Završen" : status === 2 ? "Započet" : "Na čekanju"}</p>
            </div>
            <div className="notification-footer">
                <p><strong>Task ID:</strong> {id}</p>
                <button className="dismiss-button" onClick={dismissNotification}>Izbriši</button>
            </div>
        </div>
    );
};

export default React.memo(NotificationCard);
