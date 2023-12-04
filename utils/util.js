// box의 x좌표 범위

// box의 y좌표 범위

export const getBoxPos = (x, y) => {
  let pred_x, pred_y;

  return pred_x, pred_y;
};

export const getDatafromServer = async () => {
  const res = await fetch('https://163.180.186.123:8080/get_results');
  const data = await res.json();
  return data;
};
