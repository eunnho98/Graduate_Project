import { Button } from '@chakra-ui/react';
import React, { useState, useEffect, useRef } from 'react';

// 랜덤 유저

function Socket2() {
  const [currentMessage, setCurrentMessage] = useState('');
  const [skt, setSkt] = useState();
  const [intervalId, setIntervalId] = useState();
  const [gyroData, setGyroData] = useState(null);
  const [accerData, setAccerData] = useState(null);
  const [previousAccerData, setPreviousAccerData] = useState([]);

  const gyroDataRef = useRef(null);
  const accerDataRef = useRef(null);
  const [result, setResult] = useState(undefined);
  const [t, setT] = useState(undefined);
  const [user, setUser] = useState(Math.random());

  const handleDeviceMotion = (event) => {
    const { alpha, beta, gamma } = event.rotationRate;
    const { x, y, z } = event.accelerationIncludingGravity;
    setGyroData({ alpha, beta, gamma });
    setAccerData({ x, y, z });

    const currentTime = Date.now();
    setPreviousAccerData((prev) => [
      ...prev,
      { timestamp: currentTime, accerData: { x, y, z } },
    ]);
  };

  useEffect(() => {
    const url = 'wss://163.180.186.123:8000/ws2/' + user;
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
    const url = 'wss://163.180.186.123:8000/ws2/' + user;
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
      const currentTime = Date.now();
      const accData = previousAccerData.filter(
        (item) => currentTime - item.timestamp <= 100,
      );

      const acc_x = accData.map((item) => item.accerData.x);
      const acc_y = accData.map((item) => item.accerData.y);
      const acc_z = accData.map((item) => item.accerData.z);
      const data = JSON.stringify({
        acc_x,
        acc_y,
        acc_z,
        // gyro_x: gyroData.alpha,
        // gyro_y: gyroData.beta,
        // gyro_z: gyroData.gamma,
      });
      skt.send(data);
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
      if (gyroData === null) {
        console.log('Sensor Not Granted');
      } else {
        const interval = setInterval(() => {
          const data = JSON.stringify({
            acc_x: accerDataRef.current.x,
            acc_y: accerDataRef.current.y,
            acc_z: accerDataRef.current.z,
            // gyro_x: gyroDataRef.current.alpha,
            // gyro_y: gyroDataRef.current.beta,
            // gyro_z: gyroDataRef.current.gamma,
          });
          skt.send(data);
          skt.onmessage = (e) => {
            const message = JSON.parse(e.data);
            setResult(message);
            setT(typeof message);
          };
        }, 500);
        setIntervalId(interval);
      }
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
      <Button onClick={onConnect}>웹소켓 연결하기</Button>
      <Button onClick={onClose}>웹소켓 종료</Button>
      <Button
        onClick={(e) => {
          e.preventDefault();
          if (
            window.DeviceMotionEvent &&
            typeof window.DeviceMotionEvent.requestPermission === 'function'
          ) {
            DeviceMotionEvent.requestPermission();
            window.addEventListener('devicemotion', handleDeviceMotion);
          }
        }}
      >
        센서가져오기
      </Button>
      {gyroData !== null && (
        <>
          <p>gx: {accerData.x}</p>
          <p>gx: {accerData.y}</p>
          <p>gx: {accerData.z}</p>
        </>
      )}

      <p>결과값</p>
      {result !== undefined && (
        <>
          <p>{Object.values(result)}</p>
          <p>{t}</p>
        </>
      )}
    </div>
  );
}

export default Socket2;
