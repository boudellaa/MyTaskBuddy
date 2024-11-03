import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosClient from '../http/axiosClient';

const NotificationsContext = createContext();

export const useNotifications = () => {
    return useContext(NotificationsContext);
};

export const NotificationsProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (updatedNotification, taskType) => {
        
        setNotifications((prev) => {
            const existingNotificationIndex = prev.findIndex(
                (notification) => notification.id === updatedNotification.id
            );

            if (existingNotificationIndex !== -1) {
                // Notification exists, update it
                const updatedNotifications = [...prev];
                updatedNotifications[existingNotificationIndex] = updatedNotification;
                return updatedNotifications;
            } else {
                // Notification doesn't exist, add it as a new one
                return [...prev, updatedNotification];
            }
        });
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const deleteNotification = (notificationId) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));
    }

    useEffect(() => {
        async function fetchNotifications() {
            var response = await axiosClient.get('/notifications')

            if (response.status === 200) {
                setNotifications(response.data.rows)
            }
        }

        fetchNotifications()
    }, [])

    return (
        <NotificationsContext.Provider value={{ notifications, addNotification, clearNotifications, deleteNotification }}>
            {children}
        </NotificationsContext.Provider>
    );
};
