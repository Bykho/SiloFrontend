import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import styles from './NotificationsComponent.module.css';
import config from '../config';

const NotificationsComponent = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/notifications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      console.log('notifications:', data);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/notifications/mark_read/${notificationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className={styles.notificationContainer}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className={styles.notificationButton}
      >
        <Bell size={24} color="#ffffff" />
        {notifications.length > 0 && <span className={styles.notificationDot} />}
      </button>
      {showNotifications && (
        <div className={styles.modal}>
          <div className={styles.modalHeader}>Notifications</div>
          {notifications.length === 0 ? (
            <div className={styles.noNotifications}>No new notifications</div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className={styles.notificationItem}>
                <div className={styles.notificationType}>{notification.type}</div>
                <div className={styles.notificationMessage}>{notification.message}</div>
                <button
                  onClick={() => markAsRead(notification.id)}
                  className={styles.markAsReadButton}
                >
                  Mark as read
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsComponent;