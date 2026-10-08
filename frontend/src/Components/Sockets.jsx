import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('username') || 'GuestUser';
    setCurrentUser(user);

    const newSocket = io('http://localhost:5002');
    
    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, currentUser, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};