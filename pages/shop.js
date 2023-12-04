import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';

import React, { useEffect, useState, useRef } from 'react';
import { firebase_db } from '../firebaseConfig';
import { push, ref } from 'firebase/database';
import { useRecoilState, useRecoilValue } from 'recoil';
import { IconProps } from '@/component/List';
import CustomIcon from '@/component/CustomIcon';
import { fetchingData, getCategoryData, name } from '@/atom';
import CustomItem from '@/component/CustomItem';
import Loading from '@/component/Loading';
import { getDatafromServer } from '@/utils/util';

function Data() {
  const [gyroData, setGyroData] = useState(null);
  const [accerData, setAccerData] = useState(null);
  const gyroDataRef = useRef(null);
  const accerDataRef = useRef(null);
  const latestPreviousAccerData = useRef([]);
  const [accumulatedData, setAccumulatedData] = useState([]);
  const [previousAccerData, setPreviousAccerData] = useState([]);
  const [previousGyroData, setPreviousGyroData] = useState([]);

  const [skt, setSkt] = useState(null);
  const [intervalId, setIntervalId] = useState();
  const [isBorder, setIsBorder] = useState(false);
  const [predVal, setPredVal] = useState(undefined);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const uname = useRecoilValue(name);
  const [data, setData] = useRecoilState(fetchingData);
  const result = useRecoilValue(getCategoryData);

  const handleDeviceMotion = (event) => {
    const { alpha, beta, gamma } = event.rotationRate;
    const { x, y, z } = event.accelerationIncludingGravity;
    setGyroData({ alpha, beta, gamma });
    setAccerData({ x, y, z });
    accerDataRef.current = { x, y, z };
    gyroDataRef.current = { alpha, beta, gamma };
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
        gyroData: {
          alpha: gyroDataRef.current.alpha,
          beta: gyroDataRef.current.beta,
          gamma: gyroDataRef.current.gamma,
        },
      },
    ]);
  };

  useEffect(() => {
    window.addEventListener('devicemotion', handleDeviceMotion);
    onOpen();
  }, []);

  useEffect(() => {
    // latestPreviousAccerData를 현재 previousAccerData로 업데이트
    latestPreviousAccerData.current = previousAccerData;
  }, [previousAccerData]);

  const onScale = () => {
    if (skt && skt.OPEN) {
      clearInterval(intervalId);
      setIntervalId(-1);
      skt.close();
      setSkt(null);
      setIsBorder(false);
    } else if (skt === null) {
      const serverURL = 'wss://163.180.186.123:8000/ws/' + uname;
      const ws = new WebSocket(serverURL);
      setSkt(ws);
    }
  };

  useEffect(() => {
    if (skt !== null && skt !== undefined) {
      const interval = setInterval(() => {
        const sendData = latestPreviousAccerData.current.filter(
          (item) => Date.now() - item.timestamp <= 500,
        );

        const acc_x = sendData.map((item) => item.accerData.x);
        const acc_y = sendData.map((item) => item.accerData.y);
        const acc_z = sendData.map((item) => item.accerData.z);
        const gyro_x = sendData.map((item) => item.gyroData.alpha);
        const gyro_y = sendData.map((item) => item.gyroData.beta);
        const gyro_z = sendData.map((item) => item.gyroData.gamma);

        const data = JSON.stringify({
          acc_x,
          acc_y,
          acc_z,
          gyro_x,
          gyro_y,
          gyro_z,
        });
        skt.send(data);
        skt.onmessage = (e) => {
          const message = JSON.parse(e.data);
          const result = Object.values(message);
          setPredVal(result);
        };
      }, 500);
      setIntervalId(interval);
    }
  }, [skt]);

  const pushToDB = () => {
    push(ref(firebase_db, uname), accumulatedData).then((res) => {
      setAccumulatedData([]);
      toast({
        title: '저장 완료!',
        description: '터치 데이터가 저장되었습니다.',
        status: 'success',
        duration: 4500,
        isClosable: true,
        position: 'top',
      });
    });
  };

  return (
    <div>
      {Object.keys(data).length === 0 ? (
        <Loading text="로딩중..." />
      ) : (
        <>
          <Modal isOpen={isOpen} onClose={onClose} size="5xl">
            <ModalOverlay />
            <ModalContent py="36px" top="96px">
              <ModalHeader />
              <ModalCloseButton />
              <ModalBody>
                <Text fontSize="3xl" fontWeight="bold">
                  종료하기 전에 '종료하기' <br />
                  버튼을 눌러주세요!
                </Text>
              </ModalBody>
            </ModalContent>
          </Modal>
          <HStack justifyContent="center" mt="12px">
            {IconProps.map((data) => (
              <CustomIcon
                key={data.colorScheme}
                colorScheme={data.colorScheme}
                fontSize={data.fontSize}
                icon={data.icon}
                color="white"
              />
            ))}
          </HStack>
          <HStack justifyContent="center" mt="12px">
            <Button
              colorScheme="facebook"
              fontSize="sm"
              w="84px"
              onClick={onScale}
            >
              {skt && skt.OPEN ? 'Scale 끄기' : 'Scale 켜기'}
            </Button>
            <Button colorScheme="red" fontSize="sm" w="84px" onClick={pushToDB}>
              종료하기
            </Button>
            <Button
              colorScheme="linkedin"
              fontSize="sm"
              w="84px"
              isLoading={!skt}
              onClick={() => {
                setIsBorder((prev) => !prev);
              }}
            >
              Border 보기
            </Button>
            <Button
              colorScheme="gray"
              fontSize="sm"
              w="84px"
              onClick={async () => {
                setData({});
                const fd = await getDatafromServer();
                setData(fd);
              }}
            >
              품목 리로드
            </Button>
          </HStack>
          <VStack
            spacing="16px"
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

              const data = {
                acc_x: accerData.map((item) => item.accerData.x),
                acc_y: accerData.map((item) => item.accerData.y),
                acc_z: accerData.map((item) => item.accerData.z),
                gyro_x: gyroData.map((item) => item.gyroData.alpha),
                gyro_y: gyroData.map((item) => item.gyroData.beta),
                gyro_z: gyroData.map((item) => item.gyroData.gamma),
                x: e.nativeEvent.pageX,
                y: e.nativeEvent.pageY,
              };
              setAccumulatedData((prev) => [...prev, data]);
              console.log(accumulatedData);
            }}
          >
            {result.map((items, i) => (
              <HStack
                key={i}
                spacing="24px"
                justifyContent="center"
                position="relative"
                alignItems="flex-start"
              >
                {items.map((item, j) => (
                  <>
                    <CustomItem
                      key={j}
                      url={item.url}
                      image={item.image}
                      description={item.description}
                      price={item.price}
                      scale={
                        predVal !== undefined && i * 3 + j === predVal[0]
                          ? true
                          : false
                      }
                      isBorder={isBorder}
                      // scale={i === curScaleBox[j] && j === curScaleBox[i] ? true : false}
                    />
                  </>
                ))}
              </HStack>
            ))}
          </VStack>
        </>
      )}
    </div>
  );
}

export default Data;
