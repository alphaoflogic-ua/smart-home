import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (url: string) => {
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      const socket = new WebSocket(url);
      ws.current = socket;

      socket.onopen = () => setReadyState(WebSocket.OPEN);
      socket.onclose = () => {
        setReadyState(WebSocket.CLOSED);
        // Attempt to reconnect after 3 seconds
        setTimeout(connect, 3000);
      };
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
        } catch (e) {
          setLastMessage(event.data);
        }
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  const sendMessage = (message: any) => {
    if (ws.current && readyState === WebSocket.OPEN) {
      ws.current.send(typeof message === 'string' ? message : JSON.stringify(message));
    }
  };

  return { lastMessage, readyState, sendMessage };
};
