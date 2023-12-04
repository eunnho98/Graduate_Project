import { name } from '@/atom';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { firebase_db } from '../firebaseConfig';
import { ref, set } from 'firebase/database';
import { useRouter } from 'next/router';
import Loading from '@/component/Loading';

const getRandomPosition = () => {
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  return { x, y };
};

const Dot = ({ position, clicked }) => {
  return (
    <Box
      w="32px"
      h="32px"
      borderRadius="full"
      bgColor={clicked ? 'transparent' : 'green.400'}
      position="absolute"
      left={`${position.x}%`}
      top={`${position.y}%`}
    />
  );
};

const BoxArr = Array.from({ length: 3 }, () =>
  Array.from({ length: 3 }, () => ({
    bgColor: 'gray.300',
    isDot: false,
  })),
);

function findDotBoxPosition(boxes) {
  for (let i = 0; i < boxes.length; i++) {
    for (let j = 0; j < boxes[i].length; j++) {
      if (boxes[i][j].isDot) {
        return { row: i, col: j };
      }
    }
  }
  return { row: -1, col: -1 };
}

function Data2() {
  const [count, setCount] = useState(0);
  const [dots, setDots] = useState([]);
  const [gyroData, setGyroData] = useState(null);
  const [accerData, setAccerData] = useState(null);
  const [accumulatedData, setAccumulatedData] = useState([]);
  const [boxes, setBoxes] = useState(BoxArr);
  const [buttonOrder, setButtonOrder] = useState([]);
  const [previousAccerData, setPreviousAccerData] = useState([]);
  const [previousGyroData, setPreviousGyroData] = useState([]);
  const [iteration, setIteration] = useState(0);
  const [clicked, isClicked] = useState(false);
  const uname = useRecoilValue(name);
  const router = useRouter();

  const maxIter = 1;

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

    setPreviousGyroData((prev) => [
      ...prev,
      { timestamp: currentTime, gyroData: { alpha, beta, gamma } },
    ]);
  };

  const shuffleArray = (arr) => {
    const shuffledArray = [...arr];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }
    return shuffledArray;
  };

  useEffect(() => {
    let intervalId;
    async function getData() {
      intervalId = setInterval(async () => {
        const position = getRandomPosition();
        setDots([position]);
        isClicked(false);
        const newBoxes = [...boxes];
        const nextDotIndex = buttonOrder.pop();

        if (nextDotIndex !== undefined) {
          newBoxes[Math.floor(nextDotIndex / 3)][nextDotIndex % 3].isDot = true;
          setBoxes(newBoxes);

          setTimeout(() => {
            newBoxes[Math.floor(nextDotIndex / 3)][
              nextDotIndex % 3
            ].isDot = false;
            setBoxes(newBoxes);
          }, 600);
        } else {
          if (iteration <= maxIter - 1) {
            setIteration((prev) => prev + 1);
            const allBoxIndices = Array.from({ length: 9 }, (_, i) => i); // [0, 1, 2, 3, 4, 5, 6, 7, 8]
            const shuffle = shuffleArray(allBoxIndices);
            setButtonOrder(shuffle);

            await set(
              ref(firebase_db, `${uname}/${iteration}`),
              accumulatedData,
            );

            setAccumulatedData([]);
          } else {
            clearInterval(intervalId);
            router.push('/shop');
          }
        }
      }, 1200);
    }
    getData();
    return () => clearInterval(intervalId);
  }, [boxes, buttonOrder, iteration, maxIter, accumulatedData]);

  useEffect(() => {
    window.addEventListener('devicemotion', handleDeviceMotion);
    const allBoxIndices = Array.from({ length: 9 }, (_, i) => i);
    const shuffle = shuffleArray(allBoxIndices);
    setButtonOrder(shuffle);
  }, []);

  return (
    <div>
      <Box>
        <HStack h="60px" bgColor="red.400" justifyContent="center">
          <Text fontSize="3xl">데이터 수집 페이지</Text>
        </HStack>
        <HStack justifyContent="center" mt="14px" h="40px">
          <Text fontSize="3xl">{count}</Text>
        </HStack>
        <VStack
          mt="24px"
          onClick={(e) => {
            const currentTime = Date.now();
            const accerData = previousAccerData.filter(
              (item) => currentTime - item.timestamp <= 500,
            );
            const gyroData = previousGyroData.filter(
              (item) => currentTime - item.timestamp <= 500,
            );

            e.persist();
            isClicked(true);
            setCount((prev) => prev + 1);
            const { row, col } = findDotBoxPosition(boxes);

            const dataToStore = {
              x: e.nativeEvent.pageX,
              y: e.nativeEvent.pageY,
              acc_x: accerData.map((item) => item.accerData.x),
              acc_y: accerData.map((item) => item.accerData.y),
              acc_z: accerData.map((item) => item.accerData.z),
              gyro_x: gyroData.map((item) => item.gyroData.alpha),
              gyro_y: gyroData.map((item) => item.gyroData.beta),
              gyro_z: gyroData.map((item) => item.gyroData.gamma),
              row,
              col,
            };
            setAccumulatedData((prevData) => [...prevData, dataToStore]);
          }}
        >
          {boxes.map((hitem, idx) => (
            <HStack key={`row-${idx}`}>
              {hitem.map((box, jdx) =>
                box.isDot ? (
                  <Box
                    position="relative"
                    bgColor="transparent"
                    w="100px"
                    h="170px"
                    key={`${idx}-${jdx}`}
                  >
                    {dots.map((position, index) => (
                      <Dot
                        key={index}
                        position={position}
                        setCount={setCount}
                        clicked={clicked}
                      />
                    ))}
                  </Box>
                ) : (
                  <Box
                    bgColor="transparent"
                    w="100px"
                    h="160px"
                    key={`${idx}-${jdx}`}
                  />
                ),
              )}
            </HStack>
          ))}
        </VStack>
      </Box>
    </div>
  );
}

export default Data2;
