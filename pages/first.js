import { Button, Heading, SlideFade, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';

function First() {
  const router = useRouter();
  return (
    <SlideFade
      in={true}
      offsetY="-20px"
      transition={{ enter: { duration: 0.5 } }}
    >
      <VStack p="200px 40px" gap={8}>
        <Heading textAlign="center">처음 오셨군요!</Heading>
        <Text>최초로 로그인을 하여 데이터를 수집합니다.</Text>
        <Text>무작위로 나타나는 초록색 점을 터치하세요!</Text>
        <Text>터치는 각 시도마다 한 번씩만 해주세요!</Text>
        <Text>총 100번 수행됩니다.</Text>
        <Button
          colorScheme="purple"
          w="200px"
          h="50px"
          fontSize="24px"
          letterSpacing="2px"
          lineHeight="32px"
          onClick={() => {
            router.push('/data');
          }}
        >
          시작하기
        </Button>
      </VStack>
    </SlideFade>
  );
}

export default First;
