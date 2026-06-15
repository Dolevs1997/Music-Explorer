import { Link, useNavigate, useLocation } from "react-router";
import Button from "../../components/Button/Button";
import { useState, useContext, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import UserContext from "../../Contexts/UserContext";

import BackgroundMusic from "../../components/BackgroundMusic";
import EyeIconPassword from "../../components/EyeIconPassword/EyeIconPassword";
import { GoogleLogin } from "@react-oauth/google";
import { CurrentLocationContext } from "../../Contexts/CurrentLocationContext";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const message = useRef(location.state);
  const { setCurrentLocation } = useContext(CurrentLocationContext);
  if (location.state) {
    toast(message.current);
    location.state = null;
  }
  async function handleSuccess(credentialResponse) {
    const idToken = credentialResponse.credential;
    try {
      const response = await axios.post(
        `http://${SERVER_URL}/auth/googleLogin`,
        { idToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      // console.log("response google: ", response);
      if (response.status === 200) {
        toast.success("Login successful! Redirecting to home...");
        if (response.data.message) {
          toast(response.data.message);
        }
        setUser(response.data);
        setCurrentLocation(response.data.country.fullName || "United States");

        setTimeout(() => {
          navigate("/home");
        }, 2000); // Redirect after 2 seconds
      }
    } catch (error) {
      console.error("Google login error", error);
      toast.error("Google login failed! Please try again.");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      const payload = {
        email: email,
        password: password,
      };
      const response = await axios.post(
        `http://${SERVER_URL}/auth/login`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      console.log("response", response);
      if (response.status === 200) {
        toast.success("Login successful! Redirecting to home...");
        setUser(response.data);
        setCurrentLocation(response.data.country.fullName || "United States");
        setTimeout(() => {
          navigate("/home");
        }, 2000); // Redirect after 2 seconds
      } else if (response.status === 403) {
        toast.error(response.data.message);
      } else if (response.status === 404) {
        toast.error("email / password are incorrect");
      }
    } catch (error) {
      console.error("Login error", error);
      toast.error("Login failed! Please try again.");
    }
  }

  return (
    <div
      style={{
        marginTop: "200px",
      }}
    >
      <BackgroundMusic />
      <form style={{ opacity: 0.9 }}>
        <Toaster />
        <h2>Login</h2>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Password:</label>
        <div className="passwordInputContainer">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <EyeIconPassword
            size={20}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        </div>

        <Link to="/home" className="link">
          <Button onClick={(e) => handleLogin(e)} type="login">
            Login
          </Button>
        </Link>

        <GoogleLogin onSuccess={handleSuccess} />

        <p>
          Don&apos;t have an account? {""}
          <Link to="/register" className="link">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
