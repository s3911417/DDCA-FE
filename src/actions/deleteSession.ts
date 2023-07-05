import axios from "axios";

//Delete Session
export const deleteSession = async (name: string) => {
  const response = await axios.delete("http://localhost:8081/sessions/delete", {
    data: {
      name: name,
    },
  });
  return response.data;
};
