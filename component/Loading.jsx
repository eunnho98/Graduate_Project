import { HStack, Spinner, Text, VStack } from '@chakra-ui/react';
import React from 'react';

function Loading({ ...props }) {
  return (
    <VStack justify="center" h="100vh">
      <HStack justify="center">
        <Text fontWeight="bold" fontSize="4xl">
          {props.text}
        </Text>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </HStack>
    </VStack>
  );
}

export default Loading;
