import { Button } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

function tmp() {
  const [gyroData, setGyroData] = useState(null);
  const [accerData, setAccerData] = useState(null);
  const [aData, setaData] = useState(null);
  const [previousAccerData, setPreviousAccerData] = useState([]);
  const [click, setClick] = useState(false);

  const handleDeviceMotion = (event) => {
    const { alpha, beta, gamma } = event.rotationRate;
    const { x, y, z } = event.accelerationIncludingGravity;
    setGyroData({ alpha, beta, gamma });
    setAccerData({ x, y, z });
    setaData({
      x: event.acceleration.x,
      y: event.acceleration.y,
      z: event.acceleration.z,
    });
    const currentTime = Date.now();
    setPreviousAccerData((prev) => [
      ...prev,
      { timestamp: currentTime, accerData: { x, y, z } },
    ]);
  };

  return (
    <div>
      <Button
        onClick={(e) => {
          e.preventDefault();
          if (
            window.DeviceMotionEvent &&
            typeof window.DeviceMotionEvent.requestPermission === 'function'
          ) {
            console.log('sdf');
            DeviceMotionEvent.requestPermission();
            window.addEventListener('devicemotion', handleDeviceMotion);
          } else {
            console.log('no');
            console.log(window.DeviceMotionEvent);
            console.log(typeof window.DeviceMotionEvent.requestPermission);
          }
        }}
      >
        허락
      </Button>
      <p>sdfsdfsdf</p>
      <Button
        onClick={() => {
          setClick((prev) => !prev);
          const currentTime = Date.now();
          console.log(currentTime);
          const data = previousAccerData.filter(
            (item) => currentTime - item.timestamp <= 100,
          );
          console.log(data);
          const acc_x = data.map((item) => item.accerData.x);
          const acc_y = data.map((item) => item.accerData.y);
          const acc_z = data.map((item) => item.accerData.z);
          console.log(acc_x, acc_y, acc_z);
        }}
      >
        클릭
      </Button>
      {accerData != null && click && (
        <>
          <p>ax: {accerData.x}</p>
          <p>ay: {accerData.y}</p>
          <p>az: {accerData.z}</p>
        </>
      )}
    </div>
  );
}

export default tmp;
