export const getDatafromServer = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_IP}:8080/get_results`,
  );
  const data = await res.json();
  return data;
};
