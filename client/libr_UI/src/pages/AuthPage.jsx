import { useState } from "react";
import { useUsersData } from "../contexts/userDataContext";
import { useNavigate } from "react-router-dom";
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
  Alert, // Added Alert
} from "@mui/material";

export default function AuthPage() {
  const navigate = useNavigate();
  const { addUser, loginUser, userLoading, currUser, setCurrUser } =
    useUsersData();
  const [pickedTab, setPickedTab] = useState(1);
  const [errorMsg, setErrorMsg] = useState(null);

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
    join_date_time: "",
  });

  const rules = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Standard email check
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, // Min 8 chars, 1 letter, 1 number
    username: /^[a-zA-Z0-9_]{3,15}$/, // 3-15 chars, letters, numbers, underscores
    phone: /^[0-9+]{8,15}$/, // Simple phone check (8-15 digits/plus sign)
  };

  function validateSignup(userInfo) {
    if (!userInfo.fname.trim() || !userInfo.lname.trim()) {
      setErrorMsg("First and Last name are required.");
      return false;
    }
    if (!userInfo.age || userInfo.age < 5) {
      setErrorMsg("Please enter a valid age.");
      return false;
    }
    if (!rules.phone.test(userInfo.phone)) {
      setErrorMsg("Enter a valid phone number (digits only).");
      return false;
    }
    if (!userInfo.address.trim()) {
      setErrorMsg("Address is required.");
      return false;
    }
    if (!rules.username.test(userInfo.username)) {
      setErrorMsg("Username must be 3-15 characters (no special symbols).");
      return false;
    }
    if (!rules.email.test(userInfo.email)) {
      setErrorMsg("Please enter a valid email address.");
      return false;
    }
    if (!rules.password.test(userInfo.password)) {
      setErrorMsg(
        "Password needs at least 8 characters, including a letter and a number."
      );
      return false;
    }

    setErrorMsg(null); // Clear error if everything is fine
    return true;
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  async function handleSignUpClick(e) {
    e.preventDefault();
    if (pickedTab === 0) {
      if (!validateSignup(userInfo)) {
        return;
      }
      await addUser(userInfo);
      if (!userLoading) setPickedTab(1);
      setUserInfo({
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
        join_date_time: "",
      });
    }
  }

  async function handleLoginClick() {
    const data = await loginUser(userInfo);
    if (data.success) {
      setCurrUser(data);
      navigate("/explore");
    } else {
      setCurrUser({ success: data.success, msg: data.msg });
    }
  }

  return (
    <section className="authpage-container">
      <div className="auth-content">
        <Container sx={{ width: "800px" }}>
          <div className="auth-page">
            <div className="auth-btns">
              <Tabs value={pickedTab} variant="fullWidth">
                <Tab
                  label="Sign Up"
                  onClick={() => {
                    setPickedTab(0);
                    setErrorMsg(null);
                  }}
                />
                <Tab
                  label="Login"
                  onClick={() => {
                    setPickedTab(1);
                    setErrorMsg(null);
                  }}
                />
              </Tabs>
            </div>

            {/* ERROR DISPLAY AREA */}
            {errorMsg && (
              <Alert
                severity="error"
                sx={{ mt: 2, mb: 1 }}
                onClose={() => setErrorMsg(null)}
              >
                {errorMsg}
              </Alert>
            )}

            <form className="signup-form">
              {pickedTab === 0 ? (
                <>
                  <Stack direction={"row"} spacing={2}>
                    <TextField
                      required
                      name="fname"
                      label="First Name"
                      value={userInfo.fname}
                      onChange={handleInputChange}
                      fullWidth
                    />
                    <TextField
                      required
                      name="lname"
                      label="Last Name"
                      value={userInfo.lname}
                      onChange={handleInputChange}
                      fullWidth
                    />
                    <TextField
                      required
                      name="age"
                      type="number"
                      label="Age"
                      value={userInfo.age}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  </Stack>
                  <Stack direction={"row"} spacing={2}>
                    <TextField
                      required
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
                      name="address"
                      label="Address"
                      value={userInfo.address}
                      onChange={handleInputChange}
                    />
                  </Stack>
                  <TextField
                    required
                    name="username"
                    label="Username"
                    value={userInfo.username}
                    onChange={handleInputChange}
                  />
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
                  <Button
                    variant="contained"
                    onClick={(e) => handleSignUpClick(e)}
                    sx={{ py: "10px", mt: 2 }}
                  >
                    Sign UP
                  </Button>
                </>
              ) : (
                <>
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
                      helperText={!currUser.success ? currUser.msg : ""}
                      onChange={handleInputChange}
                    />
                  </Stack>
                  <Button
                    variant="contained"
                    onClick={() => handleLoginClick()}
                    sx={{ py: "10px", mt: 2 }}
                  >
                    Login
                  </Button>
                </>
              )}
            </form>
          </div>
        </Container>
      </div>
    </section>
  );
}
