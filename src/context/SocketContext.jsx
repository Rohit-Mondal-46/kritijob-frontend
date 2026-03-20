import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { useToast } from './ToastContext';
import api from '../utils/api'; // Import api utility

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user, token } = useContext(AuthContext); // Assuming token is available in AuthContext explicitly or via localStorage
    const { addToast } = useToast();
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Only connect if user is authenticated
        if (token) {
            // Fetch initial notifications
            api.get('/notifications')
               .then(({ data }) => {
                   if(data.success) {
                       setNotifications(data.data);
                       setUnreadCount(data.data.filter(n => !n.isRead).length);
                   }
               })
               .catch(err => console.error('Failed to fetch notifications', err));

            const newSocket = io(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000', {
                auth: { token },
                query: { token } // Fallback
            });

            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('✅ Socket Connected:', newSocket.id);
            });

            newSocket.on('connect_error', (err) => {
                console.error('❌ Socket Connection Error:', err.message);
            });

            newSocket.on('disconnect', (reason) => {
                console.warn('⚠️ Socket Disconnected:', reason);
            });

            newSocket.on('receive_message', (data) => {
                console.log('📩 Message Received:', data);
                setMessages((list) => [...list, data]);
            });

            newSocket.on('notification:new', (notification) => {
                console.log('🔔 Notification Received:', notification);
                addToast(notification.title, 'info'); 
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
            });

            return () => {
                console.log('🔌 Disconnecting Socket...');
                newSocket.disconnect();
            };
        }
    }, [token, addToast]);

    const joinRoom = (room) => {
        if(socket) socket.emit('join_room', room);
    };

    const sendMessage = (messageData) => {
        if(socket) {
            socket.emit('send_message', messageData);
            setMessages((list) => [...list, messageData]);
        }
    };
    
    const markAsRead = (id) => {
        if(socket) {
             socket.emit('notification:read', id);
             // Optimistic update
             setNotifications(prev => prev.map(n => n._id === id ? {...n, isRead: true} : n));
             setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };
    
    // Function to set initial notifications from API fetch
    const setInitialNotifications = (serverNotifications) => {
        setNotifications(serverNotifications);
        setUnreadCount(serverNotifications.filter(n => !n.isRead).length);
    };

    return (
        <SocketContext.Provider value={{ socket, messages, notifications, unreadCount, joinRoom, sendMessage, markAsRead, setInitialNotifications }}>
            {children}
        </SocketContext.Provider>
    );
};
