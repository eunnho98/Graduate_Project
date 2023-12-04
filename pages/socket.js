import { Button } from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';

// 랜덤 유저

function Socket() {
  let socket;
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState(Math.floor(new Date().getTime() / 1000));
  const [currentMessage, setCurrentMessage] = useState('');
  const [skt, setSkt] = useState();
  const [intervalId, setIntervalId] = useState();
  const [res, setRes] = useState();

  const btnColor = ['orange', 'yellow', 'pink'];
  useEffect(() => {
    const url = 'wss://163.180.186.123:8000/ws/' + user;
    const ws = new WebSocket(url);
    console.log('ws', ws);

    ws.onopen = (e) => {
      ws.send('Connect!');
    };

    ws.onmessage = (e) => {
      const message = JSON.parse(e.data);
      console.log(message);
    };

    ws.onclose = (e) => {
      console.log('Connection Closed', e);
    };

    setSkt(ws);

    return () => {
      ws.close();
      setSkt(null);
    };
  }, []);

  useEffect(() => {
    if (skt === null) {
      console.log('skt in null');
    } else {
      console.log('skt is alive');
    }
  }, [skt]);

  const onConnect = () => {
    const url = 'wss://163.180.186.123:8000/ws/' + user;
    const ws = new WebSocket(url);
    console.log('ws', ws);

    ws.onopen = (e) => {
      ws.send('Connect!');
    };

    ws.onmessage = (e) => {
      const message = JSON.parse(e.data);
      console.log(message);
    };
    setSkt(ws);
  };

  const onClose = () => {
    skt.close();
    setSkt(null);
  };

  const sendMessage = () => {
    if (skt === null) {
      console.log('Connection Closed');
    } else {
      skt.send(currentMessage);
      skt.onmessage = (e) => {
        const message = JSON.parse(e.data);
        console.log('message', message);
      };
    }
  };

  const sendMessagePer = () => {
    if (skt === null) {
      console.log('connection closed');
    } else {
      const interval = setInterval(() => {
        const data = JSON.stringify({
          randomNumber: 'randomNumber',
        });
        skt.send(data);
        skt.onmessage = (e) => {
          const message = JSON.parse(e.data);
          console.log('per message', message.rannum);
          setRes(message.rannum);
        };
      }, 500);
      setIntervalId(interval);
    }
  };

  const stopPer = () => {
    clearInterval(intervalId);
    setIntervalId(-1);
  };
  return (
    <div>
      <input
        type="text"
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
      />
      <Button onClick={sendMessage} colorScheme="red">
        send
      </Button>
      <Button colorScheme="blue" onClick={sendMessagePer}>
        0.5초마다 보내기
      </Button>
      <Button colorScheme="green" onClick={stopPer}>
        중지
      </Button>
      <Button
        colorScheme={btnColor[res]}
        onClick={() => console.log('Clicked!')}
      >
        Test
      </Button>
      <Button onClick={onConnect}>웹소켓 연결하기</Button>
      <Button onClick={onClose}>웹소켓 종료</Button>
    </div>
  );
}

export default Socket;
