import { Card, VStack, Text, Box } from '@chakra-ui/react';
import React from 'react';
import Scaling from './Scaling';

function CustomItem({ ...props }) {
  const moveToPage = () => {
    const url = props.url;
    window.open(url, '_blank');
  };
  return (
    <VStack spacing="2px" position="relative">
      <Card
        w="90px"
        h="100px"
        backgroundRepeat="no-repeat"
        backgroundSize="cover"
        backgroundImage={`url(${props.image})`}
        onClick={moveToPage}
      />
      {props.scale && <Scaling url={props.url} isBorder={props.isBorder} />}
      <Box h="62px">
        <Text
          w="100px"
          fontSize="xs"
          textAlign="center"
          textOverflow="ellipsis"
          noOfLines={2}
        >
          {props.description}
        </Text>
        <Text textAlign="center" fontSize="md">
          {props.price}원
        </Text>
      </Box>
    </VStack>
  );
}

export default CustomItem;
