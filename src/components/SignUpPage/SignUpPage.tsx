import React, { useState, useCallback } from "react";
import intel from "../../assets/intel.svg";
import toast from "react-hot-toast";
import axios from "axios";
import { CustomOtherButton } from "../Button/CustomButton";
import "../LoginPage/loginPage.css";

export const SignUpPage = () => {
  // Initial state values
  const [role, setRole] = useState("admin"); // The user's role (e.g., admin, user)
  const [username, setUsername] = useState(""); // The user's username
  const [password, setPassword] = useState(""); // The user's password

  // Handle role change
  const handleRoleChange = useCallback(
    (event: { target: { value: React.SetStateAction<string> } }) => {
      // Update the role state with the selected value
      setRole(event.target.value);
    },
    []
  );

  // Handle username change
  const handleUsernameChange = useCallback(
    (event: { target: { value: React.SetStateAction<string> } }) => {
      // Update the username state with the entered value
      setUsername(event.target.value);
    },
    []
  );

  // Handle password change
  const handlePasswordChange = useCallback(
    (event: { target: { value: React.SetStateAction<string> } }) => {
      // Update the password state with the entered value
      setPassword(event.target.value);
    },
    []
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (event: { preventDefault: () => void }) => {
      // Prevent the default form submission
      event.preventDefault();
      // Regular expression to validate the password format
      const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
      // Check if both username and password are empty
      if (password.length === 0 && username.trim() === "") {
        toast.error("Username and Password Invalid.");
        return;
      }
      // Check if the password format is invalid
      if (!passwordRegex.test(password)) {
        toast.error(
          "Password must have at least 8 characters, 1 uppercase, and 1 special character."
        );
        return;
      }
      // Check if the username is empty or contains only whitespace
      if (username.trim() === "") {
        toast.error(
          "Username Invalid. Please enter a valid username with at least 1 character. Also, please do not use spaces."
        );
        return;
      }

      try {
        const response = await axios.post("http://localhost:8081/users/add", {
          username: username,
          password: password,
          role: role.charAt(0).toUpperCase() + role.slice(1),
        });
        if (response.data === "Username already exists") {
          toast.error("Username already exists");
          return;
        }

        // Display success message and navigate to the supervisor features page
        toast.success("Account Created Successfully!");
      } catch (error) {
        console.error(error);
        // Handle error scenarios
      }
    },
    [password, username, role]
  );

  return (
    <div
      className="flex flex-col h-screen items-center justify-center bg-blue-100 "
      style={{ backgroundColor: "#F8FCFF" }}
    >
      <div
        className="bg-slate-100 px-10 login_container "
        style={{ backgroundColor: "#fdfdfd" }}
      >
        <img src={intel} alt="Intel logo" className="w-28 h-28  img" />
        <form onSubmit={handleSubmit} className="login_form">
          <div className="flex flex-col">
            <span className="text-lg font-bold mb-2">Role:</span>
            <div className="flex items-center">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  value="admin"
                  checked={role === "admin"}
                  onChange={handleRoleChange}
                />
                <span className="ml-2">Admin</span>
              </label>
              <label className="inline-flex items-center ml-6">
                <input
                  type="radio"
                  className="form-radio"
                  value="operator"
                  checked={role === "operator"}
                  onChange={handleRoleChange}
                />
                <span className="ml-2">Operator</span>
              </label>
            </div>
          </div>
          <div>
            <input
              type="text"
              className="input"
              placeholder="Enter username"
              id="username"
              value={username}
              onChange={handleUsernameChange}
            />
          </div>
          <div>
            <input
              type="password"
              className="input"
              id="password"
              value={password}
              placeholder="Enter password"
              onChange={handlePasswordChange}
            />
          </div>
          <CustomOtherButton
            className="login_button"
            type="submit"
            buttonText="Register"
          />
        </form>
      </div>
    </div>
  );
};
