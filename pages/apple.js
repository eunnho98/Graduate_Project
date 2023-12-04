import { Button } from '@chakra-ui/react';
import React, { useState, useEffect, useRef } from 'react';

// 랜덤 유저

function Apple() {
  const [currentMessage, setCurrentMessage] = useState('');
  const [skt, setSkt] = useState(null);
  const [intervalId, setIntervalId] = useState();
  const [gyroData, setGyroData] = useState(null);
  const [accerData, setAccerData] = useState(null);
  const [previousAccerData, setPreviousAccerData] = useState([]);

  const latestPreviousAccerData = useRef([]);
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
    gyroDataRef.current = { alpha, beta, gamma };
    accerDataRef.current = { x, y, z };

    const currentTime = Date.now();
    setPreviousAccerData((prev) => [
      ...prev,
      {
        timestamp: currentTime,
        accerData: {
          x: accerDataRef.current.x,
          y: accerDataRef.current.y,
          z: accerDataRef.current.z,
        },
      },
    ]);

    // setPreviousAccerData((prev) =>
    //   prev.filter((item) => currentTime - item.timestamp <= 500),
    // );
  };

  useEffect(() => {
    // latestPreviousAccerData를 현재 previousAccerData로 업데이트
    latestPreviousAccerData.current = previousAccerData;
  }, [previousAccerData]);

  useEffect(() => {
    console.log('skt', skt);
    if (skt !== null && skt !== undefined) {
      const interval = setInterval(() => {
        // 최신의 previousAccerData를 사용
        const accData = latestPreviousAccerData.current.filter(
          (item) => Date.now() - item.timestamp <= 500,
        );

        const acc_x = accData.map((item) => item.accerData.x);
        const acc_y = accData.map((item) => item.accerData.y);
        const acc_z = accData.map((item) => item.accerData.z);
        const data = JSON.stringify({
          acc_x,
          acc_y,
          acc_z,
        });
        skt.send(data);
        skt.onmessage = (e) => {
          const message = JSON.parse(e.data);
          console.log(message);
          setResult(message);
          setT(typeof message);
        };
      }, 500);
      setIntervalId(interval);
    }
  }, [skt]);

  useEffect(() => {
    const url = 'wss://163.180.186.123:8000/ws3/' + user;
    const ws = new WebSocket(url);

    ws.onopen = () => {
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

  const onConnect = () => {
    const url = 'wss://163.180.186.123:8000/ws3/' + user;
    const ws = new WebSocket(url);

    ws.onopen = () => {
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
      console.log(currentTime);
      const accData = previousAccerData.filter(
        (item) => currentTime - item.timestamp <= 500,
      );

      const acc_x = accData.map((item) => item.accerData.x);
      const acc_y = accData.map((item) => item.accerData.y);
      const acc_z = accData.map((item) => item.accerData.z);
      console.log(acc_x);
      console.log(accData.map((item) => currentTime - item.timestamp));
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
          const currentTime = Date.now();
          const accData = previousAccerData.filter(
            (item) => currentTime - item.timestamp <= 500,
          );
          console.log(currentTime);
          console.log(accData);

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
            setResult(message);
            setT(typeof message);
          };
        }, 1000);
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
          <p>{typeof Object.values(result)}</p>
        </>
      )}
    </div>
  );
}

export default Apple;
