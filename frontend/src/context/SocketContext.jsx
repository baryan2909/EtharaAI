import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // If user is logged out, disconnect existing socket
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Determine target URL dynamically matching backend config
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 
      (import.meta.env.PROD ? '/' : 'http://127.0.0.1:5000');

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket synchronized with server, ID:', newSocket.id);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket desynchronized. Reason:', reason);
    });

    // Cleanup hook on logout or unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Expose project room subscription channels
  const joinProjectRoom = useCallback((projectId) => {
    if (socket) {
      socket.emit('join_project', projectId);
    }
  }, [socket]);

  const leaveProjectRoom = useCallback((projectId) => {
    if (socket) {
      socket.emit('leave_project', projectId);
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, joinProjectRoom, leaveProjectRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used inside a SocketProvider');
  }
  return context;
};
