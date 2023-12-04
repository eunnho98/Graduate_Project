import React from 'react';
import { Box } from '@chakra-ui/react';

function Scaling({ ...props }) {
  const isBorder = props.isBorder;
  const moveToPage = () => {
    const url = props.url;
    window.open(url, '_blank');
  };
  return (
    <Box
      w="140px"
      h="140px"
      bgColor={isBorder ? 'rgba(170, 29, 29, 0.4)' : 'transparent'}
      position="absolute"
      border={isBorder ? '1px solid black' : 'none'}
      top="0"
      left="0"
      zIndex="100"
      onClick={moveToPage}
    />
  );
}

export default Scaling;
