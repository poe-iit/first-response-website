import React, { useEffect } from 'react'

export const WebSocketPage = () => {
  
  useEffect(() => {
    var ws = new WebSocket('wss://first-response-server.onrender.com');

    // ws.send({})

    ws.onopen = function() {
        console.log('Connected to the server');
        ws.send('Hello, server!');
    };

    ws.onmessage = function(evt) {
        console.log('Message from server: ', evt.data);
    };

    ws.onclose = function() {
        console.log('Disconnected from the server');
    };

    return () => {
      ws.close()
    }
  }, [])

  return (
    <div>WebSocket</div>
  )
}
