import axios from "axios";

// Login User
export const getLoginUser = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const response = await axios.post("http://localhost:8081/users/login", {
    username,
    password,
  });
  return response.data;
};
