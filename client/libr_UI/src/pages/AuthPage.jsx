import { useState } from "react";
import { useUsersData } from "../contexts/userDataContext";
//STYLES
import "../styles/authpg.css";
//MUI COMPONENTS
import {
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Container,
  Tabs,
  Tab,
} from "@mui/material";

export default function AuthPage() {
  const { addUser } = useUsersData();
  const [pickedTab, setPickedTab] = useState(1);
  const [userInfo, setUserInfo] = useState({
    fname: "",
    lname: "",
    age: "",
    state: "student",
    username: "",
    email: "",
    password: "",
    address: "",
    phone: "",
    role: "user",
    is_subscribed: 0,
  });
  function validateSignup(userInfo) {
    if (!userInfo.fname.trim()) return false;
    if (!userInfo.lname.trim()) return false;
    if (!userInfo.age) return false;
    if (!userInfo.phone.trim()) return false;
    if (!userInfo.address.trim()) return false;
    if (!userInfo.username.trim()) return false;
    if (!userInfo.email.trim()) return false;
    if (!userInfo.password.trim()) return false;

    return true;
  }
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };
  async function handleAddUserClick(e) {
    e.preventDefault();
    if (!validateSignup(userInfo)) {
      console.log("validate ur info");
      return;
    }
    await addUser(userInfo);
    setUserInfo({
      fname: "",
      lname: "",
      age: "",
      state: "kid",
      username: "",
      email: "",
      password: "",
      address: "",
      phone: "",
      role: "user",
      is_subscribed: 0,
    });
  }
  return (
    <section className="authpage-container">
      <div className="auth-content">
        <Container sx={{ width: "800px" }}>
          <div className="auth-page">
            <div className="auth-btns">
              <Tabs
                value={pickedTab}
                variant="fullWidth"
                scrollButtons
                allowScrollButtonsMobile
                aria-label="signing tabs"
              >
                <Tab
                  label="Sign Up"
                  sx={{
                    fontWeight: "600",
                  }}
                  onClick={() => setPickedTab(0)}
                />
                <Tab
                  label="Login"
                  sx={{
                    fontWeight: "600",
                  }}
                  onClick={() => setPickedTab(1)}
                />
              </Tabs>
            </div>
            <form className="signup-form">
              {(() => {
                if (pickedTab === 0) {
                  return (
                    <>
                      {/*===FullName + Age===*/}
                      <Stack direction={"row"} spacing={2}>
                        <TextField
                          required
                          className="user-inp"
                          name="fname"
                          label="First Name"
                          value={userInfo.fname}
                          onChange={handleInputChange}
                        />
                        <TextField
                          required
                          className="user-inp"
                          name="lname"
                          label="Last Name"
                          value={userInfo.lname}
                          onChange={handleInputChange}
                        />
                        <TextField
                          required
                          className="user-inp"
                          name="age"
                          type="number"
                          label="Age"
                          value={userInfo.age}
                          onChange={handleInputChange}
                        />
                      </Stack>
                      {/*phone num+ address + state*/}
                      <Stack direction={"row"} spacing={2}>
                        <TextField
                          required
                          className="user-inp"
                          name="phone"
                          label="Phone"
                          value={userInfo.phone}
                          onChange={handleInputChange}
                        />
                        <FormControl className="user-sec-inp">
                          <InputLabel id="state-label">State</InputLabel>
                          <Select
                            labelId="state-label"
                            name="state"
                            value={userInfo.state}
                            onChange={handleInputChange}
                            label="State"
                          >
                            <MenuItem value="kid">Kid</MenuItem>
                            <MenuItem value="student">Student</MenuItem>
                            <MenuItem value="pro">Pro</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          required
                          className="user-sec-inp"
                          name="address"
                          label="Address"
                          value={userInfo.address}
                          onChange={handleInputChange}
                        />
                      </Stack>
                      <TextField
                        required
                        className="user-inp"
                        name="username"
                        label="Username"
                        value={userInfo.username}
                        onChange={handleInputChange}
                      />
                      <>
                        {/*==== Email + Password *====*/}
                        <Stack spacing={2}>
                          <TextField
                            required
                            name="email"
                            type="email"
                            label="Email"
                            value={userInfo.email}
                            onChange={handleInputChange}
                          />
                          <TextField
                            required
                            name="password"
                            type="password"
                            label="Password"
                            value={userInfo.password}
                            onChange={handleInputChange}
                          />
                        </Stack>
                      </>
                    </>
                  );
                } else {
                  return (
                    <>
                      {/*==== Email + Password *====*/}
                      <Stack spacing={2}>
                        <TextField
                          required
                          name="email"
                          type="email"
                          label="Email"
                          value={userInfo.email}
                          onChange={handleInputChange}
                        />
                        <TextField
                          required
                          name="password"
                          type="password"
                          label="Password"
                          value={userInfo.password}
                          onChange={handleInputChange}
                        />
                      </Stack>
                    </>
                  );
                }
              })()}

              <Button
                variant="contained"
                sx={{
                  paddingY: "10px",
                  fontSize: "1rem",
                  borderRadius: "4px",
                  boxShadow: "none",
                  ":hover": {
                    boxShadow: "none",
                  },
                }}
                onClick={(e) => handleAddUserClick(e)}
              >
                {pickedTab === 0 ? "Sign UP" : "Login"}
              </Button>
            </form>
          </div>
        </Container>
      </div>
    </section>
  );
}
