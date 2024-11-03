import React, { useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { useNotifications } from "../context/NotificationsContext";
import NotificationCard from "./NotificationCard";

const NotificationsList = ({ show, handleClose }) => {
    const { notifications } = useNotifications();

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Notifikacije</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {notifications.length === 0 ? (
                    <p>No notifications available.</p>
                ) : (
                    <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                        {notifications.map((notification, index) => (
                            <NotificationCard key={'notification-' + index} task={notification} />
                        ))}
                    </ul>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Zatvori
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default NotificationsList;
