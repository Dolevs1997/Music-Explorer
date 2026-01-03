import { Link, useNavigate } from "react-router";
import Button from "../../components/Button/Button";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import BackgroundMusic from "../../components/BackgroundMusic";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

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
        }
      );
      console.log("response", response);
      if (response.status === 200) {
        toast.success("Login successful! Redirecting to home...");
        localStorage.setItem("user", JSON.stringify(response.data));
        setTimeout(() => {
          navigate("/home");
        }, 2000); // Redirect after 2 seconds
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
      <form>
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
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Link to="/home" className="link">
          <Button onClick={(e) => handleLogin(e)}>Login</Button>
        </Link>

        <p>
          Don&apos;t have an account?
          <Link to="/register" className="link">
            {" "}
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
