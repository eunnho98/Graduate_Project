import React from 'react';
import { IconButton } from '@chakra-ui/react';
import { useSetRecoilState } from 'recoil';
import { dataCategory } from '@/atom';

function CustomIcon({ ...props }) {
  const setCategory = useSetRecoilState(dataCategory);

  let category;
  if (props.icon.type.name === 'TbPerfume') {
    category = 'cosmetic';
  } else if (props.icon.type.name === 'FaAppleAlt') {
    category = 'food';
  } else if (props.icon.type.name === 'LiaTshirtSolid') {
    category = 'fashion';
  } else if (props.icon.type.name === 'FaRunning') {
    category = 'sports';
  } else if (props.icon.type.name === 'FaBed') {
    category = 'living';
  } else if (props.icon.type.name === 'MdComputer') {
    category = 'appliance';
  }

  const OnClick = async () => {
    console.log(category);
    setCategory(category);
  };
  return (
    <IconButton
      isRound={true}
      size="lg"
      variant="solid"
      mr="4px"
      aria-label="Done"
      onClick={OnClick}
      {...props}
    ></IconButton>
  );
}

export default CustomIcon;
