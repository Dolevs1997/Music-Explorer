import { Link, useNavigate } from "react-router";
import Button from "../../components/Button/Button";
import { useState, useContext } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import UserContext from "../../Contexts/UserContext";

import BackgroundMusic from "../../components/BackgroundMusic";
import EyeIconPassword from "../../components/EyeIconPassword/EyeIconPassword";
import { GoogleLogin } from "@react-oauth/google";
import { CurrentLocationContext } from "../../Contexts/CurrentLocationContext";

// const SERVER_URL = import.meta.env.VITE_SERVER_URL;
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);
  const { setCurrentLocation } = useContext(CurrentLocationContext);

  async function handleSuccess(credentialResponse) {
    const idToken = credentialResponse.credential;
    try {
      const response = await axios.post(`/auth/googleLogin`, { idToken });
      // console.log("response google: ", response);
      if (response.status === 200) {
        setUser(response.data.user);
        setCurrentLocation(
          response.data.user?.country?.fullName || "United States",
        );
        localStorage.setItem("user", JSON.stringify(response.data.user));

        toast.success("Login successful!", { duration: 2000 });
        navigate("/home");
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
      const response = await axios.post(`/auth/login`, payload);
      console.log("response", response);
      if (response.status === 200) {
        // toast.success("Login successful! Redirecting to home...");
        setUser(response.data);
        setCurrentLocation(
          response.data.user?.country.fullName || "United States",
        );
        localStorage.setItem("user", JSON.stringify(response.data));

        toast.success("Login successful!", { duration: 2000 });
        navigate("/home");
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

        <Button type="login" onClick={(e) => handleLogin(e)}>
          Login
        </Button>

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
