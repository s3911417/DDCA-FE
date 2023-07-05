import axios from "axios";

//Delete Stock by Session ID
export const deleteStockBySessionId = async (name: string) => {
  const response = await axios.delete(
    `http://localhost:8081/stocks/delete-stocks-session`,
    {
      params: {
        sessionName: encodeURIComponent(name),
      },
    }
  );
  return response.data;
};
