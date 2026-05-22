import { Link, useNavigate } from "react-router";
import Button from "../../components/Button/Button";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import BackgroundMusic from "../../components/BackgroundMusic";
import mySound from "../../assets/sounds/Rockstar_Singer_Sings_Welcome_to_Moodiify_.mp4";
import countryList from "react-select-country-list";
import EyeIconPassword from "../../components/EyeIconPassword/EyeIconPassword";
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [specialChar, setSpecialChar] = useState(false);
  const [numberChar, setNumberChar] = useState(false);
  const [upperChar, setUpperChar] = useState(false);
  const [lowerChar, setLowerChar] = useState(false);
  const [minLength, setMinLength] = useState(false);
  const audioRef = useRef(null);
  const [countryShortName, setCountryShortName] = useState("");
  const [countryFullName, setCountryFullName] = useState("");
  const options = countryList().getData();
  console.log("country Short Name: ", countryShortName);
  console.log("country Full Name: ", countryFullName);
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  }, []);
  const handleRegisteration = async (e) => {
    console.log(countryShortName);

    e.preventDefault();
    if (!email || !password || !confirmPassword || !countryShortName) {
      toast.error("Please fill in all fields");
      return;
    } else if (password.length < 6) {
      toast.error("Password must be at least 8 characters long");
      return;
    } else if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const payload = {
      email: email,
      password: password,
      country: {
        shortName: countryShortName,
        fullName: countryFullName,
      },
    };

    const response = await axios.post(
      `http://${SERVER_URL}/auth/register`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    console.log("response", response);
    if (response.status == 200) {
      toast.success("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else if (response.status == 409) {
      toast.error("User already exists! Please login.");
    } else if (response.status == 400) {
      const data = response.data;
      console.log("Bad request data:", data);
      toast.error("Bad request! Please check your input.");
    } else toast.error("Registration failed! Please try again.");
  };
  return (
    <>
      {/* <audio ref={audioRef} src={mySound} autoPlay /> */}

      <BackgroundMusic />
      <form>
        <h2>Register</h2>
        <Toaster />

        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="country">Country</label>
        <select
          value={countryShortName}
          onChange={(e) => {
            setCountryShortName(e.target.value);
            const selectedName =
              options.find((opt) => opt.value === e.target.value)?.label || "";
            setCountryFullName(selectedName);
          }}
          style={{ backgroundColor: "var(--color-background-100)" }}
        >
          <option value="" disabled selected>
            Select your country
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label htmlFor="password">Password:</label>
        <div className="passwordInputContainer">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              const pwd = e.target.value;
              setSpecialChar(/[^A-Za-z0-9]/.test(pwd));
              setNumberChar(/\d/.test(pwd));
              setUpperChar(/[A-Z]/.test(pwd));
              setLowerChar(/[a-z]/.test(pwd));
              setMinLength(pwd.length >= 6);
            }}
            required
          />
          <EyeIconPassword
            size={20}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        </div>
        <label htmlFor="confirm-password">Confirm Password:</label>
        <div className="passwordInputContainer">
          <input
            type={showConfirmNewPassword ? "text" : "password"}
            id="confirm-password"
            name="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <EyeIconPassword
            size={20}
            showPassword={showConfirmNewPassword}
            setShowPassword={setShowConfirmNewPassword}
          />
        </div>
        <span> Password Requirements:</span>
        <ol>
          <li>
            Password must contain at least one uppercase letter{" "}
            {upperChar && "✅"}
          </li>

          <li>
            Password must contain at least one lowercase letter{" "}
            {lowerChar && "✅"}
          </li>

          <li>
            Password must contain at least one numeric character{" "}
            {numberChar && "✅"}
          </li>
          <li>
            Password must contain at least one special character{" "}
            {specialChar && "✅"}
          </li>
          <li>
            Password must be at least 6 characters long{minLength && "✅"}
          </li>
        </ol>
        <Link to="/login">
          <Button onClick={handleRegisteration} type="register">
            Register
          </Button>
        </Link>

        <p>
          Already have an account?{" "}
          <Link to="/login" className="link">
            Login here
          </Link>
        </p>
      </form>
    </>
  );
}

export default Register;
