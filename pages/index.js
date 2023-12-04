import { fetchingData, name } from '@/atom';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useRecoilState } from 'recoil';
import { Input, Button, Text, SlideFade, VStack } from '@chakra-ui/react';
import { firebase_db } from '../firebaseConfig';
import { ref, set, onValue } from 'firebase/database';
import Loading from '@/component/Loading';

function Tmp() {
  const [grant, setGrant] = useState(false);
  const router = useRouter();
  const [uname, setName] = useRecoilState(name);
  const [password, setPassword] = useState('');
  const [data, setData] = useRecoilState(fetchingData);

  useEffect(() => {
    const res = fetch(`${process.env.NEXT_PUBLIC_SERVER_IP}:8080/get_results`)
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  const requestSensorAccess = () => {
    window.DeviceMotionEvent.requestPermission().then((res) => {
      if (res === 'granted') {
        setGrant(true);
      }
    });
  };

  const OnClick = () => {
    onValue(
      ref(firebase_db, uname),
      async (snapshot) => {
        if (snapshot.exists()) {
          // 이미 가입된 경우
          router.push('/shop');
        } else {
          await set(ref(firebase_db, uname), {
            name: uname,
            password: password,
          });

          router.push('/first');
        }
      },
      {
        onlyOnce: true,
      },
    );
  };
  return (
    <div>
      {Object.keys(data).length === 0 ? (
        <Loading text="로딩중..." />
      ) : (
        <VStack p="200px 40px" gap={8}>
          <SlideFade
            in={true}
            offsetY="20px"
            transition={{ enter: { duration: 0.5 } }}
          >
            <Text fontSize="4xl" fontWeight="bold">
              KHUPang
            </Text>
          </SlideFade>
          <Input
            type="text"
            placeholder="아이디"
            value={uname || ''}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="password"
            placeholder="패스워드"
            value={password || ''}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            isLoading={!grant}
            colorScheme="blue"
            loadingText="Loading..."
            onClick={OnClick}
            width="50%"
          >
            Go!
          </Button>
          <Button onClick={requestSensorAccess} w="50%" colorScheme="whatsapp">
            허용
          </Button>
          <Text
            color={grant ? 'green.400' : 'red.400'}
            fontSize="xl"
            fontWeight="bold"
          >
            {grant ? '이용이 가능합니다' : '디바이스 센서 접근을 허락해주세요!'}
          </Text>
        </VStack>
      )}
    </div>
  );
}

export default Tmp;
